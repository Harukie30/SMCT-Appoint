"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import branches from "@/data/branches.json";
import Image from "next/image";
import { localStorageManager, BookingData } from "@/types/localStorage";


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
const sendEmailConfirmation = async (bookingData: BookingData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: bookingData.email,
        subject: 'Booking Confirmation',
        booking: bookingData,
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

export default function ConfirmedPage() {
  // Change booking state to be settable and nullable
  const [booking, setBooking] = useState<BookingData | null>(null);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  // Add a new state to track if the user just cancelled
  const [justCancelled, setJustCancelled] = useState(false);

  // Load booking from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("lastBooking");
    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  const downloadReceipt = () => {
    window.print();
  };

  const handleReschedule = () => {
    localStorageManager.setRescheduleBooking();
    router.push("/book-service");
  };

  // Send email confirmation
  const handleSendEmail = useCallback(async () => {
    if (!booking) return;

    setSendingEmail(true);
    setEmailStatus('sending');

    try {
      const result = await sendEmailConfirmation(booking);
      
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
      localStorage.setItem("lastBooking", JSON.stringify(booking));
    }
  }, [booking]);

  if (cancelLoading) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-600 bg-cover bg-center"
      >
        {/* Blurred background image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/smctb.jpg"
            alt="Background"
            fill
            className="object-cover w-full h-full blur-lg"
            priority
            draggable={false}
          />
        </div>
        {/* Blurred overlay */}
        <div className="absolute inset-0 z-10 bg-white/30 dark:bg-gray-900/30" />
        <div className="flex flex-col items-center p-8 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 relative z-20">
          {/* Logo with subtle pulse animation */}
          <div className="mb-8 animate-pulse">
            <Image
              src="/smct.png"
              alt="Logo"
              width={140}
              height={140}
              className="opacity-90 drop-shadow-lg"
            />
          </div>
          {/* Enhanced spinner with gradient */}
          <div className="relative mb-8">
            <svg
              className="animate-spin h-16 w-16 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="currentColor"
                    stopOpacity="0.5"
                  />
                  <stop
                    offset="100%"
                    stopColor="currentColor"
                    stopOpacity="1"
                  />
                </linearGradient>
              </defs>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="url(#gradient)"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="url(#gradient)"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          {/* Text with animated dots */}
          <div className="text-2xl font-semibold text-blue-800 dark:text-blue-200 flex items-center">
            Cancelling your booking
            <span className="flex space-x-1 ml-1">
              <span className="animate-bounce">.</span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                .
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.4s" }}
              >
                .
              </span>
            </span>
          </div>
          {/* Optional progress bar */}
          <div className="w-64 h-2 bg-blue-200 dark:bg-blue-800 rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-progress"
              style={{
                animation: "progress 2s ease-in-out infinite alternate",
              }}
            ></div>
          </div>
          {/* Subtle status text */}
          <p className="mt-4 text-sm text-blue-700/80 dark:text-blue-300/80">
            Please wait while we cancel your booking...
          </p>
        </div>
        {/* Add this to your global CSS or style tag */}
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes progress {
            0% {
              width: 10%;
            }
            100% {
              width: 90%;
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          .animate-progress {
            animation: progress 2s ease-in-out infinite alternate;
          }
        `}</style>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="relative w-full h-64 top">
          <Image
            src="/smct.png"
            alt="Logo"
            fill
            className="object-contain opacity-40 pointer-events-none select-none"
            style={{ maxWidth: "20vw", minWidth: "80px" }}
          />
        
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-500">
        
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
          {/* Illustration */}
          <div className="mb-6 text-gray-400 dark:text-gray-500">
            <svg
              className="w-24 h-24 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              ></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2">Oops! No Booking Found</h2>
          <p className="text-blue-500 dark:text-gray-400 mb-4">
            Please make a booking first.
          </p>
          {/* Show a message if just cancelled */}
          {justCancelled && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-300">
              Your booking has been cancelled for you only (frontend only).<br />
              It may still appear in admin/employee panels.
            </div>
          )}
          <Button onClick={() => router.push("/book-service")}>Go to Booking</Button>
        </div>
      </div>
      </div>
    );
  }

  const {
    id,
    branch,
    service,
    date,
    time,
    name,
    phone,
    email,
    plate,
    model,
    notes,
  } = booking || {};
  const branchObj = branches.find((b) => b.name === branch);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/smctb.jpg')",
        backgroundSize: "110%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Logo on the left side of the background */}
      <Image
        src="/smct.png"
        alt="Logo"
        className="absolute top-36 left-30 -translate-y-1/2 z-10 opacity-40 w-auto h-auto object-contain pointer-events-none select-none"
        style={{ maxWidth: "20vw", minWidth: "80px" }}
        width={400}
        height={400}
      />
      {/* Blurred background overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-4 relative z-10"
      >
        {/* Main content */}
        <div
          ref={printRef}
          id="receipt-area"
          className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 z-10 print:w-full print:max-w-full print:rounded-none print:shadow-none print:border-none print:p-8 print:mx-auto print:bg-white print:dark:bg-white"
        >
          {/* Header with decorative gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white print:bg-white print:text-black print:bg-none">
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
                transition={{
                  duration: 0.7,
                  ease: [0.42, 0, 0.58, 1], // easeInOut cubic-bezier
                  type: "tween",
                }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-20 w-20 text-green-500" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold print:text-black">
                Booking Confirmed
              </h2>
            </div>
            <p className="text-center text-blue-100 print:text-black">
              Your appointment has been successfully scheduled
            </p>
          </div>
          {/* Booking summary card */}
          <div className="p-6 print:p-4">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 print:text-black">
                Booking Reference:{" "}
                <span className="font-mono text-blue-600 dark:text-blue-400 print:text-blue-600">
                  #{id}
                </span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 print:text-black">
                {formatDate(date)} at {time}
              </p>
            </div>
            {/* Details with icons */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg print:bg-white print:dark:bg-white">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full print:bg-white print:dark:bg-white">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 print:text-black">
                    Service
                  </h4>
                  <p className="text-gray-900 dark:text-white print:text-black">
                    {service}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg print:bg-white print:dark:bg-white">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full print:bg-white print:dark:bg-white">
                  <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 print:text-black">
                    Location
                  </h4>
                  <p className="text-gray-900 dark:text-white print:text-black">
                    {branch}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 print:text-black">
                    {branchObj?.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg print:bg-white print:dark:bg-white">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full print:bg-white print:dark:bg-white">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 print:text-black">
                    Customer
                  </h4>
                  <p className="text-gray-900 dark:text-white print:text-black">
                    {name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 print:text-black">
                    {email} • {phone}
                  </p>
                </div>
              </div>
              {/* Plate Number */}
              {plate && (
                <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg print:bg-white print:dark:bg-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full print:bg-white print:dark:bg-white">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500 dark:text-gray-400 print:text-black">
                      Plate Number
                    </h4>
                    <p className="text-gray-900 dark:text-white print:text-black">
                      {plate}
                    </p>
                  </div>
                </div>
              )}
              {/* Vehicle Model/Make */}
              {model && (
                <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg print:bg-white print:dark:bg-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full print:bg-white print:dark:bg-white">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500 dark:text-gray-400 print:text-black">
                      Vehicle Model/Make
                    </h4>
                    <p className="text-gray-900 dark:text-white print:text-black">
                      {model}
                    </p>
                  </div>
                </div>
              )}
              {/* Notes/Requests */}
              {notes && (
                <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg print:bg-white print:dark:bg-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full print:bg-white print:dark:bg-white">
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500 dark:text-gray-400 print:text-black">
                      Notes/Requests
                    </h4>
                    <div className="max-h-[20vh] overflow-y-auto rounded bg-gray-100 dark:bg-gray-800 p-2 mt-1">
                      <p className="text-gray-900 dark:text-white print:text-black break-words whitespace-pre-wrap">
                        {notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Helpful information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                What to expect next
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Confirmation email sent to {email}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Reminder 24 hours before your appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Please arrive 10 minutes early</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Action buttons (hidden when printing) */}
        <div className="flex flex-col gap-3 print:hidden mt-6 w-full max-w-md">
          {/* POST Request Status Indicator */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Email Confirmation Status</h4>
            <div className="flex items-center gap-2">
              {emailStatus === 'idle' && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Ready to send email</span>
                </div>
              )}
              {emailStatus === 'sending' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Sending email...</span>
                </div>
              )}
              {emailStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Email sent successfully!</span>
                </div>
              )}
              {emailStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm">Failed to send email</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleSendEmail}
              disabled={sendingEmail || emailStatus === 'success'}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sendingEmail ? 'Sending...' : emailStatus === 'success' ? 'Email Sent ✓' : 'Send Email Again'}
            </Button>
          </div>

          <Button
            className="w-full text-white bg-blue-500 hover:bg-yellow-400 hover:text-black"
            onClick={downloadReceipt}
          >
            Download Receipt
          </Button>
          <Button
            onClick={() => router.push("/book-service")}
            
            className="w-full text-white bg-blue-500 hover:bg-yellow-400 hover:text-black"
          >
            Book Another Service
          </Button>
          <Button
            variant="ghost"
            className="w-full text-white bg-blue-500 hover:bg-yellow-400 dark:text-blue-400"
            onClick={handleReschedule}
          >
            Need to reschedule?
          </Button>
          <Button
            
            className="w-full bg-red-400 hover:bg-red-700"
            onClick={() => {
              setCancelLoading(true);
              localStorage.removeItem("lastBooking"); // Clear localStorage on cancel
              setTimeout(() => {
                setCancelLoading(false);
                setBooking(null);
                setJustCancelled(true); // Set justCancelled to true
              }, 1500);
            }}
          >
            Cancel Booking
          </Button> 
        </div>
        <style jsx global>{`
          @media print {
            @page {
              size: 8.5in 13in;
              margin: 1in;
            }
            body * {
              visibility: hidden !important;
            }
            #receipt-area,
            #receipt-area * {
              visibility: visible !important;
            }
            #receipt-area {
              position: static !important;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: 6.5in !important;
              min-height: 0;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
              color: black !important;
              font-family: "Fira Mono", "Consolas", "Menlo", monospace !important;
              margin: 0 auto !important;
              border-radius: 0 !important;
              padding: 0.5in !important;
              font-size: 12pt !important;
              word-break: break-word !important;
              overflow-wrap: break-word !important;
            }
            #receipt-area .bg-gradient-to-r,
            #receipt-area .rounded-2xl,
            #receipt-area .shadow-xl,
            #receipt-area .dark\:bg-gray-900,
            #receipt-area .dark\:bg-blue-900\/30,
            #receipt-area .bg-blue-100,
            #receipt-area .bg-gray-50,
            #receipt-area .dark\:bg-gray-800\/50 {
              background: white !important;
              color: black !important;
              box-shadow: none !important;
            }
            #receipt-area .border,
            #receipt-area .border-gray-100,
            #receipt-area .border-gray-400 {
              border: none !important;
            }
            #receipt-area .print\:hidden,
            #receipt-area .print\:hidden * {
              display: none !important;
            }
            #receipt-area .print\:block {
              display: block !important;
            }
            #receipt-area .print\:mx-auto {
              margin-left: auto !important;
              margin-right: auto !important;
            }
            #receipt-area .print\:my-0 {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
            }
            #receipt-area .print\:font-mono {
              font-family: "Fira Mono", "Consolas", "Menlo", monospace !important;
            }
            #receipt-area .print\:text-black {
              color: black !important;
            }
            #receipt-area .print\:border-b {
              border-bottom: 1px dashed #888 !important;
            }
            #receipt-area .print\:border-gray-400 {
              border-color: #888 !important;
            }
            #receipt-area .print\:text-xs {
              font-size: 12px !important;
            }
            #receipt-area .print\:text-base {
              font-size: 16px !important;
            }
            #receipt-area .print\:text-lg {
              font-size: 20px !important;
            }
            #receipt-area .print\:mb-2 {
              margin-bottom: 8px !important;
            }
            #receipt-area .print\:p-0 {
              padding: 0 !important;
            }
            #receipt-area .print\:p-2 {
              padding: 8px !important;
            }
            #receipt-area .print\:space-y-2 > * + * {
              margin-top: 8px !important;
            }
            #receipt-area .print\:border-dashed {
              border-style: dashed !important;
            }
            #receipt-area .print\:rounded-none {
              border-radius: 0 !important;
            }
            #receipt-area .print\:thankyou {
              display: block !important;
              text-align: center;
              margin-top: 16px;
              font-size: 12px;
            }
            #receipt-area .print\:receipt-heading {
              display: block !important;
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 0.2em;
              margin-bottom: 8px;
              border-bottom: 1px dashed #888;
              padding-bottom: 4px;
            }
            #receipt-area .print\:cutline {
              display: block !important;
            }
          }
        `}</style>
        {/* Print-only receipt heading and thank you note */}
        <div className="print:receipt-heading hidden">RECEIPT</div>
        <div className="print:cutline hidden" style={{ width: "100%" }}>
          <span
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "14px",
              letterSpacing: "0.1em",
              margin: "16px 0 8px 0",
            }}
          >
            <span aria-hidden="true" style={{ marginRight: "8px" }}>
              ✂️
            </span>
            <span
              style={{
                borderBottom: "1.5px dashed #888",
                display: "inline-block",
                width: "70%",
              }}
            ></span>
            <span aria-hidden="true" style={{ marginLeft: "8px" }}>
              ✂️
            </span>
          </span>
        </div>

        <div className="print:thankyou hidden">Thank you for your booking!</div>
      </motion.div>
    </div>
  );
}
