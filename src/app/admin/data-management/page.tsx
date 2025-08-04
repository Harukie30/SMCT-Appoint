"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bar, Line } from 'react-chartjs-2';
import { NotificationBell } from "@/components/ui/notification-bell";
import { Profile } from "@/components/ui/profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Image from "next/image";
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);


// If you see a type error, add a file src/data/mockBookings.json.d.ts with:
// declare module "*.json" { const value: any; export default value; }
import type { Booking, Employee, Branch, Service } from "@/types/localStorage";

type TabId = 'overview' | 'bookings' | 'employees' | 'branches' | 'services';

import { AdminLayout } from "@/components/ui/admin-layout";

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [reportCounts, setReportCounts] = useState({ bookings: 0, employees: 0, branches: 0, services: 0 });
  const [overviewBookings, setOverviewBookings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCounts() {
      const [bookings, employees, branches, services] = await Promise.all([
        fetch('/api/bookings').then(r => r.json()).catch(() => []),
        fetch('/api/employees').then(r => r.json()).catch(() => []),
        fetch('/api/branches').then(r => r.json()).catch(() => []),
        fetch('/api/services').then(r => r.json()).catch(() => []),
      ]);
      setReportCounts({
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        employees: Array.isArray(employees) ? employees.length : 0,
        branches: Array.isArray(branches) ? branches.length : 0,
        services: Array.isArray(services) ? services.length : 0,
      });
      setOverviewBookings(Array.isArray(bookings) ? bookings : []);
    }
    fetchCounts();
  }, []);

  // Chart data for overview
  const statusCounts = overviewBookings.reduce(
    (acc, b) => {
      acc[b.status || 'Pending'] = (acc[b.status || 'Pending'] || 0) + 1;
      return acc;
    },
    { Pending: 0, Done: 0, 'No Show': 0, Canceled: 0 }
  );

  // Bookings per branch
  const branchCounts: Record<string, number> = {};
  overviewBookings.forEach((b) => {
    if (b.branch) branchCounts[b.branch] = (branchCounts[b.branch] || 0) + 1;
  });
  const branchLabels = Object.keys(branchCounts);
  const branchData = Object.values(branchCounts);
  const avgBookingsPerBranch = branchLabels.length > 0 ? (overviewBookings.length / branchLabels.length).toFixed(2) : '0';

  // Bookings per day (line chart)
  const dayCounts: Record<string, number> = {};
  overviewBookings.forEach((b) => {
    if (b.date) dayCounts[b.date] = (dayCounts[b.date] || 0) + 1;
  });
  const dayLabels = Object.keys(dayCounts).sort();
  const dayData = dayLabels.map((d) => dayCounts[d]);

  const chartData = {
    labels: ['Pending', 'Done', 'No Show', 'Canceled'],
    datasets: [
      {
        label: 'Bookings by Status',
        data: [statusCounts.Pending, statusCounts.Done, statusCounts['No Show'], statusCounts.Canceled],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // blue
          'rgba(34, 197, 94, 0.7)',  // green
          'rgba(234, 179, 8, 0.7)',  // yellow
          'rgba(239, 68, 68, 0.7)',  // red
        ],
        borderRadius: 8,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bookings by Status', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const branchChartData = {
    labels: branchLabels,
    datasets: [
      {
        label: 'Bookings per Branch',
        data: branchData,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8,
      },
    ],
  };
  const branchChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bookings per Branch', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const dayChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Bookings per Day',
        data: dayData,
        fill: false,
        borderColor: 'rgba(59, 130, 246, 0.7)',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        tension: 0.3,
      },
    ],
  };
  const dayChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bookings per Day', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  // Place useMemo here, after all chart data variables are defined
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-4 bg-gray-50 min-h-screen">
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col">
                <h2 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">📊 Bookings by Status</h2>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col">
                <h2 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">🏢 Bookings per Branch</h2>
                <Bar data={branchChartData} options={branchChartOptions} />
                <span className="mt-2 text-center text-sm text-gray-600 block">
                  Average bookings per branch: <span className="font-bold text-blue-700">{avgBookingsPerBranch}</span>
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">📈 Bookings per Day</h2>
              <Line data={dayChartData} options={dayChartOptions} />
            </div>
          </div>
        );
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
  }, [activeTab, chartData, branchChartData, dayChartData]);

  return (
    <AdminLayout 
      title="Data Management" 
      subtitle="Manage employees, branches, services, and view analytics"
    >
        
        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportCounts.bookings}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportCounts.employees}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Branches</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportCounts.branches}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reportCounts.services}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <span className="text-2xl">🛠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {tabContent}
    </AdminLayout>
  );
}

// Individual managers for each data type
function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newBooking, setNewBooking] = useState({
    name: '',
    email: '',
    phone: '',
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
    if (newBooking.name && newBooking.email && newBooking.phone && newBooking.branch && newBooking.service && newBooking.date && newBooking.time) {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      fetchBookings();
      setNewBooking({
        name: '', email: '', phone: '', branch: '', service: '', date: '', time: '', status: 'Pending'
      });
    }
  };

  const [deleteBookingDialogOpen, setDeleteBookingDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  const handleDeleteBooking = async (id: number) => {
    setBookingToDelete(id);
    setDeleteBookingDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (bookingToDelete) {
      try {
        await fetch('/api/bookings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bookingToDelete }),
        });
        fetchBookings(); // Refresh the data
        setDeleteBookingDialogOpen(false);
        setBookingToDelete(null);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
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
            placeholder="Phone"
            value={newBooking.phone}
            onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
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
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, idx) => (
                <tr key={booking.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50 transition-colors' : 'bg-gray-50 hover:bg-blue-50 transition-colors'}>
                  <td className="px-4 py-3">{booking.name}</td>
                  <td className="px-4 py-3">{booking.email}</td>
                  <td className="px-4 py-3">{booking.phone}</td>
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
                  <td className="px-4 py-3 flex space-x-1">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleDeleteBooking(booking.id)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteBookingDialogOpen} onOpenChange={setDeleteBookingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    email: '', 
    branch: '', 
    password: '', 
    phone: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmployee, setEditEmployee] = useState<{ 
    name: string; 
    email: string; 
    branch: string; 
    password?: string;
    phone?: string;
  }>({ 
    name: '', 
    email: '', 
    branch: '', 
    password: '',
    phone: ''
  });
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEmployees = () => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch employees:", err));
  };

  const fetchBranches = () => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch branches:", err));
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const handleAddEmployee = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    if (!newEmployee.name.trim() || !newEmployee.email.trim() || !newEmployee.branch.trim() || !newEmployee.phone.trim()) {
      setError("All fields are required");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Phone number validation - exactly 11 digits
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(newEmployee.phone)) {
      setError("Phone number must be exactly 11 digits");
      return;
    }
    
    // Password validation
    if (newEmployee.password && newEmployee.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add employee');
        return;
      }
      
      setSuccess("Employee added successfully!");
      fetchEmployees();
      setNewEmployee({ name: '', email: '', branch: '', password: '', phone: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  const [deleteEmployeeDialogOpen, setDeleteEmployeeDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  const handleDeleteEmployee = async (id: number) => {
    console.log('handleDeleteEmployee called with id:', id);
    setEmployeeToDelete(id);
    setDeleteEmployeeDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    console.log('confirmDeleteEmployee called, employeeToDelete:', employeeToDelete);
    if (employeeToDelete) {
      try {
        console.log('Sending DELETE request for employee ID:', employeeToDelete);
        const response = await fetch('/api/employees', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: employeeToDelete }),
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);
        
        if (response.ok) {
          setSuccess("Employee deleted successfully!");
          fetchEmployees();
          setDeleteEmployeeDialogOpen(false);
          setEmployeeToDelete(null);
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(result.error || 'Failed to delete employee');
        }
      } catch (error) {
        console.error('Error in confirmDeleteEmployee:', error);
        setError("Network error. Please try again.");
      }
    } else {
      console.log('No employeeToDelete set');
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditId(employee.id);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      branch: employee.branch,
      password: employee.password || '',
      phone: employee.phone || '',
    });
    setEditShowPassword(false);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditEmployee((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async (id: number) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editEmployee }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess("Employee updated successfully!");
        setEditId(null);
        setEditEmployee({ name: '', email: '', branch: '', password: '', phone: '' });
        fetchEmployees();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || 'Failed to update employee');
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditEmployee({ name: '', email: '', branch: '', password: '', phone: '' });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Employees Management</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Add New Employee</h3>
        
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-3">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm mb-3">{success}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">FULL NAME</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="Enter Email Address"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PHONE NUMBER</label>
            <input
              type="tel"
              placeholder="Enter Phone (11 digits)"
              value={newEmployee.phone}
              onChange={(e) => {
                // Only allow digits and limit to 11 characters
                const value = e.target.value.replace(/\D/g, '').substring(0, 11);
                setNewEmployee({...newEmployee, phone: value});
              }}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              maxLength={11}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {newEmployee.phone && newEmployee.phone.length !== 11 && (
              <div className="text-red-500 text-xs mt-1">
                Phone number must be exactly 11 digits
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">BRANCH</label>
            <select
              value={newEmployee.branch}
              onChange={(e) => setNewEmployee({...newEmployee, branch: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PASSWORD</label>
            <input
              type="password"
              placeholder="Enter Password (optional)"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {newEmployee.password && newEmployee.password.length < 6 && (
              <div className="text-red-500 text-xs mt-1">
                Password must be at least 6 characters long
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
            Add Employee
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Branch</th>
                <th className="px-4 py-3 text-left">Password</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, idx) => (
                <tr key={employee.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50 transition-colors' : 'bg-gray-50 hover:bg-blue-50 transition-colors'}>
                  {editId === employee.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editEmployee.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="p-2 border rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editEmployee.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          className="p-2 border rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="tel"
                          value={editEmployee.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').substring(0, 11);
                            handleEditChange('phone', value);
                          }}
                          className="p-2 border rounded w-full"
                          maxLength={11}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editEmployee.branch}
                          onChange={(e) => handleEditChange('branch', e.target.value)}
                          className="p-2 border rounded w-full"
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.name}>{branch.name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative w-full">
                          <input
                            type={editShowPassword ? 'text' : 'password'}
                            value={editEmployee.password}
                            onChange={(e) => handleEditChange('password', e.target.value)}
                            className="p-2 border rounded w-full pr-10"
                            placeholder="Password (optional)"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                            onClick={() => setEditShowPassword((v) => !v)}
                            tabIndex={-1}
                            aria-label={editShowPassword ? 'Hide password' : 'Show password'}
                          >
                            {editShowPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.857-.67 1.664-1.175 2.404" /></svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 flex space-x-1">
                        <Button size="sm" onClick={() => handleEditSave(employee.id)} className="bg-green-600 hover:bg-green-700">Save</Button>
                        <Button size="sm" onClick={handleEditCancel} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{employee.name}</td>
                      <td className="px-4 py-3">{employee.email}</td>
                      <td className="px-4 py-3">{employee.phone || <span className='text-gray-400 italic'>Not set</span>}</td>
                      <td className="px-4 py-3">{employee.branch}</td>
                      <td className="px-4 py-3">{employee.password ? '••••••••' : <span className='text-gray-400 italic'>None</span>}</td>
                      <td className="px-4 py-3 flex space-x-1">
                        <Button size="sm" onClick={() => handleEditClick(employee)} className="bg-yellow-500 hover:bg-yellow-600">Edit</Button>
                        <Button size="sm" onClick={() => handleDeleteEmployee(employee.id)} className="bg-red-600 hover:bg-red-700">Delete</Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Delete Confirmation Dialog */}
      <AlertDialog open={deleteEmployeeDialogOpen} onOpenChange={setDeleteEmployeeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BranchesManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', hours: '', location: '' });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showStats, setShowStats] = useState(false);

  const fetchBranches = () => {
    const url = showStats ? '/api/branches?stats=true' : '/api/branches';
    fetch(url)
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch branches:", err));
  };

  useEffect(() => {
    fetchBranches();
  }, [showStats]);

  const handleAddBranch = async () => {
    setError("");
    setSuccess("");
    
    if (!newBranch.name || !newBranch.address || !newBranch.hours || !newBranch.location) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess("Branch added successfully!");
        fetchBranches();
        setNewBranch({ name: '', address: '', hours: '', location: '' });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || 'Failed to add branch');
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  const [deleteBranchDialogOpen, setDeleteBranchDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteBranch = async (id: number) => {
    setBranchToDelete(id);
    setDeleteBranchDialogOpen(true);
    setDeleteError("");
  };

  const confirmDeleteBranch = async () => {
    if (branchToDelete) {
      try {
        const response = await fetch('/api/branches', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: branchToDelete }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          fetchBranches();
          setDeleteBranchDialogOpen(false);
          setBranchToDelete(null);
        } else {
          setDeleteError(result.error || 'Failed to delete branch');
        }
      } catch (error) {
        setDeleteError("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Branches Management</h2>
      
      {/* Add new branch form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Add New Branch</h3>
        
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-3">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm mb-3">{success}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">BRANCH NAME</label>
            <input
              type="text"
              placeholder="Enter Branch Name"
              value={newBranch.name}
              onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ADDRESS</label>
            <input
              type="text"
              placeholder="Enter Address"
              value={newBranch.address}
              onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">OPERATING HOURS</label>
            <input
              type="text"
              placeholder="e.g., 9AM-7PM"
              value={newBranch.hours}
              onChange={(e) => setNewBranch({...newBranch, hours: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">LOCATION</label>
            <input
              type="text"
              placeholder="Enter Location"
              value={newBranch.location}
              onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <Button onClick={handleAddBranch} className="bg-blue-600 hover:bg-blue-700">
            Add Branch
          </Button>
        </div>
      </div>

      {/* Branch Statistics Toggle */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Branch Statistics</h3>
          <Button 
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {showStats ? 'Hide' : 'Show'} Employee Stats
          </Button>
        </div>
      </div>

      {/* Branches list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Hours</th>
                <th className="px-4 py-3 text-left">Location</th>
                {showStats && <th className="px-4 py-3 text-left">Employees</th>}
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch: any, idx) => (
                <tr key={branch.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50 transition-colors' : 'bg-gray-50 hover:bg-blue-50 transition-colors'}>
                  <td className="px-4 py-3 font-medium">{branch.name}</td>
                  <td className="px-4 py-3">{branch.address}</td>
                  <td className="px-4 py-3">{branch.hours}</td>
                  <td className="px-4 py-3">{branch.location}</td>
                  {showStats && (
                    <td className="px-4 py-3">
                      {branch.employeeCount ? (
                        <div>
                          <span className="font-semibold text-blue-600">{branch.employeeCount}</span> employee(s)
                          {branch.employees && branch.employees.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {branch.employees.slice(0, 2).map((emp: any) => emp.name).join(', ')}
                              {branch.employees.length > 2 && ` +${branch.employees.length - 2} more`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No employees</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 flex space-x-1">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleDeleteBranch(branch.id)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteBranchDialogOpen} onOpenChange={setDeleteBranchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
                  {deleteError}
                </div>
              ) : (
                "Are you sure you want to delete this branch? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {!deleteError && (
              <AlertDialogAction
                onClick={confirmDeleteBranch}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

  const [deleteServiceDialogOpen, setDeleteServiceDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const handleDeleteService = async (id: number) => {
    setServiceToDelete(id);
    setDeleteServiceDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceToDelete }),
      });
      fetchServices();
      setDeleteServiceDialogOpen(false);
      setServiceToDelete(null);
    }
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
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-gray-50 sticky top-0 z-10">
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
              {services.map((service, idx) => (
                <tr key={service.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50 transition-colors' : 'bg-gray-50 hover:bg-blue-50 transition-colors'}>
                  <td className="px-4 py-3">{service.name}</td>
                  <td className="px-4 py-3">{service.duration}</td>
                  <td className="px-4 py-3">{service.price}</td>
                  <td className="px-4 py-3">{service.vehicleType}</td>
                  <td className="px-4 py-3">{service.category}</td>
                  <td className="px-4 py-3 flex space-x-1">
                    <AlertDialog open={deleteServiceDialogOpen} onOpenChange={setDeleteServiceDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Service</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this service? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmDeleteService}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 