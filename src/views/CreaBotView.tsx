import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendCreaBotMessage } from '../lib/api';
import { upsertCreaBotSession } from '../lib/supabaseApi';
import { Bot, Send, Sparkles, PhoneCall, CheckCircle2, ArrowRight } from 'lucide-react';
import { CreaBotMessage } from '../types';
import { CreaWebLogo } from '../components/CreaWebLogo';

export const CreaBotView: React.FC = () => {
  const {
    currentUser,
    setIsPaymentModalOpen,
    setPaymentTargetProject,
    setPaymentType,
    setIsAuthModalOpen,
    setPendingGuestCheckoutProject,
  } = useApp();

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [offContextCount, setOffContextCount] = useState(0);

  const [messages, setMessages] = useState<CreaBotMessage[]>([
    {
      id: 'msg-welcome-full',
      rol: 'asistente',
      contenido: `¡Hola 👋! Soy CreaBot IA, el cotizador y asistente inteligente de CreaWeb.

Estoy listo para responder tus dudas, calcular el costo de tu proyecto en Soles y registrar tu pedido.

¿Qué servicio necesitas cotizar hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      opciones_rapidas: [
        '🌐 Crear Página Web (S/ 50-100)',
        '🎨 Solicitar Logo (S/ 20)',
        '🖼 Diseño Gráfico (S/ 8-15)',
        '📢 Publicidad Digital (S/ 20-45)',
        '📲 Redes Sociales (S/ 40-90)',
        '💬 Hablar con un Asesor por WhatsApp',
      ],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const historyPayload = messages.map((m) => ({ rol: m.rol, contenido: m.contenido }));
    const botReplyText = await sendCreaBotMessage(text, historyPayload);

    // Registra la conversación para que, si no termina en un pedido, el admin
    // pueda verla en "Cotizaciones Abandonadas" y hacer seguimiento.
    if (currentUser) {
      upsertCreaBotSession(currentUser.id, currentUser.nombre_completo, currentUser.telefono, text);
    }

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

    let generatedOrder: any = null;
    if (
      textLower.includes('web') ||
      textLower.includes('tienda') ||
      textLower.includes('logo') ||
      textLower.includes('cotiz')
    ) {
      const isWeb = textLower.includes('web') || textLower.includes('tienda');
      generatedOrder = {
        servicio_id: isWeb ? 'srv-web' : 'srv-grafico',
        servicio_nombre: isWeb ? 'Diseño de Páginas Web' : 'Diseño Gráfico (Logo)',
        plan_nombre: isWeb ? 'Tienda Online E-commerce' : 'Logo Empresarial',
        descripcion_proyecto: `Cotización via CreaBot: ${text}`,
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
        : [
            '🌐 Tienda Online E-commerce (S/ 100)',
            '🎨 Logo Empresarial (S/ 20)',
            '📲 Manejo de Redes (S/ 40)',
            '✅ Continuar con el 50% de anticipo',
          ],
      pedido_generado: generatedOrder,
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const handleStartPayment = (order: any) => {
    if (!currentUser) {
      setPendingGuestCheckoutProject(order);
      setIsAuthModalOpen(true);
      return;
    }

    setPaymentTargetProject(order);
    setPaymentType('anticipo');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Header Bar */}
      <div className="bg-[#1A1A2E] border border-purple-500/40 rounded-t-3xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <CreaWebLogo size="sm" variant="icon" />
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>CreaBot IA - Cotizador Oficial</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Conectado con Gemini AI
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/51905551491"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <PhoneCall className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp Directo</span>
        </a>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-gradient-to-b from-[#121223] via-[#1A1A2E] to-[#121223] border-x border-purple-900/50 p-6 overflow-y-auto space-y-6 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.rol === 'usuario' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                msg.rol === 'usuario'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-lg'
                  : 'bg-purple-950/70 border border-purple-700/50 text-gray-100 rounded-bl-none shadow'
              }`}
            >
              <p className="whitespace-pre-line">{msg.contenido}</p>

              {/* Order Card inside chat */}
              {msg.pedido_generado && (
                <div className="mt-4 p-4 bg-purple-900/90 border border-pink-500/60 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-pink-300 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Resumen de tu Cotización Personalizada</span>
                  </div>
                  <div className="text-gray-200 space-y-1">
                    <div>
                      <strong>Servicio:</strong> {msg.pedido_generado.servicio_nombre}
                    </div>
                    <div>
                      <strong>Plan:</strong> {msg.pedido_generado.plan_nombre}
                    </div>
                    <div className="text-emerald-400 font-extrabold text-base pt-1">
                      Precio Total: S/ {msg.pedido_generado.presupuesto_total}.00 Soles
                    </div>
                    <div className="text-xs text-gray-300">
                      Anticipo 50% para Iniciar: <strong className="text-white">S/ {msg.pedido_generado.presupuesto_total! / 2}.00</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartPayment(msg.pedido_generado)}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-xs"
                  >
                    <span>Pagar 50% de Anticipo (S/ {msg.pedido_generado.presupuesto_total! / 2}.00)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <span className="text-[10px] text-gray-400 mt-2 block text-right">{msg.timestamp}</span>
            </div>

            {/* Quick Option Pills */}
            {msg.opciones_rapidas && (
              <div className="mt-3 flex flex-wrap gap-2 max-w-[90%]">
                {msg.opciones_rapidas.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(opt)}
                    className="text-xs px-3.5 py-2 rounded-full bg-purple-900/50 hover:bg-purple-800 border border-purple-500/40 text-purple-200 transition-all hover:scale-105"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {offContextCount >= 2 && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs space-y-2 text-center">
            <p className="text-emerald-200 font-bold">¿Prefieres ser atendido por uno de nuestros especialistas humanos?</p>
            <a
              href="https://wa.me/51905551491"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg text-xs"
            >
              <PhoneCall className="w-4 h-4" /> Chatear por WhatsApp (+51 905 551 491)
            </a>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 p-4 rounded-2xl w-fit">
            <Bot className="w-5 h-5 animate-spin text-pink-400" />
            <span>CreaBot está redactando la respuesta...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-[#1A1A2E] border-x border-b border-purple-500/40 rounded-b-3xl flex items-center gap-3 shadow-2xl"
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Escribe tu consulta o pide una cotización..."
          className="flex-1 bg-[#121223] border border-purple-700/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
        />
        <button
          type="submit"
          disabled={loading || !inputMsg.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold disabled:opacity-50 transition-all flex items-center gap-2 text-sm shadow-lg"
        >
          <span>Enviar</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
