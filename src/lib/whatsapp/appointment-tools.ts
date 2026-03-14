// Appointment booking utilities for WhatsApp AI Receptionist

export const AVAILABLE_SLOTS = {
  weekday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
  saturday: ['09:00', '10:00', '11:00', '12:00', '13:00'],
};

export const TREATMENTS = [
  { name: 'Dental checkup & clean', cost: '£60-£80' },
  { name: 'X-rays', cost: '£25-£50' },
  { name: 'White filling', cost: '£120-£200' },
  { name: 'Root canal', cost: '£400-£700' },
  { name: 'Crown', cost: '£500-£900' },
  { name: 'Teeth whitening', cost: '£350-£500' },
  { name: 'Invisalign consultation', cost: 'Free' },
  { name: 'Emergency appointment', cost: '£90' },
  { name: 'Tooth extraction', cost: '£150-£300' },
  { name: 'Implant consultation', cost: 'Free' },
] as const;

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

export function getAvailableSlots(date: Date): string[] {
  if (isWeekday(date)) return AVAILABLE_SLOTS.weekday;
  if (isSaturday(date)) return AVAILABLE_SLOTS.saturday;
  return []; // Sunday - closed
}

export function formatAppointmentDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatAppointmentTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
}
