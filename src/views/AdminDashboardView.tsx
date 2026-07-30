import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Project, User, PortfolioItem, ProjectStatusPercentage } from '../types';
import { fetchPendingPaymentReports, findProfileByEmail, adminSetTeamMemberRole, createPortfolioItem, fetchAbandonedQuotes } from '../lib/supabaseApi';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Edit,
  Trash,
  Bot,
  MessageCircle,
  Wallet,
  UserPlus,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    projects,
    usersList,
    portfolio,
    meetings,
    handleUpdateProjectStatus,
    handleAdminVerifyPayment,
    refreshProjects,
    refreshTeamMembers,
    refreshPortfolio,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'dashboard' | 'proyectos' | 'creabot' | 'portafolio' | 'equipo' | 'pagos'
  >('dashboard');
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);
  const [assignUserModal, setAssignUserModal] = useState<string>('');

  // --- Pagos pendientes de verificación ---
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const loadPendingPayments = async () => {
    const data = await fetchPendingPaymentReports();
    setPendingPayments(data);
  };
  useEffect(() => {
    loadPendingPayments();
  }, []);

  const handleVerify = async (reportId: string) => {
    await handleAdminVerifyPayment(reportId);
    await loadPendingPayments();
    await refreshProjects();
  };

  // --- Agregar / promover miembro de equipo ---
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberDesc, setNewMemberDesc] = useState('');
  const [teamMsg, setTeamMsg] = useState('');

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamMsg('');
    const profile = await findProfileByEmail(newMemberEmail.trim());
    if (!profile) {
      setTeamMsg('No existe ninguna cuenta registrada con ese correo. Pídele que se registre primero como cliente en la web, y luego asígnale el rol aquí.');
      return;
    }
    const updated = await adminSetTeamMemberRole(profile.id, 'miembro_equipo', newMemberRole, newMemberDesc);
    if (updated) {
      setTeamMsg(`${updated.nombre_completo} ahora es miembro del equipo.`);
      setNewMemberEmail('');
      setNewMemberRole('');
      setNewMemberDesc('');
      refreshTeamMembers();
    } else {
      setTeamMsg('Ocurrió un error al asignar el rol.');
    }
  };

  // Calculations
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.estado === 100).length;
  const inProgressProjects = projects.filter((p) => p.estado < 100 && !p.estado_cancelacion).length;
  const delayedProjects = projects.filter((p) => p.es_atrasado || (p.estado < 100 && new Date() > new Date(p.fecha_entrega_estimada))).length;

  const totalIncome = projects.reduce((sum, p) => {
    let inc = 0;
    if (p.anticipo_pagado) inc += p.presupuesto_total / 2;
    if (p.saldo_pagado) inc += p.presupuesto_total / 2;
    return sum + inc;
  }, 0);

  const teamMembers = usersList.filter((u) => u.rol === 'miembro_equipo');

  // Cotizaciones abandonadas: conversaciones de CreaBot de clientes logueados que no se
  // convirtieron en pedido tras 30 min de inactividad.
  const [abandonedQuotes, setAbandonedQuotes] = useState<any[]>([]);
  useEffect(() => {
    fetchAbandonedQuotes().then(setAbandonedQuotes);
  }, []);

  // --- Agregar item al portafolio ---
  const [pfNombre, setPfNombre] = useState('');
  const [pfDescripcion, setPfDescripcion] = useState('');
  const [pfServicioNombre, setPfServicioNombre] = useState('');
  const [pfCategoria, setPfCategoria] = useState<'web' | 'grafico' | 'publicidad' | 'redes' | 'branding'>('web');
  const [pfImagen, setPfImagen] = useState('');
  const [pfImpacto, setPfImpacto] = useState('');
  const [pfEsModelo, setPfEsModelo] = useState(true);
  const [pfClienteNombre, setPfClienteNombre] = useState('');
  const [pfMsg, setPfMsg] = useState('');

  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setPfMsg('');
    const created = await createPortfolioItem({
      nombre_proyecto: pfNombre,
      descripcion: pfDescripcion,
      servicio_id: `srv-${pfCategoria}`,
      servicio_nombre: pfServicioNombre,
      categoria: pfCategoria,
      imagen_principal: pfImagen,
      galeria: [pfImagen],
      resultado_impacto: pfImpacto,
      fecha_conclusion: new Date().toISOString().slice(0, 10),
      es_visible: true,
      orden: portfolio.length + 1,
      es_modelo: pfEsModelo,
      cliente_nombre: pfEsModelo ? pfClienteNombre : undefined,
    });
    if (created) {
      setPfMsg('Agregado al portafolio.');
      setPfNombre('');
      setPfDescripcion('');
      setPfServicioNombre('');
      setPfImagen('');
      setPfImpacto('');
      setPfClienteNombre('');
      refreshPortfolio();
    } else {
      setPfMsg('Ocurrió un error al guardar. Revisa que la imagen sea una URL válida.');
    }
  };

  const handleApplyStatusUpdate = async (projId: string, newStatus: ProjectStatusPercentage) => {
    const assignedUserObj = teamMembers.find((u) => u.id === assignUserModal);
    await handleUpdateProjectStatus(projId, newStatus, assignedUserObj);
    setSelectedProjectModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Panel Administrador (Dueño)
            </span>
          </div>
          <h1 className="text-3xl font-black text-white mt-2">CreaWeb Admin Control</h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Gestión global de pedidos, asignación de equipo, seguimiento de cobros y cotizaciones abandonadas.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'dashboard'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveAdminTab('proyectos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'proyectos'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            Proyectos ({totalProjects})
          </button>
          <button
            onClick={() => setActiveAdminTab('creabot')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeAdminTab === 'creabot'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Cotiz. Abandonadas ({abandonedQuotes.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('portafolio')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'portafolio'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            Portafolio CRUD
          </button>
          <button
            onClick={() => setActiveAdminTab('pagos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeAdminTab === 'pagos'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Pagos por Verificar ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('equipo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === 'equipo'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            Equipo ({teamMembers.length})
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-[#1A1A2E] border border-purple-900/60 rounded-2xl space-y-2 shadow-xl">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Ingresos Totales (S/):</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">S/ {totalIncome}.00</div>
              <div className="text-[10px] text-gray-400">Cobros 50% anticipos + 50% saldos</div>
            </div>

            <div className="p-5 bg-[#1A1A2E] border border-purple-900/60 rounded-2xl space-y-2 shadow-xl">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Proyectos Activos:</span>
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{inProgressProjects}</div>
              <div className="text-[10px] text-gray-400">En etapa de desarrollo</div>
            </div>

            <div className="p-5 bg-[#1A1A2E] border border-purple-900/60 rounded-2xl space-y-2 shadow-xl">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Proyectos Completados:</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{completedProjects}</div>
              <div className="text-[10px] text-gray-400">Al 100% de entregas</div>
            </div>

            {/* Red Alert Card for Delayed Projects (Section 8.2) */}
            <div className={`p-5 rounded-2xl space-y-2 shadow-xl border ${
              delayedProjects > 0 ? 'bg-red-950/80 border-red-500/60 animate-pulse' : 'bg-[#1A1A2E] border-purple-900/60'
            }`}>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="font-bold text-red-400">Proyectos Atrasados:</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-red-300">{delayedProjects}</div>
              <div className="text-[10px] text-red-300 font-semibold">Alerta roja por fecha excedida</div>
            </div>
          </div>

          {/* Unassigned or Active Projects Table */}
          <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white">Solicitudes de Proyectos Recientes</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#121223] text-gray-400 uppercase text-[10px] border-b border-purple-800">
                  <tr>
                    <th className="p-3">ID Pedido</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Servicio</th>
                    <th className="p-3">Estado (%)</th>
                    <th className="p-3">Asignado a</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/40">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-gray-400 font-medium">
                        Aún no se han registrado proyectos ni clientes. A medida que los clientes se registren y realicen pedidos, aparecerán en este panel.
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => (
                      <tr key={p.id} className="hover:bg-purple-950/30 transition-colors">
                        <td className="p-3 font-mono text-purple-300 font-bold">{p.id}</td>
                        <td className="p-3 font-medium text-white">{p.cliente_nombre}</td>
                        <td className="p-3">{p.servicio_nombre}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded font-bold bg-purple-950 text-pink-300 border border-purple-700">
                            {p.estado}%
                          </span>
                        </td>
                        <td className="p-3 text-gray-200">
                          {p.miembro_asignado_nombre || (
                            <span className="text-amber-400 font-bold italic">Sin Asignar</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-emerald-400">S/ {p.presupuesto_total}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedProjectModal(p);
                              setAssignUserModal(p.miembro_asignado_id || '');
                            }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px]"
                          >
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROYECTOS TAB */}
      {activeAdminTab === 'proyectos' && (
        <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xl font-bold text-white">Todos los Proyectos Registrados</h3>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="p-8 text-center bg-[#121223] border border-purple-800/40 rounded-2xl text-xs text-gray-400">
                No hay proyectos registrados en el sistema.
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className="p-5 bg-[#121223] border border-purple-800/60 rounded-2xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-300">{p.id}</span>
                      <h4 className="text-base font-bold text-white">{p.servicio_nombre} ({p.plan_nombre})</h4>
                      <p className="text-xs text-gray-300">Cliente: {p.cliente_nombre} ({p.cliente_telefono})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-pink-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-800">
                        Avance: {p.estado}%
                      </span>
                      <button
                        onClick={() => {
                          setSelectedProjectModal(p);
                          setAssignUserModal(p.miembro_asignado_id || '');
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
                      >
                        Editar / Asignar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREABOT ABANDONED QUOTES TAB (Section 8.3) */}
      {activeAdminTab === 'creabot' && (
        <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-400" /> Centro de Cotizaciones Abandonadas (&gt;75h)
            </h3>
            <p className="text-xs text-gray-300">
              Seguimiento de conversaciones en CreaBot IA que superaron 75 horas sin completar el pedido.
            </p>
          </div>

          <div className="space-y-3">
            {abandonedQuotes.length === 0 ? (
              <div className="p-8 text-center bg-[#121223] border border-purple-800/40 rounded-2xl text-xs text-gray-400">
                No hay cotizaciones abandonadas en este momento.
              </div>
            ) : (
              abandonedQuotes.map((session) => (
                <div
                  key={session.id}
                  className="p-5 bg-[#121223] border border-pink-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">{session.cliente_nombre}</div>
                    <div className="text-pink-300 font-semibold">{session.servicio_interes || 'Consulta general'}</div>
                    <div className="text-gray-400">{session.ultimo_mensaje}</div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      Última actividad: {new Date(session.updated_at).toLocaleString('es-PE')}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${(session.cliente_telefono || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PORTFOLIO CRUD TAB */}
      {activeAdminTab === 'portafolio' && (
        <div className="space-y-6">
          <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Agregar al Portafolio
            </h3>
            <form onSubmit={handleAddPortfolioItem} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={pfNombre}
                onChange={(e) => setPfNombre(e.target.value)}
                placeholder="Nombre del proyecto"
                className="bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                required
                value={pfServicioNombre}
                onChange={(e) => setPfServicioNombre(e.target.value)}
                placeholder="Servicio (ej: Diseño de Página Web)"
                className="bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <textarea
                required
                value={pfDescripcion}
                onChange={(e) => setPfDescripcion(e.target.value)}
                placeholder="Descripción breve"
                className="md:col-span-2 bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                rows={2}
              />
              <select
                value={pfCategoria}
                onChange={(e) => setPfCategoria(e.target.value as any)}
                className="bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="web">Web</option>
                <option value="grafico">Diseño Gráfico</option>
                <option value="publicidad">Publicidad</option>
                <option value="redes">Redes Sociales</option>
                <option value="branding">Branding</option>
              </select>
              <input
                required
                value={pfImagen}
                onChange={(e) => setPfImagen(e.target.value)}
                placeholder="URL de imagen (https://...)"
                className="bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                value={pfImpacto}
                onChange={(e) => setPfImpacto(e.target.value)}
                placeholder="Resultado / impacto (opcional)"
                className="md:col-span-2 bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />

              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input type="checkbox" checked={pfEsModelo} onChange={(e) => setPfEsModelo(e.target.checked)} />
                Es un modelo/ejemplo (no un cliente real) — puede mostrar nombre
              </label>
              {pfEsModelo && (
                <input
                  value={pfClienteNombre}
                  onChange={(e) => setPfClienteNombre(e.target.value)}
                  placeholder="Nombre a mostrar (ej: Modelo de ejemplo)"
                  className="bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              )}

              <button
                type="submit"
                className="md:col-span-2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs"
              >
                Agregar al Portafolio
              </button>
            </form>
            {pfMsg && <div className="text-xs text-amber-300">{pfMsg}</div>}
          </div>

          <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Portafolio Público ({portfolio.length})</h3>
              <span className="text-xs text-purple-300">Los proyectos reales de clientes se muestran anónimos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="p-4 bg-[#121223] border border-purple-800/60 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-white text-sm">{item.nombre_proyecto}</div>
                  <div className="text-gray-300">{item.descripcion}</div>
                  <div className="text-emerald-400 font-medium">{item.resultado_impacto}</div>
                  <div className="text-[10px] text-purple-400">
                    {item.es_modelo ? 'Modelo de ejemplo' : 'Cliente real (anónimo)'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EQUIPO TAB */}
      {activeAdminTab === 'equipo' && (
        <div className="space-y-6">
          <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-6 shadow-xl">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" /> Agregar Miembro de Equipo
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Primero pídele a la persona que se registre normalmente como cliente en la web con su correo.
                Luego búscala aquí por ese correo y asígnale su rol — así queda con su propio usuario y
                contraseña, y podrás enviarle proyectos para que trabaje desde su panel.
              </p>
            </div>

            <form onSubmit={handleAddTeamMember} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="correo@registrado.com"
                className="md:col-span-2 bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
              <input
                type="text"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                placeholder="Rol (ej: Diseñador Gráfico)"
                className="bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                className="py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs"
              >
                Agregar al Equipo
              </button>
              <input
                type="text"
                value={newMemberDesc}
                onChange={(e) => setNewMemberDesc(e.target.value)}
                placeholder="Breve descripción / especialidad (opcional)"
                className="md:col-span-4 bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
            </form>

            {teamMsg && (
              <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2">
                {teamMsg}
              </div>
            )}
          </div>

          <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white">Miembros del Equipo ({teamMembers.length})</h3>

            {teamMembers.length === 0 ? (
              <p className="text-xs text-gray-400">
                Por ahora trabajas solo. Cuando sumes a alguien, agrégalo arriba y aparecerá aquí.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamMembers.map((m) => (
                  <div key={m.id} className="p-5 bg-[#121223] border border-purple-800/60 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold text-lg">
                        {m.nombre_completo.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{m.nombre_completo}</div>
                        <div className="text-pink-300 font-medium">{m.empresa_nombre || 'Sin rol asignado'}</div>
                      </div>
                    </div>
                    {m.descripcion && <p className="text-gray-300">{m.descripcion}</p>}
                    <div className="text-purple-300 font-mono text-[11px]">{m.telefono}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAGOS TAB: verificación manual de Yape/Plin/Transferencia */}
      {activeAdminTab === 'pagos' && (
        <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" /> Pagos Reportados por Verificar
          </h3>
          <p className="text-xs text-gray-400">
            Revisa en tu app de Yape/Plin/banco que el número de operación exista y el monto coincida, y recién
            entonces dale "Verificar y Confirmar". Esto es lo que marca el proyecto como pagado de verdad.
          </p>

          {pendingPayments.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No hay pagos pendientes de verificación 🎉</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#121223] text-gray-400 uppercase text-[10px] border-b border-purple-800">
                  <tr>
                    <th className="p-3">Proyecto</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Referencia</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((r: any) => (
                    <tr key={r.id} className="border-b border-purple-900/40">
                      <td className="p-3 font-mono">{r.proyecto_id}</td>
                      <td className="p-3">{r.projects?.cliente_nombre || '—'}</td>
                      <td className="p-3 capitalize">{r.tipo}</td>
                      <td className="p-3 capitalize">{r.metodo}</td>
                      <td className="p-3 font-mono text-purple-300">{r.referencia}</td>
                      <td className="p-3 font-bold text-emerald-400">S/ {r.monto}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleVerify(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verificar y Confirmar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL FOR MANAGING PROJECT STATUS & ASSIGNMENT */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1A1A2E] border border-purple-500/40 rounded-2xl p-6 text-white space-y-5">
            <h3 className="text-lg font-bold text-white">
              Gestionar Proyecto: {selectedProjectModal.id}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Asignar Miembro del Equipo:</label>
                <select
                  value={assignUserModal}
                  onChange={(e) => setAssignUserModal(e.target.value)}
                  className="w-full bg-[#121223] border border-purple-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="">Seleccionar Miembro Especializado...</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre_completo} ({m.empresa_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">Actualizar Porcentaje de Avance:</label>
                <div className="grid grid-cols-3 gap-2">
                  {([0, 20, 50, 75, 90, 100] as ProjectStatusPercentage[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleApplyStatusUpdate(selectedProjectModal.id, st)}
                      className="py-2.5 px-3 bg-purple-900/60 hover:bg-pink-600 font-bold rounded-xl text-xs border border-purple-700"
                    >
                      {st}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedProjectModal(null)}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
