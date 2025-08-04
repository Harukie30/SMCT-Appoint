import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CARS_PATH = path.join(process.cwd(), 'src/data/cars.json');

interface Car {
  id: number;
  model: string;
  brand: string;
  year: string;
  color: string;
  price: string;
  status: "Available" | "In Use" | "Maintenance" | "Sold";
  description?: string;
  imageUrl?: string;
}

async function readCars(): Promise<Car[]> {
  try {
    const data = await fs.readFile(CARS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function writeCars(cars: Car[]): Promise<void> {
  await fs.writeFile(CARS_PATH, JSON.stringify(cars, null, 2));
}

export async function GET() {
  try {
    const cars = await readCars();
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error reading cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const carData = await request.json();
    const cars = await readCars();
    
    const newCar: Car = {
      ...carData,
      id: Date.now(),
    };
    
    cars.push(newCar);
    await writeCars(cars);
    
    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    const cars = await readCars();
    
    const carIndex = cars.findIndex((car: Car) => car.id === id);
    if (carIndex === -1) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    cars[carIndex] = { ...cars[carIndex], ...updateData };
    await writeCars(cars);
    
    return NextResponse.json(cars[carIndex]);
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const cars = await readCars();
    
    const carIndex = cars.findIndex((car: Car) => car.id === id);
    if (carIndex === -1) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    cars.splice(carIndex, 1);
    await writeCars(cars);
    
    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
} 