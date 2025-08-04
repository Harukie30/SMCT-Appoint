"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentNotification {
  id: number;
  type: 'appointment';
  title: string;
  message: string;
  status: string;
  date: string;
  customerName?: string;
  service?: string;
  time?: string;
  phone?: string;
  email?: string;
}

interface AllAppointmentNotification extends AppointmentNotification {
  originalData: any; // Store the original data for reference
}

export function AppointmentNotificationBell() {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [allNotifications, setAllNotifications] = useState<AllAppointmentNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AllAppointmentNotification | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch only appointments
      const appointmentsRes = await fetch('/api/bookings');
      const appointments = await appointmentsRes.json();

      // Filter pending appointments and format as notifications
      const pendingAppointments = appointments
        .filter((app: any) => app.status === 'Pending')
        .map((app: any) => ({
          id: app.id,
          type: 'appointment' as const,
          title: 'New Appointment Request',
          message: `${app.name} requested an appointment for ${app.service}`,
          status: app.status,
          date: app.date,
          customerName: app.name,
          service: app.service,
          time: app.time,
          phone: app.phone,
          email: app.email
        }));

      setNotifications(pendingAppointments);
    } catch (error) {
      console.error('Error fetching appointment notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllNotifications = async () => {
    setIsModalLoading(true);
    try {
      // Fetch all appointments (not just pending)
      const appointmentsRes = await fetch('/api/bookings');
      const appointments = await appointmentsRes.json();

      // Format all appointments as notifications
      const allAppointments = appointments.map((app: any) => ({
        id: app.id,
        type: 'appointment' as const,
        title: 'Appointment Request',
        message: `${app.name} requested an appointment for ${app.service}`,
        status: app.status,
        date: app.date,
        customerName: app.name,
        service: app.service,
        time: app.time,
        phone: app.phone,
        email: app.email,
        originalData: app
      }));

      setAllNotifications(allAppointments);
    } catch (error) {
      console.error('Error fetching all appointment notifications:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const markAsDone = async (notification: AllAppointmentNotification) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notification.id,
          status: 'Done'
        }),
      });

      if (response.ok) {
        // Refresh the notifications
        await fetchAllNotifications();
        await fetchNotifications();
      } else {
        console.error('Failed to mark as done');
      }
    } catch (error) {
      console.error('Error marking as done:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (notification: AllAppointmentNotification) => {
    setItemToDelete(notification);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemToDelete.id
        }),
      });

      if (response.ok) {
        // Refresh the notifications
        await fetchAllNotifications();
        await fetchNotifications();
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } else {
        console.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const notificationCount = notifications.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'Canceled':
        return 'bg-gray-100 text-gray-800';
      case 'No Show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (timeString) {
      return `${formattedDate} at ${timeString}`;
    }
    return formattedDate;
  };

  const getTypeIcon = (type: 'appointment') => {
    return '📋'; // Clipboard emoji for appointments
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="relative p-6 text-black bg-blue-300 hover:bg-yellow-300 hover:text-black rounded-full"
          >
            <BellIcon className="h-20 w-20" />
            {notificationCount > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 flex items-center justify-center text-sm bg-red-500 text-white"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Appointment Notifications</h3>
            <p className="text-sm text-gray-500">Pending appointment requests</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500">No pending appointment requests</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {notification.customerName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.service}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(notification.date, notification.time)}
                        </p>
                        <Badge className={`mt-1 ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsModalOpen(true);
                fetchAllNotifications();
                setIsOpen(false);
              }}
            >
              View All Appointments
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[70vw] h-[85vh] !max-w-none flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              All Appointment Notifications
            </DialogTitle>
            <p className="text-sm text-gray-500">
              View all appointment requests
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isModalLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading all appointment notifications...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Type</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Details</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Date & Time</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Contact</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allNotifications.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                            <span className="font-semibold text-gray-900 text-lg">
                              Appointment
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">
                              {notification.customerName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 text-lg">
                            Service: {notification.service}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 text-lg">
                            {formatDateTime(notification.date, notification.time)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base text-gray-600">
                            <div className="font-medium">{notification.email}</div>
                            <div>{notification.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getStatusColor(notification.status)} text-base px-3 py-1`}>
                            {notification.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {(notification.status === 'Pending' || notification.status === 'Confirmed') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsDone(notification)}
                                disabled={isUpdating}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {isUpdating ? 'Updating...' : 'Mark Done'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(notification)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {allNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No appointment notifications found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
            <div className="text-sm text-gray-500">
              Total: {allNotifications.length} appointment notification{allNotifications.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  fetchAllNotifications();
                }}
                disabled={isModalLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 