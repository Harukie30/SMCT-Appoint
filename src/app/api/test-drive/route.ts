import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("API received data:", data);
    const { name, email, phone, date, time, model, branch } = data;

    console.log("Extracted fields:", { name, email, phone, date, time, model, branch });

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !model || !branch) {
      console.log("Missing fields validation failed");
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!email) missingFields.push("email");
      if (!phone) missingFields.push("phone");
      if (!date) missingFields.push("date");
      if (!time) missingFields.push("time");
      if (!model) missingFields.push("model");
      if (!branch) missingFields.push("branch");
      
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(", ")}` 
      }, { status: 400 });
    }

    // Read existing test drives
    const dataPath = path.join(process.cwd(), 'src', 'data', 'test-drives.json');
    let testDrives = [];
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      testDrives = JSON.parse(fileContent);
    } catch (error) {
      console.log("No existing test drives file found, starting fresh");
    }

    // Create new test drive entry
    const newTestDrive = {
      id: Date.now(),
      name,
      email,
      phone,
      date,
      time,
      model,
      branch,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    console.log("Created test drive entry:", newTestDrive);

    // Add to existing data and save
    testDrives.push(newTestDrive);
    
    try {
      fs.writeFileSync(dataPath, JSON.stringify(testDrives, null, 2));
    } catch (error) {
      console.error("Error writing to file:", error);
    }

    // Send notification to employees in the branch
    try {
      const notificationMessage = `New test drive booking for ${name} (${model}) on ${date} at ${time}`;
      
      const notificationResponse = await fetch(`${req.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testDriveId: newTestDrive.id,
          testDriveBranch: branch,
          type: 'new_test_drive',
          message: notificationMessage
        })
      });

      if (notificationResponse.ok) {
        const notificationResult = await notificationResponse.json();
        console.log('Notification sent:', notificationResult.message);
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the main request if notification fails
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: "Test drive booking received successfully.",
      id: newTestDrive.id,
      data: newTestDrive
    });

  } catch (error) {
    console.error("Error in test drive API:", error);
    return NextResponse.json({ 
      error: "Internal server error. Please try again." 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Read test drives from JSON file
    const dataPath = path.join(process.cwd(), 'src', 'data', 'test-drives.json');
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      const testDrives = JSON.parse(fileContent);
      return NextResponse.json(testDrives);
    } catch (error) {
      console.log("No test drives file found, returning empty array");
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error in GET test drive API:", error);
    return NextResponse.json([]);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Read existing test drives
    const dataPath = path.join(process.cwd(), 'src', 'data', 'test-drives.json');
    let testDrives = [];
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      testDrives = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: "No test drives found." }, { status: 404 });
    }

    // Find and update the test drive
    const testDriveIndex = testDrives.findIndex((td: any) => td.id === id);
    if (testDriveIndex === -1) {
      return NextResponse.json({ error: "Test drive not found." }, { status: 404 });
    }

    const testDrive = testDrives[testDriveIndex];
    const oldStatus = testDrive.status;
    testDrive.status = status;

    // Save updated data
    try {
      fs.writeFileSync(dataPath, JSON.stringify(testDrives, null, 2));
    } catch (error) {
      console.error("Error writing to file:", error);
      return NextResponse.json({ error: "Failed to update test drive." }, { status: 500 });
    }

    // Send notification to employees in the branch
    try {
      const notificationMessage = `Test drive for ${testDrive.name} (${testDrive.model}) status changed from ${oldStatus} to ${status}`;
      
      const notificationResponse = await fetch(`${req.nextUrl.origin}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testDriveId: id,
          testDriveBranch: testDrive.branch,
          type: 'test_drive_status_change',
          message: notificationMessage
        })
      });

      if (notificationResponse.ok) {
        const notificationResult = await notificationResponse.json();
        console.log('Notification sent:', notificationResult.message);
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the main request if notification fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating test drive:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Read existing test drives
    const dataPath = path.join(process.cwd(), 'src', 'data', 'test-drives.json');
    let testDrives = [];
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      testDrives = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: "No test drives found." }, { status: 404 });
    }

    // Filter out the test drive to delete
    const updatedTestDrives = testDrives.filter((td: any) => td.id !== id);

    if (updatedTestDrives.length === testDrives.length) {
      return NextResponse.json({ error: "Test drive not found." }, { status: 404 });
    }

    // Save updated data
    try {
      fs.writeFileSync(dataPath, JSON.stringify(updatedTestDrives, null, 2));
    } catch (error) {
      console.error("Error writing to file:", error);
      return NextResponse.json({ error: "Failed to delete test drive." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting test drive:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
} 