import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, QrCode, Building, CheckCircle2, ArrowRight, Lock, Clock } from 'lucide-react';
import { CreaWebLogo } from './CreaWebLogo';

type SimpleMethod = 'yape' | 'plin' | 'transferencia';

export const PaymentModal: React.FC = () => {
  const { isPaymentModalOpen, setIsPaymentModalOpen, paymentTargetProject, paymentType, handleReportPayment, openLegalModal } =
    useApp();

  const [selectedMethod, setSelectedMethod] = useState<SimpleMethod>('yape');
  const [txRef, setTxRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isPaymentModalOpen || !paymentTargetProject) return null;

  const totalAmount = paymentTargetProject.presupuesto_total || 100;
  const amountToPay = totalAmount / 2;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const ok = await handleReportPayment(paymentTargetProject, selectedMethod, txRef.trim());

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
        {/* Modal Header */}
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

        {/* Modal Body */}
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
            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* Summary Card */}
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

              <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2 flex gap-2 items-start">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Realiza el pago por el medio elegido y luego pega aquí el número de operación. Un asesor lo
                  verificará antes de confirmar tu proyecto.
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-300 mb-2">
                  Selecciona Método de Pago en Perú:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('yape')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedMethod === 'yape'
                        ? 'bg-purple-600/30 border-pink-500 text-white font-bold ring-2 ring-pink-500/50'
                        : 'bg-purple-950/30 border-gray-800 text-gray-300 hover:border-purple-600'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <span className="text-xs">Yape</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('plin')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedMethod === 'plin'
                        ? 'bg-purple-600/30 border-pink-500 text-white font-bold ring-2 ring-pink-500/50'
                        : 'bg-purple-950/30 border-gray-800 text-gray-300 hover:border-purple-600'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-teal-400" />
                    <span className="text-xs">Plin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('transferencia')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedMethod === 'transferencia'
                        ? 'bg-purple-600/30 border-pink-500 text-white font-bold ring-2 ring-pink-500/50'
                        : 'bg-purple-950/30 border-gray-800 text-gray-300 hover:border-purple-600'
                    }`}
                  >
                    <Building className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Banco BCP</span>
                  </button>
                </div>
              </div>

              {/* Method Details */}
              {(selectedMethod === 'yape' || selectedMethod === 'plin') && (
                <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-3 text-xs text-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0">
                      <QrCode className="w-full h-full text-purple-900" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Yape / Plin Oficial CreaWeb</p>
                      <p className="text-emerald-400 font-semibold text-sm">Número: +51 905 551 491</p>
                      <p className="text-gray-400">Titular: CreaWeb Perú S.A.C.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Código de Operación o Nro de Referencia:
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
                </div>
              )}

              {selectedMethod === 'transferencia' && (
                <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-3 text-xs text-gray-200">
                  <div className="space-y-1">
                    <p className="font-bold text-white">Transferencia BCP / CCI Perú</p>
                    <p>Cuenta BCP Soles: 193-9821034-0-12</p>
                    <p>CCI: 00219300982103401219</p>
                    <p className="text-gray-400">Titular: CreaWeb Perú S.A.C.</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Nro de Operación de Transferencia:
                    </label>
                    <input
                      type="text"
                      required
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder="Ej: BCP-198234"
                      className="w-full bg-[#121223] border border-purple-700/60 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
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

              {/* Submit Button */}
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
