import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatusPercentage } from '../types';
import { Briefcase, Upload, CheckCircle2, FileText, ArrowRight, Clock, Star } from 'lucide-react';

export const TeamMemberView: React.FC = () => {
  const { projects, currentUser, handleUploadDeliverableFile, handleUpdateSubtaskStatus, handleUpdateProjectStatus } = useApp();

  if (!currentUser) return null;

  const myAssignedProjects = projects.filter(
    (p) => p.miembro_asignado_id === currentUser.id || currentUser.rol === 'admin'
  );

  const [selectedProj, setSelectedProj] = useState<Project | null>(myAssignedProjects[0] || null);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('https://creaempresasweb.my.canva.site/entregable-demo.pdf');

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProj || !fileName) return;

    await handleUploadDeliverableFile(selectedProj.id, fileName, fileUrl);
    setFileName('');
    alert('Entregable subido con éxito como nueva versión.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-purple-900/40 pb-6">
        <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-900/50 text-pink-300 border border-purple-500/40">
          Panel de Especialista
        </span>
        <h1 className="text-3xl font-black text-white mt-2">Área de Trabajo de {currentUser.nombre_completo}</h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Desarrollo de proyectos, subida de versiones de entregables y marcado de subtareas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Assigned Projects */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">Tus Proyectos Asignados:</h3>
          <div className="space-y-3">
            {myAssignedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProj(p)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedProj?.id === p.id
                    ? 'bg-purple-900/60 border-pink-500 shadow-xl'
                    : 'bg-[#1A1A2E] border-purple-900/60'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-purple-300 font-bold">{p.id}</span>
                  <span className="font-bold text-pink-300 bg-purple-950 px-2 py-0.5 rounded">{p.estado}%</span>
                </div>
                <h4 className="font-bold text-white text-sm mt-1">{p.servicio_nombre}</h4>
                <p className="text-xs text-gray-400">Cliente: {p.cliente_nombre}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Project Workspace */}
        {selectedProj && (
          <div className="lg:col-span-8 bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex justify-between items-start pb-4 border-b border-purple-900/40">
              <div>
                <span className="text-xs font-mono font-bold text-purple-300">{selectedProj.id}</span>
                <h2 className="text-xl font-black text-white">{selectedProj.servicio_nombre}</h2>
                <p className="text-xs text-gray-300">{selectedProj.descripcion_proyecto}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block">Fecha Límite:</span>
                <span className="text-xs font-bold text-pink-300">{selectedProj.fecha_entrega_estimada}</span>
              </div>
            </div>

            {/* Advance Status Controls */}
            <div className="p-4 bg-[#121223] rounded-2xl border border-purple-800/50 space-y-2">
              <label className="block text-xs font-bold text-white">Avanzar Estado del Proyecto:</label>
              <div className="grid grid-cols-6 gap-2">
                {([0, 20, 50, 75, 90, 100] as ProjectStatusPercentage[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateProjectStatus(selectedProj.id, st)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      selectedProj.estado === st
                        ? 'bg-pink-600 text-white border-pink-400'
                        : 'bg-purple-950 text-gray-300 border-purple-800 hover:border-purple-600'
                    }`}
                  >
                    {st}%
                  </button>
                ))}
              </div>
            </div>

            {/* Subtasks Control */}
            {selectedProj.subtareas && selectedProj.subtareas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-pink-300">Marcar Subtareas Completadas:</h3>
                <div className="space-y-2">
                  {selectedProj.subtareas.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 bg-[#121223] rounded-xl border border-purple-800/40 flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">{st.nombre}</span>
                      <button
                        onClick={() =>
                          handleUpdateSubtaskStatus(
                            selectedProj.id,
                            st.id,
                            st.estado === 'completada' ? 'pendiente' : 'completada'
                          )
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          st.estado === 'completada'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-900 text-purple-200'
                        }`}
                      >
                        {st.estado === 'completada' ? '✓ Completada' : 'Marcar Lista'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverable File Upload Form */}
            <div className="p-5 bg-purple-950/40 border border-purple-800/60 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-pink-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4" /> Subir Nuevo Entregable / Avance (Versión v
                {(selectedProj.archivos?.length || 0) + 1})
              </h3>

              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Nombre o Descripción del Archivo:</label>
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Ej: Maqueta_Web_Propuesta_v1.pdf"
                    className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">URL / Enlace al Archivo:</label>
                  <input
                    type="url"
                    required
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow text-xs"
                >
                  Publicar Entregable para el Cliente
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
