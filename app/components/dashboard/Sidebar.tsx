"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, Fragment } from "react";

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Analytics", icon: ChartBarIcon, path: "/analytics" },
  { name: "Users", icon: UsersIcon, path: "/users" },
  { name: "Settings", icon: CogIcon, path: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); 

  useEffect(() => {
    setIsOpen(window.innerWidth >= 768);

    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); 

  return (
    <Fragment>
      <motion.aside
        className={`
          bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl
          dark:bg-gray-700 dark:from-gray-700 dark:to-gray-700 dark:text-gray-100 dark:shadow-none /* Dark mode styles for background, gradient override, and text */
          transition-all duration-300 ease-in-out
          h-screen fixed top-0 z-40 overflow-hidden /* Mobile positioning */

          ${isOpen ? "left-0 w-56" : "left-[-100%] w-0"} /* Mobile open/close states */

          md:relative md:h-auto md:top-auto md:left-auto md:z-auto md:overflow-visible /* Reset mobile positioning for desktop */
          ${isOpen ? "md:w-56" : "md:w-20"} /* Desktop open/close states */
        `}>

        <div className="p-4 pl-4">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.h1 className="text-2xl font-bold text-white dark:text-gray-100">
                Dashboard
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center py-3 text-white/80 hover:bg-white/10 transition-colors duration-200
                dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                ${isOpen ? 'pl-4' : 'pl-2'}
                ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-blue-600 dark:text-white"
                    : ""
                }`}
              >
                <div className="flex items-center justify-start w-full">
                  <item.icon className="w-5 h-5" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors z-50
        dark:bg-gray-700 dark:hover:bg-gray-600 dark:shadow-none"
        style={{
          left: isOpen ? 'calc(14rem - 0.75rem)' : '0.5rem',
          transition: 'left 300ms ease-in-out',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={isOpen ? "close" : "open"}>
            {isOpen ? (
              <ChevronLeftIcon className="w-6 h-6 text-indigo-600 dark:text-blue-400" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-indigo-600 dark:text-blue-400" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </Fragment>
  );
}
