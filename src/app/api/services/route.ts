import { NextRequest, NextResponse } from 'next/server';
import type { Service } from '@/types/localStorage';
import { promises as fs } from 'fs';
import path from 'path';

const servicesFile = path.join(process.cwd(), 'src/data/services.json');

async function readServices(): Promise<Service[]> {
  try {
    const data = await fs.readFile(servicesFile, 'utf-8');
    return JSON.parse(data) as Service[];
  } catch {
    return [];
  }
}

async function writeServices(services: Service[]): Promise<void> {
  await fs.writeFile(servicesFile, JSON.stringify(services, null, 2), 'utf-8');
}

export async function GET() {
  const services = await readServices();
  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.duration || !data.price || !data.vehicleType || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const services = await readServices();
    const newService: Service = {
      ...data,
      id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
    };
    services.push(newService);
    await writeServices(services);
    return NextResponse.json({ success: true, service: newService });
  } catch {
    return NextResponse.json({ error: 'Failed to add service' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const services = await readServices();
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    services.splice(index, 1);
    await writeServices(services);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Service not found' }, { status: 404 });
} 