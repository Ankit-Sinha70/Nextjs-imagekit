'use client';

import { motion } from 'framer-motion';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '../Notification';
import LogoutConfirmationModal from '../models/LogoutConfirmationModal';

export default function Navbar() {

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();
    const { showNotification } = useNotification();

    const handleLogout = async () => {
        try {
          setIsLoggingOut(true);
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
    
          if (!response.ok) throw new Error('Logout failed');
    
          localStorage.removeItem('token');
          showNotification('Logged out successfully', 'success');
          router.push('/login');
        } catch (error) {
          showNotification('Error during logout', 'error');
        } finally {
          setIsLoggingOut(false);
          setShowLogoutModal(false);
        }
      };
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl">
        <div className="flex justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <h1 className="text-xl font-bold">Dashboard</h1>
          </motion.div>
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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