"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Booking, Branch } from "@/types/localStorage";
import { TrashIcon, ArrowUturnLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Employee } from "@/types/localStorage";

// Helper components
const statusOptions = ["Pending", "Confirmed", "Done", "Canceled"];
const statusIcons = {
  Pending: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  Confirmed: <CheckCircleIcon className="h-6 w-6 text-blue-500" />,
  Done: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  Canceled: <XCircleIcon className="h-6 w-6 text-gray-400" />,
};

function AdminSidebar() {
  const handleLogout = () => window.location.href = "/login";
  return (
    <aside className="w-60 bg-blue-700 text-white flex flex-col py-8 px-4 shadow-lg min-h-screen">
      <div className="text-2xl font-bold mb-8">Admin</div>
      <nav className="flex-1 space-y-2">
        <Link href="/admin/appointments" className="block py-2 px-3 rounded hover:bg-blue-800 bg-blue-800 font-semibold">Appointments</Link>
        <Link href="/admin/data-management" className="block py-2 px-3 rounded hover:bg-blue-800">Data Management</Link>
      </nav>
      <button onClick={handleLogout} className="mt-8 py-2 px-3 rounded bg-red-500 hover:bg-red-700 text-white font-semibold">
        Logout
      </button>
    </aside>
  );
}

function StatusSummary({ bookings }: { bookings: Booking[] }) {
  const counts = useMemo(() => {
    return statusOptions.reduce((acc, status) => {
      acc[status] = bookings.filter(b => b.status === status).length;
      return acc;
    }, {} as Record<string, number>);
  }, [bookings]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {statusOptions.map(status => (
        <div key={status} className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
          {statusIcons[status as keyof typeof statusIcons]}
          <div>
            <div className="text-2xl font-bold">{counts[status]}</div>
            <div className="text-sm font-medium text-gray-600">{status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState({ branch: "", date: "", status: "", employee: "" });

  const fetchBookings = () => {
    fetch('/api/bookings').then(res => res.json()).then(data => setBookings(Array.isArray(data) ? data : []));
  };
  const fetchBranches = () => {
    fetch('/api/branches').then(res => res.json()).then(data => setBranches(Array.isArray(data) ? data : []));
  };
  const fetchEmployees = () => {
    fetch('/api/employees').then(res => res.json()).then(data => setEmployees(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchBookings();
    fetchBranches();
    fetchEmployees();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchBookings();
  };

  const handleAssignEmployee = async (bookingId: number, employeeName: string) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bookingId, assignedEmployee: employeeName }),
    });
    fetchBookings();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      await fetch('/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchBookings();
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      (!filters.branch || b.branch === filters.branch) &&
      (!filters.date || b.date === filters.date) &&
      (!filters.status || b.status === filters.status) &&
      (!filters.employee || b.assignedEmployee === filters.employee)
    );
  }, [bookings, filters]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Appointments Dashboard</h1>
        <StatusSummary bookings={bookings} />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Branch</label>
            <select 
              value={filters.branch} 
              onChange={(e) => setFilters(f => ({ ...f, branch: e.target.value }))} 
              className="p-2 border rounded w-full"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.name}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Employee</label>
            <select 
              value={filters.employee} 
              onChange={(e) => setFilters(f => ({ ...f, employee: e.target.value }))} 
              className="p-2 border rounded w-full"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input 
              type="date" 
              value={filters.date} 
              onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))} 
              className="p-2 border rounded w-full" 
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} 
              className="p-2 border rounded w-full"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Customer", "Branch", "Service", "Date & Time", "Assigned To", "Status", "Actions"].map(h => (
                  <th key={h} className="py-3 px-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>{b.name}</div>
                      <div className="text-sm text-gray-500">{b.email}</div>
                    </td>
                    <td className="py-3 px-4">{b.branch}</td>
                    <td className="py-3 px-4">{b.service}</td>
                    <td className="py-3 px-4">{b.date} at {b.time}</td>
                    <td className="py-3 px-4">
                      <select
                        value={b.assignedEmployee || ""}
                        onChange={(e) => handleAssignEmployee(b.id, e.target.value)}
                        className="p-1 border rounded bg-white"
                      >
                        <option value="">Unassigned</option>
                        {employees
                          .filter(emp => emp.branch === b.branch)
                          .map(emp => (
                            <option key={emp.id} value={emp.name}>
                              {emp.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="p-1 border rounded bg-white"
                        disabled={b.status === "Canceled"}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                        onClick={() => handleDelete(b.id)}
                        title="Delete Booking"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </Button>
                      {(b.status === 'Canceled' || b.status === 'Done') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          onClick={() => handleStatusChange(b.id, 'Pending')}
                          title="Revert to Pending"
                        >
                          <ArrowUturnLeftIcon className="h-5 w-5 text-gray-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 