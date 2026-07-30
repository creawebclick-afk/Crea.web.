import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Service, ServicePlan, ServiceCategory } from '../types';
import { Layout, Palette, Megaphone, Share2, Bookmark, CheckCircle2, ArrowRight, Bot, PhoneCall } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, setActiveTab, setIsPaymentModalOpen, setPaymentTargetProject, setPaymentType } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<{ srv: Service; plan: ServicePlan } | null>(null);

  const filteredServices =
    activeCategory === 'todos'
      ? services
      : services.filter((s) => s.categoria === activeCategory);

  const handleStartQuoteFromPlan = (srv: Service, plan: ServicePlan) => {
    setPaymentTargetProject({
      servicio_id: srv.id,
      servicio_nombre: srv.nombre,
      plan_nombre: plan.nombre,
      descripcion_proyecto: `Solicitud de servicio: ${srv.nombre} - ${plan.nombre}`,
      presupuesto_total: plan.precio,
    });
    setPaymentType('anticipo');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-900/50 text-pink-300 border border-purple-500/40">
          Catálogo Transparente
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Catálogo Completo de Servicios</h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Precios fijos en Soles (S/) adaptados a emprendedores peruanos. Pago 50% de anticipo para arrancar.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveCategory('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'todos'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          Todos los Servicios
        </button>

        <button
          onClick={() => setActiveCategory('web')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === 'web'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-pink-400" />
          <span>Diseño Web</span>
        </button>

        <button
          onClick={() => setActiveCategory('grafico')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === 'grafico'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Diseño Gráfico</span>
        </button>

        <button
          onClick={() => setActiveCategory('publicidad')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === 'publicidad'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Publicidad Digital</span>
        </button>

        <button
          onClick={() => setActiveCategory('redes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === 'redes'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Redes Sociales</span>
        </button>

        <button
          onClick={() => setActiveCategory('branding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeCategory === 'branding'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-teal-400" />
          <span>Branding Completo</span>
        </button>
      </div>

      {/* Services Cards */}
      <div className="space-y-12">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-[#1A1A2E] border border-purple-900/60 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6"
          >
            {/* Service Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-purple-900/40">
              <div className="flex items-start gap-4">
                <img
                  src={srv.imagen}
                  alt={srv.nombre}
                  className="w-20 h-20 rounded-2xl object-cover border border-purple-500/30 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">{srv.nombre}</h2>
                    {srv.tiene_subtareas && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Proyecto por Subtareas
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300">{srv.descripcion}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('creabot')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-4 h-4" />
                  <span>Cotizar con CreaBot IA</span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-300">
                Planes y Precios Oficiales:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {srv.planes.map((plan) => (
                  <div
                    key={plan.plan_id}
                    className="p-5 bg-[#121223] border border-purple-800/60 rounded-2xl flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-white text-base">{plan.nombre}</h5>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-400">S/ {plan.precio}</span>
                          <span className="text-[10px] text-gray-400 block">Anticipo: S/ {plan.precio / 2}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300">{plan.descripcion}</p>

                      {/* Includes list */}
                      <ul className="space-y-1.5 pt-2 border-t border-purple-900/40 text-xs text-gray-300">
                        {plan.incluye.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Subtasks template preview if exists */}
                      {plan.subtareas_template && (
                        <div className="pt-2 border-t border-purple-900/30">
                          <span className="text-[10px] font-bold text-purple-300 uppercase block mb-1">
                            Etapas / Subtareas incluidas:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {plan.subtareas_template.map((st, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-gray-300 border border-purple-800/50"
                              >
                                {i + 1}. {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartQuoteFromPlan(srv, plan)}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Solicitar Plan (Anticipo S/ {plan.precio / 2})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
