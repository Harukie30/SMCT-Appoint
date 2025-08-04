"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Booking, Branch } from "@/types/localStorage";
import { TrashIcon, ArrowUturnLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon, FunnelIcon, EyeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Employee } from "@/types/localStorage";
import { AdminLayout } from "@/components/ui/admin-layout";
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

// Helper components
const statusOptions = ["Pending", "Confirmed", "Done", "Canceled"];
const statusIcons = {
  Pending: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  Confirmed: <CheckCircleIcon className="h-6 w-6 text-blue-500" />,
  Done: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  Canceled: <XCircleIcon className="h-6 w-6 text-gray-400" />,
};

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
  Canceled: "bg-gray-100 text-gray-800",
};

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
        <div key={status} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            {statusIcons[status as keyof typeof statusIcons]}
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts[status]}</div>
              <div className="text-sm font-medium text-gray-600">{status}</div>
            </div>
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
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBookings = () => {
    fetch('/api/bookings').then(res => res.json()).then(data => setBookings(Array.isArray(data) ? data : []));
  };
  const fetchBranches = () => {
    fetch('/api/branches').then(res => res.json()).then(data => setBranches(Array.isArray(data) ? data : []));
  };
  const fetchEmployees = () => {
    fetch('/api/employees').then(res => res.json()).then(data => setEmployees(Array.isArray(data) ? data : []));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchBookings(),
        fetchBranches(),
        fetchEmployees()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user should be redirected to test drive dashboard
    const managementMode = localStorage.getItem("managementMode");
    if (managementMode === "test-drives") {
      window.location.href = "/test-drive-dashboard";
      return;
    }

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const handleDelete = async (id: number) => {
    console.log('handleDelete called with id:', id);
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    console.log('confirmDelete called, itemToDelete:', itemToDelete);
    if (itemToDelete) {
      try {
        console.log('Sending DELETE request for booking ID:', itemToDelete);
        const response = await fetch('/api/bookings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemToDelete }),
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);
        
        if (response.ok) {
          setDeleteSuccess("Booking deleted successfully!");
          fetchBookings();
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          setTimeout(() => setDeleteSuccess(""), 3000);
        } else {
          setDeleteError(result.error || 'Failed to delete booking');
        }
      } catch (error) {
        console.error('Error in confirmDelete:', error);
        setDeleteError("Network error. Please try again.");
      }
    } else {
      console.log('No itemToDelete set');
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

  const clearFilters = () => {
    setFilters({ branch: "", date: "", status: "", employee: "" });
  };

  return (
    <AdminLayout 
      title="Appointments Management" 
      subtitle="Manage customer appointments and service bookings"
    >
      <StatusSummary bookings={bookings} />

      {/* Success and Error Messages */}
      {deleteSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {deleteSuccess}
        </div>
      )}
      {deleteError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {deleteError}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <select 
                  value={filters.branch} 
                  onChange={(e) => setFilters(f => ({ ...f, branch: e.target.value }))} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select 
                  value={filters.employee} 
                  onChange={(e) => setFilters(f => ({ ...f, employee: e.target.value }))} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input 
                  type="date" 
                  value={filters.date} 
                  onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mr-2"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredBookings.length}</span> of <span className="font-medium">{bookings.length}</span> appointments
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex bg-blue-600 text-white hover:bg-blue-700 hover:text-white items-center gap-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <EyeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No appointments found</p>
                      <p className="text-sm">Try adjusting your filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{b.name}</div>
                        <div className="text-sm text-gray-500">{b.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{b.date}</div>
                      <div className="text-gray-500">{b.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={b.assignedEmployee || ""}
                        onChange={(e) => handleAssignEmployee(b.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={b.status === "Canceled"}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(b.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        {(b.status === 'Canceled' || b.status === 'Done') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            onClick={() => handleStatusChange(b.id, 'Pending')}
                            title="Revert to Pending"
                          >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <span className="text-red-600">{deleteError}</span>
              ) : (
                "Are you sure you want to delete this appointment? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
} 