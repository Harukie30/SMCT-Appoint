"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


// If you see a type error, add a file src/data/mockBookings.json.d.ts with:
// declare module "*.json" { const value: any; export default value; }
import type { Booking, Employee, Branch, Service } from "@/types/localStorage";

type TabId = 'overview' | 'bookings' | 'employees' | 'branches' | 'services';

function AdminSidebar() {
  const handleLogout = () => {
    // localStorageManager.clearAuth(); // Removed as per edit hint
    window.location.href = "/login";
  };
  
  return (
    <aside className="w-60 bg-blue-700 text-white flex flex-col py-8 px-4 shadow-lg min-h-screen">
      <div className="text-2xl font-bold mb-8">Admin</div>
      <nav className="flex-1 space-y-2">
        <Link href="/admin/appointments" className="block py-2 px-3 rounded hover:bg-blue-800">Appointments</Link>
        <Link href="/admin/data-management" className="block py-2 px-3 rounded hover:bg-blue-800 bg-blue-800 font-semibold">Data Management</Link>
      </nav>
      <button
        onClick={handleLogout}
        className="mt-8 py-2 px-3 rounded bg-red-500 hover:bg-red-700 text-white font-semibold"
      >
        Logout
      </button>
    </aside>
  );
}

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return <div className="p-4">Overview tab (no DataInitializer)</div>;
      case 'bookings':
        return <BookingsManager />;
      case 'employees':
        return <EmployeesManager />;
      case 'branches':
        return <BranchesManager />;
      case 'services':
        return <ServicesManager />;
      default:
        return <div className="p-4">Overview tab (no DataInitializer)</div>;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Data Management</h1>
        
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'employees', label: 'Employees' },
              { id: 'branches', label: 'Branches' },
              { id: 'services', label: 'Services' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {tabContent}
      </main>
    </div>
  );
}

// Individual managers for each data type
function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newBooking, setNewBooking] = useState({
    name: '',
    email: '',
    branch: '',
    service: '',
    date: '',
    time: '',
    status: 'Pending' as "Pending" | "No Show" | "Done" | "Canceled"
  });

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch bookings:", err));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAddBooking = async () => {
    if (newBooking.name && newBooking.email && newBooking.branch && newBooking.service && newBooking.date && newBooking.time) {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      fetchBookings();
      setNewBooking({
        name: '', email: '', branch: '', service: '', date: '', time: '', status: 'Pending'
      });
    }
  };

  const handleDeleteBooking = async (id: number) => {
    // Note: Your bookings API does not yet support DELETE. This will need to be added.
    // For now, this will not persist.
    console.log("DELETE functionality for bookings API not implemented yet.");
    setBookings(bookings.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bookings Management</h2>
      
      {/* Add new booking form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Add New Booking</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newBooking.name}
            onChange={(e) => setNewBooking({...newBooking, name: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={newBooking.email}
            onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Branch"
            value={newBooking.branch}
            onChange={(e) => setNewBooking({...newBooking, branch: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Service"
            value={newBooking.service}
            onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={newBooking.date}
            onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="time"
            value={newBooking.time}
            onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
            className="p-2 border rounded"
          />
          <select
            value={newBooking.status}
            onChange={(e) => setNewBooking({...newBooking, status: e.target.value as "Pending" | "No Show" | "Done" | "Canceled"})}
            className="p-2 border rounded"
          >
            <option value="Pending">Pending</option>
            <option value="No Show">No Show</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>
          <Button onClick={handleAddBooking} className="bg-blue-600 hover:bg-blue-700">
            Add Booking
          </Button>
        </div>
      </div>

      {/* Bookings list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b">
                <td className="px-4 py-3">{booking.name}</td>
                <td className="px-4 py-3">{booking.email}</td>
                <td className="px-4 py-3">{booking.branch}</td>
                <td className="px-4 py-3">{booking.service}</td>
                <td className="px-4 py-3">{booking.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'Done' ? 'bg-green-100 text-green-800' :
                    booking.status === 'No Show' ? 'bg-red-100 text-red-800' :
                    booking.status === 'Canceled' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', branch: '', password: '' });

  const fetchEmployees = () => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch employees:", err));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (newEmployee.name && newEmployee.email && newEmployee.branch) {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      fetchEmployees();
      setNewEmployee({ name: '', email: '', branch: '', password: '' });
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    await fetch('/api/employees', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchEmployees();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Employees Management</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Add New Employee</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Branch"
            value={newEmployee.branch}
            onChange={(e) => setNewEmployee({...newEmployee, branch: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password (optional)"
            value={newEmployee.password}
            onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
            className="p-2 border rounded"
          />
          <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
            Add Employee
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">{employee.branch}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BranchesManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', hours: '', location: '' });

  const fetchBranches = () => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch branches:", err));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranch = async () => {
    if (newBranch.name && newBranch.address && newBranch.hours && newBranch.location) {
      await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch),
      });
      fetchBranches();
      setNewBranch({ name: '', address: '', hours: '', location: '' });
    }
  };

  const handleDeleteBranch = async (id: number) => {
    await fetch('/api/branches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchBranches();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Branches Management</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Add New Branch</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newBranch.name}
            onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={newBranch.address}
            onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Hours"
            value={newBranch.hours}
            onChange={(e) => setNewBranch({...newBranch, hours: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Location"
            value={newBranch.location}
            onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
            className="p-2 border rounded"
          />
          <Button onClick={handleAddBranch} className="bg-blue-600 hover:bg-blue-700">
            Add Branch
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Hours</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id} className="border-b">
                <td className="px-4 py-3">{branch.name}</td>
                <td className="px-4 py-3">{branch.address}</td>
                <td className="px-4 py-3">{branch.hours}</td>
                <td className="px-4 py-3">{branch.location}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: '', duration: '', price: '', vehicleType: '', category: '' });

  const fetchServices = () => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch services:", err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async () => {
    if (newService.name && newService.duration && newService.price && newService.vehicleType && newService.category) {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      fetchServices();
      setNewService({ name: '', duration: '', price: '', vehicleType: '', category: '' });
    }
  };

  const handleDeleteService = async (id: number) => {
    await fetch('/api/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchServices();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Services Management</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Add New Service</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newService.name}
            onChange={(e) => setNewService({...newService, name: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Duration"
            value={newService.duration}
            onChange={(e) => setNewService({...newService, duration: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Price"
            value={newService.price}
            onChange={(e) => setNewService({...newService, price: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Vehicle Type"
            value={newService.vehicleType}
            onChange={(e) => setNewService({...newService, vehicleType: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={newService.category}
            onChange={(e) => setNewService({...newService, category: e.target.value})}
            className="p-2 border rounded"
          />
          <Button onClick={handleAddService} className="bg-blue-600 hover:bg-blue-700">
            Add Service
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Vehicle Type</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b">
                <td className="px-4 py-3">{service.name}</td>
                <td className="px-4 py-3">{service.duration}</td>
                <td className="px-4 py-3">{service.price}</td>
                <td className="px-4 py-3">{service.vehicleType}</td>
                <td className="px-4 py-3">{service.category}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 