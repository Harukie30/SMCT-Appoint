import { NextRequest, NextResponse } from 'next/server';
import type { Employee } from '@/types/localStorage';

const employees: Employee[] = [];

export async function GET() {
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.email || !data.branch) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newEmployee: Employee = {
      ...data,
      id: Date.now(),
    };
    employees.push(newEmployee);
    return NextResponse.json({ success: true, employee: newEmployee });
  } catch {
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees.splice(index, 1);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
} 