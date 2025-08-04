import { NextRequest, NextResponse } from 'next/server';
import type { BookingData } from '@/types/localStorage';
import { promises as fs } from 'fs';
import path from 'path';

const BOOKINGS_PATH = path.join(process.cwd(), 'src/data/bookings.json');
const EMPLOYEES_PATH = path.join(process.cwd(), 'src/data/employees.json');

interface Booking extends BookingData {
  id: number;
  status: string;
  assignedEmployee?: string;
}

async function readBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile(BOOKINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeBookings(bookings: Booking[]) {
  await fs.writeFile(BOOKINGS_PATH, JSON.stringify(bookings, null, 2), 'utf-8');
}

async function readEmployees(): Promise<any[]> {
  try {
    const data = await fs.readFile(EMPLOYEES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper function to automatically assign an employee from the selected branch
async function assignEmployeeToBranch(branchName: string): Promise<string | null> {
  try {
    const employees = await readEmployees();
    const branchEmployees = employees.filter(emp => emp.branch === branchName);
    
    if (branchEmployees.length === 0) {
      console.log(`No employees found for branch: ${branchName}`);
      return null;
    }
    
    // Get current bookings to implement load balancing
    const bookings = await readBookings();
    
    // Count bookings per employee for this branch
    const employeeBookingCounts: { [key: string]: number } = {};
    branchEmployees.forEach(emp => {
      employeeBookingCounts[emp.name] = 0;
    });
    
    // Count existing bookings for each employee
    bookings.forEach(booking => {
      if (booking.branch === branchName && booking.assignedEmployee) {
        employeeBookingCounts[booking.assignedEmployee] = 
          (employeeBookingCounts[booking.assignedEmployee] || 0) + 1;
      }
    });
    
    // Find the employee with the least bookings
    let selectedEmployee = branchEmployees[0];
    let minBookings = employeeBookingCounts[selectedEmployee.name] || 0;
    
    branchEmployees.forEach(emp => {
      const bookingCount = employeeBookingCounts[emp.name] || 0;
      if (bookingCount < minBookings) {
        selectedEmployee = emp;
        minBookings = bookingCount;
      }
    });
    
    console.log(`Assigned employee ${selectedEmployee.name} to branch ${branchName} (${minBookings} current bookings)`);
    
    return selectedEmployee.name;
  } catch (error) {
    console.error('Error assigning employee:', error);
    return null;
  }
}

export async function GET() {
  const bookings = await readBookings();
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
    
    // Automatically assign an employee from the selected branch
    const assignedEmployee = await assignEmployeeToBranch(bookingData.branch);
    
    const bookings = await readBookings();
    const newBooking: Booking = { 
      ...bookingData, 
      id: Date.now(), 
      status: 'Pending',
      assignedEmployee: assignedEmployee || undefined
    };
    
    bookings.push(newBooking);
    await writeBookings(bookings);
    
    return NextResponse.json({ 
      success: true, 
      booking: newBooking,
      message: assignedEmployee 
        ? `Booking created successfully. Assigned to ${assignedEmployee}.`
        : 'Booking created successfully. No employees available at this branch.'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, assignedEmployee } = await request.json();
    const bookings = await readBookings();
    const booking = bookings.find((b: Booking) => b.id === id);
    if (booking) {
      // Update status if provided
      if (status !== undefined) {
        booking.status = status;
      }
      // Update assigned employee if provided
      if (assignedEmployee !== undefined) {
        booking.assignedEmployee = assignedEmployee || undefined;
      }
      await writeBookings(bookings);
      return NextResponse.json({ success: true, booking });
    }
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE request received');
    const body = await request.json();
    console.log('Request body:', body);
    const { id } = body;
    
    console.log('Booking ID to delete:', id);
    
    if (!id) {
      console.log('No ID provided');
      return NextResponse.json({ 
        error: 'Booking ID is required' 
      }, { status: 400 });
    }

    const bookings = await readBookings();
    console.log('Current bookings:', bookings);
    const index = bookings.findIndex((b: Booking) => b.id === id);
    console.log('Found booking at index:', index);
    
    if (index === -1) {
      console.log('Booking not found');
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    const deletedBooking = bookings[index];
    console.log('Deleting booking:', deletedBooking);
    bookings.splice(index, 1);
    await writeBookings(bookings);
    console.log('Booking deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: `Booking for "${deletedBooking.name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ 
      error: 'Failed to delete booking. Please try again.' 
    }, { status: 500 });
  }
} 