"use client";

import { useNotification } from "./components/Notification";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const { showNotification } = useNotification();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 dark:text-gray-100">
            Welcome to Your App
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-xl text-center text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-300 px-4 sm:px-0 leading-relaxed tracking-wide"
          >
            <span className="block text-indigo-600 dark:text-indigo-400 font-semibold">
              Upload. Optimize. Share.
            </span>
            Seamless{" "}
            <span className="font-medium text-black dark:text-white">
              video management
            </span>{" "}
            powered by{" "}
            <span className="text-indigo-500 font-bold">ImageKit</span>.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-300 leading-relaxed tracking-wide"
          >
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              A modern fullstack application
            </span>{" "}
            built with{" "}
            <strong className="text-black dark:text-white">Next.js</strong>,
            featuring{" "}
            <span className="underline underline-offset-4 decoration-indigo-500 dark:decoration-indigo-400">
              authentication
            </span>
            , <span className="italic">notifications</span>, and more.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 shadow-md"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Authentication"
              description="Secure user authentication with email and password"
              icon="🔐"
            />
            <FeatureCard
              title="Real-time Notifications"
              description="Stay updated with our notification system"
              icon="🔔"
            />
            <FeatureCard
              title="Modern UI"
              description="Beautiful and responsive user interface"
              icon="🎨"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4 dark:text-gray-100">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-8 dark:text-gray-300">
          Join thousands of users who are already using our platform
        </p>
        <button
          onClick={() =>
            showNotification("Welcome to our platform!", "success")
          }
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Try Demo
        </button>
      </div>
    </main>
  );
}

// Feature Card Component
function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl dark:hover:shadow-gray-900">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
