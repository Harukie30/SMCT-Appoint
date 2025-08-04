import { NextRequest, NextResponse } from 'next/server';
import type { Employee } from '@/types/localStorage';
import { promises as fs } from 'fs';
import path from 'path';

const EMPLOYEES_PATH = path.join(process.cwd(), 'src/data/employees.json');
const BRANCHES_PATH = path.join(process.cwd(), 'src/data/branches.json');

async function readEmployees(): Promise<Employee[]> {
  try {
    const data = await fs.readFile(EMPLOYEES_PATH, 'utf-8');
    return JSON.parse(data) as Employee[];
  } catch {
    return [];
  }
}

async function readBranches(): Promise<any[]> {
  try {
    const data = await fs.readFile(BRANCHES_PATH, 'utf-8');
    return JSON.parse(data) as any[];
  } catch {
    return [];
  }
}

async function writeEmployees(employees: Employee[]) {
  await fs.writeFile(EMPLOYEES_PATH, JSON.stringify(employees, null, 2), 'utf-8');
}

// Validate if branch exists
async function validateBranch(branchName: string): Promise<boolean> {
  const branches = await readBranches();
  return branches.some(branch => branch.name === branchName);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch');
  
  const employees = await readEmployees();
  
  // If branch parameter is provided, filter employees by branch
  if (branch) {
    const filteredEmployees = employees.filter(emp => emp.branch === branch);
    return NextResponse.json(filteredEmployees);
  }
  
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.branch) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, and branch are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }

    // Validate phone number if provided
    if (data.phone && data.phone.length !== 11) {
      return NextResponse.json({ 
        error: 'Phone number must be exactly 11 digits' 
      }, { status: 400 });
    }

    // Validate password if provided
    if (data.password && data.password.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Validate branch exists
    const branchExists = await validateBranch(data.branch);
    if (!branchExists) {
      return NextResponse.json({ 
        error: `Branch "${data.branch}" does not exist. Please select a valid branch.` 
      }, { status: 400 });
    }

    // Check if email already exists
    const employees = await readEmployees();
    const existingEmployee = employees.find(emp => emp.email.toLowerCase() === data.email.toLowerCase());
    if (existingEmployee) {
      return NextResponse.json({ 
        error: 'An employee with this email already exists' 
      }, { status: 409 });
    }

    const newEmployee: Employee = {
      ...data,
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      branch: data.branch.trim(),
      phone: data.phone?.trim() || undefined,
    };
    
    employees.push(newEmployee);
    await writeEmployees(employees);
    
    // Return employee without password for security
    const { password, ...employeeWithoutPassword } = newEmployee;
    return NextResponse.json({ 
      success: true, 
      employee: employeeWithoutPassword,
      message: 'Employee added successfully'
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({ 
      error: 'Failed to add employee. Please try again.' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE request received');
    const body = await request.json();
    console.log('Request body:', body);
    const { id } = body;
    
    console.log('Employee ID to delete:', id);
    
    if (!id) {
      console.log('No ID provided');
      return NextResponse.json({ 
        error: 'Employee ID is required' 
      }, { status: 400 });
    }

    const employees = await readEmployees();
    console.log('Current employees:', employees);
    const index = employees.findIndex(e => e.id === id);
    console.log('Found employee at index:', index);
    
    if (index === -1) {
      console.log('Employee not found');
      return NextResponse.json({ 
        error: 'Employee not found' 
      }, { status: 404 });
    }

    const deletedEmployee = employees[index];
    console.log('Deleting employee:', deletedEmployee);
    employees.splice(index, 1);
    await writeEmployees(employees);
    console.log('Employee deleted successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: `Employee "${deletedEmployee.name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ 
      error: 'Failed to delete employee. Please try again.' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ 
        error: 'Employee ID is required' 
      }, { status: 400 });
    }

    const employees = await readEmployees();
    const index = employees.findIndex(e => e.id === data.id);
    
    if (index === -1) {
      return NextResponse.json({ 
        error: 'Employee not found' 
      }, { status: 404 });
    }

    // Validate email format if being updated
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json({ 
          error: 'Please enter a valid email address' 
        }, { status: 400 });
      }
    }

    // Validate phone number if being updated
    if (data.phone && data.phone.length !== 11) {
      return NextResponse.json({ 
        error: 'Phone number must be exactly 11 digits' 
      }, { status: 400 });
    }

    // Validate password if being updated
    if (data.password && data.password.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Validate branch if being updated
    if (data.branch) {
      const branchExists = await validateBranch(data.branch);
      if (!branchExists) {
        return NextResponse.json({ 
          error: `Branch "${data.branch}" does not exist. Please select a valid branch.` 
        }, { status: 400 });
      }
    }

    // Check if email already exists (excluding current employee)
    if (data.email) {
      const existingEmployee = employees.find(emp => 
        emp.email.toLowerCase() === data.email.toLowerCase() && emp.id !== data.id
      );
      if (existingEmployee) {
        return NextResponse.json({ 
          error: 'An employee with this email already exists' 
        }, { status: 409 });
      }
    }

    // Update employee
    const updatedEmployee = { 
      ...employees[index], 
      ...data,
      email: data.email ? data.email.toLowerCase().trim() : employees[index].email,
      name: data.name ? data.name.trim() : employees[index].name,
      branch: data.branch ? data.branch.trim() : employees[index].branch,
      phone: data.phone ? data.phone.trim() : employees[index].phone,
    };
    
    employees[index] = updatedEmployee;
    await writeEmployees(employees);
    
    // Return employee without password for security
    const { password, ...employeeWithoutPassword } = updatedEmployee;
    return NextResponse.json({ 
      success: true, 
      employee: employeeWithoutPassword,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ 
      error: 'Failed to update employee. Please try again.' 
    }, { status: 500 });
  }
} 