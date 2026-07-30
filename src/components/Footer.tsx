import React from 'react';
import { Globe, Phone, Mail, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { CreaWebLogo } from './CreaWebLogo';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { openLegalModal } = useApp();
  return (
    <footer className="bg-[#121223] text-gray-400 border-t border-purple-900/40 pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          {/* Col 1: About */}
          <div className="space-y-4">
            <CreaWebLogo size="sm" variant="horizontal" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Solución integral de diseño web, gráfico, publicidad y redes sociales para pequeños emprendedores en Perú. Impulsamos tu negocio digital de forma accesible y transparente.
            </p>
            <div className="text-xs text-purple-300 font-medium">
              Modelo de Trabajo Directo 50/50: 50% Anticipo + 50% Saldo al finalizar.
            </div>
          </div>

          {/* Col 2: Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Contacto Oficial</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="https://wa.me/51905551491" target="_blank" rel="noreferrer" className="hover:underline">
                  WhatsApp: +51 905 551 491
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-purple-400" />
                <a href="mailto:crea.web.click@gmail.com" className="hover:underline">
                  crea.web.click@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Globe className="w-4 h-4 text-pink-400" />
                <a href="https://creaempresasweb.my.canva.site/" target="_blank" rel="noreferrer" className="hover:underline truncate">
                  creaempresasweb.my.canva.site
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Lima, Perú (Atención a todo el país)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Meeting Schedule (Section 8.8) */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" /> Horario de Atención
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li className="flex justify-between py-1 border-b border-gray-800/60">
                <span>Lun / Mié / Vie / Sáb:</span>
                <span className="font-medium text-purple-300">3:00 pm – 10:00 pm</span>
              </li>
              <li className="flex justify-between py-1 border-b border-gray-800/60">
                <span>Martes / Jueves:</span>
                <span className="font-medium text-purple-300">3:00 pm – 6:00 pm</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Domingos:</span>
                <span className="font-medium text-pink-400">Cerrado</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Marco Legal Perú
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Cumplimiento estricto de la Ley N° 29733 (Ley de Protección de Datos Personales de Perú).
            </p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Política de Reembolso: 100% en estado 0% antes de iniciar.</li>
              <li>• Portafolio: Solo mediante autorización previa del cliente.</li>
              <li>• Comprobantes: Facturas y boletas electrónicas.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 CreaWeb. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <button onClick={() => openLegalModal('terminos')} className="hover:text-gray-300">Términos y Condiciones</button>
            <button onClick={() => openLegalModal('privacidad')} className="hover:text-gray-300">Política de Privacidad</button>
            <a href="https://wa.me/51905551491?text=Quiero%20presentar%20un%20reclamo" target="_blank" rel="noreferrer" className="hover:text-gray-300">Libro de Reclamaciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
