import { NextRequest, NextResponse } from 'next/server';
import type { Branch } from '@/types/localStorage';
import { promises as fs } from 'fs';
import path from 'path';

const branchesFile = path.join(process.cwd(), 'src/data/branches.json');
const employeesFile = path.join(process.cwd(), 'src/data/employees.json');

async function readBranches(): Promise<Branch[]> {
  try {
    const data = await fs.readFile(branchesFile, 'utf-8');
    return JSON.parse(data) as Branch[];
  } catch {
    return [];
  }
}

async function readEmployees(): Promise<any[]> {
  try {
    const data = await fs.readFile(employeesFile, 'utf-8');
    return JSON.parse(data) as any[];
  } catch {
    return [];
  }
}

async function writeBranches(branches: Branch[]): Promise<void> {
  await fs.writeFile(branchesFile, JSON.stringify(branches, null, 2), 'utf-8');
}

async function writeEmployees(employees: any[]): Promise<void> {
  await fs.writeFile(employeesFile, JSON.stringify(employees, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats') === 'true';
  
  const branches = await readBranches();
  
  if (includeStats) {
    const employees = await readEmployees();
    const branchesWithStats = branches.map(branch => {
      const branchEmployees = employees.filter(emp => emp.branch === branch.name);
      return {
        ...branch,
        employeeCount: branchEmployees.length,
        employees: branchEmployees.map(emp => ({ id: emp.id, name: emp.name, email: emp.email }))
      };
    });
    return NextResponse.json(branchesWithStats);
  }
  
  return NextResponse.json(branches);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.address || !data.hours || !data.location) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, address, hours, and location are required' 
      }, { status: 400 });
    }

    // Validate branch name format
    if (data.name.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Branch name must be at least 2 characters long' 
      }, { status: 400 });
    }

    // Check if branch name already exists
    const branches = await readBranches();
    const existingBranch = branches.find(b => b.name.toLowerCase() === data.name.toLowerCase());
    if (existingBranch) {
      return NextResponse.json({ 
        error: 'A branch with this name already exists' 
      }, { status: 409 });
    }

    const newBranch: Branch = {
      ...data,
      id: branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1,
      name: data.name.trim(),
      address: data.address.trim(),
      hours: data.hours.trim(),
      location: data.location.trim(),
    };
    
    branches.push(newBranch);
    await writeBranches(branches);
    
    return NextResponse.json({ 
      success: true, 
      branch: newBranch,
      message: 'Branch added successfully'
    });
  } catch (error) {
    console.error('Error adding branch:', error);
    return NextResponse.json({ 
      error: 'Failed to add branch. Please try again.' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Branch ID is required' 
      }, { status: 400 });
    }

    const branches = await readBranches();
    const index = branches.findIndex(b => b.id === id);
    
    if (index === -1) {
      return NextResponse.json({ 
        error: 'Branch not found' 
      }, { status: 404 });
    }

    const branchToDelete = branches[index];
    
    // Check if branch has employees
    const employees = await readEmployees();
    const branchEmployees = employees.filter(emp => emp.branch === branchToDelete.name);
    
    if (branchEmployees.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete branch "${branchToDelete.name}" because it has ${branchEmployees.length} employee(s) assigned to it. Please reassign or delete the employees first.`,
        employeeCount: branchEmployees.length,
        employees: branchEmployees.map(emp => ({ id: emp.id, name: emp.name, email: emp.email }))
      }, { status: 409 });
    }

    branches.splice(index, 1);
    await writeBranches(branches);
    
    return NextResponse.json({ 
      success: true, 
      message: `Branch "${branchToDelete.name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ 
      error: 'Failed to delete branch. Please try again.' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ 
        error: 'Branch ID is required' 
      }, { status: 400 });
    }

    const branches = await readBranches();
    const index = branches.findIndex(b => b.id === data.id);
    
    if (index === -1) {
      return NextResponse.json({ 
        error: 'Branch not found' 
      }, { status: 404 });
    }

    // Validate branch name if being updated
    if (data.name) {
      if (data.name.trim().length < 2) {
        return NextResponse.json({ 
          error: 'Branch name must be at least 2 characters long' 
        }, { status: 400 });
      }

      // Check if new name already exists (excluding current branch)
      const existingBranch = branches.find(b => 
        b.name.toLowerCase() === data.name.toLowerCase() && b.id !== data.id
      );
      if (existingBranch) {
        return NextResponse.json({ 
          error: 'A branch with this name already exists' 
        }, { status: 409 });
      }
    }

    const oldBranchName = branches[index].name;
    const updatedBranch = { 
      ...branches[index], 
      ...data,
      name: data.name ? data.name.trim() : branches[index].name,
      address: data.address ? data.address.trim() : branches[index].address,
      hours: data.hours ? data.hours.trim() : branches[index].hours,
      location: data.location ? data.location.trim() : branches[index].location,
    };
    
    branches[index] = updatedBranch;
    await writeBranches(branches);

    // Update employees if branch name changed
    if (data.name && data.name !== oldBranchName) {
      const employees = await readEmployees();
      const updatedEmployees = employees.map(emp => 
        emp.branch === oldBranchName 
          ? { ...emp, branch: data.name }
          : emp
      );
      await writeEmployees(updatedEmployees);
    }
    
    return NextResponse.json({ 
      success: true, 
      branch: updatedBranch,
      message: 'Branch updated successfully'
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ 
      error: 'Failed to update branch. Please try again.' 
    }, { status: 500 });
  }
} 