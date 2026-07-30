import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatusPercentage } from '../types';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  MessageSquare,
  Star,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  XCircle,
  FileText,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    setIsPaymentModalOpen,
    setPaymentTargetProject,
    setPaymentType,
    setIsMeetingModalOpen,
    setMeetingTargetProjectId,
    handleCancelProject0Percent,
    handleLeaveReview,
    currentUser,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'activos' | 'completados' | 'todos'>('activos');
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  if (!currentUser) return null;

  // User's projects
  const myProjects = projects.filter((p) => {
    if (currentUser.rol === 'cliente') {
      return p.user_id === currentUser.id || p.cliente_email === currentUser.email;
    }
    return true; // Admin or team member sees context
  });

  const filteredProjects = myProjects.filter((p) => {
    if (activeFilter === 'activos') return p.estado < 100 && p.estado_cancelacion !== 'cancelado_reembolsado';
    if (activeFilter === 'completados') return p.estado === 100;
    return true;
  });

  const selectedProject = myProjects.find((p) => p.id === selectedProjectId) || myProjects[0];

  const handlePayBalance = (proj: Project) => {
    setPaymentTargetProject(proj);
    setPaymentType('saldo');
    setIsPaymentModalOpen(true);
  };

  const handleCancelClick = async (proj: Project) => {
    if (proj.estado > 0) {
      alert('Este proyecto ya inició su desarrollo. Según nuestra política (Sección 8.1), para cancelaciones en proyectos en curso por favor contacta a soporte por WhatsApp.');
      return;
    }

    if (confirm('¿Estás seguro de cancelar este proyecto? Al estar al 0% recibirás el reembolso completo de tu anticipo (50%).')) {
      const ok = await handleCancelProject0Percent(proj.id);
      if (ok) {
        alert('Proyecto cancelado. Se ha procesado el reembolso de tu anticipo de 50%.');
      }
    }
  };

  const handleSubmitReviewForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      await handleLeaveReview(selectedProject.id, ratingStars, reviewText);
      setReviewSubmitted(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/40 pb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-900/50 text-pink-300 border border-purple-500/40">
            Panel del Cliente
          </span>
          <h1 className="text-3xl font-black text-white mt-2">Mis Proyectos & Seguimiento</h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Monitorea el avance de tu trabajo en tiempo real, descarga entregables y gestiona tus pagos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('activos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'activos'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            En Progreso
          </button>
          <button
            onClick={() => setActiveFilter('completados')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'completados'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            Completados
          </button>
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'todos'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#1A1A2E] text-gray-300 border border-purple-900'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {myProjects.length === 0 ? (
        <div className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-purple-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Aún no tienes proyectos solicitados</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Explora nuestro catálogo de servicios o conversa con CreaBot IA para realizar tu primer pedido con 50% de anticipo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Projects Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">Tus Solicitudes:</h3>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredProjects.map((p) => {
                const isSelected = selectedProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-900/60 border-pink-500 shadow-xl ring-1 ring-pink-500/50'
                        : 'bg-[#1A1A2E] border-purple-900/60 hover:border-purple-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[11px] font-mono text-purple-300 font-bold">{p.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.estado === 100
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : p.estado_cancelacion
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : 'bg-purple-950 text-pink-300 border border-pink-500/30'
                        }`}
                      >
                        {p.estado_cancelacion ? 'Reembolsado' : `${p.estado}% completado`}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm mt-1">{p.servicio_nombre}</h4>
                    <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">{p.descripcion_proyecto}</p>

                    <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2 mt-2 border-t border-purple-800/40">
                      <span>Entrega: {p.fecha_entrega_estimada}</span>
                      <span className="font-bold text-emerald-400">S/ {p.presupuesto_total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Details Panel */}
          {selectedProject && (
            <div className="lg:col-span-8 bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 lg:p-8 space-y-8 shadow-2xl">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      {selectedProject.id}
                    </span>
                    {selectedProject.es_atrasado && (
                      <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/50 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Atrasado
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedProject.servicio_nombre}</h2>
                  <p className="text-xs text-gray-300">{selectedProject.descripcion_proyecto}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setMeetingTargetProjectId(selectedProject.id);
                      setIsMeetingModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4 text-pink-400" />
                    <span>Agendar Cita</span>
                  </button>

                  {/* Cancellation button at 0% */}
                  {selectedProject.estado === 0 && !selectedProject.estado_cancelacion && (
                    <button
                      onClick={() => handleCancelClick(selectedProject)}
                      className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold transition-colors flex items-center gap-1"
                      title="Cancelar y recibir reembolso de 50%"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancelar (0%)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar Display */}
              <div className="space-y-3 p-5 bg-[#121223] rounded-2xl border border-purple-800/50">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">Estado Actual del Proyecto:</span>
                  <span className="text-pink-300 text-sm font-extrabold">{selectedProject.estado}%</span>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-purple-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-purple-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow"
                    style={{ width: `${selectedProject.estado}%` }}
                  />
                </div>

                {/* Progress percentages steps */}
                <div className="grid grid-cols-6 text-[10px] text-center font-medium text-gray-400 pt-1">
                  <span className={selectedProject.estado >= 0 ? 'text-pink-400 font-bold' : ''}>0% Inicio</span>
                  <span className={selectedProject.estado >= 20 ? 'text-pink-400 font-bold' : ''}>20% Maqueta</span>
                  <span className={selectedProject.estado >= 50 ? 'text-pink-400 font-bold' : ''}>50% Desarrollo</span>
                  <span className={selectedProject.estado >= 75 ? 'text-pink-400 font-bold' : ''}>75% Pruebas</span>
                  <span className={selectedProject.estado >= 90 ? 'text-pink-400 font-bold' : ''}>90% Ajustes</span>
                  <span className={selectedProject.estado === 100 ? 'text-emerald-400 font-bold' : ''}>100% Listo</span>
                </div>

                <div className="flex flex-wrap justify-between items-center text-xs text-gray-300 pt-3 border-t border-purple-900/40">
                  <div>
                    Especialista Asignado:{' '}
                    <strong className="text-white">
                      {selectedProject.miembro_asignado_nombre || 'Por asignar por Admin'}
                    </strong>
                  </div>
                  <div>
                    Fecha Entrega Estimada: <strong className="text-pink-300">{selectedProject.fecha_entrega_estimada}</strong>
                  </div>
                </div>
              </div>

              {/* Subtasks Section if exists */}
              {selectedProject.subtareas && selectedProject.subtareas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">
                    Etapas & Subtareas del Trabajo:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProject.subtareas.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-[#121223] border border-purple-800/40 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              st.estado === 'completada'
                                ? 'text-emerald-400'
                                : st.estado === 'en_progreso'
                                ? 'text-amber-400 animate-pulse'
                                : 'text-gray-600'
                            }`}
                          />
                          <span className={st.estado === 'completada' ? 'line-through text-gray-400' : 'text-white'}>
                            {st.nombre}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            st.estado === 'completada'
                              ? 'bg-emerald-950 text-emerald-400'
                              : st.estado === 'en_progreso'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-gray-900 text-gray-400'
                          }`}
                        >
                          {st.estado.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverable Files Section (Client sees current version es_version_actual = true) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Entregables & Avances (Última Versión):
                </h3>

                {selectedProject.archivos && selectedProject.archivos.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProject.archivos
                      .filter((f) => f.es_version_actual) // Section 8.10 Rule: Client sees current version only!
                      .map((file) => (
                        <div
                          key={file.id}
                          className="p-3.5 bg-[#121223] border border-purple-800/60 rounded-xl flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-900/60 text-pink-300">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-white">{file.nombre}</div>
                              <div className="text-[10px] text-gray-400">
                                Versión v{file.version} • Subido por {file.subido_por_nombre} el {file.created_at}
                              </div>
                            </div>
                          </div>

                          {/* Download locked if balance unpaid and project is 100% */}
                          {selectedProject.estado === 100 && !selectedProject.saldo_pagado ? (
                            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-3 py-1.5 rounded-lg border border-amber-500/40">
                              🔒 Abonar Saldo 50% para Descargar
                            </span>
                          ) : (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar
                            </a>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#121223] rounded-xl text-xs text-gray-400 text-center">
                    Aún no hay entregables o archivos subidos. Se publicarán conforme avance el desarrollo.
                  </div>
                )}
              </div>

              {/* 50/50 Payments Status & Balance Payment Action */}
              <div className="p-5 bg-gradient-to-r from-[#121223] to-purple-950 border border-purple-800/60 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Estado Financiero 50/50:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-800/50 space-y-1">
                    <div className="text-gray-400">1er Pago (50% Anticipo):</div>
                    <div className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> S/ {selectedProject.presupuesto_total / 2} Soles (Pagado)
                    </div>
                  </div>

                  <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-800/50 space-y-1">
                    <div className="text-gray-400">2do Pago (50% Saldo):</div>
                    {selectedProject.saldo_pagado ? (
                      <div className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> S/ {selectedProject.presupuesto_total / 2} Soles (Pagado)
                      </div>
                    ) : (
                      <div className="font-bold text-amber-300 text-sm">
                        S/ {selectedProject.presupuesto_total / 2} Soles (Pendiente al finalizar)
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner when project reaches 100% and balance is pending */}
                {selectedProject.estado === 100 && !selectedProject.saldo_pagado && (
                  <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-xl space-y-3 text-xs text-amber-200">
                    <p className="font-bold text-sm text-white">¡Tu proyecto ha llegado al 100% de desarrollo!</p>
                    <p>Por favor realiza el abono del 50% restante para desbloquear la descarga de todos los archivos finales.</p>

                    <button
                      onClick={() => handlePayBalance(selectedProject)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <span>Pagar Saldo Final (S/ {selectedProject.presupuesto_total / 2}.00)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review & Rating Form when completed & paid */}
              {selectedProject.estado === 100 && selectedProject.saldo_pagado && (
                <div className="p-5 bg-[#121223] border border-purple-800/60 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400" /> Calificación del Trabajo
                  </h3>

                  {selectedProject.calificacion_cliente ? (
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                        {Array.from({ length: selectedProject.calificacion_cliente }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-white ml-2">({selectedProject.calificacion_cliente}/5 Estrellas)</span>
                      </div>
                      <p className="italic text-gray-300">"{selectedProject.review_cliente}"</p>
                    </div>
                  ) : reviewSubmitted ? (
                    <div className="text-xs text-emerald-400 font-bold">¡Muchas gracias por tu reseña!</div>
                  ) : (
                    <form onSubmit={handleSubmitReviewForm} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-gray-300 mb-1">
                          ¿Cómo calificas el trabajo recibido?
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingStars(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= ratingStars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-300 mb-1">Comentario u Opinión (Opcional):</label>
                        <textarea
                          rows={2}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Cuéntanos tu experiencia con CreaWeb..."
                          className="w-full bg-[#1A1A2E] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow text-xs"
                      >
                        Enviar Calificación
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
