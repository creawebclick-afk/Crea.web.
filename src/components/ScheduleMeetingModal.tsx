import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreaWebLogo } from './CreaWebLogo';
import {
  PERU_MEETING_HOURS,
  getAvailableTimeSlotsForDate,
  isDateAvailableForMeetings,
  TimeSlot,
} from '../lib/meetingScheduler';
import { X, Calendar as CalendarIcon, Clock, Video, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { MeetingType } from '../types';

export const ScheduleMeetingModal: React.FC = () => {
  const { isMeetingModalOpen, setIsMeetingModalOpen, handleScheduleMeeting, projects, config } = useApp();

  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow by default
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('15:00');
  const [meetingType, setMeetingType] = useState<MeetingType>('video_call');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isMeetingModalOpen) return null;

  const dateObj = new Date(selectedDateStr + 'T12:00:00');
  const isAvailable = isDateAvailableForMeetings(dateObj);
  const availableSlots: TimeSlot[] = isAvailable ? getAvailableTimeSlotsForDate(dateObj) : [];

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || availableSlots.length === 0) return;

    const fullDateTimeISO = `${selectedDateStr}T${selectedSlot}:00-05:00`;
    const targetProj = projects.find((p) => p.id === selectedProjectId);

    const created = await handleScheduleMeeting({
      proyecto_id: selectedProjectId || undefined,
      proyecto_titulo: targetProj ? targetProj.servicio_nombre : 'Consulta de Servicio CreaWeb',
      fecha_hora: fullDateTimeISO,
      tipo: meetingType,
      link_reunion: meetingType === 'video_call' ? 'https://meet.google.com/creaweb-peru-meet' : undefined,
      notas: notes,
    });

    if (created) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsMeetingModalOpen(false);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1A1A2E] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden text-white my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#121223] via-[#1A1A2E] to-purple-950 px-6 py-4 border-b border-purple-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreaWebLogo size="xs" variant="icon" />
            <h3 className="text-lg font-bold text-white">Agendar Reunión / Asesoría</h3>
          </div>
          <button
            onClick={() => setIsMeetingModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">¡Reunión Confirmada!</h4>
              <p className="text-xs text-gray-300">
                Hemos enviado la confirmación a tu correo y WhatsApp. Te recordaremos 15 minutos antes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookMeeting} className="space-y-4">
              {/* Business Hours Info Badge */}
              <div className="p-3 bg-purple-950/60 border border-purple-800/60 rounded-xl text-xs space-y-1 text-purple-200">
                <div className="font-bold text-pink-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Horarios de Atención Perú:
                </div>
                <div>• Lun/Mié/Vie/Sáb: 3:00 pm – 10:00 pm</div>
                <div>• Mar/Jue: 3:00 pm – 6:00 pm | Dom: Cerrado</div>
              </div>

              {/* Select Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Selecciona Fecha:</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Time Slots */}
              {!isAvailable ? (
                <div className="p-3 bg-pink-950/40 border border-pink-500/40 rounded-xl text-xs text-pink-300 font-medium">
                  Los domingos la agencia está cerrada. Por favor selecciona de lunes a sábado.
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Horarios Disponibles para esta Fecha:
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.timeStr}
                        type="button"
                        onClick={() => setSelectedSlot(slot.timeStr)}
                        className={`py-2 px-2 text-xs rounded-lg border font-medium transition-all ${
                          selectedSlot === slot.timeStr
                            ? 'bg-purple-600 text-white border-pink-400 font-bold shadow-md'
                            : 'bg-purple-950/30 border-gray-800 text-gray-300 hover:border-purple-600'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Modalidad de Reunión:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingType('video_call')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                      meetingType === 'video_call'
                        ? 'bg-purple-600/30 border-pink-500 text-white font-bold'
                        : 'bg-purple-950/30 border-gray-800 text-gray-300'
                    }`}
                  >
                    <Video className="w-4 h-4 text-purple-400" />
                    <span>Google Meet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingType('llamada_telefonica')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                      meetingType === 'llamada_telefonica'
                        ? 'bg-purple-600/30 border-pink-500 text-white font-bold'
                        : 'bg-purple-950/30 border-gray-800 text-gray-300'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Llamada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingType('presencial')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all ${
                      meetingType === 'presencial'
                        ? 'bg-purple-600/30 border-pink-500 text-white font-bold'
                        : 'bg-purple-950/30 border-gray-800 text-gray-300'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Oficina {config?.ubicacion?.split(",")[0] || "Nuevo Chimbote"}</span>
                  </button>
                </div>
              </div>

              {/* Optional Project Link */}
              {projects.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Vincular a un Proyecto (Opcional):</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">Consulta General (Sin proyecto)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.servicio_nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Temas a Tratar / Notas:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Revisión de maqueta web, requerimientos de logo..."
                  className="w-full bg-[#121223] border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isAvailable || availableSlots.length === 0}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50"
              >
                Confirmar Cita para el {selectedDateStr} a las {selectedSlot}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
