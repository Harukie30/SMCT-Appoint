"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";

// Test drive booking data interface
interface TestDriveBookingData {
  id?: number;
  branch: string;
  model: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// POST request functions
const sendTestDriveEmailConfirmation = async (bookingData: TestDriveBookingData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: bookingData.email,
        subject: 'Test Drive Confirmation',
        booking: bookingData,
        type: 'test-drive'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default function TestDriveConfirmedPage() {
  const [booking, setBooking] = useState<TestDriveBookingData | null>(null);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Load booking from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("lastTestDriveBooking");
    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  const downloadReceipt = () => {
    window.print();
  };

  const handleReschedule = () => {
    localStorage.setItem("rescheduleTestDrive", "true");
    router.push("/test-drive");
  };

  // Send email confirmation
  const handleSendEmail = useCallback(async () => {
    if (!booking) return;

    setSendingEmail(true);
    setEmailStatus('sending');

    try {
      const result = await sendTestDriveEmailConfirmation(booking);
      
      if (result.success) {
        setEmailStatus('success');
        console.log('Email sent successfully!');
      } else {
        setEmailStatus('error');
        console.error('Failed to send email:', result.error);
      }
    } catch (error) {
      setEmailStatus('error');
      console.error('Error sending email:', error);
    } finally {
      setSendingEmail(false);
    }
  }, [booking]);

  // Send email automatically when page loads and save booking to localStorage
  useEffect(() => {
    if (booking) {
      // Save booking to localStorage
      localStorage.setItem("lastTestDriveBooking", JSON.stringify(booking));
      
      // Auto-send email confirmation
      handleSendEmail();
    }
  }, [booking, handleSendEmail]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Test Drive Booking Found</h2>
          <p className="text-gray-600 mb-6">It seems there's no test drive booking to display.</p>
          <Button onClick={() => router.push("/test-drive")} className="bg-green-600 hover:bg-green-700">
            Book a Test Drive
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Image
              src="/smct.png"
              alt="SMCT Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Test Drive Confirmed!
          </h1>
          <p className="text-gray-600">
            Your test drive experience has been successfully scheduled
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Booking Details */}
          <motion.div
            ref={printRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Booking Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Car Model */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <TruckIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Car Model</p>
                  <p className="font-semibold text-gray-800">{booking.model}</p>
                </div>
              </div>

              {/* Branch */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-semibold text-gray-800">{booking.branch}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(booking.date)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold text-gray-800">{booking.time}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold text-gray-800">{booking.name}</p>
                  <p className="text-sm text-gray-600">{booking.phone}</p>
                  <p className="text-sm text-gray-600">{booking.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Actions & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* What to Expect */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <TruckIcon className="h-5 w-5" />
                What to Expect
              </h3>
              <ul className="space-y-3 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Confirmation call within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Email with dealership details and directions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Reminder 1 day before your test drive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Bring your valid driver's license</span>
                </li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Important Notes
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Test drives typically last 15-30 minutes</li>
                <li>• Arrive 10 minutes before your scheduled time</li>
                <li>• Our staff will accompany you during the test drive</li>
                <li>• Feel free to ask questions about the vehicle</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If you need to modify or cancel your test drive:
              </p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>(123) 456-7890</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>testdrive@smct.com</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleReschedule}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            Reschedule Test Drive
          </Button>
          
          <Button
            onClick={() => router.push("/test-drive")}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3"
          >
            Book Another Test Drive
          </Button>
          
          <Button
            onClick={downloadReceipt}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
          >
            Download Receipt
          </Button>
        </motion.div>

        {/* Email Status */}
        {emailStatus === 'sending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">Sending confirmation email...</p>
          </motion.div>
        )}

        {emailStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-green-600">✓ Confirmation email sent successfully!</p>
          </motion.div>
        )}

        {emailStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-red-600">Failed to send confirmation email</p>
            <Button
              onClick={handleSendEmail}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </motion.div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
} 