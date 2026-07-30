import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { X, UserPlus, LogIn, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import { CreaWebLogo } from './CreaWebLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    pendingGuestCheckoutProject,
    setIsPaymentModalOpen,
    setPaymentTargetProject,
    setPaymentType,
    openLegalModal,
  } = useApp();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('+51 9');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const afterAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingGuestCheckoutProject) {
      setPaymentTargetProject(pendingGuestCheckoutProject);
      setPaymentType('anticipo');
      setIsPaymentModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register' && !acceptTerms) {
      setErrorMsg('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre_completo: nombre || 'Cliente Emprendedor',
              telefono: telefono || '+51 900 000 000',
            },
          },
        });
        if (error) throw error;
        afterAuthSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        afterAuthSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1A1A2E] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden text-white my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#121223] via-[#1A1A2E] to-purple-950 px-6 py-4 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreaWebLogo size="xs" variant="icon" />
            <div>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                {mode === 'register' ? 'Registro Rápido' : 'Iniciar Sesión'}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {mode === 'register' ? 'Crea tu Cuenta para Continuar' : 'Bienvenido de vuelta'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-300">
            {mode === 'register'
              ? 'Para procesar tu pago de anticipo (50%) y enviarte los avances de tu proyecto, necesitamos vincular tu solicitud a una cuenta personal.'
              : 'Ingresa tu correo y contraseña para acceder a tus proyectos.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo:</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: María Flores"
                    className="w-full bg-[#121223] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@empresa.com"
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Teléfono WhatsApp (Perú):</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full bg-[#121223] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="flex items-start gap-2 pt-1 text-[11px] text-gray-300">
                <input
                  type="checkbox"
                  id="terms-auth"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-purple-700"
                />
                <label htmlFor="terms-auth">
                  Acepto los{' '}
                  <button type="button" onClick={() => openLegalModal('terminos')} className="text-pink-300 underline font-semibold">
                    Términos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button type="button" onClick={() => openLegalModal('privacidad')} className="text-pink-300 underline font-semibold">
                    Política de Privacidad
                  </button>{' '}
                  (Ley N° 29733 Perú).
                </label>
              </div>
            )}

            {errorMsg && (
              <div className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>
                {loading
                  ? 'Procesando...'
                  : mode === 'register'
                  ? 'Crear Cuenta y Continuar'
                  : 'Iniciar Sesión'}
              </span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-purple-900/40 text-xs text-gray-400">
            {mode === 'register' ? (
              <span>
                ¿Ya tienes una cuenta?{' '}
                <button onClick={() => setMode('login')} className="text-pink-300 font-bold hover:underline">
                  Iniciar Sesión
                </button>
              </span>
            ) : (
              <span>
                ¿Eres nuevo?{' '}
                <button onClick={() => setMode('register')} className="text-pink-300 font-bold hover:underline">
                  Registrarme ahora
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
