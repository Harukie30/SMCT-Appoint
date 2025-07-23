import { NextRequest, NextResponse } from 'next/server';
import type { Branch } from '@/types/localStorage';
import { promises as fs } from 'fs';
import path from 'path';

const branchesFile = path.join(process.cwd(), 'src/data/branches.json');

async function readBranches(): Promise<Branch[]> {
  try {
    const data = await fs.readFile(branchesFile, 'utf-8');
    return JSON.parse(data) as Branch[];
  } catch {
    return [];
  }
}

async function writeBranches(branches: Branch[]): Promise<void> {
  await fs.writeFile(branchesFile, JSON.stringify(branches, null, 2), 'utf-8');
}

export async function GET() {
  const branches = await readBranches();
  return NextResponse.json(branches);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.address || !data.hours || !data.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const branches = await readBranches();
    const newBranch: Branch = {
      ...data,
      id: branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1,
    };
    branches.push(newBranch);
    await writeBranches(branches);
    return NextResponse.json({ success: true, branch: newBranch });
  } catch {
    return NextResponse.json({ error: 'Failed to add branch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const branches = await readBranches();
  const index = branches.findIndex(b => b.id === id);
  if (index !== -1) {
    branches.splice(index, 1);
    await writeBranches(branches);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
} 