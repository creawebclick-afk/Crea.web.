import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User as UserIcon, Mail, Phone, MapPin, Building, ShieldCheck, CheckCircle2, Lock, Star } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, projects, updateProfile } = useApp();

  const [nombre, setNombre] = useState(currentUser?.nombre_completo || '');
  const [empresa, setEmpresa] = useState(currentUser?.empresa_nombre || '');
  const [telefono, setTelefono] = useState(currentUser?.telefono || '');
  const [ubicacion, setUbicacion] = useState(currentUser?.ubicacion || 'Lima, Perú');
  const [consentPortfolio, setConsentPortfolio] = useState(currentUser?.autoriza_portafolio_default ?? false);
  const [isSaved, setIsSuccessSaved] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      nombre_completo: nombre,
      empresa_nombre: empresa,
      telefono,
      ubicacion,
      autoriza_portafolio_default: consentPortfolio,
    });

    setIsSuccessSaved(true);
    setTimeout(() => setIsSuccessSaved(false), 2000);
  };

  const myCompletedProjects = projects.filter((p) => p.user_id === currentUser.id && p.estado === 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-purple-900/40 pb-6">
        <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-900/50 text-pink-300 border border-purple-500/40">
          Cuenta de Usuario
        </span>
        <h1 className="text-3xl font-black text-white mt-2">Perfil & Configuración</h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Gestiona tus datos personales, preferencias de privacidad y consentimiento para el portafolio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6C3ED6] to-[#FF66C7] p-1 mx-auto shadow-xl">
            <img
              src={currentUser.foto_perfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser.nombre_completo}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{currentUser.nombre_completo}</h3>
            <p className="text-xs text-purple-300 font-medium capitalize">{currentUser.rol.replace('_', ' ')}</p>
            <p className="text-xs text-gray-400 mt-1">{currentUser.empresa_nombre || 'Emprendedor Perú'}</p>
          </div>

          <div className="pt-4 border-t border-purple-900/40 text-xs text-gray-300 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="truncate">{currentUser.email || 'Sin correo registrado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{currentUser.telefono || 'Sin teléfono'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pink-400" />
              <span>{currentUser.ubicacion || 'Perú'}</span>
            </div>
          </div>
        </div>

        {/* Edit Form & Portfolio Privacy Switch */}
        <div className="md:col-span-2 bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white">Editar Datos Personales</h3>

          {isSaved && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Cambios guardados correctamente.
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Empresa / Negocio:</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej: Bodega La Flor"
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Teléfono WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Ubicación (Región Perú):</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Section 8.5 Portfolio Consent Toggle */}
            <div className="p-4 bg-purple-950/60 border border-purple-800/60 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacidad del Portafolio
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Permitir que CreaWeb publique los resultados de tus proyectos completados en el portafolio público de la web.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConsentPortfolio(!consentPortfolio)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consentPortfolio ? 'bg-emerald-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consentPortfolio ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="text-[10px] text-gray-400 font-medium">
                Estado actual: <strong className={consentPortfolio ? 'text-emerald-400' : 'text-amber-400'}>
                  {consentPortfolio ? 'SÍ (Autorizado)' : 'NO (Privado por defecto)'}
                </strong>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs"
            >
              Guardar Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
