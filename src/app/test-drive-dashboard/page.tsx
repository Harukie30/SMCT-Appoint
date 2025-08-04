"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TestDriveNotificationBell } from "@/components/ui/test-drive-notification-bell";
import { EmployeeNotificationBell } from "@/components/ui/employee-notification-bell";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  CogIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";


// Types
type TestDriveStatus = "Pending" | "Confirmed" | "Completed" | "Canceled" | "No Show";
type TestDrive = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  model: string;
  branch: string;
  status: TestDriveStatus;
  createdAt: string;
};

// Constants
const STATUS_OPTIONS: TestDriveStatus[] = [
  "Pending",
  "Confirmed",
  "Completed",
  "Canceled",
  "No Show",
];

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Canceled: "bg-gray-100 text-gray-800 border-gray-200",
  "No Show": "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS = {
  Pending: <ClockIcon className="h-4 w-4" />,
  Confirmed: <CheckCircleIcon className="h-4 w-4" />,
  Completed: <CheckCircleIcon className="h-4 w-4" />,
  Canceled: <XCircleIcon className="h-4 w-4" />,
  "No Show": <XCircleIcon className="h-4 w-4" />,
};

// Components
function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
        STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
        "bg-gray-100 text-gray-800"
      }`}
    >
      {STATUS_ICONS[status as keyof typeof STATUS_ICONS]}
      {status}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function TestDriveSidebar({
  testDrives,
  onDashboardClick,
  onPendingClick,
  onCompletedClick,
  onCanceledClick,
  onNoShowClick,
}: {
  testDrives: TestDrive[];
  onDashboardClick: () => void;
  onPendingClick: () => void;
  onCompletedClick: () => void;
  onCanceledClick: () => void;
  onNoShowClick: () => void;
}) {
  // Get next 3 upcoming test drives (by soonest date+time)
  const now = new Date();
  const upcoming = testDrives
    .filter((td) => {
      const dt = new Date(`${td.date}T${td.time || "00:00"}`);
      return (
        dt >= now &&
        td.status !== "Canceled" &&
        td.status !== "Completed" &&
        td.status !== "No Show"
      );
    })
    .sort((a, b) =>
      (a.date + (a.time || "00:00")).localeCompare(b.date + (b.time || "00:00"))
    )
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
          <TruckIcon className="h-5 w-5" />
          <span>Test Drive Portal</span>
        </div>
      </div>
      <nav className="flex-1 space-y-2 mb-8">
        <button
          type="button"
          onClick={onDashboardClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/50 hover:bg-blue-700 transition-colors font-medium w-full text-left"
        >
          <CogIcon className="h-5 w-5" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={onPendingClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-yellow-800 transition-colors font-medium w-full text-left"
        >
          <ClockIcon className="h-5 w-5" />
          Pending Test Drives
        </button>
        <button
          type="button"
          onClick={onCompletedClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-green-800 transition-colors font-medium w-full text-left"
        >
          <CheckCircleIcon className="h-5 w-5" />
          Completed Test Drives
        </button>
        <button
          type="button"
          onClick={onCanceledClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-gray-800 transition-colors font-medium w-full text-left"
        >
          <XCircleIcon className="h-5 w-5" />
          Canceled Test Drives
        </button>
        <button
          type="button"
          onClick={onNoShowClick}
          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-400/30 hover:bg-red-800 transition-colors font-medium w-full text-left"
        >
          <UserIcon className="h-5 w-5" />
          No Show Test Drives
        </button>
      </nav>
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-2 text-blue-100 flex items-center gap-2">
            <ClockIcon className="h-4 w-4" /> Upcoming Test Drives
          </h3>
          <ul className="space-y-2">
            {upcoming.map((td) => (
              <li
                key={td.id}
                className="bg-blue-800/40 rounded-lg px-3 py-2 flex flex-col"
              >
                <span className="font-medium text-white text-sm">
                  {td.name}
                </span>
                <span className="text-xs text-blue-200">{td.model}</span>
                <span className="text-xs text-blue-300 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 inline" /> {td.date}{" "}
                  {td.time || "Time TBD"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

function ProfileEditModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    branch?: string;
  } | null;
  onUpdate: (updatedUser: {
    name: string;
    email: string;
    phone: string;
    branch: string;
  }) => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    branch: user?.branch || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        branch: user.branch || "",
      });
    }
  }, [user]);

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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={formData.branch}
              onChange={(e) =>
                setFormData({ ...formData, branch: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Branch</option>
              <option value="Main Branch">Main Branch</option>
              <option value="North Branch">North Branch</option>
              <option value="South Branch">South Branch</option>
              <option value="East Branch">East Branch</option>
              <option value="West Branch">West Branch</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserProfileCard() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    phone?: string;
    branch?: string;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userRole = localStorage.getItem("userRole") || "user";

        if (userRole === "admin") {
          // Admin user
          setUser({
            name: "Admin",
            email: "admin@company.com",
            role: "admin",
          });
        } else if (userRole === "employee") {
          // Employee user - fetch from API
          const employeeName = localStorage.getItem("employeeName");
          if (employeeName) {
            const response = await fetch("/api/employees");
            const employees = await response.json();
            const employee = employees.find(
              (e: any) => e.name === employeeName
            );

            if (employee) {
              setUser({
                name: employee.name,
                email: employee.email,
                role: "employee",
                phone: employee.phone,
                branch: employee.branch,
              });
            } else {
              // Fallback to localStorage if employee not found in API
              setUser({
                name: employeeName,
                email: `${employeeName}@company.com`,
                role: "employee",
              });
            }
          }
        } else {
          // Default user
          setUser({
            name: "User",
            email: "user@company.com",
            role: "user",
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        // Fallback to localStorage data
        const userName = localStorage.getItem("employeeName") || "User";
        const userRole = localStorage.getItem("userRole") || "user";
        const userEmail = localStorage.getItem("employeeName")
          ? `${localStorage.getItem("employeeName")}@company.com`
          : "user@company.com";

        setUser({
          name: userName,
          email: userEmail,
          role: userRole,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
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

  const handleProfileUpdate = async (updatedData: {
    name: string;
    email: string;
    phone: string;
    branch: string;
  }) => {
    try {
      // For employees, update their profile in the employees API
      if (user?.role === "employee") {
        const employeeName = localStorage.getItem("employeeName");
        if (employeeName) {
          // Find employee by name and update
          const response = await fetch("/api/employees");
          const employees = await response.json();
          const employee = employees.find((e: any) => e.name === employeeName);

          if (employee) {
            await fetch("/api/employees", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: employee.id,
                name: updatedData.name,
                email: updatedData.email,
                phone: updatedData.phone,
                branch: updatedData.branch,
              }),
            });

            // Update localStorage
            localStorage.setItem("employeeName", updatedData.name);
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    name: updatedData.name,
                    email: updatedData.email,
                    phone: updatedData.phone,
                    branch: updatedData.branch,
                  }
                : null
            );
          }
        }
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
        <Button
          size="sm"
          variant="destructive"
          className="ml-4"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-xl shadow px-4 py-3 mb-8 justify-end">
        <UserCircleIcon className="h-10 w-10 text-gray-300" />
        <div>
          <div className="font-semibold text-gray-700">User not found</div>
        </div>
        <Button
          size="sm"
          variant="destructive"
          className="ml-4"
          onClick={handleLogout}
        >
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
          <div className="font-semibold text-gray-700">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <div className="text-xs text-blue-700 capitalize">{user.role}</div>
          {user.branch && (
            <div className="text-xs text-gray-500">{user.branch}</div>
          )}
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
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
}

function TestDriveFilters({
  modelFilter,
  statusFilter,
  dateFilter,
  uniqueModels,
  onModelChange,
  onStatusChange,
  onDateChange,
  onClearFilters,
}: {
  modelFilter: string;
  statusFilter: string;
  dateFilter: string;
  uniqueModels: string[];
  onModelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FunnelIcon className="h-5 w-5" />
          Filters
        </h3>
        <Button
          onClick={onClearFilters}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Model
          </label>
          <select
            value={modelFilter}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Models</option>
            {uniqueModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}



function PendingStatusActionButtons({
  testDrive,
  onStatusChange,
}: {
  testDrive: TestDrive;
  onStatusChange: (id: number, status: TestDriveStatus) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        className="gap-1 bg-green-600 hover:bg-green-700 text-white"
        onClick={() => onStatusChange(testDrive.id, "Confirmed")}
      >
        <CheckCircleIcon className="h-4 w-4" />
        Confirm
      </Button>
    </div>
  );
}

function StatusActionButtons({
  testDrive,
  onStatusChange,
}: {
  testDrive: TestDrive;
  onStatusChange: (id: number, status: TestDriveStatus) => void;
}) {
  const getAvailableActions = (currentStatus: TestDriveStatus) => {
    switch (currentStatus) {
      case "Pending":
        return [
          { status: "Completed" as TestDriveStatus, label: "Complete", icon: CheckCircleIcon, variant: "default", className: "gap-1 bg-green-600 text-white hover:bg-green-400" },
          { status: "Canceled" as TestDriveStatus, label: "Cancel", icon: XCircleIcon, variant: "destructive", className: "gap-1" },
          { status: "No Show" as TestDriveStatus, label: "No Show", icon: XCircleIcon, variant: "default", className: "gap-1 bg-red-600 hover:bg-red-400" }
        ];
      case "Confirmed":
        return [
          { status: "Completed" as TestDriveStatus, label: "Mark Complete", icon: CheckCircleIcon, variant: "default", className: "gap-1 bg-green-600 text-white hover:bg-green-400" },
          { status: "Canceled" as TestDriveStatus, label: "Cancel", icon: XCircleIcon, variant: "destructive", className: "gap-1" },
          { status: "No Show" as TestDriveStatus, label: "No Show", icon: XCircleIcon, variant: "default", className: "gap-1 bg-red-600 hover:bg-red-400" }
        ];
      case "Completed":
        return []; // No actions available for completed test drives
      case "Canceled":
        return []; // No actions available for canceled test drives
      case "No Show":
        return [
          { status: "Completed" as TestDriveStatus, label: "Mark Complete", icon: CheckCircleIcon, variant: "outline", className: "gap-1 bg-green-600 text-white hover:bg-green-400" },
          { status: "Canceled" as TestDriveStatus, label: "Cancel", icon: XCircleIcon, variant: "destructive", className: "gap-1" }
        ];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions(testDrive.status);

  return (
    <div className="flex gap-2">
      {availableActions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Button
            key={action.status}
            size="sm"
            variant={action.variant as any}
            className={action.className}
            onClick={() => onStatusChange(testDrive.id, action.status)}
          >
            <IconComponent className="h-4 w-4" /> {action.label}
          </Button>
        );
      })}
    </div>
  );
}

function TestDriveTable({
  testDrives,
  onStatusChange,
  onViewDetails,
}: {
  testDrives: TestDrive[];
  onStatusChange: (id: number, status: TestDriveStatus) => void;
  onViewDetails: (testDrive: TestDrive) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {testDrives.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <TruckIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No test drives found
                    </p>
                    <p className="text-sm">
                      Try adjusting your filters or add a new test drive
                      booking.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              testDrives.map((testDrive) => (
                <tr
                  key={testDrive.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {testDrive.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {testDrive.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {testDrive.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {testDrive.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(testDrive.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {testDrive.time || "Time not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={testDrive.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <StatusActionButtons
                        testDrive={testDrive}
                        onStatusChange={onStatusChange}
                      />
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <button
                        onClick={() => onViewDetails(testDrive)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
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

function PendingTestDrivesTable({
  testDrives,
  onStatusChange,
  onViewDetails,
}: {
  testDrives: TestDrive[];
  onStatusChange: (id: number, status: TestDriveStatus) => void;
  onViewDetails: (testDrive: TestDrive) => void;
}) {
  // Filter only pending test drives
  const pendingTestDrives = testDrives.filter((td) => td.status === "Pending");

  // Function to check if a test drive is an upcoming appointment
  const isUpcomingAppointment = (testDrive: TestDrive) => {
    const today = new Date();
    const appointmentDate = new Date(testDrive.date);
    
    // Set today's time to start of day for comparison
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    // Check if appointment is today or in the future
    return appointmentDate >= today;
  };

  // Only show upcoming appointments
  const upcomingAppointments = pendingTestDrives.filter(isUpcomingAppointment);

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments Section */}
      {upcomingAppointments.length > 0 ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Upcoming Appointments ({upcomingAppointments.length})
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Test drives scheduled for today or upcoming dates
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-700">
              <thead className="bg-blue-50 dark:bg-blue-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-blue-200 dark:divide-blue-700">
                {upcomingAppointments.map((testDrive) => (
                  <tr
                    key={testDrive.id}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {testDrive.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                            <EnvelopeIcon className="h-3 w-3" />
                            {testDrive.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            {testDrive.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {testDrive.model}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {new Date(testDrive.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                        {testDrive.time || "Time not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={testDrive.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <PendingStatusActionButtons
                          testDrive={testDrive}
                          onStatusChange={onStatusChange}
                        />
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                        <button
                          onClick={() => onViewDetails(testDrive)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State when no upcoming appointments */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                No upcoming appointments
              </p>
              <p className="text-sm">
                No pending test drives are scheduled for today or upcoming dates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedTestDrivesTable({
  testDrives,
  onStatusChange,
  onViewDetails,
}: {
  testDrives: TestDrive[];
  onStatusChange: (id: number, status: TestDriveStatus) => void;
  onViewDetails: (testDrive: TestDrive) => void;
}) {
  // Filter only completed test drives
  const completedTestDrives = testDrives.filter(
    (td) => td.status === "Completed"
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          Completed Test Drives ({completedTestDrives.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          View completed test drive sessions (read-only)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {completedTestDrives.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <CheckCircleIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No completed test drives
                    </p>
                    <p className="text-sm">
                      No test drives have been completed yet.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              completedTestDrives.map((testDrive) => (
                <tr
                  key={testDrive.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-green-600 dark:text-green-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {testDrive.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {testDrive.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {testDrive.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {testDrive.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(testDrive.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {testDrive.time || "Time not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={testDrive.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <StatusActionButtons
                        testDrive={testDrive}
                        onStatusChange={onStatusChange}
                      />
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <button
                        onClick={() => onViewDetails(testDrive)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
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

function CanceledTestDrivesTable({
  testDrives,
  onStatusChange,
  onViewDetails,
}: {
  testDrives: TestDrive[];
  onStatusChange: (id: number, status: TestDriveStatus) => void;
  onViewDetails: (testDrive: TestDrive) => void;
}) {
  // Filter only canceled test drives
  const canceledTestDrives = testDrives.filter(
    (td) => td.status === "Canceled"
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <XCircleIcon className="h-5 w-5 text-gray-600" />
          Canceled Test Drives ({canceledTestDrives.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          View canceled test drive bookings (read-only)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {canceledTestDrives.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <XCircleIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No canceled test drives
                    </p>
                    <p className="text-sm">
                      No test drives have been canceled yet.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              canceledTestDrives.map((testDrive) => (
                <tr
                  key={testDrive.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {testDrive.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {testDrive.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {testDrive.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {testDrive.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(testDrive.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {testDrive.time || "Time not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={testDrive.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <StatusActionButtons
                        testDrive={testDrive}
                        onStatusChange={onStatusChange}
                      />
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <button
                        onClick={() => onViewDetails(testDrive)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
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

function NoShowTestDrivesTable({
  testDrives,
  onStatusChange,
  onViewDetails,
}: {
  testDrives: TestDrive[];
  onStatusChange: (id: number, status: TestDriveStatus) => void;
  onViewDetails: (testDrive: TestDrive) => void;
}) {
  // Filter only no-show test drives
  const noShowTestDrives = testDrives.filter(
    (td) => td.status === "No Show"
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <XCircleIcon className="h-5 w-5 text-red-600" />
          No Show Test Drives ({noShowTestDrives.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          View and manage no-show test drive bookings
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {noShowTestDrives.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <XCircleIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No no-show test drives
                    </p>
                    <p className="text-sm">
                      No test drives have been marked as no-show yet.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              noShowTestDrives.map((testDrive) => (
                <tr
                  key={testDrive.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-red-600 dark:text-red-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {testDrive.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {testDrive.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {testDrive.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {testDrive.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(testDrive.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {testDrive.time || "Time not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={testDrive.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <StatusActionButtons
                        testDrive={testDrive}
                        onStatusChange={onStatusChange}
                      />
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <button
                        onClick={() => onViewDetails(testDrive)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
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

function TestDriveDetails({
  testDrive,
  onClose,
}: {
  testDrive: TestDrive | null;
  onClose: () => void;
}) {
  if (!testDrive) return null;

  return (
    <Dialog open={!!testDrive} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-blue-600" />
          Test Drive Details
        </DialogTitle>
        <div className="space-y-4">
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Name: {testDrive.name}
            </span>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Email: {testDrive.email}
            </span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Phone: {testDrive.phone}
            </span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Date: {new Date(testDrive.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Time: {testDrive.time || "Time not specified"}
            </span>
          </div>
          <div className="flex items-center">
            <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Model: {testDrive.model}
            </span>
          </div>
          <div className="flex items-center">
            <StatusBadge status={testDrive.status} />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
            Created: {new Date(testDrive.createdAt).toLocaleString()}
          </div>
        </div>
        <DialogClose asChild>
          <Button className="w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export default function TestDriveDashboard() {
  const router = useRouter();
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedTestDrive, setSelectedTestDrive] = useState<TestDrive | null>(
    null
  );




  // View states
  const [showDashboard, setShowDashboard] = useState(true);
  const [showPending, setShowPending] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [showNoShow, setShowNoShow] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  const fetchTestDrives = async () => {
    try {
      const response = await fetch("/api/test-drive");
      const data = await response.json();
      setTestDrives(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching test drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user should be redirected to appointment management
    const managementMode = localStorage.getItem("managementMode");
    const userRole = localStorage.getItem("userRole");

    if (managementMode === "appointments") {
      if (userRole === "admin") {
        window.location.href = "/admin/appointments";
      } else if (userRole === "employee") {
        window.location.href = "/employee/dashboard";
      }
      return;
    }

    // Get current user email for notifications
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setCurrentUserEmail(userEmail);
    }

    fetchTestDrives();
  }, []);

  const handleStatusChange = async (id: number, status: TestDriveStatus) => {
    try {
      await fetch("/api/test-drive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchTestDrives();
      toast.success("Test drive status updated successfully");
    } catch (error) {
      toast.error("Failed to update test drive status");
    }
  };



  const handleViewDetails = (testDrive: TestDrive) => {
    setSelectedTestDrive(testDrive);
    toast.success(`Viewing details for ${testDrive.name}'s test drive`);
  };

  const handleCloseDetails = () => {
    setSelectedTestDrive(null);
    toast.info("Details modal closed");
  };

  const handleClearFilters = () => {
    setModelFilter("");
    setStatusFilter("");
    setDateFilter("");
  };

  const handleRefresh = async () => {
    try {
      await fetchTestDrives();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  // Sidebar click handlers
  const handleDashboardClick = () => {
    setShowDashboard(true);
    setShowPending(false);
    setShowCompleted(false);
    setShowCanceled(false);
    setShowNoShow(false);
  };

  const handlePendingClick = () => {
    setShowDashboard(false);
    setShowPending(true);
    setShowCompleted(false);
    setShowCanceled(false);
    setShowNoShow(false);
  };

  const handleCompletedClick = () => {
    setShowDashboard(false);
    setShowPending(false);
    setShowCompleted(true);
    setShowCanceled(false);
    setShowNoShow(false);
  };

  const handleCanceledClick = () => {
    setShowDashboard(false);
    setShowPending(false);
    setShowCompleted(false);
    setShowCanceled(true);
    setShowNoShow(false);
  };

  const handleNoShowClick = () => {
    setShowDashboard(false);
    setShowPending(false);
    setShowCompleted(false);
    setShowCanceled(false);
    setShowNoShow(true);
  };

  // Filter test drives
  const filteredTestDrives = useMemo(() => {
    return testDrives.filter((td) => {
      const matchesModel = !modelFilter || td.model === modelFilter;
      const matchesStatus = !statusFilter || td.status === statusFilter;
      const matchesDate = !dateFilter || td.date === dateFilter;
      return matchesModel && matchesStatus && matchesDate;
    });
  }, [testDrives, modelFilter, statusFilter, dateFilter]);

  // Filter test drives for main dashboard (exclude pending, canceled, and completed)
  const mainDashboardTestDrives = useMemo(() => {
    return testDrives.filter((td) => {
      const matchesModel = !modelFilter || td.model === modelFilter;
      const matchesStatus = !statusFilter || td.status === statusFilter;
      const matchesDate = !dateFilter || td.date === dateFilter;
      // Include only confirmed and no show test drives in main dashboard (exclude pending, canceled, and completed)
      const isNotPending = td.status !== "Pending";
      const isNotCanceled = td.status !== "Canceled";
      const isNotCompleted = td.status !== "Completed";
      return matchesModel && matchesStatus && matchesDate && isNotPending && isNotCanceled && isNotCompleted;
    });
  }, [testDrives, modelFilter, statusFilter, dateFilter]);

  // Get unique models for filter
  const uniqueModels = useMemo(() => {
    return [...new Set(testDrives.map((td) => td.model))];
  }, [testDrives]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = testDrives.length;
    const pending = testDrives.filter((td) => td.status === "Pending").length;
    const confirmed = testDrives.filter((td) => td.status === "Confirmed").length;
    const completed = testDrives.filter(
      (td) => td.status === "Completed"
    ).length;
    const canceled = testDrives.filter((td) => td.status === "Canceled").length;
    const noShow = testDrives.filter((td) => td.status === "No Show").length;

    return { total, pending, confirmed, completed, canceled, noShow };
  }, [testDrives]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <TestDriveSidebar
        testDrives={testDrives}
        onDashboardClick={handleDashboardClick}
        onPendingClick={handlePendingClick}
        onCompletedClick={handleCompletedClick}
        onCanceledClick={handleCanceledClick}
        onNoShowClick={handleNoShowClick}
      />

      <main className="flex-1 p-8">
        <div className="flex justify-end items-center gap-4">
          <TestDriveNotificationBell />
          {currentUserEmail && (
            <EmployeeNotificationBell employeeEmail={currentUserEmail} />
          )}
          <UserProfileCard />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <TruckIcon className="h-8 w-8 text-blue-600" />
                {showDashboard && "Test Drive Dashboard"}
                {showPending && "Pending Test Drives"}
                {showCompleted && "Completed Test Drives"}
                {showCanceled && "Canceled Test Drives"}
                {showNoShow && "No Show Test Drives"}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {showDashboard && "Manage confirmed and completed test drive appointments"}
                {showPending && "View and manage pending test drive bookings"}
                {showCompleted && "View completed test drive sessions"}
                {showCanceled && "View canceled test drive bookings"}
                {showNoShow && "View no-show test drive bookings"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  router.push("/test-drive");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                New Test Drive
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {showDashboard && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Total
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Confirmed
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.confirmed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Completed
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Canceled
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.canceled}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    No Shows
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.noShow}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard View - Show Pending Test Drives prominently */}
        {showDashboard && (
          <>
            {/* Filters for All Test Drives */}
            <TestDriveFilters
              modelFilter={modelFilter}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              uniqueModels={uniqueModels}
              onModelChange={setModelFilter}
              onStatusChange={setStatusFilter}
              onDateChange={setDateFilter}
              onClearFilters={handleClearFilters}
            />

            {/* Confirmed Test Drives Table */}
            <TestDriveTable
              testDrives={mainDashboardTestDrives}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          </>
        )}

        {/* Pending View */}
        {showPending && (
          <PendingTestDrivesTable
            testDrives={testDrives}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Completed View */}
        {showCompleted && (
          <CompletedTestDrivesTable
            testDrives={testDrives}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Canceled View */}
        {showCanceled && (
          <CanceledTestDrivesTable
            testDrives={testDrives}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* No Show View */}
        {showNoShow && (
          <NoShowTestDrivesTable
            testDrives={testDrives}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Details Modal */}
        <TestDriveDetails
          testDrive={selectedTestDrive}
          onClose={handleCloseDetails}
        />




      </main>
    </div>
  );
}
