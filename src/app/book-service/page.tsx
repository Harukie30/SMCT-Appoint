"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import branches from "@/data/branches.json";
import services from "@/data/services.json";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Simulate dynamic data (could be fetched from API)
const availableTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];

// Define Branch type
interface Branch {
  id: number;
  name: string;
  address: string;
  hours: string;
  location: string;
}

// Define Service type
interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  vehicleType: string;
  category: string;
}

export default function BookServicePage() {
  const [step, setStep] = useState(0);
  const [branch, setBranch] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, ] = useState(false);
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  // Add vehicle type state
  const [vehicleType, setVehicleType] = useState<string>("");
  const [serviceSearch, setServiceSearch] = useState<string>("");
  // Add new state for contact info
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  // Fake loading screen for getting started
  const [fakeLoading, setFakeLoading] = useState(true);
  // Show loading after confirming booking
  const [postSubmitLoading, setPostSubmitLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFakeLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reschedule = localStorage.getItem("rescheduleBooking");
      const lastBooking = localStorage.getItem("lastBooking");
      if (reschedule && lastBooking) {
        const data = JSON.parse(lastBooking);
        setBranch(data.branch || "");
        setService(data.service || "");
        setDate(data.date || "");
        setTime(data.time || "");
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setPlate(data.plate || "");
        setModel(data.model || "");
        setNotes(data.notes || "");
        localStorage.removeItem("rescheduleBooking");
      }
    }
  }, []);

  if (fakeLoading) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-600 bg-cover bg-center"
        style={{ backgroundImage: undefined }}
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
            Getting things ready
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
            Loading your experience...
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
  if (postSubmitLoading) {
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
            Processing your booking
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
            Finalizing your experience...
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

  const steps = [
    { label: "Select Branch", icon: MapPinIcon },
    { label: "Select Service", icon: WrenchScrewdriverIcon },
    { label: "Date & Time", icon: CalendarDaysIcon },
    { label: "Your Details", icon: UserIcon },
    { label: "Confirmation", icon: CheckCircleIcon },
  ];

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostSubmitLoading(true);
    const booking = {
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
    };
    // Send booking to API
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    setTimeout(() => {
      // Save booking data to localStorage
      localStorage.setItem("lastBooking", JSON.stringify(booking));
      router.push("/confirmed");
    }, 1500);
  };

  const handleReset = () => {
    setStep(0);
    setBranch("");
    setService("");
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setEmail("");
    setSubmitted(false);
  };

  // Update isStepValid so that step 3 requires email to include '@'
  const isStepValid = [
    !!branch,
    !!service,
    !!date && !!time,
    !!name && !!phone && !!email && email.includes("@") && !!plate,
    true,
  ][step];

  // Calculate min date (today) and max date (3 months from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const locations = Array.from(
    new Set((branches as Branch[]).map((b) => b.location))
  );
  const filteredBranches = (branches as Branch[]).filter((b) => {
    const matchesLocation = selectedLocation
      ? b.location === selectedLocation
      : true;
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  // For vehicle type selection
  const vehicleTypes = Array.from(
    new Set((services as Service[]).map((s) => s.vehicleType))
  );
  // For service filtering
  const filteredServices = (services as Service[])
    .filter((s) =>
      vehicleType
        ? s.vehicleType === vehicleType || s.vehicleType === "all"
        : true
    )
    .filter(
      (s) =>
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        s.category.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  // Group by category
  const servicesByCategory = filteredServices.reduce(
    (acc: Record<string, Service[]>, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {}
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center "
      style={{ backgroundImage: "url('/app.png')" }}
    >
      <div className="min-h-screen flex items-center justify-center  py-12 px-4">
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Header with stepper */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
            {/* Back to Home button */}
            <div className="p-4">
              <Button
                type="button"
                className="flex items-center gap-2 bg-blue-500 hover:text-black hover:bg-yellow-400"
                onClick={() => router.push("/")}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <h1 className="text-2xl font-bold mb-2">Book Your Service</h1>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {steps.map((stepObj, idx) => (
                  <div key={stepObj.label} className="flex items-center">
                    <div
                      className={`w-13 h-13 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${
                        idx === step
                          ? "bg-white text-blue-600 scale-110"
                          : idx < step
                          ? "bg-blue-400"
                          : "bg-blue-700/50"
                      }`}
                    >
                      <stepObj.icon className="h-8 w-8" />
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-4 h-1 mx-1 rounded transition-all ${
                          idx < step ? "bg-blue-400" : "bg-blue-700/50"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-md font-medium">
                Step {step + 1} of {steps.length}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-10 w-10 text-green-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Booking Confirmed!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Thank you,{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-300">
                      {name}
                    </span>
                    !
                    <br />
                    We&apos;ve sent the details to {email}.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-6 text-left">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CalendarDaysIcon className="h-5 w-5" />
                      Booking Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Service:
                        </span>{" "}
                        {service}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Branch:
                        </span>{" "}
                        {branch}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Date:
                        </span>{" "}
                        {formatDate(date)}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Time:
                        </span>{" "}
                        {time}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Name:
                        </span>{" "}
                        {name}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Phone:
                        </span>{" "}
                        {phone}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Email:
                        </span>{" "}
                        {email}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Plate Number:
                        </span>{" "}
                        {plate}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Vehicle Model/Make:
                        </span>{" "}
                        {model || <span className="text-gray-400">—</span>}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Notes/Requests:
                        </span>{" "}
                        {notes || <span className="text-gray-400">—</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={handleReset}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Book Another Service
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/confirmed")}
                    >
                      View Booking
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: step > 0 ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: step > 0 ? -50 : 50 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Step 1: Branch Selection */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MapPinIcon className="h-6 w-6 text-blue-500" />
                        Select Your Preferred Branch
                      </h2>
                      <div className="flex flex-col md:flex-row gap-3 mb-2">
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search by name, address, or location..."
                          className="w-full md:w-1/2 p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                        />
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full md:w-1/3 p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                        >
                          <option value="">All Locations</option>
                          {locations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-3">
                        {filteredBranches.length === 0 ? (
                          <div className="text-gray-500 dark:text-gray-400">
                            No branches found.
                          </div>
                        ) : (
                          filteredBranches.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setBranch(b.name)}
                              className={`p-4 rounded-lg border text-left transition-all flex flex-col items-start
                              ${
                                branch === b.name
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                              }
                            `}
                            >
                              <div className="font-medium flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-blue-400" />
                                {b.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {b.address}
                              </div>
                              <div className="text-xs mt-1 text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <CalendarDaysIcon className="h-3 w-3" />{" "}
                                {b.hours}
                              </div>
                              <div className="text-xs mt-1 text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <span>{b.location}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Service Selection */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-blue-500" />
                        Choose Your Service
                      </h2>
                      {/* Vehicle type selection */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setVehicleType("")}
                          className={`px-4 py-2 rounded-lg border transition-all
                          ${
                            vehicleType === ""
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                          }`}
                        >
                          All
                        </button>
                        {vehicleTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setVehicleType(type)}
                            className={`px-4 py-2 rounded-lg border transition-all
                            ${
                              vehicleType === type
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                      {/* Service search */}
                      <input
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Search services..."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 mb-2"
                      />
                      {/* Grouped services */}
                      {Object.keys(servicesByCategory).length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400">
                          No services found.
                        </div>
                      ) : (
                        Object.entries(servicesByCategory).map(
                          ([category, services]) => (
                            <div key={category} className="mb-4">
                              <div className="font-semibold text-blue-600 dark:text-blue-300 mb-2">
                                {category}
                              </div>
                              <div className="grid gap-3">
                                {services.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setService(s.name)}
                                    className={`p-4 rounded-lg border text-left transition-all flex flex-col items-start
                                  ${
                                    service === s.name
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                  }
                                `}
                                  >
                                    <div className="font-medium">{s.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      Duration: {s.duration}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {s.price}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  )}

                  {/* Step 3: Date & Time Selection */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                        Select Date & Time
                      </h2>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Appointment Date
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          min={today.toISOString().split("T")[0]}
                          max={maxDate.toISOString().split("T")[0]}
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                          required
                        />
                      </div>

                      {date && (
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Available Times
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {availableTimes.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTime(t)}
                                className={`py-2 rounded-lg transition-all
                                ${
                                  time === t
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Contact Information */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <UserIcon className="h-6 w-6 text-blue-500" />
                        Your Contact Information
                      </h2>
                      <div className="space-y-3">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                            required
                          />
                        </div>
                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="09123456789"
                            value={phone}
                            onChange={(e) => {
                              // Only allow digits and limit to 11 characters
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .substring(0, 11);
                              setPhone(value);
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={11}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                            required
                          />
                          {phone && phone.length !== 11 && (
                            <div className="text-red-500 text-xs mt-1">
                              Phone number must be exactly 11 digits
                            </div>
                          )}
                        </div>
                        {/* Email Address */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                            required
                          />
                          {email && !email.includes("@") && (
                            <div className="text-red-500 text-xs mt-1">
                              Email must contain `@`
                            </div>
                          )}
                        </div>
                        {/* Plate Number */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Vehicle Plate Number
                          </label>
                          <input
                            type="text"
                            placeholder="ABC-1234"
                            value={plate}
                            onChange={(e) =>
                              setPlate(e.target.value.toUpperCase())
                            }
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                            required
                          />
                          {!plate && (
                            <div className="text-red-500 text-xs mt-1">
                              Plate number is required
                            </div>
                          )}
                        </div>
                        {/* Vehicle Model/Make */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Vehicle Model/Make (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Toyota Camry, Honda Click, etc."
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                          />
                        </div>
                        {/* Notes/Requests */}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Notes/Requests (optional)
                          </label>
                          <textarea
                            placeholder="Any special instructions?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Submit */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                        Review Your Booking
                      </h2>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Service:
                          </span>
                          <span className="font-medium">{service}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Branch:
                          </span>
                          <span className="font-medium">{branch}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Date:
                          </span>
                          <span className="font-medium">
                            {formatDate(date)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Time:
                          </span>
                          <span className="font-medium">{time}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Name:
                          </span>
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Phone:
                          </span>
                          <span className="font-medium">{phone}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Email:
                          </span>
                          <span className="font-medium">{email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Plate Number:
                          </span>
                          <span className="font-medium">{plate}</span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-500 dark:text-gray-400">
                            Vehicle Model/Make:
                          </span>
                          <span className="font-medium">
                            {model || <span className="text-gray-400">—</span>}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Notes/Requests:
                          </span>
                          <div className="max-h-[20vh] overflow-y-auto">
                            <span className="font-medium break-words whitespace-pre-wrap">
                              {notes || <span className="text-gray-400">—</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex justify-between pt-4">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex items-center gap-1 bg-blue-500 text-white hover:text-black hover:bg-yellow-400"
                      >
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                      </Button>
                    )}
                    {step < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid}
                        className="ml-auto flex items-center gap-1 bg-blue-500 hover:text-black hover:bg-yellow-400 "
                      >
                        Next <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="ml-auto bg-blue-600 hover:bg-green-500 hover:text-black min-w-[120px]"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
