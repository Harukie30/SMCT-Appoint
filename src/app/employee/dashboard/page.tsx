"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Booking, Employee } from "@/types/localStorage";
import { AppointmentNotificationBell } from "@/components/ui/appointment-notification-bell";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CogIcon,
  UserCircleIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";


// Types
type StatusOption = "Pending" | "No Show" | "Done" | "Canceled";
type UpcomingBooking = Booking & { onCancel?: (id: number) => void };

// Constants
const STATUS_OPTIONS: StatusOption[] = [
  "Pending",
  "No Show",
  "Done",
  "Canceled",
];
const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  "No Show": "bg-red-100 text-red-800",
  Done: "bg-green-100 text-green-800",
  Canceled: "bg-gray-200 text-gray-500",
};

// Components
function ProfileEditModal({ 
  isOpen, 
  onClose, 
  employee, 
  onUpdate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  employee: Employee | null;
  onUpdate: (updatedEmployee: { name: string; email: string; phone: string; branch: string }) => void;
}) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    branch: employee?.branch || ""
  });
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || "",
        branch: employee.branch
      });
    }
  }, [employee]);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await fetch('/api/branches');
        if (response.ok) {
          const branchesData = await response.json();
          setBranches(branchesData);
        } else {
          console.error('Failed to fetch branches');
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loadingBranches}
            >
              <option value="">
                {loadingBranches ? "Loading branches..." : "Select Branch"}
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
            {loadingBranches && (
              <p className="text-xs text-gray-500 mt-1">Loading available branches...</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeSidebar({
  bookings,
  onUpcomingClick,
  onDashboardClick,
  onCanceledClick,
  onCompletedClick,
  onNoShowClick
}: {
  bookings: Booking[];
  onUpcomingClick: () => void;
  onDashboardClick: () => void;
  onCanceledClick: () => void;
  onCompletedClick: () => void;
  onNoShowClick: () => void;
}) {
  // Get next 3 upcoming appointments (by soonest date+time)
  const now = new Date();
  const upcoming = bookings
    .filter((b) => {
      const dt = new Date(`${b.date}T${b.time}`);
      return dt >= now && b.status !== "Canceled" && b.status !== "Done" && b.status !== "No Show";
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col py-8 px-4 shadow-xl min-h-screen">
      <div className="text-center mb-8">
        <Image 
          src="/smct.png" 
          alt="SMCT Logo" 
          width={100} 
          height={100} 
          className="mx-auto mb-3 rounded-lg"
        />
        <div className="text-xl font-bold flex items-center justify-center gap-2">
          <CogIcon className="h-5 w-5" />
          <span>Employee Portal</span>
        </div>
      </div>
      <nav className="flex-1 space-y-2 mb-8">
        <button
          type="button"
          onClick={onDashboardClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/50 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <UserIcon className="h-5 w-5" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={onUpcomingClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <ClockIcon className="h-5 w-5" />
          Upcoming Appointments
        </button>
        <button
          type="button"
          onClick={onCanceledClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-gray-800 transition-colors font-medium w-full text-left"
        >
          <XCircleIcon className="h-5 w-5" />
          Canceled Appointments
        </button>
        <button
          type="button"
          onClick={onCompletedClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-green-800 transition-colors font-medium w-full text-left"
        >
          <CheckCircleIcon className="h-5 w-5" />
          Completed Appointments
        </button>
        <button
          type="button"
          onClick={onNoShowClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-red-800 transition-colors font-medium w-full text-left"
        >
          <UserMinusIcon className="h-5 w-5" />
          No Show Appointments
        </button>
      </nav>
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-2 text-blue-100 flex items-center gap-2">
            <ClockIcon className="h-4 w-4" /> Upcoming Appointments
          </h3>
          <ul className="space-y-2">
            {upcoming.map((b) => (
              <li key={b.id} className="bg-blue-800/40 rounded-lg px-3 py-2 flex flex-col">
                <span className="font-medium text-white text-sm">{b.name}</span>
                <span className="text-xs text-blue-200">{b.service}</span>
                <span className="text-xs text-blue-300 flex items-center gap-1">
                  <ClockIcon className="h-3 w-3 inline" /> {b.date} {b.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClass =
    STATUS_COLORS[status.replace(" ", "") as keyof typeof STATUS_COLORS] ||
    "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
    >
      {status}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-blue-600 font-medium">Loading bookings...</span>
    </div>
  );
}

function NextAppointmentAlert({ booking }: { booking: Booking }) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-lg shadow-sm">
      <h3 className="font-semibold mb-1">Upcoming Appointment</h3>
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium">
            {booking.name} - {booking.service}
          </p>
          <p className="text-sm flex items-center gap-2">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {booking.date}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {booking.time}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function BookingFilters({
  serviceFilter,
  timeFilter,
  uniqueServices,
  uniqueTimes,
  onServiceChange,
  onTimeChange,
}: {
  serviceFilter: string;
  timeFilter: string;
  uniqueServices: string[];
  uniqueTimes: string[];
  onServiceChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service
        </label>
        <select
          value={serviceFilter}
          onChange={(e) => onServiceChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Services</option>
          {uniqueServices.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time
        </label>
        <select
          value={timeFilter}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Times</option>
          {uniqueTimes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StatusSummaryCards({ bookings }: { bookings: Booking[] }) {
  const statusCounts = STATUS_OPTIONS.map((status) => ({
    status,
    count: bookings.filter((b) => b.status === status).length,
  }));
  const statusIcons = {
    Pending: <ClockIcon className="h-6 w-6 text-yellow-500" />,
    "No Show": <XCircleIcon className="h-6 w-6 text-red-500" />,
    Done: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    Canceled: <XCircleIcon className="h-6 w-6 text-gray-400" />,
  };
  const statusBg = {
    Pending: "bg-yellow-50 border-yellow-200",
    "No Show": "bg-red-50 border-red-200",
    Done: "bg-green-50 border-green-200",
    Canceled: "bg-gray-100 border-gray-200",
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {statusCounts.map(({ status, count }) => (
        <div
          key={status}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border shadow-sm ${statusBg[status as keyof typeof statusBg]}`}
        >
          <div className="mb-2">{statusIcons[status as keyof typeof statusIcons]}</div>
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-xs font-medium text-gray-600 mt-1">{status}</div>
        </div>
      ))}
    </div>
  );
}

function AppointmentActions({ booking, onStatusChange, allowActions = false }: { booking: Booking; onStatusChange: (id: number, status: StatusOption) => void; allowActions?: boolean }) {
  const isDone = booking.status === "Done";
  const isCanceled = booking.status === "Canceled";
  const isNoShow = booking.status === "No Show";

  // If allowActions is true, always enable actions
  const disabled = !allowActions && (isDone || isCanceled || isNoShow);

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={isDone ? "outline" : "default"}
        className="gap-1 bg-green-600 text-white hover:bg-green-400"
        onClick={() => onStatusChange(booking.id, "Done")}
        disabled={disabled}
      >
        <CheckCircleIcon className="h-4 w-4" /> Done
      </Button>
      <Button
        size="sm"
        className="gap-1 bg-red-600 hover:bg-red-400 "
        onClick={() => onStatusChange(booking.id, "No Show")}
        disabled={disabled}
      >
        <XCircleIcon className="h-4 w-4" /> No Show
      </Button>
      <Button
        size="sm"
        variant={isCanceled ? "outline" : "destructive"}
        className="gap-1"
        onClick={() => onStatusChange(booking.id, "Canceled")}
        disabled={disabled}
      >
        <XCircleIcon className="h-4 w-4" /> Cancel
      </Button>
    </div>
  );
}

function UpcomingAppointmentsTable({ bookings, onStatusChange, onViewDetails }: { bookings: UpcomingBooking[]; onStatusChange: (id: number, status: StatusOption) => void; onViewDetails: (booking: Booking) => void }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No upcoming appointments.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-sm text-gray-500">{b.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-700" onClick={() => onViewDetails(b)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CanceledAppointmentsTable({ bookings, onStatusChange, onViewDetails }: { bookings: Booking[]; onStatusChange: (id: number, status: StatusOption) => void; onViewDetails: (booking: Booking) => void }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No canceled appointments.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-sm text-gray-500">{b.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentActions booking={b} onStatusChange={onStatusChange} />
                    <Button size="sm" className="bg-blue-500 text-white mt-2 hover:bg-blue-700 " onClick={() => onViewDetails(b)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompletedAppointmentsTable({ bookings, onStatusChange, onViewDetails }: { bookings: Booking[]; onStatusChange: (id: number, status: StatusOption) => void; onViewDetails: (booking: Booking) => void }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No completed appointments.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-sm text-gray-500">{b.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentActions booking={b} onStatusChange={onStatusChange} />
                    <Button size="sm" className="bg-blue-500 text-white mt-2 hover:bg-blue-700 " onClick={() => onViewDetails(b)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoShowAppointmentsTable({ bookings, onStatusChange, onViewDetails }: { bookings: Booking[]; onStatusChange: (id: number, status: StatusOption) => void; onViewDetails: (booking: Booking) => void }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No &quot;No Show&quot; appointments.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-sm text-gray-500">{b.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{b.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentActions booking={b} onStatusChange={onStatusChange} allowActions={true} />
                    <Button size="sm" className="bg-blue-500 text-white mt-2 hover:bg-blue-700 " onClick={() => onViewDetails(b)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function UserProfileCard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const employeeName = localStorage.getItem("employeeName");
        const userRole = localStorage.getItem("userRole");
        
        if (userRole === "admin") {
          // Admin user
          setEmployee({
            id: 0,
            name: "Admin",
            email: "admin@company.com",
            branch: "Main Branch",
            phone: "",
            password: "",
            role: "admin"
          });
        } else if (userRole === "employee" && employeeName) {
          // Employee user - fetch from API
          const response = await fetch('/api/employees');
          const employees = await response.json();
          const employee = employees.find((e: Employee) => e.name === employeeName);
          
          if (employee) {
            setEmployee(employee);
          } else {
            // Fallback to localStorage if employee not found in API
            setEmployee({
              id: 0,
              name: employeeName,
              email: `${employeeName}@company.com`,
              branch: "Main Branch",
              phone: "",
              password: "",
              role: "employee"
            });
          }
        } else {
          // Default user
          setEmployee({
            id: 0,
            name: "User",
            email: "user@company.com",
            branch: "Main Branch",
            phone: "",
            password: "",
            role: "user"
          });
        }
      } catch (error) {
        console.error("Error fetching employee info:", error);
        // Fallback to localStorage data
        const employeeName = localStorage.getItem("employeeName") || "User";
        setEmployee({
          id: 0,
          name: employeeName,
          email: `${employeeName}@company.com`,
          branch: "Main Branch",
          phone: "",
          password: "",
          role: "employee"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeInfo();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("employeeLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("employeeName");
      localStorage.removeItem("managementMode");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Error during logout");
      router.push("/login");
    }
  };

  const handleProfileUpdate = async (updatedData: { name: string; email: string; phone: string; branch: string }) => {
    try {
      if (employee && employee.role === "employee") {
        // Update employee profile in the employees API
        await fetch('/api/employees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: employee.id,
            name: updatedData.name,
            email: updatedData.email,
            phone: updatedData.phone,
            branch: updatedData.branch,
            password: employee.password, // Keep existing password
            role: employee.role // Keep existing role
          }),
        });
        
        // Update localStorage
        localStorage.setItem("employeeName", updatedData.name);
        
        // Update local state
        setEmployee(prev => prev ? { ...prev, ...updatedData } : null);
        
        // Show success message (you can add toast notification here)
        console.log("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 mb-8 justify-end">
        <UserCircleIcon className="h-10 w-10 text-gray-300" />
        <div>
          <div className="font-semibold text-gray-700">Loading...</div>
        </div>
        <Button size="sm" variant="destructive" className="ml-4" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 mb-8 justify-end">
        <UserCircleIcon className="h-10 w-10 text-gray-300" />
        <div>
          <div className="font-semibold text-gray-700">Employee not found</div>
        </div>
        <Button size="sm" variant="destructive" className="ml-4" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 mb-8 justify-end">
        <UserCircleIcon className="h-10 w-10 text-blue-500" />
        <div>
          <div className="font-semibold text-gray-700">{employee.name}</div>
          <div className="text-sm text-gray-500">{employee.email}</div>
          <div className="text-xs text-blue-700 capitalize">{employee.role}</div>
          <div className="text-xs text-gray-500">{employee.branch}</div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowEditModal(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        employee={employee}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showNoShow, setShowNoShow] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  const upcomingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    
    // Get current employee info
    const employeeName = localStorage.getItem("employeeName");
    const userRole = localStorage.getItem("userRole");
    
    if (userRole === "employee" && employeeName) {
      // Fetch employee details
      fetch('/api/employees')
        .then(res => res.json())
        .then(employees => {
          const employee = employees.find((e: Employee) => e.name === employeeName);
          if (employee) {
            setCurrentEmployee(employee);
          }
        });
    }

    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  // Filter bookings - only show bookings assigned to current employee
  let filteredBookings = bookings;
  
  // Filter by assigned employee if current employee is logged in
  if (currentEmployee && currentEmployee.role === "employee") {
    filteredBookings = bookings.filter(b => b.assignedEmployee === currentEmployee.name);
  }
  
  if (!showCompleted && !showCanceled && !showNoShow) {
    const now = new Date();
    filteredBookings = filteredBookings.filter(
      (b) => {
        const dt = new Date(`${b.date}T${b.time}`);
        return (
          (!serviceFilter || b.service === serviceFilter) &&
          (!timeFilter || b.time === timeFilter) &&
          dt >= now &&
          b.status !== "Done" &&
          b.status !== "No Show" &&
          b.status !== "Canceled"
        );
      }
    );
  } else if (showCompleted) {
    filteredBookings = filteredBookings.filter(
      (b) => b.status === "Done" && (!serviceFilter || b.service === serviceFilter) && (!timeFilter || b.time === timeFilter)
    );
  } else if (showCanceled) {
    filteredBookings = filteredBookings.filter(
      (b) => b.status === "Canceled" && (!serviceFilter || b.service === serviceFilter) && (!timeFilter || b.time === timeFilter)
    );
  } else if (showNoShow) {
    filteredBookings = filteredBookings.filter(
      (b) => b.status === "No Show" && (!serviceFilter || b.service === serviceFilter) && (!timeFilter || b.time === timeFilter)
    );
  }

  // Get next appointment (exclude canceled, done, no show)
  const nextAppointment = filteredBookings.length
    ? [...filteredBookings]
        .filter((b) => {
          const dt = new Date(`${b.date}T${b.time}`);
          return dt >= now && b.status !== "Canceled" && b.status !== "Done" && b.status !== "No Show";
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
    : null;

  // Get next 3 upcoming appointments (by soonest date+time) - only assigned to current employee
  let upcomingList = bookings
    .filter((b) => {
      const dt = new Date(`${b.date}T${b.time}`);
      return dt >= now && b.status !== "Canceled" && b.status !== "Done" && b.status !== "No Show";
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  // Filter by assigned employee if current employee is logged in
  if (currentEmployee && currentEmployee.role === "employee") {
    upcomingList = upcomingList.filter(b => b.assignedEmployee === currentEmployee.name);
  }

  // Pass onCancel to upcomingList
  const upcomingListWithCancel = upcomingList.map((b) => ({ ...b, onCancel: (id: number) => handleStatusChange(id, "Canceled") }));

  // Filter lists by assigned employee if current employee is logged in
  let canceledList = bookings.filter((b) => b.status === "Canceled");
  let completedList = bookings.filter((b) => b.status === "Done");
  let noShowList = bookings.filter((b) => b.status === "No Show");

  if (currentEmployee && currentEmployee.role === "employee") {
    canceledList = canceledList.filter(b => b.assignedEmployee === currentEmployee.name);
    completedList = completedList.filter(b => b.assignedEmployee === currentEmployee.name);
    noShowList = noShowList.filter(b => b.assignedEmployee === currentEmployee.name);
  }

  // Handle status change
  const handleStatusChange = async (id: number, status: StatusOption) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    // Re-fetch bookings to update the UI
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []));
    // Show toast
    let message = '';
    let type: 'success' | 'warning' | 'error' = 'success';
    if (status === 'Done') {
      message = 'Appointment marked as completed!';
      type = 'success';
    } else if (status === 'No Show') {
      message = 'Appointment marked as no show.';
      type = 'warning';
    } else if (status === 'Canceled') {
      message = 'Appointment canceled.';
      type = 'error';
    }
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  };

  // Get unique values for filters
  const uniqueServices = Array.from(new Set(filteredBookings.map((b) => b.service)));
  const uniqueTimes = Array.from(new Set(filteredBookings.map((b) => b.time)));

  const handleUpcomingClick = () => {
    setShowUpcoming((prev) => !prev);
    setShowCanceled(false);
    setShowCompleted(false);
    setShowNoShow(false);
    setTimeout(() => {
      if (upcomingRef.current && !showUpcoming) {
        upcomingRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleCanceledClick = () => {
    setShowUpcoming(false);
    setShowCanceled(true);
    setShowCompleted(false);
    setShowNoShow(false);
  };

  const handleCompletedClick = () => {
    setShowUpcoming(false);
    setShowCanceled(false);
    setShowCompleted(true);
    setShowNoShow(false);
  };

  const handleNoShowClick = () => {
    setShowUpcoming(false);
    setShowCanceled(false);
    setShowCompleted(false);
    setShowNoShow(true);
  };

  const handleDashboardClick = () => {
    setShowUpcoming(false);
    setShowCanceled(false);
    setShowCompleted(false);
    setShowNoShow(false);
  };

  function handleViewDetails(booking: Booking) {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  }
  function handleCloseDetails() {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  }


  return (
    <div className="min-h-screen flex bg-gray-100">
      <EmployeeSidebar
        bookings={filteredBookings}
        onUpcomingClick={handleUpcomingClick}
        onDashboardClick={handleDashboardClick}
        onCanceledClick={handleCanceledClick}
        onCompletedClick={handleCompletedClick}
        onNoShowClick={handleNoShowClick}
      />

             <main className="flex-1 p-6">
                 <div className="flex justify-end items-center gap-4">
          <AppointmentNotificationBell />
          <UserProfileCard />
        </div>
        {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all
            ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-600'}`}
          >
            {toast.message}
          </div>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : showUpcoming ? (
          <div ref={upcomingRef} className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700">
              <ClockIcon className="h-5 w-5" /> Upcoming Appointments
            </h3>
            <UpcomingAppointmentsTable bookings={upcomingListWithCancel} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} />
          </div>
        ) : showCanceled ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
              <XCircleIcon className="h-5 w-5" /> Canceled Appointments
            </h3>
            <CanceledAppointmentsTable bookings={canceledList} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} />
          </div>
        ) : showCompleted ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="h-5 w-5" /> Completed Appointments
            </h3>
            <CompletedAppointmentsTable bookings={completedList} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} />
          </div>
        ) : showNoShow ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-700">
              <UserMinusIcon className="h-5 w-5" /> No Show Appointments
            </h3>
            <NoShowAppointmentsTable bookings={noShowList} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} />
          </div>
        ) : (
          <>
                         <header className="mb-8">
               <div>
                 <h1 className="text-3xl font-bold text-gray-800">
                   Appointment Dashboard
                 </h1>
                 <p className="text-gray-600">
                   Manage and track customer appointments
                 </p>

               </div>
             </header>
            <StatusSummaryCards bookings={filteredBookings}  />
            {nextAppointment && <NextAppointmentAlert booking={nextAppointment} />}
            <BookingFilters 
              serviceFilter={serviceFilter}
              timeFilter={timeFilter}
              uniqueServices={uniqueServices}
              uniqueTimes={uniqueTimes}
              onServiceChange={setServiceFilter}
              onTimeChange={setTimeFilter}
            />
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-auto max-h-[31vh]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <UserIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <p>No appointments found</p>
                            <p className="text-sm text-gray-400">
                              Try adjusting your filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {booking.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {booking.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {booking.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                            {booking.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <AppointmentActions booking={booking} onStatusChange={handleStatusChange} />
                            <Button size="sm" className="bg-blue-500 text-white mt-2 hover:bg-blue-700 " onClick={() => handleViewDetails(booking)}>
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      {showDetailsModal && selectedBooking && (
        <Dialog open={showDetailsModal} onOpenChange={handleCloseDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                Appointment Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              {/* Customer Information Section */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Name:</span>
                      <span className="text-gray-900 font-medium">{selectedBooking.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Email:</span>
                      <span className="text-blue-600">{selectedBooking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Phone:</span>
                      <span className="text-gray-900">{selectedBooking.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Information Section */}
              <div className="bg-green-100 rounded-lg p-4 mb-6">
                                 <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                   <CogIcon className="w-5 h-5" />
                   Service Information
                 </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Service:</span>
                      <span className="text-gray-900 font-medium">{selectedBooking.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Branch:</span>
                      <span className="text-gray-900">{selectedBooking.branch}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Information Section */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Schedule Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Date:</span>
                      <span className="text-gray-900 font-medium">{selectedBooking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 min-w-[100px]">Time:</span>
                      <span className="text-gray-900">{selectedBooking.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information Section */}
              {(selectedBooking.plate || selectedBooking.model) && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                   <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   <UserIcon className="w-5 h-5" />
                   Vehicle Information
                 </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {selectedBooking.plate && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 min-w-[100px]">Plate Number:</span>
                          <span className="text-gray-900 font-medium">{selectedBooking.plate}</span>
                        </div>
                      )}
                      {selectedBooking.model && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 min-w-[100px]">Model/Make:</span>
                          <span className="text-gray-900">{selectedBooking.model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {selectedBooking.notes && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                   <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   <CalendarIcon className="w-5 h-5" />
                   Notes & Requests
                 </h3>
                  <div className="bg-white rounded-md p-3 border border-blue-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Appointment Status
                </h3>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedBooking.status} />
                  <span className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
