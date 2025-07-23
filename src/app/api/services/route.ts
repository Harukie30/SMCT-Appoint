import { NextRequest, NextResponse } from 'next/server';
import type { Service } from '@/types/localStorage';

const services: Service[] = [];

export async function GET() {
  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.duration || !data.price || !data.vehicleType || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newService: Service = {
      ...data,
      id: Date.now(),
    };
    services.push(newService);
    return NextResponse.json({ success: true, service: newService });
  } catch {
    return NextResponse.json({ error: 'Failed to add service' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    services.splice(index, 1);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Service not found' }, { status: 404 });
} 