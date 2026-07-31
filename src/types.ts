/**
 * CreaWeb - Application Types & Data Models
 */

export type UserRole = 'cliente' | 'miembro_equipo' | 'admin';

export interface User {
  id: string;
  email: string;
  nombre_completo: string;
  telefono: string;
  rol: UserRole;
  foto_perfil?: string;
  empresa_nombre?: string;
  descripcion?: string;
  ubicacion: string;
  fecha_registro: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  autoriza_portafolio_default?: boolean;
}

export interface BusinessConfig {
  id: number;
  nombre_negocio: string;
  email_contacto: string;
  telefono_whatsapp: string;
  numero_yape: string;
  numero_plin: string;
  ubicacion: string;
}

export type ServiceCategory = 'web' | 'grafico' | 'publicidad' | 'redes' | 'branding';

export interface ServicePlan {
  plan_id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  incluye: string[];
  subtareas_template?: string[];
}

export interface Service {
  id: string;
  nombre: string;
  categoria: ServiceCategory;
  descripcion: string;
  precio_desde: number;
  rango_precio_texto: string;
  planes: ServicePlan[];
  tiene_subtareas: boolean;
  imagen: string;
  es_activo: boolean;
}

export type ProjectStatusPercentage = 0 | 20 | 50 | 75 | 90 | 100;

export interface ProjectFile {
  id: string;
  proyecto_id: string;
  nombre: string;
  tipo: 'avance' | 'entregable_final';
  url: string;
  version: number;
  es_version_actual: boolean;
  subido_por_nombre: string;
  created_at: string;
  tamano_str?: string;
}

export interface Subtask {
  id: string;
  proyecto_id: string;
  nombre: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fecha_inicio?: string;
  fecha_fin?: string;
}

export type PaymentType = 'anticipo' | 'saldo';
export type PaymentMethod = 'yape' | 'plin' | 'transferencia' | 'efectivo';
export type PaymentStatus = 'pendiente' | 'verificado' | 'rechazado';

export interface Payment {
  id: string;
  proyecto_id: string;
  usuario_id: string;
  monto: number;
  tipo: PaymentType;
  metodo: PaymentMethod;
  estado: PaymentStatus;
  referencia_transaccion: string;
  fecha_pago: string;
}

export interface Project {
  id: string; // e.g. PED-20260728001
  user_id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  servicio_id: string;
  servicio_nombre: string;
  plan_nombre?: string;
  descripcion_proyecto: string;
  estado: ProjectStatusPercentage;
  tiene_subtareas: boolean;
  es_atrasado: boolean;
  estado_cancelacion?: 'cancelado_reembolsado' | 'cancelacion_rechazada' | null;
  autoriza_portafolio: boolean;
  fecha_inicio: string;
  fecha_entrega_estimada: string;
  fecha_entrega_real?: string;
  presupuesto_total: number;
  anticipo_pagado: boolean;
  saldo_pagado: boolean;
  miembro_asignado_id?: string;
  miembro_asignado_nombre?: string;
  miembro_asignado_rol?: string;
  calificacion_cliente?: number; // 1 to 5
  review_cliente?: string;
  archivos: ProjectFile[];
  subtareas: Subtask[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  proyecto_id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: UserRole;
  tipo: 'cliente' | 'miembro_equipo' | 'admin_comment';
  mensaje: string;
  archivo_url?: string;
  archivo_nombre?: string;
  leido: boolean;
  es_privado: boolean; // True for internal team/admin notes
  created_at: string;
}

export interface CreaBotMessage {
  id: string;
  rol: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: string;
  opciones_rapidas?: string[];
  pedido_generado?: Partial<Project>;
}

export interface CreaBotSession {
  id: string;
  usuario_id?: string | null;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  historial: CreaBotMessage[];
  estado: 'activa' | 'completada' | 'abandonada';
  mensajes_fuera_contexto_consecutivos: number;
  ultima_actividad: string;
  notificacion_abandono_enviada: boolean;
  pedido_generado_id?: string;
}

export type MeetingType = 'video_call' | 'llamada_telefonica' | 'presencial';
export type MeetingStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'realizada';

export interface Meeting {
  id: string;
  proyecto_id?: string;
  proyecto_titulo?: string;
  usuario_cliente_id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_hora: string; // ISO string
  tipo: MeetingType;
  link_reunion?: string;
  estado: MeetingStatus;
  notas?: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  proyecto_id?: string;
  nombre_proyecto: string;
  descripcion: string;
  servicio_id: string;
  servicio_nombre: string;
  categoria: ServiceCategory;
  imagen_principal: string;
  galeria: string[];
  resultado_impacto: string;
  fecha_conclusion: string;
  es_visible: boolean;
  orden: number;
  cliente_nombre?: string;
  es_modelo?: boolean; // true = ejemplo puesto por el admin, false/undefined = proyecto real de cliente (se muestra anónimo)
}

export interface AppNotification {
  id: string;
  usuario_id: string;
  tipo: 'proyecto_asignado' | 'estado_cambio' | 'pago_pendiente' | 'chat_nuevo' | 'reunion_confirmada' | 'cotizacion_abandonada';
  titulo: string;
  mensaje: string;
  link_accion?: string;
  leido: boolean;
  created_at: string;
}

export interface AdminMetrics {
  total_clientes: number;
  total_proyectos: number;
  proyectos_completados: number;
  proyectos_atrasados: number;
  ingresos_totales: number;
  ingresos_anticipos: number;
  ingresos_saldos: number;
  calificacion_promedio: number;
}
