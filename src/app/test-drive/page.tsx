"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvailabilityCalendar, type DateAvailability } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Car {
  id: number;
  model: string;
  brand: string;
  year: string;
  color: string;
  price: string;
  status: "Available" | "In Use" | "Maintenance" | "Sold";
  description?: string;
  imageUrl?: string;
}

import { type TimeSlot } from '@/lib/utils';

export default function TestDrivePage() {
  const router = useRouter();
  const [fakeLoading, setFakeLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<Record<string, DateAvailability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string; address: string; hours: string; location: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  
  // Multi-step form state
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    date: Date | undefined;
    time: string;
    model: string;
    phone: string;
    branch: string;
  }>({
    name: "",
    email: "",
    date: undefined,
    time: "",
    model: "",
    phone: "",
    branch: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Steps configuration
  const steps = [
    { label: "Select Branch", icon: MapPinIcon },
    { label: "Select Car", icon: TruckIcon },
    { label: "Date & Time", icon: CalendarDaysIcon },
    { label: "Your Details", icon: UserIcon },
    { label: "Confirmation", icon: CheckCircleIcon },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setFakeLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Function to fetch branches
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        console.error('Failed to fetch branches');
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Function to fetch available time slots for test drives
  const fetchAvailableSlots = async (selectedDate: string) => {
    if (!selectedDate) return;
    
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/available-slots?date=${selectedDate}&type=test-drive`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } else {
        console.error('Failed to fetch available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Function to fetch availability data for calendar
  const fetchAvailabilityData = async () => {
    setLoadingAvailability(true);
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      
      const response = await fetch(`/api/available-slots?startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&type=test-drive`);
      if (response.ok) {
        const data = await response.json();
        setAvailabilityData(data.availability || {});
      } else {
        console.error('Failed to fetch availability data');
        setAvailabilityData({});
      }
    } catch (error) {
      console.error('Error fetching availability data:', error);
      setAvailabilityData({});
    } finally {
      setLoadingAvailability(false);
    }
  };

  const fetchCars = async () => {
    setLoadingCars(true);
    try {
      const response = await fetch("/api/cars");
      if (response.ok) {
        const data = await response.json();
        setCars(data);
      } else {
        console.error("Failed to fetch cars");
        setCars([]);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  // Check for reschedule state and pre-fill form
  useEffect(() => {
    const isRescheduling = localStorage.getItem("rescheduleTestDrive");
    if (isRescheduling === "true") {
      const lastBooking = localStorage.getItem("lastTestDriveBooking");
      if (lastBooking) {
        const bookingData = JSON.parse(lastBooking);
        setForm({
          name: bookingData.name || "",
          email: bookingData.email || "",
          date: bookingData.date ? new Date(bookingData.date) : undefined,
          time: bookingData.time || "",
          model: bookingData.model || "",
          phone: bookingData.phone || "",
          branch: bookingData.branch || "",
        });
        // Clear the reschedule flag
        localStorage.removeItem("rescheduleTestDrive");
      }
    }
  }, []);

  // Handle navigation when submitted
  useEffect(() => {
    if (submitted) {
      router.push("/test-drive-confirmed");
    }
  }, [submitted, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.date) {
      newErrors.date = "Please select a date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(form.date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
      
      // Limit bookings to 6 months in the future
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      if (selectedDate > maxDate) {
        newErrors.date = "Please select a date within the next 6 months";
      }
    }
    if (!form.time) newErrors.time = "Please select a time";
    if (!form.model) newErrors.model = "Please select a model";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{11}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid 11-digit phone number";
    }
    if (!form.branch) newErrors.branch = "Please select a branch";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    
    if (validate()) {
      setIsLoading(true);
      try {
        const requestBody = {
          ...form,
          date: form.date ? form.date.toISOString() : undefined,
          time: form.time,
        };
        
        const res = await fetch("/api/test-drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          setApiError(data.error || "Something went wrong. Please try again.");
        } else {
          // Save booking data to localStorage for the confirmed page
          const bookingData = {
            id: data.id || Date.now(),
            branch: form.branch,
            model: form.model,
            date: form.date ? form.date.toISOString().split('T')[0] : '',
            time: form.time,
            name: form.name,
            phone: form.phone,
            email: form.email,
          };
          localStorage.setItem("lastTestDriveBooking", JSON.stringify(bookingData));
          setSubmitted(true);
        }
      } catch (err) {
        setApiError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNext = () => {
    // If moving to the review step (step 4), validate the form first
    if (step === 3) {
      validate();
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const isStepValid = [
    !!form.branch,
    !!form.model,
    !!form.date && !!form.time,
    !!form.name && !!form.phone && !!form.email && form.email.includes("@"),
    true,
  ][step];

  const handleReset = () => {
    setStep(0);
    setForm({
      name: "",
      email: "",
      date: undefined,
      time: "",
      model: "",
      phone: "",
      branch: "",
    });
    setSubmitted(false);
    setErrors({});
    setApiError("");
  };

  if (fakeLoading) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50"
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
              className="animate-spin h-16 w-16 text-green-600 dark:text-green-400"
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
          <div className="text-2xl font-semibold text-green-800 dark:text-green-200 flex items-center">
            Loading test drive
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
          <div className="w-64 h-2 bg-green-200 dark:bg-green-800 rounded-full mt-6 overflow-hidden">
            <div
              className="h-full bg-green-600 dark:bg-green-400 rounded-full animate-progress"
              style={{
                animation: "progress 2s ease-in-out infinite alternate",
              }}
            ></div>
          </div>

          {/* Subtle status text */}
          <p className="mt-4 text-sm text-green-700/80 dark:text-green-300/80">
            Preparing your test drive experience...
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

   if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/app.png')" }}
    >
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Header with stepper */}
          <div className="bg-gradient-to-r from-green-600 to-green-600 p-6 text-white">
            {/* Back to Choice button */}
            <div className="p-4">
              <Button
                type="button"
                className="flex items-center gap-2 bg-green-500 hover:text-black hover:bg-yellow-400"
                onClick={() => router.push("/choose-booking")}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Choice
              </Button>
            </div>
            <h1 className="text-2xl font-bold mb-2">Book Your Test Drive</h1>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {steps.map((stepObj, idx) => (
                  <div key={stepObj.label} className="flex items-center">
                    <div
                      className={`w-13 h-13 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${
                        idx === step
                          ? "bg-white text-green-600 scale-110"
                          : idx < step
                          ? "bg-green-400"
                          : "bg-green-700/50"
                      }`}
                    >
                      <stepObj.icon className="h-8 w-8" />
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-4 h-1 mx-1 rounded transition-all ${
                          idx < step ? "bg-green-400" : "bg-green-700/50"
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
            {apiError && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400 shadow mb-2">
                {apiError}
              </div>
            )}
            <AnimatePresence mode="wait">
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
                      <MapPinIcon className="h-6 w-6 text-green-500" />
                      Select Your Preferred Branch
                    </h2>
                    <div className="grid gap-3">
                      {loadingBranches ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-2"></div>
                          <span className="text-gray-600">Loading branches...</span>
                        </div>
                      ) : branches.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400">
                          No branches available.
                        </div>
                      ) : (
                        branches.map((branch) => (
                          <button
                            key={branch.id}
                            type="button"
                            onClick={() => setForm({ ...form, branch: branch.name })}
                            className={`p-4 rounded-lg border text-left transition-all flex flex-col items-start
                            ${
                              form.branch === branch.name
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm"
                                : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                            }
                          `}
                          >
                            <div className="font-medium flex items-center gap-2">
                              <MapPinIcon className="h-5 w-5 text-green-400" />
                              {branch.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {branch.address}
                            </div>
                            <div className="text-xs mt-1 text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <CalendarDaysIcon className="h-3 w-3" />{" "}
                              {branch.hours}
                            </div>
                            <div className="text-xs mt-1 text-gray-400 dark:text-gray-500 flex items-center gap-1">
                              <span>{branch.location}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Car Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <TruckIcon className="h-6 w-6 text-green-500" />
                      Choose Your Car
                    </h2>
                    <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                      {loadingCars ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-2"></div>
                          <span className="text-gray-600">Loading cars...</span>
                        </div>
                      ) : cars.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400">
                          No cars available.
                        </div>
                      ) : (
                        cars.map((car: Car) => (
                          <button
                            key={car.id}
                            type="button"
                            onClick={() => setForm({ ...form, model: `${car.brand} ${car.model}` })}
                            className={`w-full p-4 rounded-lg border text-left transition-all flex flex-col items-start
                            ${
                              form.model === `${car.brand} ${car.model}`
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm"
                                : "border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }
                          `}
                          >
                            <div className="font-medium">{car.brand} {car.model}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Year: {car.year}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Color: {car.color}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Date & Time Selection */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <CalendarDaysIcon className="h-6 w-6 text-green-500" />
                      Select Date & Time
                    </h2>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Appointment Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.date ? (
                              format(form.date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <AvailabilityCalendar
                            mode="single"
                            selected={form.date}
                            onSelect={(date: Date | undefined) => {
                              setForm({ ...form, date, time: "" }); // Reset time when date changes
                              if (errors.date) {
                                setErrors({ ...errors, date: "" });
                              }
                              if (date) {
                                fetchAvailableSlots(date.toISOString().split('T')[0]);
                              }
                            }}
                            initialFocus
                            fromDate={new Date()}
                            toDate={(() => {
                              const maxDate = new Date();
                              maxDate.setMonth(maxDate.getMonth() + 6);
                              return maxDate;
                            })()}
                            disabled={(date: Date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const selectedDate = new Date(date);
                              selectedDate.setHours(0, 0, 0, 0);
                              
                              // Disable past dates
                              if (selectedDate < today) return true;
                              
                              // Disable dates more than 6 months in the future
                              const maxDate = new Date();
                              maxDate.setMonth(maxDate.getMonth() + 6);
                              if (selectedDate > maxDate) return true;
                              
                              return false;
                            }}
                            availabilityData={availabilityData}
                            showAvailabilityIndicators={true}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {form.date && (
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Available Times
                        </label>
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            <span className="ml-2 text-gray-600">Loading available times...</span>
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No available time slots for this date.</p>
                            <p className="text-sm">Please select a different date.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => slot.available && setForm({ ...form, time: slot.time })}
                                disabled={!slot.available}
                                className={`py-2 rounded-lg transition-all text-sm
                                ${
                                  form.time === slot.time
                                    ? "bg-green-600 text-white"
                                    : slot.available
                                    ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                                }`}
                                title={slot.conflictingBooking ? `Booked by ${slot.conflictingBooking.name}` : undefined}
                              >
                                {slot.time}
                                {slot.conflictingBooking && (
                                  <div className="text-xs text-red-500 mt-1">
                                    Booked
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Contact Information */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <UserIcon className="h-6 w-6 text-green-500" />
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
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800"
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
                          value={form.phone}
                          onChange={(e) => {
                            // Only allow digits and limit to 11 characters
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .substring(0, 11);
                            setForm({ ...form, phone: value });
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={11}
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800"
                          required
                        />
                        {form.phone && form.phone.length !== 11 && (
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
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800"
                          required
                        />
                        {form.email && !form.email.includes("@") && (
                          <div className="text-red-500 text-xs mt-1">
                            Email must contain `@`
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      Review Your Booking
                    </h2>
                    
                    {/* Show validation errors if any */}
                    {Object.keys(errors).length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Please fix the following errors:</h3>
                        <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                          {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Car Model:
                        </span>
                        <span className="font-medium">{form.model}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Branch:
                        </span>
                        <span className="font-medium">{form.branch}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Date:
                        </span>
                        <span className="font-medium">
                          {form.date ? format(form.date, "PPP") : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Time:
                        </span>
                        <span className="font-medium">{form.time}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Name:
                        </span>
                        <span className="font-medium">{form.name}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Phone:
                        </span>
                        <span className="font-medium">{form.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Email:
                        </span>
                        <span className="font-medium">{form.email}</span>
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
                      className="flex items-center gap-1 bg-green-500 text-white hover:text-black hover:bg-yellow-400"
                    >
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </Button>
                  )}
                  {step < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid}
                      className="ml-auto flex items-center gap-1 bg-green-500 hover:text-black hover:bg-yellow-400"
                    >
                      Next <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="ml-auto flex gap-2">
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 min-w-[120px]"
                        disabled={isLoading || Object.keys(errors).length > 0}
                        title={Object.keys(errors).length > 0 ? "Please fix validation errors first" : ""}
                      >
                        {isLoading ? (
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
                        ) : Object.keys(errors).length > 0 ? (
                          "Fix Errors First"
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>

                    </div>
                  )}
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
