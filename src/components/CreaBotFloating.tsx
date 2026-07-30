import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendCreaBotMessage } from '../lib/api';
import { Bot, X, Send, Sparkles, MessageCircle, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CreaBotMessage, Service } from '../types';
import { CreaWebLogo } from './CreaWebLogo';

export const CreaBotFloating: React.FC = () => {
  const { setActiveTab, setIsPaymentModalOpen, setPaymentTargetProject, setPaymentType, currentUser, setIsAuthModalOpen, setPendingGuestCheckoutProject } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [offContextCount, setOffContextCount] = useState(0);

  const [messages, setMessages] = useState<CreaBotMessage[]>([
    {
      id: 'msg-welcome',
      rol: 'asistente',
      contenido: '¡Hola! 👋 Soy CreaBot IA, tu asistente de CreaWeb. Estoy aquí para ayudarte a conocer nuestros servicios, calcular tu cotización y registrar tu pedido en minutos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      opciones_rapidas: [
        '🌐 Crear Página Web',
        '🎨 Solicitar Logo',
        '🖼 Diseño Gráfico',
        '📢 Publicidad Digital',
        '📲 Redes Sociales',
        '💬 Hablar con un Asesor',
      ],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    const userMsg: CreaBotMessage = {
      id: `msg-${Date.now()}`,
      rol: 'usuario',
      contenido: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    // Call server Gemini endpoint
    const historyPayload = messages.map((m) => ({ rol: m.rol, contenido: m.contenido }));
    const botReplyText = await sendCreaBotMessage(text, historyPayload);

    // Context check logic (Section 8.7)
    const textLower = text.toLowerCase();
    const isServiceQuery =
      textLower.includes('web') ||
      textLower.includes('logo') ||
      textLower.includes('gráfico') ||
      textLower.includes('grafico') ||
      textLower.includes('publicidad') ||
      textLower.includes('redes') ||
      textLower.includes('branding') ||
      textLower.includes('cotiz') ||
      textLower.includes('precio') ||
      textLower.includes('hola');

    let currentOff = offContextCount;
    if (!isServiceQuery) {
      currentOff += 1;
      setOffContextCount(currentOff);
    } else {
      setOffContextCount(0);
      currentOff = 0;
    }

    let finalReply = botReplyText;
    let showWhatsAppButton = false;

    if (currentOff >= 2) {
      finalReply = 'Veo que tu consulta necesita más detalle. Te conecto con un asesor humano para ayudarte de inmediato 🙂';
      showWhatsAppButton = true;
    }

    // Check if auto quote can be generated
    let generatedOrder: any = null;
    if (textLower.includes('web') || textLower.includes('tienda') || textLower.includes('logo')) {
      const isWeb = textLower.includes('web') || textLower.includes('tienda');
      generatedOrder = {
        servicio_id: isWeb ? 'srv-web' : 'srv-grafico',
        servicio_nombre: isWeb ? 'Diseño de Páginas Web' : 'Diseño Gráfico (Logo)',
        plan_nombre: isWeb ? 'Tienda Online E-commerce' : 'Logo Empresarial',
        descripcion_proyecto: `Cotización vía CreaBot IA: ${text}`,
        presupuesto_total: isWeb ? 100 : 20,
      };
    }

    const botMsg: CreaBotMessage = {
      id: `msg-${Date.now() + 1}`,
      rol: 'asistente',
      contenido: finalReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      opciones_rapidas: showWhatsAppButton
        ? undefined
        : ['🌐 Ver Planes Web (S/ 50-100)', '🎨 Logo (S/ 20)', '📲 Redes Sociales (S/ 40)', '✅ Continuar con el 50% de anticipo'],
      pedido_generado: generatedOrder,
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const handleStartPayment = (order: any) => {
    if (!currentUser) {
      // Flujo 1 Guest Conversion: Requires account creation before deposit
      setPendingGuestCheckoutProject(order);
      setIsAuthModalOpen(true);
      return;
    }

    setPaymentTargetProject(order);
    setPaymentType('anticipo');
    setIsPaymentModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6C3ED6] to-[#FF66C7] text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-sm border border-purple-400/40"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1A1A2E]" />
          </div>
          <span className="hidden sm:inline">💬 ¿Necesitas ayuda?</span>
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">CreaBot IA</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-[#1A1A2E] border border-purple-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#121223] via-[#1A1A2E] to-purple-950 px-4 py-3 border-b border-purple-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreaWebLogo size="xs" variant="icon" />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>CreaBot IA</span>
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Cotizador Oficial de CreaWeb
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('creabot');
                }}
                className="text-xs text-purple-300 hover:text-white px-2 py-1 rounded bg-purple-900/40 hover:bg-purple-800"
                title="Ampliar a pantalla completa"
              >
                Pantalla Completa
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-gradient-to-b from-[#1A1A2E] to-[#121223]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.rol === 'usuario' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.rol === 'usuario'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-md'
                      : 'bg-purple-950/60 border border-purple-700/40 text-gray-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.contenido}</p>

                  {/* Generated Order Card */}
                  {msg.pedido_generado && (
                    <div className="mt-3 p-3 bg-purple-900/80 border border-pink-500/50 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-pink-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Resumen de tu Cotización</span>
                      </div>
                      <div className="text-gray-200 space-y-1">
                        <div>
                          <strong>Servicio:</strong> {msg.pedido_generado.servicio_nombre}
                        </div>
                        <div>
                          <strong>Plan:</strong> {msg.pedido_generado.plan_nombre}
                        </div>
                        <div className="text-emerald-400 font-extrabold text-sm pt-1">
                          Precio Total: S/ {msg.pedido_generado.presupuesto_total}
                        </div>
                        <div className="text-[11px] text-gray-300">
                          Anticipo 50%: <span className="font-bold text-white">S/ {msg.pedido_generado.presupuesto_total! / 2}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartPayment(msg.pedido_generado)}
                        className="w-full mt-2 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Pagar Anticipo (S/ {msg.pedido_generado.presupuesto_total! / 2})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-gray-400 mt-1 block text-right">{msg.timestamp}</span>
                </div>

                {/* Quick Option Pills */}
                {msg.opciones_rapidas && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.opciones_rapidas.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(opt)}
                        className="text-[11px] px-2.5 py-1.5 rounded-full bg-purple-900/40 hover:bg-purple-800 border border-purple-500/30 text-purple-200 transition-all hover:scale-105"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {offContextCount >= 2 && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs space-y-2 text-center animate-pulse">
                <p className="text-emerald-200 font-medium">¿Prefieres atención directa con nuestro equipo?</p>
                <a
                  href="https://wa.me/51905551491"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg text-xs"
                >
                  <PhoneCall className="w-4 h-4" /> Hablar por WhatsApp (+51 905 551 491)
                </a>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 p-3 rounded-xl w-fit">
                <Bot className="w-4 h-4 animate-spin text-pink-400" />
                <span>CreaBot está pensando tu respuesta...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#121223] border-t border-purple-900/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Escribe tu consulta o cotización..."
              className="flex-1 bg-purple-950/50 border border-purple-800/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
