'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { name: 'Analytics', icon: ChartBarIcon, path: '/dashboard/analytics' },
  { name: 'Users', icon: UsersIcon, path: '/dashboard/users' },
  { name: 'Settings', icon: CogIcon, path: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-white shadow-lg"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${
                isActive ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
} 