import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreaWebLogo } from './CreaWebLogo';
import {
  Bot,
  User as UserIcon,
  Briefcase,
  ShieldCheck,
  Users,
  PhoneCall,
  Menu,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    signOut,
    activeTab,
    setActiveTab,
    setIsMeetingModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    if ((tab === 'proyectos' || tab === 'perfil') && !currentUser) {
      setIsAuthModalOpen(true);
      setMobileMenuOpen(false);
      return;
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleMeetingClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsMeetingModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A2E] text-white shadow-lg border-b border-purple-900/40">
      {/* Top Banner: Contact + Session */}
      <div className="bg-[#121223] px-4 py-1.5 text-xs border-b border-gray-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-gray-300">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Atención WhatsApp: +51 905 551 491
          </span>
          <span className="hidden sm:inline text-gray-500">|</span>
          <a
            href="https://wa.me/51905551491"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 hover:underline"
          >
            <PhoneCall className="w-3.0 h-3.0" /> Contactar Asesor
          </a>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/80 border border-purple-600/50 text-purple-200 hover:bg-purple-900 transition-colors text-xs font-medium"
            >
              <UserIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>{currentUser.nombre_completo}</span>
              <LogOut className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/80 border border-purple-600/50 text-purple-200 hover:bg-purple-900 transition-colors text-xs font-medium"
            >
              <LogIn className="w-3.5 h-3.5 text-pink-400" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div onClick={() => handleNavClick('inicio')} className="cursor-pointer">
            <CreaWebLogo size="md" variant="horizontal" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNavClick('inicio')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'inicio'
                  ? 'bg-purple-600/30 text-pink-300 border border-purple-500/50 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🏠 Inicio
            </button>

            <button
              onClick={() => handleNavClick('servicios')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'servicios'
                  ? 'bg-purple-600/30 text-pink-300 border border-purple-500/50 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              🛠 Servicios
            </button>

            <button
              onClick={() => handleNavClick('portafolio')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'portafolio'
                  ? 'bg-purple-600/30 text-pink-300 border border-purple-500/50 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              📂 Portafolio
            </button>

            <button
              onClick={() => handleNavClick('proyectos')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'proyectos'
                  ? 'bg-purple-600/30 text-pink-300 border border-purple-500/50 shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Mis Proyectos</span>
            </button>

            <button
              onClick={() => handleNavClick('creabot')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'creabot'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-pink-300 hover:bg-pink-500/10 border border-pink-500/30'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Chat IA</span>
            </button>

            {/* Admin View Tab: solo visible si el rol real (verificado en la base de datos) es admin */}
            {currentUser?.rol === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* Team View Tab: solo visible si el rol real es miembro_equipo */}
            {currentUser?.rol === 'miembro_equipo' && (
              <button
                onClick={() => handleNavClick('equipo')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'equipo'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Panel Miembro</span>
              </button>
            )}
          </nav>

          {/* Action Buttons Right */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleMeetingClick}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 transition-colors flex items-center gap-1.5"
            >
              📅 Agendar Reunión
            </button>

            <button
              onClick={() => handleNavClick('perfil')}
              className={`p-2 rounded-lg border transition-all relative ${
                activeTab === 'perfil'
                  ? 'bg-purple-600/30 text-pink-300 border-purple-400'
                  : 'border-gray-700 hover:bg-white/5 text-gray-300'
              }`}
              title="Mi Perfil"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => handleNavClick('creabot')}
              className="p-2 rounded-lg bg-pink-600/20 text-pink-300 border border-pink-500/30 text-xs font-medium flex items-center gap-1"
            >
              <Bot className="w-4 h-4" />
              <span>CreaBot</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121223] border-b border-purple-900/60 px-4 pt-2 pb-6 space-y-2 text-sm">
          <button
            onClick={() => handleNavClick('inicio')}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-medium ${
              activeTab === 'inicio' ? 'bg-purple-600/30 text-pink-300' : 'text-gray-300'
            }`}
          >
            🏠 Inicio
          </button>
          <button
            onClick={() => handleNavClick('servicios')}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-medium ${
              activeTab === 'servicios' ? 'bg-purple-600/30 text-pink-300' : 'text-gray-300'
            }`}
          >
            🛠 Servicios
          </button>
          <button
            onClick={() => handleNavClick('portafolio')}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-medium ${
              activeTab === 'portafolio' ? 'bg-purple-600/30 text-pink-300' : 'text-gray-300'
            }`}
          >
            📂 Portafolio
          </button>
          <button
            onClick={() => handleNavClick('proyectos')}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-medium ${
              activeTab === 'proyectos' ? 'bg-purple-600/30 text-pink-300' : 'text-gray-300'
            }`}
          >
            📋 Mis Proyectos
          </button>
          <button
            onClick={() => handleNavClick('perfil')}
            className={`w-full text-left px-3 py-2.5 rounded-lg font-medium ${
              activeTab === 'perfil' ? 'bg-purple-600/30 text-pink-300' : 'text-gray-300'
            }`}
          >
            👤 Mi Perfil
          </button>

          {currentUser?.rol === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-3 py-2.5 rounded-lg font-bold bg-amber-500/20 text-amber-300"
            >
              🛡 Panel Administrador
            </button>
          )}

          {currentUser?.rol === 'miembro_equipo' && (
            <button
              onClick={() => handleNavClick('equipo')}
              className="w-full text-left px-3 py-2.5 rounded-lg font-bold bg-emerald-500/20 text-emerald-300"
            >
              👥 Panel Miembro de Equipo
            </button>
          )}

          <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
            <button
              onClick={() => {
                handleMeetingClick();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg font-semibold bg-purple-600 text-white text-center"
            >
              📅 Agendar Reunión
            </button>
            {currentUser ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg font-semibold bg-gray-800 text-gray-200 text-center flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg font-semibold bg-gray-800 text-gray-200 text-center flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
