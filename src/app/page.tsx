"useclient";

import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  UserGroupIcon,
  StarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Easy Online Booking",
    desc: "Let your customers book services anytime, anywhere.",
    icon: CalendarDaysIcon,
  },
  {
    title: "Real-Time Availability",
    desc: "Show up-to-date slots and avoid double bookings.",
    icon: CheckCircleIcon,
  },
  {
    title: "Automated Reminders",
    desc: "Reduce no-shows with SMS & email notifications.",
    icon: BellAlertIcon,
  },
  {
    title: "Service Provider Profiles",
    desc: "Showcase your team and their expertise.",
    icon: UserGroupIcon,
  },
  {
    title: "Customer Reviews",
    desc: "Build trust with ratings and feedback.",
    icon: StarIcon,
  },
  {
    title: "Secure Online Payments",
    desc: "Accept payments safely and easily.",
    icon: CreditCardIcon,
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between font-sans overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <div className="relative w-full h-screen ">
          <div className="relative w-full h-screen blur-xs">
            <Image
              src="/smct.jpg"
              alt="Background"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-100/80 dark:from-gray-900/90 dark:via-gray-950/80 dark:to-gray-900/90" />
      </div>

      {/* Hero Section */}
      <header className="w-full flex flex-col items-center justify-center py-20 px-4 text-center relative overflow-hidden">
        {/* Decorative Gradient */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-transparent rounded-full blur-3xl" />
        </div>
        {/* Logo Placeholder */}

        <Image
          src="/smct.png" // or .jpg, depending on your file
          alt="SMCT Logo"
          width={250}
          height={150}
          className="object-contain rounded-full"
        />

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white z-10 drop-shadow-md">
          Service Scheduling App
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-4 z-10">
          Effortlessly manage and schedule your services with SMCT.
        </p>
        <p className="text-base sm:text-lg text-blue-600 dark:text-indigo-300 mb-10 z-10 font-medium">
          Fast, reliable, and designed for your business needs.
        </p>
        <Link href="/book-service" passHref>
          <Button
            className="text-lg px-8 py-6 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-blue-600 hover:text-white z-10"
            size="lg"
          >
            Get Started
          </Button>
        </Link>
      </header>

      {/* Features Section */}
      <section className="w-full max-w-6xl px-4 py-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Why Choose SMCT?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-md p-8 flex flex-col items-start border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow group relative overflow-hidden"
            >
              <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                <feature.icon className="h-8 w-8 text-blue-500 dark:text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-white  text-sm border-t border-gray-200 dark:border-gray-800 bg-blue-500 dark:bg-gray-950/60 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
          <span>
            &copy; {new Date().getFullYear()} SMCT. All rights reserved.
          </span>

          <span>
            Made with <span className="text-indigo-500">&#10084;</span> for
            service businesses
            <Link href="/login" passHref>
              <Button
                
                className="ml-16 text-black hover:bg-blue-300 hover:text-white bg-yellow-500 text-sm px-4 py-2"
              >
                Admin Login
              </Button>
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
