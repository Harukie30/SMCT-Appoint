"use client";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/ui/admin-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  CalendarIcon, 
  TruckIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalBookings: number;
  totalTestDrives: number;
  totalEmployees: number;
  totalBranches: number;
  totalServices: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  canceledBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalTestDrives: 0,
    totalEmployees: 0,
    totalBranches: 0,
    totalServices: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    canceledBookings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookings, testDrives, employees, branches, services] = await Promise.all([
          fetch('/api/bookings').then(r => r.json()).catch(() => []),
          fetch('/api/test-drive').then(r => r.json()).catch(() => []),
          fetch('/api/employees').then(r => r.json()).catch(() => []),
          fetch('/api/branches').then(r => r.json()).catch(() => []),
          fetch('/api/services').then(r => r.json()).catch(() => []),
        ]);

        const bookingsArray = Array.isArray(bookings) ? bookings : [];
        const testDrivesArray = Array.isArray(testDrives) ? testDrives : [];

        const bookingStats = bookingsArray.reduce((acc, booking) => {
          acc[booking.status || 'Pending'] = (acc[booking.status || 'Pending'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setStats({
          totalBookings: bookingsArray.length,
          totalTestDrives: testDrivesArray.length,
          totalEmployees: Array.isArray(employees) ? employees.length : 0,
          totalBranches: Array.isArray(branches) ? branches.length : 0,
          totalServices: Array.isArray(services) ? services.length : 0,
          pendingBookings: bookingStats.Pending || 0,
          confirmedBookings: bookingStats.Confirmed || 0,
          completedBookings: bookingStats.Done || 0,
          canceledBookings: bookingStats.Canceled || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarIcon,
      color: "blue",
      href: "/admin/appointments",
    },
    {
      title: "Test Drives",
      value: stats.totalTestDrives,
      icon: TruckIcon,
      color: "green",
      href: "/admin/test-drives",
    },
    {
      title: "Employees",
      value: stats.totalEmployees,
      icon: UserGroupIcon,
      color: "purple",
      href: "/admin/data-management",
    },
    {
      title: "Branches",
      value: stats.totalBranches,
      icon: BuildingOfficeIcon,
      color: "orange",
      href: "/admin/data-management",
    },
  ];

  const bookingStatusCards = [
    {
      title: "Pending",
      value: stats.pendingBookings,
      icon: ClockIcon,
      color: "yellow",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Confirmed",
      value: stats.confirmedBookings,
      icon: CheckCircleIcon,
      color: "blue",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Completed",
      value: stats.completedBookings,
      icon: CheckCircleIcon,
      color: "green",
      change: "+15%",
      changeType: "increase",
    },
    {
      title: "Canceled",
      value: stats.canceledBookings,
      icon: XCircleIcon,
      color: "red",
      change: "-3%",
      changeType: "decrease",
    },
  ];

  const quickActions = [
    {
      title: "View Appointments",
      description: "Manage customer appointments and bookings",
      icon: CalendarIcon,
      href: "/admin/appointments",
      color: "blue",
    },
    {
      title: "Test Drive Management",
      description: "Handle test drive requests and car inventory",
      icon: TruckIcon,
      href: "/admin/test-drives",
      color: "green",
    },
    {
      title: "Data Management",
      description: "Manage employees, branches, and services",
      icon: WrenchScrewdriverIcon,
      href: "/admin/data-management",
      color: "purple",
    },
  ];

  return (
    <AdminLayout 
      title="Admin Dashboard" 
      subtitle="Welcome back! Here's what's happening with your business today."
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {bookingStatusCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <div className="flex items-center mt-2">
                  {card.changeType === "increase" ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.changeType === "increase" ? "text-green-600" : "text-red-600"
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center mb-4`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New appointment booked</p>
                <p className="text-xs text-gray-500">John Doe - Oil Change Service</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Test drive confirmed</p>
                <p className="text-xs text-gray-500">Toyota Camry - Sarah Wilson</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New employee added</p>
                <p className="text-xs text-gray-500">Mike Johnson - Main Branch</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Service completed</p>
                <p className="text-xs text-gray-500">Brake Inspection - Robert Brown</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 