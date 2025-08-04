import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Types
type NotificationType = "test_drive_status_change" | "new_test_drive" | "test_drive_cancelled";
type NotificationStatus = "unread" | "read";

interface Notification {
  id: number;
  employeeId: number;
  employeeEmail: string;
  employeeBranch: string;
  testDriveId: number;
  testDriveBranch: string;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { testDriveId, testDriveBranch, type, message } = data;

    if (!testDriveId || !testDriveBranch || !type || !message) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Read employees to find those assigned to the branch
    const employeesPath = path.join(process.cwd(), 'src', 'data', 'employees.json');
    const notificationsPath = path.join(process.cwd(), 'src', 'data', 'notifications.json');
    
    let employees = [];
    let notifications = [];
    
    try {
      const employeesContent = fs.readFileSync(employeesPath, 'utf8');
      employees = JSON.parse(employeesContent);
    } catch (error) {
      console.log("No employees file found");
      return NextResponse.json({ error: "No employees found" }, { status: 404 });
    }

    try {
      const notificationsContent = fs.readFileSync(notificationsPath, 'utf8');
      notifications = JSON.parse(notificationsContent);
    } catch (error) {
      console.log("No notifications file found, starting fresh");
    }

    // Find employees assigned to the test drive's branch
    const branchEmployees = employees.filter((emp: any) => emp.branch === testDriveBranch);
    
    if (branchEmployees.length === 0) {
      return NextResponse.json({ 
        message: "No employees assigned to this branch",
        success: true 
      });
    }

    // Create notifications for each employee in the branch
    const newNotifications: Notification[] = branchEmployees.map((emp: any) => ({
      id: Date.now() + Math.random(), // Ensure unique ID
      employeeId: emp.id,
      employeeEmail: emp.email,
      employeeBranch: emp.branch,
      testDriveId,
      testDriveBranch,
      type,
      message,
      status: "unread" as NotificationStatus,
      createdAt: new Date().toISOString(),
    }));

    // Add new notifications to existing ones
    notifications.push(...newNotifications);
    
    // Save notifications
    fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));

    return NextResponse.json({ 
      success: true,
      message: `Notifications sent to ${branchEmployees.length} employee(s) in ${testDriveBranch}`,
      notifications: newNotifications
    });

  } catch (error) {
    console.error("Error creating notifications:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeEmail = searchParams.get('employeeEmail');
    const status = searchParams.get('status');

    const notificationsPath = path.join(process.cwd(), 'src', 'data', 'notifications.json');
    
    let notifications = [];
    
    try {
      const notificationsContent = fs.readFileSync(notificationsPath, 'utf8');
      notifications = JSON.parse(notificationsContent);
    } catch (error) {
      return NextResponse.json([]);
    }

    // Filter notifications based on query parameters
    let filteredNotifications = notifications;

    if (employeeEmail) {
      filteredNotifications = filteredNotifications.filter((notification: Notification) => 
        notification.employeeEmail === employeeEmail
      );
    }

    if (status) {
      filteredNotifications = filteredNotifications.filter((notification: Notification) => 
        notification.status === status
      );
    }

    return NextResponse.json(filteredNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { notificationId, status } = data;

    if (!notificationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notificationsPath = path.join(process.cwd(), 'src', 'data', 'notifications.json');
    
    let notifications = [];
    
    try {
      const notificationsContent = fs.readFileSync(notificationsPath, 'utf8');
      notifications = JSON.parse(notificationsContent);
    } catch (error) {
      return NextResponse.json({ error: "No notifications found" }, { status: 404 });
    }

    // Find and update the notification
    const notificationIndex = notifications.findIndex((n: Notification) => n.id === notificationId);
    if (notificationIndex === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    notifications[notificationIndex].status = status;

    // Save updated notifications
    fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 