import { NextRequest, NextResponse } from 'next/server';
import type { Branch } from '@/types/localStorage';

const branches: Branch[] = [];

export async function GET() {
  return NextResponse.json(branches);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.address || !data.hours || !data.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newBranch: Branch = {
      ...data,
      id: Date.now(),
    };
    branches.push(newBranch);
    return NextResponse.json({ success: true, branch: newBranch });
  } catch {
    return NextResponse.json({ error: 'Failed to add branch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const index = branches.findIndex(b => b.id === id);
  if (index !== -1) {
    branches.splice(index, 1);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
} 