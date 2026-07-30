import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PortfolioItem, ServiceCategory } from '../types';
import { Layout, Palette, Megaphone, Share2, Bookmark, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

export const PortfolioView: React.FC = () => {
  const { portfolio, services, setIsPaymentModalOpen, setPaymentTargetProject, setPaymentType } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const filteredItems =
    activeCategory === 'todos'
      ? portfolio
      : portfolio.filter((item) => item.categoria === activeCategory);

  const handleQuieroUnoAsi = (item: PortfolioItem) => {
    const srv = services.find((s) => s.id === item.servicio_id) || services[0];
    setPaymentTargetProject({
      servicio_id: srv.id,
      servicio_nombre: srv.nombre,
      plan_nombre: srv.planes[0]?.nombre || 'Plan Estándar',
      descripcion_proyecto: `Solicitud inspirada en proyecto de portafolio: ${item.nombre_proyecto}`,
      presupuesto_total: srv.planes[0]?.precio || 50,
    });
    setPaymentType('anticipo');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-purple-900/50 text-pink-300 border border-purple-500/40">
          Trabajos Reales
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Portafolio Global CreaWeb</h1>
        <p className="text-xs sm:text-sm text-gray-300">
          Proyectos entregados a pequeños emprendedores en Perú (mostrados únicamente con autorización de cada cliente).
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
          Todos los Trabajos
        </button>

        <button
          onClick={() => setActiveCategory('web')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'web'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          Páginas Web
        </button>

        <button
          onClick={() => setActiveCategory('grafico')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'grafico'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          Diseño Gráfico
        </button>

        <button
          onClick={() => setActiveCategory('branding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'branding'
              ? 'bg-purple-600 text-white shadow-lg border border-pink-400'
              : 'bg-[#1A1A2E] text-gray-300 hover:bg-purple-900/40 border border-purple-900/50'
          }`}
        >
          Branding
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-[#1A1A2E] border border-purple-900/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-purple-500/60 transition-all duration-300"
          >
            <div>
              {/* Image Showcase */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.imagen_principal}
                  alt={item.nombre_proyecto}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A1A2E]/90 backdrop-blur-md text-pink-300 text-[10px] font-bold border border-pink-500/30">
                  {item.servicio_nombre}
                </span>
              </div>

              {/* Info */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                    {item.nombre_proyecto}
                  </h3>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{item.descripcion}</p>

                {/* Impact Result */}
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/50 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Resultado / Impacto:
                  </div>
                  <div className="text-xs text-gray-200 font-medium">{item.resultado_impacto}</div>
                </div>

                <div className="text-[10px] text-gray-400 pt-1">
                  Cliente:{' '}
                  <span className="text-gray-300 font-semibold">
                    {item.es_modelo ? item.cliente_nombre || 'Ejemplo ilustrativo' : 'Cliente CreaWeb (identidad protegida)'}
                  </span>{' '}
                  • Concluido: {item.fecha_conclusion}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="p-6 pt-0">
              <button
                onClick={() => handleQuieroUnoAsi(item)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <span>¡Quiero uno así para mi negocio!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
