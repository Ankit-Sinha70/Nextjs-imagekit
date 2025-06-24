'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { name: 'Analytics', icon: ChartBarIcon, path: '/analytics' },
  { name: 'Users', icon: UsersIcon, path: '/users' },
  { name: 'Settings', icon: CogIcon, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.aside
      className={`
        bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl
        dark:bg-gray-900 dark:text-gray-100 dark:shadow-none /* Dark mode styles for background and text */
        transition-all duration-300 ease-in-out
        h-screen fixed top-0 z-50 overflow-hidden /* Mobile positioning */

        ${isOpen ? 'left-0 w-64' : 'left-[-100%] w-0'} /* Mobile open/close states */

        md:relative md:h-auto md:top-auto md:left-auto md:z-auto md:overflow-visible /* Reset mobile positioning for desktop */
        ${isOpen ? 'md:w-64' : 'md:w-20'} /* Desktop open/close states */
      `}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors
        dark:bg-gray-700 dark:hover:bg-gray-600 dark:shadow-none" /* Dark mode styles for button */
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
          >
            {isOpen ? (
              <ChevronLeftIcon className="w-4 h-4 text-indigo-600 dark:text-blue-400" /> /* Dark mode icon color */
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-indigo-600 dark:text-blue-400" /> /* Dark mode icon color */
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.h1
              className="text-2xl font-bold text-white dark:text-gray-100" /* Dark mode text color */
            >
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
              className={`flex items-center px-6 py-3 text-white/80 hover:bg-white/10 transition-colors duration-200
              dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 /* Dark mode link text & hover */
              ${
                isActive
                  ? 'bg-white/20 text-white dark:bg-blue-600 dark:text-white' /* Dark mode active link */
                  : ''
              }`}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5" />
                {isOpen && (
                  <span className="ml-3">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
} 