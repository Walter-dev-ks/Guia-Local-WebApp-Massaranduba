import { supabase } from '@/integrations/supabase/client';
import type { WeeklyHours } from '@/types';

export interface SpecialHours {
  [date: string]: {
    open: string;
    close: string;
    closed: boolean;
    reason?: string;
  };
}

export interface BusinessHoursWithSpecial {
  hours: WeeklyHours;
  special_hours?: SpecialHours;
}

export function isBusinessOpenFromHours(hours: WeeklyHours, specialHours?: SpecialHours): boolean {
  const now = new Date();
  const today = formatDateForSpecialHours(now);
  
  // Check if today has special hours
  if (specialHours && specialHours[today]) {
    const specialDay = specialHours[today];
    return !specialDay.closed && isTimeInRange(now, specialDay.open, specialDay.close);
  }
  
  // Use regular weekly hours
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayName = days[now.getDay()];
  const todayHours = hours[dayName];

  if (todayHours.closed) return false;

  return isTimeInRange(now, todayHours.open, todayHours.close);
}

export function getBusinessStatusText(hours: WeeklyHours, specialHours?: SpecialHours): string {
  const now = new Date();
  const today = formatDateForSpecialHours(now);
  const hasSpecialHours = specialHours && specialHours[today];
  
  if (hasSpecialHours) {
    const specialDay = specialHours[today];
    if (specialDay.closed) {
      return 'Fechado em horário especial';
    }
    return 'Aberto em horário especial';
  }
  
  const isOpen = isBusinessOpenFromHours(hours, specialHours);
  return isOpen ? 'Aberto' : 'Fechado';
}

export function getSpecialHoursForDate(specialHours?: SpecialHours, date: Date = new Date()) {
  if (!specialHours) return undefined;

  const today = formatDateForSpecialHours(date);
  return specialHours[today];
}

export function getSpecialHourReason(specialHours?: SpecialHours): string | undefined {
  if (!specialHours) return undefined;
  
  const now = new Date();
  const today = formatDateForSpecialHours(now);
  
  return specialHours[today]?.reason;
}

function isTimeInRange(date: Date, openTime: string, closeTime: string): boolean {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes <= openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

function formatDateForSpecialHours(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStorageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return data.publicUrl;
}
