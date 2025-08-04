"use client";

import { useState } from "react";
import { UserIcon, CogIcon, BellIcon, ShieldCheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  notifications: number;
  permissions: string[];
}

export function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock profile data - in a real app, this would come from an API
  const profileData: ProfileData = {
    name: "Admin User",
    email: "admin@smct.com",
    role: "Administrator",
    department: "Management",
    lastLogin: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    notifications: 3,
    permissions: ["View Appointments", "Manage Test Drives", "Data Management", "User Management"]
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("managementMode");
      toast.success("Logged out successfully");
      window.location.href = "/login";
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Error during logout");
      window.location.href = "/login";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-900">{profileData.name}</div>
            <div className="text-xs text-gray-500">{profileData.role}</div>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
            <p className="text-gray-600">{profileData.email}</p>
            <Badge className="mt-2 bg-blue-100 text-blue-800">
              {profileData.role}
            </Badge>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{profileData.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Login</p>
                <p className="font-medium">{profileData.lastLogin}</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <Badge className="bg-red-500 text-white">
                {profileData.notifications}
              </Badge>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">Permissions</span>
              </div>
              <div className="space-y-2">
                {profileData.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Add settings functionality here
                console.log("Settings clicked");
              }}
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 