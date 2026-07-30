import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CreaBotFloating } from './components/CreaBotFloating';
import { PaymentModal } from './components/PaymentModal';
import { ScheduleMeetingModal } from './components/ScheduleMeetingModal';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';

import { HomeView } from './views/HomeView';
import { ServicesView } from './views/ServicesView';
import { PortfolioView } from './views/PortfolioView';
import { ProjectsView } from './views/ProjectsView';
import { CreaBotView } from './views/CreaBotView';
import { ProfileView } from './views/ProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { TeamMemberView } from './views/TeamMemberView';

const RequireLogin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setIsAuthModalOpen } = useApp();
  if (currentUser) return <>{children}</>;
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <h2 className="text-xl font-bold text-white">Necesitas iniciar sesión</h2>
      <p className="text-sm text-gray-400">Crea una cuenta o inicia sesión para ver esta sección.</p>
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm"
      >
        Iniciar Sesión / Registrarme
      </button>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab, currentUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center text-gray-400 text-sm">
        Cargando sesión...
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-200px)]">
      {activeTab === 'inicio' && <HomeView />}
      {activeTab === 'servicios' && <ServicesView />}
      {activeTab === 'portafolio' && <PortfolioView />}
      {activeTab === 'proyectos' && (
        <RequireLogin>
          <ProjectsView />
        </RequireLogin>
      )}
      {activeTab === 'creabot' && <CreaBotView />}
      {activeTab === 'perfil' && (
        <RequireLogin>
          <ProfileView />
        </RequireLogin>
      )}
      {/* El rol viene verificado desde la base de datos (RLS), no de un selector local */}
      {activeTab === 'admin' && currentUser?.rol === 'admin' && <AdminDashboardView />}
      {activeTab === 'equipo' && currentUser?.rol === 'miembro_equipo' && <TeamMemberView />}
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#121223] text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white">
        <Header />
        <MainContent />
        <Footer />
        <CreaBotFloating />
        <PaymentModal />
        <ScheduleMeetingModal />
        <AuthModal />
        <LegalModalHost />
      </div>
    </AppProvider>
  );
}

const LegalModalHost: React.FC = () => {
  const { legalModalTab, closeLegalModal } = useApp();
  if (!legalModalTab) return null;
  return <LegalModal initialTab={legalModalTab} onClose={closeLegalModal} />;
};

export default App;
