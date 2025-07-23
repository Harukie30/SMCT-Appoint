import { NextRequest, NextResponse } from 'next/server';
import type { BookingData } from '@/types/localStorage';

// In-memory bookings array
const bookings: (BookingData & { id: number; status: string })[] = [];

export async function GET() {
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time', 'branch'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    const newBooking = { ...bookingData, id: Date.now(), status: 'Pending' };
    bookings.push(newBooking);
    return NextResponse.json({ success: true, booking: newBooking });
  } catch {
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      return NextResponse.json({ success: true, booking });
    }
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings.splice(index, 1);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
} 