import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Slot management utilities
export interface TimeSlot {
  time: string;
  available: boolean;
  conflictingBooking?: {
    id: number;
    name: string;
    service?: string;
    model?: string;
  };
}

export interface BookingConflict {
  id: number;
  name: string;
  service?: string;
  model?: string;
  date: string;
  time: string;
  status: string;
}

// Generate all possible time slots for a given date
export function generateTimeSlots(
  date: string,
  startTime: string = "09:00",
  endTime: string = "17:30",
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
    slots.push(timeString);
    
    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
}

// Check for booking conflicts on a specific date and time
export function checkBookingConflicts(
  date: string,
  time: string,
  existingBookings: BookingConflict[],
  excludeBookingId?: number
): BookingConflict | null {
  return existingBookings.find(booking => 
    booking.date === date && 
    booking.time === time && 
    booking.id !== excludeBookingId &&
    booking.status !== "Canceled" &&
    booking.status !== "No Show"
  ) || null;
}

// Get available time slots for a specific date
export function getAvailableTimeSlots(
  date: string,
  existingBookings: BookingConflict[],
  startTime: string = "09:00",
  endTime: string = "17:30",
  intervalMinutes: number = 30
): TimeSlot[] {
  const allSlots = generateTimeSlots(date, startTime, endTime, intervalMinutes);
  
  return allSlots.map(slot => {
    const conflict = checkBookingConflicts(date, slot, existingBookings);
    return {
      time: slot,
      available: !conflict,
      conflictingBooking: conflict || undefined
    };
  });
}

// Check if a specific date/time combination is available
export function isSlotAvailable(
  date: string,
  time: string,
  existingBookings: BookingConflict[],
  excludeBookingId?: number
): boolean {
  const conflict = checkBookingConflicts(date, time, existingBookings, excludeBookingId);
  return !conflict;
}

// Get business hours for different days (you can customize this)
export function getBusinessHours(dayOfWeek: number): { start: string; end: string } {
  // Sunday = 0, Monday = 1, etc.
  if (dayOfWeek === 0) { // Sunday
    return { start: "10:00", end: "16:00" };
  }
  if (dayOfWeek === 6) { // Saturday
    return { start: "09:00", end: "17:00" };
  }
  // Monday to Friday
  return { start: "09:00", end: "17:30" };
}

// Check if a date is in the past
export function isDateInPast(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  return selectedDate < today;
}

// Check if a date is today
export function isDateToday(date: string): boolean {
  const today = new Date();
  const selectedDate = new Date(date);
  return (
    today.getFullYear() === selectedDate.getFullYear() &&
    today.getMonth() === selectedDate.getMonth() &&
    today.getDate() === selectedDate.getDate()
  );
}

// Get current time in HH:MM format
export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// Check if a time slot is in the past for today
export function isTimeSlotInPast(date: string, time: string): boolean {
  if (!isDateToday(date)) return false;
  
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  return now > slotTime;
}
