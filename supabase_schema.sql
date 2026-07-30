-- ============================================================
-- CreaWeb - Esquema de Base de Datos para Supabase
-- Pega TODO este archivo en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Extensión para generar UUIDs si hiciera falta
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. PERFILES (extiende auth.users, que ya maneja Supabase Auth)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre_completo text not null,
  telefono text,
  rol text not null default 'cliente' check (rol in ('cliente', 'miembro_equipo', 'admin')),
  foto_perfil text,
  empresa_nombre text,
  descripcion text,
  ubicacion text default 'Lima, Perú',
  fecha_registro date not null default current_date,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'suspendido')),
  autoriza_portafolio_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Función auxiliar para saber si el usuario autenticado es admin,
-- sin causar recursión infinita en las políticas RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'admin'
  );
$$;

-- Crea automáticamente el perfil cuando alguien se registra en Supabase Auth.
-- Si el correo coincide con el dueño de CreaWeb, se asigna admin automáticamente
-- (así solo existe UN admin y nadie más puede auto-asignarse ese rol).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, nombre_completo, telefono, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre_completo', 'Usuario CreaWeb'),
    new.raw_user_meta_data->>'telefono',
    case when new.email = 'crea.web.click@gmail.com' then 'admin' else 'cliente' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Evita que un cliente se auto-promueva a admin/miembro_equipo editando su propio perfil.
-- Solo el admin puede cambiar el campo "rol" de cualquier perfil (incluido el suyo).
create or replace function public.protect_role_column()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.rol is distinct from old.rol and not public.is_admin() then
    new.rol := old.rol;
  end if;
  return new;
end;
$$;

create trigger protect_profiles_role
  before update on public.profiles
  for each row execute procedure public.protect_role_column();

alter table public.profiles enable row level security;

create policy "Ver mi propio perfil, o si soy admin, o roster público de equipo"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin() or rol = 'miembro_equipo');

create policy "Actualizar mi propio perfil, o admin actualiza cualquiera"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- 2. PROYECTOS / PEDIDOS
-- ------------------------------------------------------------
create table public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id),
  cliente_nombre text not null,
  cliente_telefono text not null,
  cliente_email text not null,
  servicio_id text not null,
  servicio_nombre text not null,
  plan_nombre text,
  descripcion_proyecto text not null,
  estado int not null default 0 check (estado in (0, 20, 50, 75, 90, 100)),
  tiene_subtareas boolean not null default false,
  es_atrasado boolean not null default false,
  estado_cancelacion text check (estado_cancelacion in ('cancelado_reembolsado', 'cancelacion_rechazada')),
  autoriza_portafolio boolean not null default false,
  fecha_inicio date not null default current_date,
  fecha_entrega_estimada date,
  fecha_entrega_real date,
  presupuesto_total numeric not null,
  anticipo_pagado boolean not null default false,
  saldo_pagado boolean not null default false,
  miembro_asignado_id uuid references public.profiles(id),
  miembro_asignado_nombre text,
  miembro_asignado_rol text,
  calificacion_cliente int check (calificacion_cliente between 1 and 5),
  review_cliente text,
  archivos jsonb not null default '[]'::jsonb,
  subtareas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Cliente ve sus proyectos, admin ve todos, miembro ve los asignados"
  on public.projects for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or miembro_asignado_id = auth.uid()
  );

create policy "Cliente crea su propio proyecto"
  on public.projects for insert
  with check (user_id = auth.uid());

-- Los clientes NO pueden actualizar proyectos directamente (evita que se auto-marquen
-- como pagados o cambien su propio presupuesto/estado). Solo admin y el miembro asignado.
create policy "Admin actualiza cualquier proyecto"
  on public.projects for update
  using (public.is_admin());

create policy "Miembro asignado actualiza avance de su proyecto"
  on public.projects for update
  using (miembro_asignado_id = auth.uid());

-- RPC segura para que el cliente cancele su propio proyecto SOLO si sigue en 0%
create or replace function public.cancel_project_0_percent(p_id text)
returns public.projects
language plpgsql
security definer
as $$
declare
  result public.projects;
begin
  update public.projects
    set estado_cancelacion = 'cancelado_reembolsado'
  where id = p_id and user_id = auth.uid() and estado = 0
  returning * into result;

  if result.id is null then
    raise exception 'No se puede cancelar: el proyecto ya inició desarrollo o no te pertenece.';
  end if;

  return result;
end;
$$;

-- RPC segura para que el cliente deje su reseña SOLO en su propio proyecto ya al 100%
create or replace function public.leave_project_review(p_id text, p_rating int, p_review text)
returns public.projects
language plpgsql
security definer
as $$
declare
  result public.projects;
begin
  update public.projects
    set calificacion_cliente = p_rating, review_cliente = p_review
  where id = p_id and user_id = auth.uid() and estado = 100
  returning * into result;

  if result.id is null then
    raise exception 'No se puede calificar este proyecto todavía.';
  end if;

  return result;
end;
$$;

-- ------------------------------------------------------------
-- 3. REPORTES DE PAGO (el cliente reporta Yape/Plin/Transferencia,
--    el admin lo verifica manualmente y recién ahí se marca como pagado)
-- ------------------------------------------------------------
create table public.payment_reports (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text not null references public.projects(id),
  usuario_id uuid not null references auth.users(id),
  tipo text not null check (tipo in ('anticipo', 'saldo')),
  metodo text not null check (metodo in ('yape', 'plin', 'transferencia')),
  referencia text not null,
  monto numeric not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'verificado', 'rechazado')),
  created_at timestamptz not null default now()
);

alter table public.payment_reports enable row level security;

create policy "Cliente reporta y ve sus propios pagos, admin ve todos"
  on public.payment_reports for select
  using (usuario_id = auth.uid() or public.is_admin());

create policy "Cliente reporta un pago propio"
  on public.payment_reports for insert
  with check (usuario_id = auth.uid());

create policy "Admin actualiza estado de reportes de pago"
  on public.payment_reports for update
  using (public.is_admin());

-- RPC: el admin verifica un pago reportado y esto marca el proyecto como pagado
create or replace function public.admin_verify_payment(p_report_id uuid)
returns public.projects
language plpgsql
security definer
as $$
declare
  rpt public.payment_reports;
  result public.projects;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede verificar pagos.';
  end if;

  update public.payment_reports set estado = 'verificado' where id = p_report_id
  returning * into rpt;

  if rpt.tipo = 'anticipo' then
    update public.projects set anticipo_pagado = true where id = rpt.proyecto_id returning * into result;
  else
    update public.projects set saldo_pagado = true where id = rpt.proyecto_id returning * into result;
  end if;

  return result;
end;
$$;

-- ------------------------------------------------------------
-- 4. PORTAFOLIO
-- ------------------------------------------------------------
create table public.portfolio (
  id text primary key default ('port-' || substr(gen_random_uuid()::text, 1, 8)),
  proyecto_id text references public.projects(id),
  nombre_proyecto text not null,
  descripcion text not null,
  servicio_id text not null,
  servicio_nombre text not null,
  categoria text not null,
  imagen_principal text not null,
  galeria text[] not null default '{}',
  resultado_impacto text,
  fecha_conclusion date,
  es_visible boolean not null default true,
  orden int not null default 0,
  cliente_nombre text, -- Solo se llena si es un "modelo" de ejemplo. Los proyectos reales van anónimos.
  es_modelo boolean not null default true, -- true = ejemplo puesto por el admin, false = proyecto real de cliente (anónimo)
  created_at timestamptz not null default now()
);

alter table public.portfolio enable row level security;

create policy "Todos pueden ver el portafolio visible"
  on public.portfolio for select
  using (es_visible = true or public.is_admin());

create policy "Solo admin administra el portafolio"
  on public.portfolio for insert with check (public.is_admin());
create policy "Solo admin edita el portafolio"
  on public.portfolio for update using (public.is_admin());
create policy "Solo admin elimina del portafolio"
  on public.portfolio for delete using (public.is_admin());

-- 3 modelos de ejemplo para no lanzar el portafolio vacío (marcados es_modelo = true)
insert into public.portfolio (nombre_proyecto, descripcion, servicio_id, servicio_nombre, categoria, imagen_principal, galeria, resultado_impacto, fecha_conclusion, es_visible, orden, cliente_nombre, es_modelo)
values
('Bodega La Flor de Lima', 'Diseño e implementación de tienda online rápida con catálogo interactivo y checkout directo a WhatsApp para recepción de pedidos.', 'srv-web', 'Diseño de Páginas Web', 'web', 'https://images.unsplash.com/photo-1556742049-0a67f572d312?auto=format&fit=crop&q=80&w=800', array['https://images.unsplash.com/photo-1556742049-0a67f572d312?auto=format&fit=crop&q=80&w=800'], 'Ejemplo ilustrativo de resultado esperado.', '2026-07-25', true, 1, 'Modelo de ejemplo', true),
('Pollería El Carboncito', 'Diseño de logotipo moderno, carta digital interactiva y banners promocionales para delivery.', 'srv-grafico', 'Diseño Gráfico', 'grafico', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800', array['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'], 'Ejemplo ilustrativo de resultado esperado.', '2026-06-20', true, 2, 'Modelo de ejemplo', true),
('Boutique Moda Alpaca', 'Estrategia de branding completa y catálogo web responsivo.', 'srv-branding', 'Branding Completo', 'branding', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800', array['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'], 'Ejemplo ilustrativo de resultado esperado.', '2026-05-10', true, 3, 'Modelo de ejemplo', true);

-- ------------------------------------------------------------
-- 5. REUNIONES
-- ------------------------------------------------------------
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  proyecto_id text references public.projects(id),
  proyecto_titulo text,
  usuario_cliente_id uuid not null references auth.users(id),
  cliente_nombre text not null,
  cliente_telefono text not null,
  fecha_hora timestamptz not null,
  tipo text not null check (tipo in ('video_call', 'llamada_telefonica', 'presencial')),
  link_reunion text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada', 'realizada')),
  notas text,
  created_at timestamptz not null default now()
);

alter table public.meetings enable row level security;

create policy "Cliente ve sus reuniones, admin ve todas"
  on public.meetings for select
  using (usuario_cliente_id = auth.uid() or public.is_admin());

create policy "Cliente agenda su propia reunión"
  on public.meetings for insert
  with check (usuario_cliente_id = auth.uid());

create policy "Admin actualiza cualquier reunión"
  on public.meetings for update using (public.is_admin());

-- ------------------------------------------------------------
-- 6. NOTIFICACIONES
-- ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id),
  tipo text not null,
  titulo text not null,
  mensaje text not null,
  link_accion text,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Cada quien ve solo sus notificaciones"
  on public.notifications for select
  using (usuario_id = auth.uid());

create policy "Cada quien marca sus notificaciones como leídas"
  on public.notifications for update
  using (usuario_id = auth.uid());

-- El sistema (admin, vía service role o RPC) inserta notificaciones para cualquiera.
create policy "Admin crea notificaciones para cualquiera"
  on public.notifications for insert
  with check (public.is_admin() or usuario_id = auth.uid());

-- Notifica al admin cuando entra un nuevo proyecto
create or replace function public.notify_admin_new_project()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notifications (usuario_id, tipo, titulo, mensaje, link_accion)
  select id, 'proyecto_asignado', '¡Nuevo proyecto registrado!',
         'Proyecto ' || new.id || ' (' || new.servicio_nombre || ') listo para revisión.',
         '/admin/proyectos'
  from public.profiles where rol = 'admin';
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.notify_admin_new_project();

-- ------------------------------------------------------------
-- 7. SESIONES DE CREABOT (para ver cotizaciones abandonadas en el panel admin)
-- ------------------------------------------------------------
create table public.creabot_sessions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id),
  cliente_nombre text,
  cliente_telefono text,
  servicio_interes text,
  ultimo_mensaje text,
  estado text not null default 'activa' check (estado in ('activa', 'abandonada', 'convertida')),
  proyecto_id text references public.projects(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creabot_sessions enable row level security;

create policy "Cliente ve y crea sus propias sesiones, admin ve todas"
  on public.creabot_sessions for select
  using (usuario_id = auth.uid() or public.is_admin());

create policy "Cliente inserta su propia sesión"
  on public.creabot_sessions for insert
  with check (usuario_id = auth.uid());

create policy "Cliente actualiza su propia sesión, admin actualiza cualquiera"
  on public.creabot_sessions for update
  using (usuario_id = auth.uid() or public.is_admin());

-- ============================================================
-- Fin del esquema. Después de correr esto:
-- 1. Ve a Authentication → Providers → confirma que "Email" esté activado.
-- 2. Ve a Authentication → Settings y desactiva "Confirm email" para lanzar más rápido
--    (puedes reactivarlo después).
-- 3. Regístrate en la app con crea.web.click@gmail.com para crear tu cuenta admin.
-- ============================================================
