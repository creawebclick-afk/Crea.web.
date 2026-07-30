/**
 * Este archivo queda solo como puente de compatibilidad para el chat CreaBot
 * (que sigue pasando por el servidor Express para no exponer la GEMINI_API_KEY).
 * Todo lo demás (proyectos, pagos, portafolio, reuniones, notificaciones, perfiles)
 * vive ahora en src/lib/supabaseApi.ts, conectado directamente a Supabase.
 */
export { sendCreaBotMessage } from './supabaseApi';
