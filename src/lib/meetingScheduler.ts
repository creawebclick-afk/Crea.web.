/**
 * CreaWeb - Meeting Schedule Validator
 * Strictly enforces Peruvian Business Hours as defined in Section 8.8:
 * - Lun / Mié / Vie / Sáb: 3:00 pm – 10:00 pm (15:00 – 22:00)
 * - Mar / Jue: 3:00 pm – 6:00 pm (15:00 – 18:00)
 * - Domingo: Cerrado
 */

export interface TimeSlot {
  timeStr: string; // e.g. "15:00", "16:00"
  label: string;   // e.g. "3:00 PM", "4:00 PM"
}

export const PERU_MEETING_HOURS = {
  // 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 0: Sunday
  1: { start: 15, end: 22, name: 'Lunes (3:00 pm - 10:00 pm)' },
  2: { start: 15, end: 18, name: 'Martes (3:00 pm - 6:00 pm)' },
  3: { start: 15, end: 22, name: 'Miércoles (3:00 pm - 10:00 pm)' },
  4: { start: 15, end: 18, name: 'Jueves (3:00 pm - 6:00 pm)' },
  5: { start: 15, end: 22, name: 'Viernes (3:00 pm - 10:00 pm)' },
  6: { start: 15, end: 22, name: 'Sábado (3:00 pm - 10:00 pm)' },
  0: { start: 0, end: 0, name: 'Domingo (Cerrado)' },
};

export function isDateAvailableForMeetings(dateObj: Date): boolean {
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek !== 0; // Sundays are closed
}

export function getAvailableTimeSlotsForDate(dateObj: Date): TimeSlot[] {
  const dayOfWeek = dateObj.getDay();
  const config = PERU_MEETING_HOURS[dayOfWeek as keyof typeof PERU_MEETING_HOURS];

  if (!config || config.start === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];
  for (let hour = config.start; hour < config.end; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    
    // Add 1-hour slots
    slots.push({
      timeStr: `${hour.toString().padStart(2, '0')}:00`,
      label: `${displayHour}:00 ${period}`,
    });
    
    // Add 30-min slots if not the very end
    if (hour + 0.5 < config.end) {
      slots.push({
        timeStr: `${hour.toString().padStart(2, '0')}:30`,
        label: `${displayHour}:30 ${period}`,
      });
    }
  }

  return slots;
}

export function formatPeruDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatPeruTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
