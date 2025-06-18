'use client';

import { motion } from 'framer-motion';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNotification } from '../Notification';
import LogoutConfirmationModal from '../models/LogoutConfirmationModal';

export default function Navbar() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { showNotification } = useNotification();

    // Function to get dynamic title based on current path
    const getPageTitle = () => {
        switch (pathname) {
            case '/dashboard':
                return 'Dashboard';
            case '/dashboard/analytics':
                return 'Analytics';
            case '/dashboard/profile':
                return 'Profile';
            case '/dashboard/settings':
                return 'Settings';
            default:
                // Extract title from pathname for other routes
                const path = pathname.split('/').pop();
                return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';
        }
    };

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
          className="bg-white shadow-sm"
        >
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl">
            <div className="flex justify-between h-16">
              <motion.div
                className="flex items-center"
              >
                <h1 className="text-xl font-bold">{getPageTitle()}</h1>
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