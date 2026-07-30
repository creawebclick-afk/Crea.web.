import React, { useState } from 'react';
import { X, FileText, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  initialTab?: 'terminos' | 'privacidad';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'terminos', onClose }) => {
  const [tab, setTab] = useState<'terminos' | 'privacidad'>(initialTab);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#1A1A2E] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 bg-[#121223]">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('terminos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                tab === 'terminos' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Términos y Condiciones
            </button>
            <button
              onClick={() => setTab('privacidad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                tab === 'privacidad' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Política de Privacidad
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-xs text-gray-300 space-y-3 leading-relaxed">
          {tab === 'terminos' ? (
            <>
              <h3 className="text-lg font-bold text-white">Términos y Condiciones de CreaWeb</h3>
              <p className="text-gray-400">Última actualización: julio de 2026.</p>

              <p><strong className="text-white">1. Servicio.</strong> CreaWeb Perú ofrece servicios de diseño web, diseño gráfico, publicidad digital, gestión de redes sociales y branding para pequeños emprendedores en Perú.</p>

              <p><strong className="text-white">2. Modalidad de pago.</strong> Todo proyecto se cobra en dos partes: 50% de anticipo antes de iniciar el trabajo, y 50% de saldo al completar el proyecto (100% de avance). El pago se reporta por Yape, Plin o transferencia bancaria y queda sujeto a verificación manual por parte del equipo antes de confirmarse.</p>

              <p><strong className="text-white">3. Cancelaciones y reembolsos.</strong> El cliente puede cancelar su proyecto y solicitar el reembolso completo del anticipo únicamente mientras el proyecto se encuentre en 0% de avance (antes de que el equipo empiece a trabajar). Una vez iniciado el desarrollo (más de 0% de avance), no se realizan reembolsos, ya que se ha comprometido tiempo y recursos del equipo.</p>

              <p><strong className="text-white">4. Plazos de entrega.</strong> El plazo estimado se comunica al confirmar el proyecto y puede variar según la complejidad. Si un proyecto se retrasa respecto a la fecha estimada, el cliente será notificado.</p>

              <p><strong className="text-white">5. Portafolio.</strong> Al finalizar un proyecto, el cliente puede autorizar (de forma opcional) que se use como ejemplo en el portafolio público de CreaWeb. Si se autoriza, el proyecto se muestra sin revelar el nombre del cliente ni datos de contacto, salvo que el cliente indique expresamente lo contrario.</p>

              <p><strong className="text-white">6. Propiedad de los entregables.</strong> Una vez pagado el 100% del proyecto, los archivos finales (diseños, sitio web, artes) son propiedad del cliente.</p>

              <p><strong className="text-white">7. Uso aceptable.</strong> CreaWeb se reserva el derecho de rechazar proyectos con contenido ilegal, discriminatorio o que infrinja derechos de terceros.</p>

              <p><strong className="text-white">8. Contacto.</strong> Para consultas sobre estos términos: crea.web.click@gmail.com o WhatsApp +51 905 551 491.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white">Política de Privacidad de CreaWeb</h3>
              <p className="text-gray-400">
                Conforme a la Ley N° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento.
              </p>

              <p><strong className="text-white">1. Datos que recopilamos.</strong> Nombre completo, correo electrónico, número de teléfono/WhatsApp, y la información del proyecto que nos compartes (descripción, presupuesto, archivos que subas).</p>

              <p><strong className="text-white">2. Finalidad.</strong> Usamos tus datos únicamente para: crear y gestionar tu cuenta, dar seguimiento a tu proyecto, comunicarnos contigo sobre avances y pagos, y verificar los pagos que reportas.</p>

              <p><strong className="text-white">3. Almacenamiento.</strong> Tus datos se guardan de forma cifrada en una base de datos administrada por Supabase (Postgres), con acceso restringido: solo tú puedes ver tus propios proyectos y datos, y el equipo de CreaWeb solo accede a lo necesario para atender tu solicitud.</p>

              <p><strong className="text-white">4. No compartimos tus datos</strong> con terceros para fines publicitarios. Solo se comparten cuando la ley lo exige o para procesar un pago que tú mismo reportas.</p>

              <p><strong className="text-white">5. Tus derechos (ARCO).</strong> Puedes solicitar en cualquier momento el Acceso, Rectificación, Cancelación u Oposición al tratamiento de tus datos personales escribiendo a crea.web.click@gmail.com.</p>

              <p><strong className="text-white">6. Portafolio público.</strong> Nunca publicamos tu nombre ni datos de contacto en el portafolio sin tu autorización explícita, y aun autorizándolo, por defecto se muestra de forma anónima.</p>

              <p><strong className="text-white">7. Cambios.</strong> Si actualizamos esta política, se notificará a través de la plataforma.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
