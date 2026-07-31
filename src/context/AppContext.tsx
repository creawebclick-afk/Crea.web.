import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Project, Service, Meeting, PortfolioItem, AppNotification, UserRole, Subtask, BusinessConfig } from '../types';
import { INITIAL_SERVICES } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';
import {
  fetchMyProfile,
  fetchTeamMembers,
  fetchProjects,
  createProject,
  updateProjectApi,
  cancelProject0Percent,
  leaveProjectReview,
  uploadDeliverableFile,
  updateSubtaskStatus,
  fetchMeetings,
  scheduleMeetingApi,
  fetchPortfolio,
  fetchNotifications,
  markNotificationReadApi,
  reportPayment,
  adminVerifyPayment,
  updateMyProfile,
  markCreaBotSessionConverted,
  fetchConfig,
  updateConfig,
} from '../lib/supabaseApi';

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  usersList: User[]; // miembros de equipo (para asignación de proyectos)
  services: Service[];
  projects: Project[];
  portfolio: PortfolioItem[];
  meetings: Meeting[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  paymentTargetProject: Partial<Project> | null;
  setPaymentTargetProject: (p: Partial<Project> | null) => void;
  paymentType: 'anticipo' | 'saldo';
  setPaymentType: (t: 'anticipo' | 'saldo') => void;

  isMeetingModalOpen: boolean;
  setIsMeetingModalOpen: (open: boolean) => void;
  meetingTargetProjectId?: string;
  setMeetingTargetProjectId: (id?: string) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  pendingGuestCheckoutProject: Partial<Project> | null;
  setPendingGuestCheckoutProject: (p: Partial<Project> | null) => void;

  legalModalTab: 'terminos' | 'privacidad' | null;
  openLegalModal: (tab: 'terminos' | 'privacidad') => void;
  closeLegalModal: () => void;

  config: BusinessConfig | null;
  updateBusinessConfig: (changes: Partial<BusinessConfig>) => Promise<boolean>;

  refreshProjects: () => Promise<void>;
  refreshTeamMembers: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  handleReportPayment: (
    projectData: Partial<Project>,
    metodo: 'yape' | 'plin' | 'transferencia',
    referencia: string
  ) => Promise<boolean>;
  handleAdminVerifyPayment: (reportId: string) => Promise<void>;
  handleCancelProject0Percent: (projectId: string) => Promise<boolean>;
  handleUpdateProjectStatus: (projectId: string, newStatus: 0 | 20 | 50 | 75 | 90 | 100, assignedUser?: User) => Promise<void>;
  handleUploadDeliverableFile: (projectId: string, nombre: string, url: string) => Promise<void>;
  handleUpdateSubtaskStatus: (projectId: string, subtaskId: string, estado: Subtask['estado']) => Promise<void>;
  handleScheduleMeeting: (meetingData: Partial<Meeting>) => Promise<Meeting | null>;
  handleTogglePortfolioConsent: (consent: boolean) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  handleLeaveReview: (projectId: string, rating: number, reviewText: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetProject, setPaymentTargetProject] = useState<Partial<Project> | null>(null);
  const [paymentType, setPaymentType] = useState<'anticipo' | 'saldo'>('anticipo');

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingTargetProjectId, setMeetingTargetProjectId] = useState<string | undefined>(undefined);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingGuestCheckoutProject, setPendingGuestCheckoutProject] = useState<Partial<Project> | null>(null);

  const [legalModalTab, setLegalModalTab] = useState<'terminos' | 'privacidad' | null>(null);
  const openLegalModal = (tab: 'terminos' | 'privacidad') => setLegalModalTab(tab);
  const closeLegalModal = () => setLegalModalTab(null);

  const [config, setConfig] = useState<BusinessConfig | null>(null);
  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);
  const updateBusinessConfig = async (changes: Partial<BusinessConfig>) => {
    const updated = await updateConfig(changes);
    if (updated) {
      setConfig(updated);
      return true;
    }
    return false;
  };

  // --- Sesión real de Supabase Auth ---
  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId: string) => {
      const profile = await fetchMyProfile(userId);
      if (mounted) setCurrentUser(profile);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => mounted && setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setProjects([]);
        setMeetings([]);
        setNotifications([]);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setActiveTab('inicio');
  };

  const refreshProjects = useCallback(async () => {
    if (!currentUser) return;
    const data = await fetchProjects(currentUser.id, currentUser.rol);
    setProjects(data);
  }, [currentUser]);

  useEffect(() => {
    // Portafolio es público, se carga siempre
    fetchPortfolio().then(setPortfolio);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    refreshProjects();
    fetchMeetings(currentUser.id, currentUser.rol).then(setMeetings);
    fetchNotifications(currentUser.id).then(setNotifications);
    if (currentUser.rol === 'admin') {
      fetchTeamMembers().then(setUsersList);
    }
  }, [currentUser, refreshProjects]);

  const handleReportPayment = async (
    projectData: Partial<Project>,
    metodo: 'yape' | 'plin' | 'transferencia',
    referencia: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    if (paymentType === 'anticipo') {
      const newProj = await createProject({
        ...projectData,
        user_id: currentUser.id,
        cliente_nombre: currentUser.nombre_completo,
        cliente_telefono: currentUser.telefono,
        cliente_email: currentUser.email,
        autoriza_portafolio: currentUser.autoriza_portafolio_default ?? false,
      });
      if (!newProj) return false;

      await reportPayment(newProj.id, currentUser.id, 'anticipo', metodo, referencia, (newProj.presupuesto_total || 0) / 2);
      markCreaBotSessionConverted(currentUser.id, newProj.id);
      setProjects((prev) => [newProj, ...prev]);
      setIsPaymentModalOpen(false);
      setPaymentTargetProject(null);
      setActiveTab('proyectos');
      setSelectedProjectId(newProj.id);
      return true;
    } else {
      if (!projectData.id) return false;
      await reportPayment(
        projectData.id,
        currentUser.id,
        'saldo',
        metodo,
        referencia,
        (projectData.presupuesto_total || 0) / 2
      );
      setIsPaymentModalOpen(false);
      setPaymentTargetProject(null);
      return true;
    }
  };

  const handleAdminVerifyPayment = async (reportId: string) => {
    const updated = await adminVerifyPayment(reportId);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleCancelProject0Percent = async (projectId: string): Promise<boolean> => {
    const updated = await cancelProject0Percent(projectId);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return true;
    }
    return false;
  };

  const handleUpdateProjectStatus = async (
    projectId: string,
    newStatus: 0 | 20 | 50 | 75 | 90 | 100,
    assignedUser?: User
  ) => {
    const payload: Partial<Project> = { estado: newStatus };
    if (assignedUser) {
      payload.miembro_asignado_id = assignedUser.id;
      payload.miembro_asignado_nombre = assignedUser.nombre_completo;
      payload.miembro_asignado_rol = assignedUser.empresa_nombre;
    }
    const updated = await updateProjectApi(projectId, payload);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleUploadDeliverableFile = async (projectId: string, nombre: string, url: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !currentUser) return;
    const updated = await uploadDeliverableFile(project, nombre, url, currentUser.nombre_completo);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleUpdateSubtaskStatus = async (projectId: string, subtaskId: string, estado: Subtask['estado']) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const updated = await updateSubtaskStatus(project, subtaskId, estado);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleScheduleMeeting = async (meetingData: Partial<Meeting>): Promise<Meeting | null> => {
    if (!currentUser) return null;
    const created = await scheduleMeetingApi({
      ...meetingData,
      usuario_cliente_id: currentUser.id,
      cliente_nombre: currentUser.nombre_completo,
      cliente_telefono: currentUser.telefono,
    });
    if (created) {
      setMeetings((prev) => [created, ...prev]);
      setIsMeetingModalOpen(false);
      return created;
    }
    return null;
  };

  const handleTogglePortfolioConsent = async (consent: boolean) => {
    if (!currentUser) return;
    setCurrentUser((prev) => (prev ? { ...prev, autoriza_portafolio_default: consent } : prev));
    await updateMyProfile(currentUser.id, { autoriza_portafolio_default: consent });
  };

  const refreshTeamMembers = async () => {
    const data = await fetchTeamMembers();
    setUsersList(data);
  };

  const refreshPortfolio = async () => {
    const data = await fetchPortfolio();
    setPortfolio(data);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = await updateMyProfile(currentUser.id, updates);
    if (updated) setCurrentUser(updated);
  };

  const handleLeaveReview = async (projectId: string, rating: number, reviewText: string) => {
    const updated = await leaveProjectReview(projectId, rating, reviewText);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)));
    markNotificationReadApi(id);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.leido).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        signOut,
        usersList,
        services,
        projects,
        portfolio,
        meetings,
        notifications,
        unreadNotificationsCount,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        paymentTargetProject,
        setPaymentTargetProject,
        paymentType,
        setPaymentType,
        isMeetingModalOpen,
        setIsMeetingModalOpen,
        meetingTargetProjectId,
        setMeetingTargetProjectId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        pendingGuestCheckoutProject,
        setPendingGuestCheckoutProject,
        legalModalTab,
        openLegalModal,
        closeLegalModal,
        config,
        updateBusinessConfig,
        refreshProjects,
        refreshTeamMembers,
        refreshPortfolio,
        handleReportPayment,
        handleAdminVerifyPayment,
        handleCancelProject0Percent,
        handleUpdateProjectStatus,
        handleUploadDeliverableFile,
        handleUpdateSubtaskStatus,
        handleScheduleMeeting,
        handleTogglePortfolioConsent,
        updateProfile,
        handleLeaveReview,
        markNotificationAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
