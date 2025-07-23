"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import employeesData from "@/data/employees.json";
import { motion } from "framer-motion";
import { KeyIcon, UserIcon, } from "@heroicons/react/24/outline";

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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-100 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-black overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-slate-300/[0.04] bg-center [mask-image:linear-gradient(to_bottom,white,transparent,transparent)] dark:bg-grid-slate-100/[0.03]"></div>
      </div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-800/80 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to access your dashboard
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-2.5 pl-10 pr-4 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition"
                required
                placeholder={
                  role === "admin" ? "Username" : "Select your name"
                }
                autoFocus
                list={role === "employee" ? "employee-names" : undefined}
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
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-2.5 pl-10 pr-4 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}
            <Button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500  focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 ease-in-out transform hover:scale-[1.02] flex items-center justify-center"
              disabled={isLoading}
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
          </form>
          <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            Demo Admin: <span className="font-semibold">admin / admin123</span>{" "}
            <br />
            Demo Employee Password:{" "}
            <span className="font-semibold">emp123</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 