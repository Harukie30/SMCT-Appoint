"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ChooseBookingPage() {
  const router = useRouter();
  const [fakeLoading, setFakeLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setFakeLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChoice = (choice: "service" | "test-drive") => {
    if (choice === "service") {
      router.push("/book-service");
    } else {
      router.push("/test-drive");
    }
  };

  if (fakeLoading) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-yellow-100 to-blue-100 dark:from-blue-900 dark:via-blue-400 dark:to-yellow-400"
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
            Loading your choices
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
            Preparing your booking options...
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

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-500 via-yellow-100 to-blue100 dark:from-blue-900 dark:via-blue-400 dark:to-yellow-400"
    >
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              type="button"
              className="flex items-center gap-2 bg-blue-500 hover:text-black hover:bg-yellow-400 mb-6"
              onClick={() => router.push("/")}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Home
            </Button>
       
            <div className="bg-white rounded-2xl shadow-md p-6 mx-auto">
              <div className="mb-6">
                <Image
                  src="/smct.png"
                  alt="SMCT Logo"
                  width={120}
                  height={120}
                  className="mx-auto object-contain rounded-full"
                />
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 dark:text-white mb-4">
                What would you like to book?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose between our professional service booking or experience
                our vehicles with a test drive
              </p>
            </div>
           
          </div>

          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Service Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group"
            >
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-2xl cursor-pointer transform hover:scale-105 h-[500px]"
                onClick={() => handleChoice("service")}
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white text-center flex flex-col justify-center h-1/2">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <WrenchScrewdriverIcon className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Book a Service</h2>
                  <p className="text-blue-100">
                    Professional maintenance and repair services
                  </p>
                </div>

                <div className="p-6 flex flex-col justify-between h-1/2">
                  <div className="space-y-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Oil changes & maintenance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Brake & suspension work</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Engine diagnostics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Electrical & AC services</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-300 hover:scale-[1.02]">
                    Book Service
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Test Drive Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group"
            >
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-green-500 transition-all duration-300 hover:shadow-2xl cursor-pointer transform hover:scale-105 h-[500px]"
                onClick={() => handleChoice("test-drive")}
              >
                <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 text-white text-center flex flex-col justify-center h-1/2">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TruckIcon className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Book a Test Drive</h2>
                  <p className="text-green-100">
                    Experience our vehicles firsthand
                  </p>
                </div>

                <div className="p-6 flex flex-col justify-between h-1/2">
                  <div className="space-y-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Professional test drive experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Latest vehicle models</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Expert guidance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>No pressure sales approach</span>
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-sm transition-all duration-300 hover:scale-[1.02]">
                    Book Test Drive
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Need help choosing?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our team is here to help you make the right choice. Contact us
                for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Call: (123) 456-7890</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Email: info@smct.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
