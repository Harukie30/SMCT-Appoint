"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import employeesData from "@/data/employees.json";
import {
  KeyIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Employee {
  id: number;
  name: string;
  email: string;
  branch: string;
  password?: string;
}
const adminCreds = { username: "admin", password: "admin123" };
const employeeNames = (employeesData as Employee[]).map((e) => e.name);

// Header Component
function Header() {
  return (
    <header className="bg-blue-400 ">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/smct.png"
              alt="SMCT Logo"
              width={40}
              height={40}
              className="rounded"
            />
            <h1 className="text-lg font-semibold text-white">
              SMCT Appointment System
            </h1>
          </div>
          <nav className="flex space-x-6">
            <motion.a
              href="/"
              className="flex items-center gap-1 text-white text-md bg-blue-500 font-bold hover:underline hover:text-black hover:bg-yellow-400 rounded-md px-2 py-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Home</span>
            </motion.a>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-blue-400 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <p className="text-white text-sm">
            © 2025 SMCT Appointment System. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-200 hover:text-white text-md">
              Privacy
            </a>
            <a href="#" className="text-gray-200 hover:text-white text-md">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LoginPage() {
  const [role, setRole] = useState("admin");
  const [managementMode, setManagementMode] = useState<
    "appointments" | "test-drives" | "test-drive-dashboard"
  >("appointments");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    branch: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const router = useRouter();

  // Fetch branches for registration form
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        console.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Load branches when component mounts
  useEffect(() => {
    fetchBranches();
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.toLowerCase() === adminCreds.username) {
      setRole("admin");
    } else {
      // Check both existing employees and registered users
      const existingEmployees = (employeesData as Employee[]).map((e) =>
        e.email.toLowerCase()
      );
      if (existingEmployees.includes(value.toLowerCase())) {
        setRole("employee");
      } else {
        // Could be a newly registered employee
        setRole("employee");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let loggedIn = false;
      let redirectUrl = "";

      if (role === "admin") {
        if (email === adminCreds.username && password === adminCreds.password) {
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("managementMode", managementMode);
          loggedIn = true;
          redirectUrl =
            managementMode === "appointments"
              ? "/admin/appointments"
              : "";
        } else {
          setError("Invalid admin username or password");
        }
      } else if (role === "employee") {
        // Fetch employees from API to check for newly registered users
        const response = await fetch("/api/employees");
        const employees = await response.json();

        const employee = employees.find(
          (e: Employee) => e.email.toLowerCase() === email.toLowerCase()
        );

        if (employee && password === (employee.password || "emp123")) {
          localStorage.setItem("employeeLoggedIn", "true");
          localStorage.setItem("userRole", "employee");
          localStorage.setItem("employeeName", employee.name);
          localStorage.setItem("managementMode", managementMode);
          loggedIn = true;
          redirectUrl =
            managementMode === "appointments"
              ? "/employee/dashboard"
              : "/test-drive-dashboard";
        } else {
          setError("Invalid employee email or password");
        }
      }

      if (loggedIn) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("savedEmail", email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("savedEmail");
        }
        router.push(redirectUrl);
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setIsLoading(true);

    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (registerForm.password.length < 6) {
      setRegisterError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Validate phone number
    if (registerForm.phone.length !== 11) {
      setRegisterError("Phone number must be exactly 11 digits");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterSuccess(
          data.message || "Registration successful! You can now login."
        );
        // Reset form
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          branch: "",
        });
        // Switch back to login after 2 seconds
        setTimeout(() => {
          setIsRegistering(false);
          setRegisterSuccess("");
        }, 2000);
      } else {
        setRegisterError(
          data.error || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      setRegisterError(
        "An error occurred during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterFormChange = (field: string, value: string) => {
    setRegisterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-300">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
          {/* Left Side */}
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-100 p-10 border-r border-gray-200">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">
              {isRegistering
                ? "Join Our Community"
                : (role === "admin" || role === "employee") &&
                  managementMode === "test-drives"
                ? "Test Drive Dashboard"
                : "Manage Your Appointments"}
            </h2>
            <p className="text-gray-500 mb-8 text-center">
              {isRegistering
                ? "Create your account to access our booking system and manage your appointments with ease."
                : (role === "admin" || role === "employee") &&
                  managementMode === "test-drives"
                ? "Access our advanced test drive dashboard with comprehensive analytics, detailed reporting, and enhanced management capabilities for optimal vehicle demonstration tracking."
                : "Easily manage appointments with a smooth and efficient scheduling system. Keep track of bookings, client details, and service times with ease."}
            </p>
            {/* Illustration */}
            <Image
              src={
                (role === "admin" || role === "employee") &&
                managementMode === "test-drives"
                  ? "/reg.png"
                  : "/data.png"
              }
              alt={
                (role === "admin" || role === "employee") &&
                managementMode === "test-drives"
                  ? "Test Drives"
                  : "Appointments"
              }
              width={180}
              height={140}
            />
          </div>
          {/* Right Side (Login/Register Form) */}
          <div className="flex-1 flex flex-col justify-center p-10">
            <AnimatePresence mode="wait">
              {!isRegistering ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    Login To Your Account
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Enter your details to login.
                  </p>

                  {/* Management Mode Switch - For Admin and Employee */}
                  {(role === "admin" || role === "employee") && (
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-gray-600 mb-3">
                        MANAGEMENT MODE
                      </label>
                      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setManagementMode("appointments")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                            managementMode === "appointments"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Appointments
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setManagementMode("test-drives")}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                            managementMode === "test-drives"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          <TruckIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Test Drives
                          </span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {managementMode === "appointments"
                          ? "Manage customer appointments and service bookings"
                          : "Comprehensive test drive dashboard with advanced features"}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <EnvelopeIcon className="h-5 w-5 text-green-500" />
                        </span>
                        <input
                          type="text"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                          placeholder="Enter Your Email"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <KeyIcon className="h-5 w-5 text-green-500" />
                        </span>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                          placeholder="Enter Password"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="mr-2 accent-blue-500"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm text-gray-700"
                      >
                        Remember Me
                      </label>
                    </div>
                    {error && (
                      <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-green-400 text-white font-semibold py-2 rounded shadow"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "LOGIN"}
                    </Button>

                    <div className="text-xs text-gray-500 mt-1">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        Register here
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    Create Your Account
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Fill in your details to register.
                  </p>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          FULL NAME
                        </label>
                        <input
                          type="text"
                          value={registerForm.name}
                          onChange={(e) =>
                            handleRegisterFormChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Enter Your Full Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) =>
                            handleRegisterFormChange("email", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Enter Your Email"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          PHONE NUMBER
                        </label>
                        <input
                          type="tel"
                          value={registerForm.phone}
                          onChange={(e) => {
                            // Only allow digits and limit to 11 characters
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .substring(0, 11);
                            handleRegisterFormChange("phone", value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Enter Your Phone (11 digits)"
                          maxLength={11}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          required
                        />
                        {registerForm.phone &&
                          registerForm.phone.length !== 11 && (
                            <div className="text-red-500 text-xs mt-1">
                              Phone number must be exactly 11 digits
                            </div>
                          )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          BRANCH
                        </label>
                        <select
                          value={registerForm.branch}
                          onChange={(e) =>
                            handleRegisterFormChange("branch", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          required
                          disabled={loadingBranches}
                        >
                          <option value="">
                            {loadingBranches ? "Loading branches..." : "Select Branch"}
                          </option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.name}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          PASSWORD
                        </label>
                        <input
                          type="password"
                          value={registerForm.password}
                          onChange={(e) =>
                            handleRegisterFormChange("password", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Enter Password"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          CONFIRM PASSWORD
                        </label>
                        <input
                          type="password"
                          value={registerForm.confirmPassword}
                          onChange={(e) =>
                            handleRegisterFormChange(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Confirm Password"
                          required
                        />
                      </div>
                    </div>
                    {registerError && (
                      <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
                        {registerError}
                      </div>
                    )}
                    {registerSuccess && (
                      <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm">
                        {registerSuccess}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded shadow"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "REGISTER"}
                    </Button>

                    <div className="text-xs text-gray-500 mt-1">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsRegistering(false)}
                        className="text-blue-500 underline hover:text-blue-700"
                      >
                        Login here
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
