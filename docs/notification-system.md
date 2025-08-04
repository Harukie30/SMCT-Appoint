# Branch-Specific Notification System

## Overview

The notification system automatically sends notifications to employees based on their branch assignments when test drive events occur.

## How It Works

### 1. Branch Assignment
- Each employee is assigned to a specific branch in `src/data/employees.json`
- Each test drive is associated with a branch in `src/data/test-drives.json`

### 2. Notification Triggers
Notifications are automatically sent when:
- **New Test Drive**: When a customer books a new test drive
- **Status Change**: When a test drive status is updated (Pending → Confirmed, Confirmed → Completed, etc.)

### 3. Notification Matching
- When a test drive event occurs, the system finds all employees assigned to that test drive's branch
- Notifications are created for each employee in that branch
- Employees only receive notifications for test drives in their assigned branch

## API Endpoints

### `/api/notifications` (POST)
Creates notifications for employees in a specific branch.

**Request Body:**
```json
{
  "testDriveId": 123,
  "testDriveBranch": "Tagb HO",
  "type": "new_test_drive",
  "message": "New test drive booking for John Doe (Toyota Camry)"
}
```

### `/api/notifications` (GET)
Retrieves notifications for a specific employee.

**Query Parameters:**
- `employeeEmail`: Filter notifications by employee email
- `status`: Filter by notification status ("unread" or "read")

### `/api/notifications` (PATCH)
Marks a notification as read.

**Request Body:**
```json
{
  "notificationId": 123,
  "status": "read"
}
```

## Data Structure

### Notification Object
```json
{
  "id": 123,
  "employeeId": 1,
  "employeeEmail": "employee@example.com",
  "employeeBranch": "Tagb HO",
  "testDriveId": 456,
  "testDriveBranch": "Tagb HO",
  "type": "test_drive_status_change",
  "message": "Test drive status updated",
  "status": "unread",
  "createdAt": "2025-08-04T05:35:00.000Z"
}
```

## UI Components

### EmployeeNotificationBell
- Displays in the test drive dashboard header
- Shows unread notification count
- Allows employees to view and mark notifications as read
- Auto-refreshes every 30 seconds

## Files Involved

- `src/app/api/notifications/route.ts` - Notification API endpoints
- `src/components/ui/employee-notification-bell.tsx` - Notification UI component
- `src/data/notifications.json` - Notification storage
- `src/data/employees.json` - Employee branch assignments
- `src/data/test-drives.json` - Test drive branch information
- `src/app/api/test-drive/route.ts` - Modified to send notifications

## Example Workflow

1. Customer books test drive for "Tagb HO" branch
2. System finds employees assigned to "Tagb HO" branch
3. Notifications are created for those employees
4. Employees see notification bell with unread count
5. Employees can view and mark notifications as read

## Benefits

- **Branch-Specific**: Employees only see notifications relevant to their branch
- **Real-Time**: Notifications appear immediately when events occur
- **Non-Intrusive**: Notifications don't interrupt workflow
- **Trackable**: All notifications are stored and can be marked as read 