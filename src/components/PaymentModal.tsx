import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, MessageCircle, Lock, Clock, ArrowRight } from 'lucide-react';
import { CreaWebLogo } from './CreaWebLogo';

type SimpleMethod = 'yape' | 'plin' | 'transferencia' | 'efectivo';

export const PaymentModal: React.FC = () => {
  const { isPaymentModalOpen, setIsPaymentModalOpen, paymentTargetProject, paymentType, handleReportPayment, openLegalModal, config } =
    useApp();

  const [selectedMethod, setSelectedMethod] = useState<SimpleMethod>('yape');
  const [txRef, setTxRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  if (!isPaymentModalOpen || !paymentTargetProject) return null;

  const totalAmount = paymentTargetProject.presupuesto_total || 100;
  const amountToPay = totalAmount / 2;
  const whatsapp = config?.telefono_whatsapp || '51905551491';

  const mensajeWhatsapp = encodeURIComponent(
    `Hola CreaWeb 👋 Quiero coordinar el pago de mi proyecto "${paymentTargetProject.servicio_nombre || 'Servicio CreaWeb'}" (${
      paymentType === 'anticipo' ? 'anticipo 50%' : 'saldo final 50%'
    }: S/ ${amountToPay}.00). ¿Me pasas el número para Yape/Plin o los datos de la cuenta?`
  );

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const ok = await handleReportPayment(paymentTargetProject, selectedMethod as any, txRef.trim());
    setIsProcessing(false);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTxRef('');
      }, 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1A1A2E] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-[#121223] via-[#1A1A2E] to-purple-950 px-6 py-4 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreaWebLogo size="xs" variant="icon" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {paymentType === 'anticipo' ? 'Primer Pago (50% Anticipo)' : 'Segundo Pago (50% Saldo)'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {paymentTargetProject.servicio_nombre || 'Servicio CreaWeb'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-white">¡Pago Reportado!</h4>
              <p className="text-sm text-gray-300 max-w-xs mx-auto">
                Nuestro equipo va a verificar tu pago manualmente (normalmente en minutos, no más de unas
                horas) y recién ahí quedará confirmado. Te avisaremos por WhatsApp.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-purple-950/60 border border-purple-800/60 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span>Presupuesto Total del Proyecto:</span>
                  <span className="font-semibold text-white">S/ {totalAmount}.00</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-pink-300 pt-1 border-t border-purple-800/50">
                  <span>Monto a Pagar Ahora (50%):</span>
                  <span className="text-lg text-emerald-400">S/ {amountToPay}.00 Soles</span>
                </div>
              </div>

              {!showReportForm ? (
                <>
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                    <MessageCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Por seguridad, no mostramos números de pago automáticamente. Coordina directo con
                      nosotros por WhatsApp y te confirmamos a dónde Yapear/Plinear o transferir.
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${whatsapp}?text=${mensajeWhatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> Coordinar Pago por WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowReportForm(true)}
                    className="w-full py-2.5 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    Ya pagué, quiero reportarlo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-5">
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                    <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Cuenta el medio que usaste y el código de operación. Un asesor lo verificará antes de confirmar tu proyecto.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-300 mb-2">Medio de pago usado:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['yape', 'plin', 'transferencia', 'efectivo'] as SimpleMethod[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSelectedMethod(m)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                            selectedMethod === m
                              ? 'bg-purple-600/30 border-pink-500 text-white ring-2 ring-pink-500/50'
                              : 'bg-purple-950/30 border-gray-800 text-gray-300 hover:border-purple-600'
                          }`}
                        >
                          {m === 'transferencia' ? 'Transf.' : m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Código de Operación / Referencia:
                    </label>
                    <input
                      type="text"
                      required
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder="Ej: 849201"
                      className="w-full bg-[#121223] border border-purple-700/60 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-gray-400">
                    <input type="checkbox" required defaultChecked id="terms-pay" className="mt-0.5 rounded" />
                    <label htmlFor="terms-pay">
                      Acepto los{' '}
                      <button type="button" onClick={() => openLegalModal('terminos')} className="text-purple-300 underline">
                        Términos del Servicio 50/50
                      </button>{' '}
                      y la Política de Reembolso (100% garantizado en estado 0%).
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Enviando reporte de pago...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Reportar Pago de S/ {amountToPay}.00 Soles</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="w-full text-center text-[11px] text-gray-500 hover:text-gray-300"
                  >
                    ← Volver a coordinar por WhatsApp
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
