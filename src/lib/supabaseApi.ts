/**
 * Capa de datos de CreaWeb sobre Supabase.
 * Reemplaza al antiguo backend Express en memoria: todo se guarda de verdad
 * en Postgres y las reglas de acceso (quién ve/edita qué) están garantizadas
 * por Row Level Security en la base de datos, no solo en el frontend.
 */
import { supabase } from './supabaseClient';
import { User, Project, Meeting, PortfolioItem, AppNotification, UserRole, ProjectFile, Subtask } from '../types';

// ---------- Perfiles / Usuarios ----------

export async function fetchMyProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    console.error('Error al cargar perfil:', error.message);
    return null;
  }
  return data as User;
}

export async function fetchTeamMembers(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('rol', 'miembro_equipo');
  if (error) {
    console.error('Error al cargar equipo:', error.message);
    return [];
  }
  return (data || []) as User[];
}

// Admin busca un usuario existente por correo para promoverlo a miembro de equipo
export async function findProfileByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
  if (error) {
    console.error('Error al buscar usuario:', error.message);
    return null;
  }
  return (data as User) || null;
}

export async function adminSetTeamMemberRole(
  userId: string,
  rol: UserRole,
  empresa_nombre?: string,
  descripcion?: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ rol, empresa_nombre, descripcion })
    .eq('id', userId)
    .select()
    .single();
  if (error) {
    console.error('Error al asignar rol de equipo:', error.message);
    return null;
  }
  return data as User;
}

export async function updateMyProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) {
    console.error('Error al actualizar perfil:', error.message);
    return null;
  }
  return data as User;
}

// ---------- Proyectos ----------

export async function fetchProjects(userId: string, role: UserRole): Promise<Project[]> {
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

  if (role === 'admin') {
    // RLS ya limita esto a admin; no hace falta filtro extra
  } else if (role === 'miembro_equipo') {
    query = query.eq('miembro_asignado_id', userId);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al cargar proyectos:', error.message);
    return [];
  }
  return (data || []) as Project[];
}

export async function createProject(projectData: Partial<Project>): Promise<Project | null> {
  const id = projectData.id || `PED-${Date.now().toString().slice(-8)}`;
  const fechaEntrega = new Date();
  fechaEntrega.setDate(fechaEntrega.getDate() + 10);

  const payload = {
    ...projectData,
    id,
    estado: 0,
    es_atrasado: false,
    anticipo_pagado: false, // se marca true solo cuando el admin verifica el pago reportado
    saldo_pagado: false,
    fecha_entrega_estimada: projectData.fecha_entrega_estimada || fechaEntrega.toISOString().slice(0, 10),
    archivos: [],
    subtareas: [],
  };

  const { data, error } = await supabase.from('projects').insert(payload).select().single();
  if (error) {
    console.error('Error al crear proyecto:', error.message);
    return null;
  }
  return data as Project;
}

// Actualizaciones que solo el admin o el miembro asignado pueden hacer (avance, archivos, subtareas, asignación)
export async function updateProjectApi(id: string, updates: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  if (error) {
    console.error('Error al actualizar proyecto:', error.message);
    alert(error.message || 'Ocurrió un error al actualizar el proyecto.');
    return null;
  }
  return data as Project;
}

// Acción del cliente: cancelar mientras el proyecto sigue en 0% (vía función segura en la BD)
export async function cancelProject0Percent(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase.rpc('cancel_project_0_percent', { p_id: projectId });
  if (error) {
    alert(error.message);
    return null;
  }
  return data as Project;
}

// Acción del cliente: dejar reseña (vía función segura en la BD)
export async function leaveProjectReview(projectId: string, rating: number, review: string): Promise<Project | null> {
  const { data, error } = await supabase.rpc('leave_project_review', {
    p_id: projectId,
    p_rating: rating,
    p_review: review,
  });
  if (error) {
    alert(error.message);
    return null;
  }
  return data as Project;
}

export async function uploadDeliverableFile(
  project: Project,
  nombre: string,
  url: string,
  subidoPorNombre: string
): Promise<Project | null> {
  const nuevaVersion = (project.archivos?.length || 0) + 1;
  const nuevoArchivo: ProjectFile = {
    id: `file-${Date.now()}`,
    proyecto_id: project.id,
    nombre,
    tipo: 'avance',
    url,
    version: nuevaVersion,
    es_version_actual: true,
    subido_por_nombre: subidoPorNombre,
    created_at: new Date().toISOString(),
  };
  const archivosActualizados = [...(project.archivos || []).map((a) => ({ ...a, es_version_actual: false })), nuevoArchivo];
  return updateProjectApi(project.id, { archivos: archivosActualizados });
}

export async function updateSubtaskStatus(
  project: Project,
  subtaskId: string,
  estado: Subtask['estado']
): Promise<Project | null> {
  const subtareasActualizadas = (project.subtareas || []).map((s) => (s.id === subtaskId ? { ...s, estado } : s));
  return updateProjectApi(project.id, { subtareas: subtareasActualizadas });
}

// ---------- Pagos (reporte del cliente + verificación del admin) ----------

export async function reportPayment(
  proyecto_id: string,
  usuario_id: string,
  tipo: 'anticipo' | 'saldo',
  metodo: 'yape' | 'plin' | 'transferencia',
  referencia: string,
  monto: number
) {
  const { data, error } = await supabase
    .from('payment_reports')
    .insert({ proyecto_id, usuario_id, tipo, metodo, referencia, monto })
    .select()
    .single();
  if (error) {
    console.error('Error al reportar pago:', error.message);
    return null;
  }
  return data;
}

export async function fetchPendingPaymentReports() {
  const { data, error } = await supabase
    .from('payment_reports')
    .select('*, projects(servicio_nombre, cliente_nombre)')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error al cargar reportes de pago:', error.message);
    return [];
  }
  return data || [];
}

export async function adminVerifyPayment(reportId: string): Promise<Project | null> {
  const { data, error } = await supabase.rpc('admin_verify_payment', { p_report_id: reportId });
  if (error) {
    alert(error.message);
    return null;
  }
  return data as Project;
}

// ---------- Portafolio ----------

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const { data, error } = await supabase.from('portfolio').select('*').eq('es_visible', true).order('orden');
  if (error) {
    console.error('Error al cargar portafolio:', error.message);
    return [];
  }
  return (data || []) as PortfolioItem[];
}

export async function createPortfolioItem(item: Partial<PortfolioItem>): Promise<PortfolioItem | null> {
  const { data, error } = await supabase.from('portfolio').insert(item).select().single();
  if (error) {
    console.error('Error al crear item de portafolio:', error.message);
    return null;
  }
  return data as PortfolioItem;
}

// ---------- Reuniones ----------

export async function fetchMeetings(userId: string, role: UserRole): Promise<Meeting[]> {
  let query = supabase.from('meetings').select('*').order('fecha_hora', { ascending: true });
  if (role !== 'admin') {
    query = query.eq('usuario_cliente_id', userId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error al cargar reuniones:', error.message);
    return [];
  }
  return (data || []) as Meeting[];
}

export async function scheduleMeetingApi(meetingData: Partial<Meeting>): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from('meetings')
    .insert({ ...meetingData, estado: 'confirmada' })
    .select()
    .single();
  if (error) {
    console.error('Error al agendar reunión:', error.message);
    return null;
  }
  return data as Meeting;
}

// ---------- Notificaciones ----------

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error al cargar notificaciones:', error.message);
    return [];
  }
  return (data || []) as AppNotification[];
}

export async function markNotificationReadApi(id: string) {
  await supabase.from('notifications').update({ leido: true }).eq('id', id);
}

// ---------- Sesiones de CreaBot (para ver cotizaciones abandonadas en el panel admin) ----------

export async function upsertCreaBotSession(
  usuario_id: string,
  cliente_nombre: string,
  cliente_telefono: string,
  ultimo_mensaje: string,
  servicio_interes?: string
) {
  // Busca si ya existe una sesión activa de este usuario para actualizarla en vez de duplicar
  const { data: existing } = await supabase
    .from('creabot_sessions')
    .select('id')
    .eq('usuario_id', usuario_id)
    .eq('estado', 'activa')
    .maybeSingle();

  if (existing) {
    await supabase
      .from('creabot_sessions')
      .update({ ultimo_mensaje, servicio_interes, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase.from('creabot_sessions').insert({
      usuario_id,
      cliente_nombre,
      cliente_telefono,
      ultimo_mensaje,
      servicio_interes,
    });
  }
}

export async function markCreaBotSessionConverted(usuario_id: string, proyecto_id: string) {
  await supabase
    .from('creabot_sessions')
    .update({ estado: 'convertida', proyecto_id })
    .eq('usuario_id', usuario_id)
    .eq('estado', 'activa');
}

export async function fetchAbandonedQuotes() {
  // "Abandonada" = sesión activa (no convertida en proyecto) con más de 30 minutos sin actividad
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('creabot_sessions')
    .select('*')
    .eq('estado', 'activa')
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('Error al cargar cotizaciones abandonadas:', error.message);
    return [];
  }
  return data || [];
}

// ---------- CreaBot (sigue pasando por el servidor Express, que guarda la GEMINI_API_KEY) ----------

export async function sendCreaBotMessage(message: string, history: any[]): Promise<string> {
  try {
    const res = await fetch('/api/creabot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Error en CreaBot');
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error(err);
    return '¡Hola! En CreaWeb estamos listos para ayudarte. Puedes ver nuestras opciones rápidas o contactarnos por WhatsApp al +51 905 551 491.';
  }
}
