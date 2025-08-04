import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  getAvailableTimeSlots, 
  getBusinessHours, 
  isDateInPast, 
  isTimeSlotInPast,
  type BookingConflict 
} from '@/lib/utils';

const BOOKINGS_PATH = path.join(process.cwd(), 'src/data/bookings.json');
const TEST_DRIVES_PATH = path.join(process.cwd(), 'src/data/test-drives.json');

async function readBookings(): Promise<BookingConflict[]> {
  try {
    const data = await fs.readFile(BOOKINGS_PATH, 'utf-8');
    const bookings = JSON.parse(data);
    return bookings.map((booking: any) => ({
      id: booking.id,
      name: booking.name,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      status: booking.status
    }));
  } catch {
    return [];
  }
}

async function readTestDrives(): Promise<BookingConflict[]> {
  try {
    const data = await fs.readFile(TEST_DRIVES_PATH, 'utf-8');
    const testDrives = JSON.parse(data);
    return testDrives.map((testDrive: any) => ({
      id: testDrive.id,
      name: testDrive.name,
      model: testDrive.model,
      date: testDrive.date,
      time: testDrive.time,
      status: testDrive.status
    }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type'); // 'service' or 'test-drive' or 'all'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // If we have a date range, return availability for multiple dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateRange: string[] = [];
      
      // Generate all dates in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(d.toISOString().split('T')[0]);
      }
      
      // Fetch existing bookings based on type
      let existingBookings: BookingConflict[] = [];
      
      if (type === 'service' || type === 'all') {
        const serviceBookings = await readBookings();
        existingBookings.push(...serviceBookings);
      }
      
      if (type === 'test-drive' || type === 'all') {
        const testDriveBookings = await readTestDrives();
        existingBookings.push(...testDriveBookings);
      }
      
      // If no type specified, check both
      if (!type) {
        const serviceBookings = await readBookings();
        const testDriveBookings = await readTestDrives();
        existingBookings = [...serviceBookings, ...testDriveBookings];
      }
      
      // Get availability for each date in the range
      const availabilityMap: Record<string, { hasAvailableSlots: boolean; totalSlots: number; availableSlots: number }> = {};
      
      for (const checkDate of dateRange) {
        if (isDateInPast(checkDate)) {
          availabilityMap[checkDate] = { hasAvailableSlots: false, totalSlots: 0, availableSlots: 0 };
          continue;
        }
        
        const businessHours = getBusinessHours(new Date(checkDate).getDay());
        const availableSlots = getAvailableTimeSlots(
          checkDate,
          existingBookings,
          businessHours.start,
          businessHours.end,
          30
        );
        
        // Filter out past time slots for today
        const filteredSlots = availableSlots.filter(slot => 
          slot.available && !isTimeSlotInPast(checkDate, slot.time)
        );
        
        availabilityMap[checkDate] = {
          hasAvailableSlots: filteredSlots.length > 0,
          totalSlots: availableSlots.length,
          availableSlots: filteredSlots.length
        };
      }
      
      return NextResponse.json({
        dateRange: { startDate, endDate },
        availability: availabilityMap
      });
    }
    
    // Original single date logic
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Check if date is in the past
    if (isDateInPast(date)) {
      return NextResponse.json({ 
        error: 'Cannot book appointments in the past',
        availableSlots: []
      });
    }

    // Get business hours for the selected date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const businessHours = getBusinessHours(dayOfWeek);

    // Fetch existing bookings based on type
    let existingBookings: BookingConflict[] = [];
    
    if (type === 'service' || type === 'all') {
      const serviceBookings = await readBookings();
      existingBookings.push(...serviceBookings);
    }
    
    if (type === 'test-drive' || type === 'all') {
      const testDriveBookings = await readTestDrives();
      existingBookings.push(...testDriveBookings);
    }

    // If no type specified, check both
    if (!type) {
      const serviceBookings = await readBookings();
      const testDriveBookings = await readTestDrives();
      existingBookings = [...serviceBookings, ...testDriveBookings];
    }

    // Get available time slots
    const availableSlots = getAvailableTimeSlots(
      date,
      existingBookings,
      businessHours.start,
      businessHours.end,
      30 // 30-minute intervals
    );

    // Filter out past time slots for today
    const filteredSlots = availableSlots.map(slot => ({
      ...slot,
      available: slot.available && !isTimeSlotInPast(date, slot.time)
    }));

    return NextResponse.json({
      date,
      businessHours,
      availableSlots: filteredSlots,
      totalSlots: filteredSlots.length,
      availableCount: filteredSlots.filter(slot => slot.available).length
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    return NextResponse.json({ error: 'Failed to get available slots' }, { status: 500 });
  }
} 