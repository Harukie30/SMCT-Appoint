"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Booking, Employee } from "@/types/localStorage";
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
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";


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
function EmployeeSidebar({
  bookings,
  onUpcomingClick,
  onDashboardClick,
  onCanceledClick,
  onCompletedClick,
  onNoShowClick // Add this
}: {
  bookings: Booking[];
  onUpcomingClick: () => void;
  onDashboardClick: () => void;
  onCanceledClick: () => void;
  onCompletedClick: () => void;
  onNoShowClick: () => void; // Add this
}) {
  // Get next 3 upcoming appointments (by soonest date+time)
  const now = new Date();
  const upcoming = bookings
    .filter((b) => {
      const dt = new Date(`${b.date}T${b.time}`);
      return dt >= now;
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col py-8 px-4 shadow-xl min-h-screen">
      <div className="text-2xl font-bold mb-8 px-3 flex items-center gap-2">
        <CogIcon className="h-6 w-6" />
        <span>Employee Portal</span>
      </div>
      <nav className="flex-1 space-y-2 mb-8">
        <button
          type="button"
          onClick={onDashboardClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-700/50 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <UserIcon className="h-5 w-5" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={onUpcomingClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-700/30 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <ClockIcon className="h-5 w-5" />
          Upcoming Appointments
        </button>
        <button
          type="button"
          onClick={onCanceledClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-700/30 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <XCircleIcon className="h-5 w-5" />
          Canceled Appointments
        </button>
        <button
          type="button"
          onClick={onCompletedClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-700/30 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <CheckCircleIcon className="h-5 w-5" />
          Completed Appointments
        </button>
        <button
          type="button"
          onClick={onNoShowClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-700/30 hover:bg-blue-700 transition-colors font-medium w-full text-left"
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
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
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

function AppointmentActions({ booking, onStatusChange }: { booking: Booking; onStatusChange: (id: number, status: StatusOption) => void }) {
  const isDone = booking.status === "Done";
  const isCanceled = booking.status === "Canceled";
  const isNoShow = booking.status === "No Show";

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={isDone ? "outline" : "default"}
        className="gap-1 bg-green-600 text-white hover:bg-green-400"
        onClick={() => onStatusChange(booking.id, "Done")}
        disabled={isDone || isCanceled || isNoShow}
      >
        <CheckCircleIcon className="h-4 w-4" /> Done
      </Button>
      <Button
        size="sm"

        className="gap-1 bg-yellow-600 hover:bg-yellow-400 "
        onClick={() => onStatusChange(booking.id, "No Show")}
        disabled={isDone || isCanceled || isNoShow}
      >
        <XCircleIcon className="h-4 w-4" /> No Show
      </Button>
      <Button
        size="sm"
        variant={isCanceled ? "outline" : "destructive"}
        className="gap-1"
        onClick={() => onStatusChange(booking.id, "Canceled")}
        disabled={isDone || isCanceled || isNoShow}
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
                    <AppointmentActions booking={b} onStatusChange={onStatusChange} />
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(b)}>
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
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(b)}>
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
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(b)}>
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
                    <AppointmentActions booking={b} onStatusChange={onStatusChange} />
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(b)}>
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
  const router = useRouter();

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployee(data[0]); // Display the first employee for now
        }
      })
      .catch(err => console.error("Failed to fetch employees:", err));
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  if (!employee) {
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

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 mb-8 justify-end">
      <UserCircleIcon className="h-10 w-10 text-blue-500" />
      <div>
        <div className="font-semibold text-gray-700">{employee.name}</div>
        <div className="text-sm text-gray-500">{employee.email}</div>
        <div className="text-xs text-blue-700">{employee.branch}</div>
      </div>
      <Button size="sm" variant="destructive" className="ml-4" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}

export default function EmployeeDashboard() {
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

  const upcomingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter(
    (b) =>
      (!serviceFilter || b.service === serviceFilter) &&
      (!timeFilter || b.time === timeFilter)
  );

  // Get next appointment
  const nextAppointment = filteredBookings.length
    ? [...filteredBookings].sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
      )[0]
    : null;

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
  };

  // Get unique values for filters
  const uniqueServices = Array.from(new Set(bookings.map((b) => b.service)));
  const uniqueTimes = Array.from(new Set(bookings.map((b) => b.time)));

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

  // Get next 3 upcoming appointments (by soonest date+time)
  const now = new Date();
  const upcomingList = bookings
    .filter((b) => {
      const dt = new Date(`${b.date}T${b.time}`);
      return dt >= now;
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  // Pass onCancel to upcomingList
  const upcomingListWithCancel = upcomingList.map((b) => ({ ...b, onCancel: (id: number) => handleStatusChange(id, "Canceled") }));

  const canceledList = bookings.filter((b) => b.status === "Canceled");
  const completedList = bookings.filter((b) => b.status === "Done");
  const noShowList = bookings.filter((b) => b.status === "No Show");


  return (
    <div className="min-h-screen flex bg-gray-50">
      <EmployeeSidebar
        bookings={bookings}
        onUpcomingClick={handleUpcomingClick}
        onDashboardClick={handleDashboardClick}
        onCanceledClick={handleCanceledClick}
        onCompletedClick={handleCompletedClick}
        onNoShowClick={handleNoShowClick}
      />

      <main className="flex-1 p-8">
        <div className="flex justify-end">
          <UserProfileCard />
        </div>
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
              <h1 className="text-3xl font-bold text-gray-800">
                Appointment Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and track customer appointments
              </p>
            </header>
            <StatusSummaryCards bookings={bookings} />
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
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(booking)}>
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
          <DialogContent>
            <DialogTitle>Appointment Details</DialogTitle>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <div className="space-y-2">
                <div><span className="font-semibold">Customer:</span> {selectedBooking.name}</div>
                <div><span className="font-semibold">Email:</span> {selectedBooking.email}</div>
                <div><span className="font-semibold">Phone:</span> {selectedBooking.phone || '-'}</div>
                <div><span className="font-semibold">Service:</span> {selectedBooking.service}</div>
                <div><span className="font-semibold">Branch:</span> {selectedBooking.branch}</div>
                <div><span className="font-semibold">Date:</span> {selectedBooking.date}</div>
                <div><span className="font-semibold">Time:</span> {selectedBooking.time}</div>
                <div><span className="font-semibold">Plate Number:</span> {selectedBooking.plate || '-'}</div>
                <div><span className="font-semibold">Vehicle Model/Make:</span> {selectedBooking.model || '-'}</div>
                <div className="break-words whitespace-pre-wrap"><span className="font-semibold">Notes/Requests:</span> {selectedBooking.notes || '-'}</div>
                <div><span className="font-semibold">Status:</span> {selectedBooking.status}</div>
              </div>
            </div>
            <DialogClose asChild>
              <Button className="mt-4 w-full" variant="outline">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
