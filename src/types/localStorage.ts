// TypeScript types for localStorage usage

// Define the structure of data stored in localStorage
export interface LocalStorageData {
  // Authentication data
  adminLoggedIn?: string;
  employeeLoggedIn?: string;
  userRole?: "admin" | "employee";
  employeeName?: string;
  
  // Booking data
  rescheduleBooking?: string;
  lastBooking?: BookingData;
  
  // Application data
  bookings?: Booking[];
  employees?: Employee[];
  branches?: Branch[];
  services?: Service[];
}

// Interface for booking data structure
export interface BookingData {
  id?: number;
  branch: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  plate: string;
  model: string;
  notes?: string;
}

// Application data interfaces
export interface Booking {
  id: number;
  branch: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "No Show" | "Done" | "Canceled";
  email: string;
  assignedEmployee?: string; // Name of the assigned employee
  phone: string;
  plate: string;
  model: string;
  notes?: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  branch: string;
  password?: string;
  phone?: string;
  role?: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  hours: string;
  location: string;
}

export interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  vehicleType: string;
  category: string;
}

// Type-safe localStorage wrapper class
export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  private constructor() {}
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  // Check if localStorage is available (client-side only)
  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  // Generic setter with type safety
  setItem<K extends keyof LocalStorageData>(
    key: K, 
    value: LocalStorageData[K]
  ): void {
    if (!this.isLocalStorageAvailable()) return;
    
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, String(value));
    }
  }

  // Generic getter with type safety
  getItem<K extends keyof LocalStorageData>(
    key: K
  ): LocalStorageData[K] | null {
    if (!this.isLocalStorageAvailable()) return null;
    
    const item = localStorage.getItem(key);
    if (item === null) return null;
    
    // Try to parse as JSON first, fallback to string
    try {
      return JSON.parse(item) as LocalStorageData[K];
    } catch {
      return item as LocalStorageData[K];
    }
  }

  // Remove item
  removeItem<K extends keyof LocalStorageData>(key: K): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.removeItem(key);
  }

  // Clear all items
  clear(): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.clear();
  }

  // Authentication methods
  isAdminLoggedIn(): boolean {
    return this.getItem('adminLoggedIn') === 'true';
  }

  isEmployeeLoggedIn(): boolean {
    return this.getItem('employeeLoggedIn') === 'true';
  }

  getUserRole(): "admin" | "employee" | null {
    return this.getItem('userRole') || null;
  }

  getEmployeeName(): string | null {
    return this.getItem('employeeName') || null;
  }

  getLastBooking(): BookingData | null {
    return this.getItem('lastBooking') || null;
  }

  isRescheduleBooking(): boolean {
    return this.getItem('rescheduleBooking') === 'true';
  }

  setAdminAuth(): void {
    this.setItem('adminLoggedIn', 'true');
    this.setItem('userRole', 'admin');
  }

  setEmployeeAuth(employeeName: string): void {
    this.setItem('employeeLoggedIn', 'true');
    this.setItem('userRole', 'employee');
    this.setItem('employeeName', employeeName);
  }

  clearAuth(): void {
    this.removeItem('adminLoggedIn');
    this.removeItem('employeeLoggedIn');
    this.removeItem('userRole');
    this.removeItem('employeeName');
  }

  setLastBooking(booking: BookingData): void {
    this.setItem('lastBooking', booking);
  }

  setRescheduleBooking(): void {
    this.setItem('rescheduleBooking', 'true');
  }

  clearBookingData(): void {
    this.removeItem('lastBooking');
    this.removeItem('rescheduleBooking');
  }

  // Application data methods
  getBookings(): Booking[] {
    return this.getItem('bookings') || [];
  }

  setBookings(bookings: Booking[]): void {
    this.setItem('bookings', bookings);
  }

  addBooking(booking: Omit<Booking, 'id'>): Booking {
    const bookings = this.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1
    };
    bookings.push(newBooking);
    this.setBookings(bookings);
    return newBooking;
  }

  updateBooking(id: number, updates: Partial<Booking>): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    bookings[index] = { ...bookings[index], ...updates };
    this.setBookings(bookings);
    return bookings[index];
  }

  deleteBooking(id: number): boolean {
    const bookings = this.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    if (filtered.length === bookings.length) return false;
    
    this.setBookings(filtered);
    return true;
  }

  getEmployees(): Employee[] {
    return this.getItem('employees') || [];
  }

  setEmployees(employees: Employee[]): void {
    this.setItem('employees', employees);
  }

  addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const employees = this.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1
    };
    employees.push(newEmployee);
    this.setEmployees(employees);
    return newEmployee;
  }

  updateEmployee(id: number, updates: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    employees[index] = { ...employees[index], ...updates };
    this.setEmployees(employees);
    return employees[index];
  }

  deleteEmployee(id: number): boolean {
    const employees = this.getEmployees();
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length === employees.length) return false;
    
    this.setEmployees(filtered);
    return true;
  }

  getBranches(): Branch[] {
    return this.getItem('branches') || [];
  }

  setBranches(branches: Branch[]): void {
    this.setItem('branches', branches);
  }

  addBranch(branch: Omit<Branch, 'id'>): Branch {
    const branches = this.getBranches();
    const newBranch: Branch = {
      ...branch,
      id: branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1
    };
    branches.push(newBranch);
    this.setBranches(branches);
    return newBranch;
  }

  updateBranch(id: number, updates: Partial<Branch>): Branch | null {
    const branches = this.getBranches();
    const index = branches.findIndex(b => b.id === id);
    if (index === -1) return null;
    
    branches[index] = { ...branches[index], ...updates };
    this.setBranches(branches);
    return branches[index];
  }

  deleteBranch(id: number): boolean {
    const branches = this.getBranches();
    const filtered = branches.filter(b => b.id !== id);
    if (filtered.length === branches.length) return false;
    
    this.setBranches(filtered);
    return true;
  }

  getServices(): Service[] {
    return this.getItem('services') || [];
  }

  setServices(services: Service[]): void {
    this.setItem('services', services);
  }

  addService(service: Omit<Service, 'id'>): Service {
    const services = this.getServices();
    const newService: Service = {
      ...service,
      id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1
    };
    services.push(newService);
    this.setServices(services);
    return newService;
  }

  updateService(id: number, updates: Partial<Service>): Service | null {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    services[index] = { ...services[index], ...updates };
    this.setServices(services);
    return services[index];
  }

  deleteService(id: number): boolean {
    const services = this.getServices();
    const filtered = services.filter(s => s.id !== id);
    if (filtered.length === services.length) return false;
    
    this.setServices(filtered);
    return true;
  }

  // Initialize data from JSON files (for first-time setup)
  initializeData(): void {
    // Only initialize if data doesn't exist
    if (this.getBookings().length === 0) {
      this.setBookings([
        {
          id: 1,
          branch: "Main Branch",
          name: "John Doe",
          service: "Oil Change",
          date: "2024-06-10",
          time: "10:00",
          status: "Pending",
          email: "john@example.com",
          phone: "",
          plate: "",
          model: ""
        },
        {
          id: 2,
          branch: "Main Branch",
          name: "Jane Smith",
          service: "Tire Rotation",
          date: "2024-06-11",
          time: "14:00",
          status: "Pending",
          email: "jane@example.com",
          phone: "",
          plate: "",
          model: ""
        },
        {
          id: 3,
          branch: "Branch B",
          name: "Alice Brown",
          service: "Battery Replacement",
          date: "2024-06-12",
          time: "09:30",
          status: "Pending",
          email: "alice@example.com",
          phone: "",
          plate: "",
          model: ""
        }
      ]);
    }

    if (this.getEmployees().length === 0) {
      this.setEmployees([
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
          branch: "Main Branch",
          password: "emp123"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane.smith@example.com",
          branch: "Main Branch"
        },
        {
          id: 3,
          name: "Alice Brown",
          email: "alice.brown@example.com",
          branch: "Branch B"
        }
      ]);
    }

    if (this.getBranches().length === 0) {
      this.setBranches([
        { id: 1, name: "TAGB HO", address: "123 Main St", hours: "9AM-7PM", location: "City Center" },
        { id: 2, name: "TAGB HO2", address: "456 High Ave", hours: "8AM-8PM", location: "City Center" },
        { id: 3, name: "Suburb", address: "789 Park Blvd", hours: "10AM-6PM", location: "Suburbs" }
      ]);
    }

    if (this.getServices().length === 0) {
      this.setServices([
        { id: 1, name: "Car tool", duration: "30 mins", price: "$35", vehicleType: "car", category: "Maintenance" },
        { id: 2, name: "Car Wash", duration: "45 mins", price: "$25", vehicleType: "car", category: "Maintenance" },
        { id: 3, name: "Motorcycle Oil Change", duration: "20 mins", price: "$20", vehicleType: "motorcycle", category: "Maintenance" },
        { id: 4, name: "Motorcycle major maintenance", duration: "20 mins", price: "$20", vehicleType: "motorcycle", category: "Maintenance" }
      ]);
    }
  }

  // Clear all application data
  clearAllData(): void {
    this.clear();
  }
}

// Export a singleton instance
export const localStorageManager = LocalStorageManager.getInstance();

// Type-safe localStorage hooks for React
export const useLocalStorage = {
  // Authentication
  getAdminLoggedIn: (): boolean => localStorageManager.isAdminLoggedIn(),
  getEmployeeLoggedIn: (): boolean => localStorageManager.isEmployeeLoggedIn(),
  getUserRole: (): "admin" | "employee" | null => localStorageManager.getUserRole(),
  getEmployeeName: (): string | null => localStorageManager.getEmployeeName(),
  getLastBooking: (): BookingData | null => localStorageManager.getLastBooking(),
  isRescheduleBooking: (): boolean => localStorageManager.isRescheduleBooking(),
  
  // Application data
  getBookings: (): Booking[] => localStorageManager.getBookings(),
  getEmployees: (): Employee[] => localStorageManager.getEmployees(),
  getBranches: (): Branch[] => localStorageManager.getBranches(),
  getServices: (): Service[] => localStorageManager.getServices(),
}; 