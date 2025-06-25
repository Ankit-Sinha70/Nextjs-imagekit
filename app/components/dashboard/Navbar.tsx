"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotification } from "../Notification";
import LogoutConfirmationModal from "../models/LogoutConfirmationModal";

export default function Navbar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showNotification } = useNotification();

  // Function to get dynamic title based on current path
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/dashboard/analytics":
        return "Analytics";
      case "/dashboard/profile":
        return "Profile";
      case "/dashboard/settings":
        return "Settings";
      default:
        // Extract title from pathname for other routes
        const path = pathname.split("/").pop();
        return path
          ? path.charAt(0).toUpperCase() + path.slice(1)
          : "Dashboard";
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }

      localStorage.removeItem("token");
      showNotification("Logged out successfully", "success");
      router.push("/login");
    } catch (error: unknown) {
      let errorMessage = "Error during logout";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Logout error:", errorMessage, error);
      showNotification(errorMessage, "error");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <motion.nav className="shadow-sm dark:shadow-none">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl dark:bg-gray-700 dark:from-gray-700 dark:to-gray-700 dark:text-gray-100">
        <div className="flex justify-between h-16">
          <motion.div className="flex items-center">
            <h1 className="ml-7 text-xl font-bold">{getPageTitle()}</h1>
          </motion.div>
          <div className="flex items-center">
            <motion.button
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </motion.nav>
  );
}
