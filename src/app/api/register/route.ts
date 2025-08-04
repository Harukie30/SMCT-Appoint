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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'phone', 'branch'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` }, 
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' }, 
        { status: 400 }
      );
    }

    // Validate password length
    if (data.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' }, 
        { status: 400 }
      );
    }

    // Validate phone number - exactly 11 digits
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 11 digits' }, 
        { status: 400 }
      );
    }

    // Validate branch exists
    const branchExists = await validateBranch(data.branch);
    if (!branchExists) {
      return NextResponse.json(
        { error: `Branch "${data.branch}" does not exist. Please select a valid branch.` }, 
        { status: 400 }
      );
    }

    // Check if email already exists
    const employees = await readEmployees();
    const existingEmployee = employees.find(emp => emp.email.toLowerCase() === data.email.toLowerCase());
    
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'An account with this email already exists' }, 
        { status: 409 }
      );
    }

    // Create new employee
    const newEmployee: Employee = {
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      branch: data.branch.trim(),
      password: data.password, // In production, this should be hashed
      phone: data.phone.trim(),
      role: data.role || 'employee'
    };

    // Add to employees list
    employees.push(newEmployee);
    await writeEmployees(employees);

    // Return success response (without password)
    const { password, ...employeeWithoutPassword } = newEmployee;
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now login.',
      employee: employeeWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user. Please try again.' }, 
      { status: 500 }
    );
  }
} 