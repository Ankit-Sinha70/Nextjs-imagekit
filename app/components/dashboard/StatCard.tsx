'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: IconType;
  change: string;
  trend: 'up' | 'down';
}

export default function StatCard({ title, value, icon: Icon, change, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                 border border-gray-100 hover:border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
      </div>
    </motion.div>
  );
} 