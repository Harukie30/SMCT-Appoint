"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import employeesData from "@/data/employees.json";
import { motion } from "framer-motion";
import { KeyIcon, UserIcon, } from "@heroicons/react/24/outline";
import Image from "next/image";

interface Employee {
  id: number;
  name: string;
  email: string;
  branch: string;
  password?: string;
}
const adminCreds = { username: "admin", password: "admin123" };
const employeeNames = (employeesData as Employee[]).map((e) => e.name);

export default function LoginPage() {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (value.toLowerCase() === adminCreds.username) {
      setRole("admin");
    } else if (employeeNames.map(n => n.toLowerCase()).includes(value.toLowerCase())) {
      setRole("employee");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate a network delay for a better UX
    setTimeout(() => {
      let loggedIn = false;
      let redirectUrl = "";

      if (role === "admin") {
        if (
          username === adminCreds.username &&
          password === adminCreds.password
        ) {
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("userRole", "admin");
          loggedIn = true;
          redirectUrl = "/admin/appointments";
        } else {
          setError("Invalid admin username or password");
        }
      } else if (role === "employee") {
        const employee = (employeesData as Employee[]).find(
          (e) => e.name === username
        );
        if (employee && password === (employee.password || "emp123")) {
          localStorage.setItem("employeeLoggedIn", "true");
          localStorage.setItem("userRole", "employee");
          localStorage.setItem("employeeName", username);
          loggedIn = true;
          redirectUrl = "/employee/dashboard";
        } else {
          setError("Invalid employee name or password");
        }
      }

      if (loggedIn) {
        router.push(redirectUrl);
      } else {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-200 via-sky-100 to-indigo-300 dark:from-gray-900 dark:via-gray-950 dark:to-black overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-slate-300/[0.04] bg-center [mask-image:linear-gradient(to_bottom,white,transparent,transparent)] dark:bg-grid-slate-100/[0.03]" />
      </div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full max-w-sm rounded-3xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/40 dark:border-gray-800/80 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8 relative overflow-hidden"
        >
          {/* Brand/Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="mb-2">
              <Image src="/smct.png" alt="SMCT Logo" width={150} height={150}  />
            </div>
            <span className="text-xl font-bold tracking-tight text-indigo-700 dark:text-indigo-300">SMCT Appoint</span>
          </div>
          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Welcome Back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to access your dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6" aria-label="Login form">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-2.5 pl-10 pr-4 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:italic placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                placeholder={role === "admin" ? "Username" : "Select your name"}
                autoFocus
                list={role === "employee" ? "employee-names" : undefined}
                aria-label={role === "admin" ? "Admin username" : "Employee name"}
              />
              {role === "employee" && (
                <datalist id="employee-names">
                  {employeeNames.map((name: string) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-2.5 pl-10 pr-12 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:italic placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                aria-label="Password"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-indigo-500 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.857-.67 1.664-1.175 2.404" /></svg>
                )}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400 shadow"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-500 px-4 py-2.5 text-base font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-blue-600 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 ease-in-out transform flex items-center justify-center gap-2"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
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
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>
            <div className="flex justify-between items-center mt-2">
              <a href="#" className="text-xs text-indigo-500 hover:underline focus:outline-none focus:underline transition" tabIndex={0}>Forgot password?</a>
              <span className="text-xs text-gray-400 dark:text-gray-500">Need help? <a href="mailto:support@smct.com" className="underline hover:text-indigo-600">Contact support</a></span>
            </div>
          </form>
          <div className="mt-7 text-center text-xs text-gray-400 dark:text-gray-500">
            Demo Admin: <span className="font-semibold">admin / admin123</span>{" "}
            <br />
            Demo Employee Password: <span className="font-semibold">emp123</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 