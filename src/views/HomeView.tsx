import React from 'react';
import { useApp } from '../context/AppContext';
import { CreaWebLogo } from '../components/CreaWebLogo';
import {
  Globe,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  Layout,
  Palette,
  Megaphone,
  Share2,
  Bookmark,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setActiveTab, services, setIsPaymentModalOpen, setPaymentTargetProject, setPaymentType } = useApp();

  const handleQuickQuote = (srv: any, plan: any) => {
    setPaymentTargetProject({
      servicio_id: srv.id,
      servicio_nombre: srv.nombre,
      plan_nombre: plan.nombre,
      descripcion_proyecto: `Solicitud rápida desde Inicio para ${plan.nombre}`,
      presupuesto_total: plan.precio,
    });
    setPaymentType('anticipo');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#121223] via-[#1A1A2E] to-[#121223] py-16 lg:py-24 border-b border-purple-900/30">
        {/* Glow lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/40 text-pink-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>La Agencia Digital para Pequeños Emprendedores en Perú</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Diseño Web, Gráfico y Redes que{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                  Hacen Crecer Tu Negocio
                </span>
            </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Obtén tu página web, logo corporativo o campaña publicitaria sin complicaciones. Cotiza al instante con nuestra IA, paga solo el <strong className="text-white">50% de anticipo</strong> y sigue tu proyecto en tiempo real.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('creabot')}
                  className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-[#6C3ED6] to-[#FF66C7] hover:from-purple-500 hover:to-pink-500 text-white font-extrabold rounded-xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Bot className="w-5 h-5 text-white animate-bounce" />
                  <span>Cotizar con CreaBot IA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('servicios')}
                  className="w-full sm:w-auto px-6 py-4 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Layout className="w-4 h-4 text-purple-400" />
                  <span>Ver Todos los Servicios</span>
                </button>
              </div>

              {/* Badges Guarantee */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left border-t border-purple-900/40 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pago 50% / 50% seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Seguimiento 0% a 100%</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Entrega rápida garantizada</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="bg-gradient-to-b from-purple-900/40 to-[#1A1A2E] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-mono text-purple-300 font-semibold">CreaWeb Perú 2026</span>
                </div>

                {/* Brand Logo Card Feature */}
                <div className="flex items-center justify-center p-4 rounded-2xl bg-[#0F0F1A] border border-purple-500/30 shadow-inner group">
                  <CreaWebLogo variant="full" size={72} />
                </div>

                <div className="p-4 bg-[#121223] rounded-2xl border border-purple-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Servicio Popular #1</span>
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                      Desde S/ 50.00
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">Diseño de Página Web Tienda Online</h4>
                  <p className="text-xs text-gray-300">
                    Incluye catálogo interactivo, carrito de compras y envío de pedidos directo a tu WhatsApp.
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-purple-300 font-medium">Anticipo: S/ 25.00 Soles</span>
                    <button
                      onClick={() => handleQuickQuote(services[0], services[0].planes[0])}
                      className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <span>Solicitar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* WhatsApp Quick Box */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500 text-white">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">¿Dudas o cotización especial?</div>
                      <div className="text-emerald-300 font-medium">+51 905 551 491</div>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/51905551491"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-[11px]"
                  >
                    Escribir
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Nuestros Servicios Principales</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Transparencia total en precios y entregas adaptadas a emprendedores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="group bg-[#1A1A2E] border border-purple-900/50 hover:border-purple-500/60 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={srv.imagen}
                    alt={srv.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#1A1A2E]/90 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/40">
                    {srv.rango_precio_texto}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                    {srv.nombre}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{srv.descripcion}</p>

                  <div className="pt-2 border-t border-purple-900/40 space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold block">
                      Planes Disponibles:
                    </span>
                    {srv.planes.map((p) => (
                      <div
                        key={p.plan_id}
                        className="flex items-center justify-between p-2 rounded-lg bg-purple-950/40 text-xs text-gray-200"
                      >
                        <span className="truncate pr-2 font-medium">{p.nombre}</span>
                        <span className="font-extrabold text-pink-300 shrink-0">S/ {p.precio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab('servicios')}
                  className="py-2.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-xs font-semibold border border-purple-700/50 transition-colors text-center"
                >
                  Saber Más
                </button>

                <button
                  onClick={() => handleQuickQuote(srv, srv.planes[0])}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>Cotizar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (EL MODELO 50/50) */}
      <section className="bg-[#121223] py-16 border-y border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">¿Cómo Funciona CreaWeb?</h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Proceso simple en 4 pasos sin sorpresas en el costo final.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="p-6 bg-[#1A1A2E] border border-purple-900/50 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 text-pink-300 font-extrabold text-lg flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-white text-base">Cotización Automática</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Elige tu servicio o habla con CreaBot IA para definir los detalles y obtener el monto exacto en Soles.
              </p>
            </div>

            <div className="p-6 bg-[#1A1A2E] border border-purple-900/50 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 text-pink-300 font-extrabold text-lg flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-white text-base">Anticipo del 50%</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Realizas tu primer pago por Yape, Plin o Tarjeta. Tu proyecto inicia formalmente al 0% en tu panel.
              </p>
            </div>

            <div className="p-6 bg-[#1A1A2E] border border-purple-900/50 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 text-pink-300 font-extrabold text-lg flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-white text-base">Desarrollo y Avances</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                El equipo asignado trabaja en tu entregable. Ves el avance (20% → 50% → 75% → 90%) con comentarios y previas.
              </p>
            </div>

            <div className="p-6 bg-[#1A1A2E] border border-purple-900/50 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 text-pink-300 font-extrabold text-lg flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-white text-base">Saldo 50% & Entrega</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Al llegar al 100%, abonaste el saldo restante y descargas todos tus archivos finales listos para usar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CREABOT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-950 via-[#1A1A2E] to-pink-950 border border-purple-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold">
              <Bot className="w-4 h-4" /> CreaBot IA 24/7 Disponible
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              ¿No sabes qué servicio elegir para tu negocio?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Conversa con CreaBot IA en un minuto. Te hará preguntas sencillas sobre tu presupuesto y te armará la cotización ideal.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('creabot')}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-sm shrink-0 flex items-center gap-2"
          >
            <span>Probar CreaBot IA Ahora</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
