'use client';

import { motion } from 'framer-motion';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';

interface UserStatsData {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export default function UserStats() {
  // Mock data - in a real app, this would come from an API
  const stats: UserStatsData = {
    totalUsers: 1247,
    newUsers: 89,
    activeUsers: 892,
    inactiveUsers: 355
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12%',
      trend: 'up' as const,
      color: 'blue'
    },
    {
      title: 'New Users',
      value: stats.newUsers.toString(),
      icon: UserPlus,
      change: '+8%',
      trend: 'up' as const,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      change: '+5%',
      trend: 'up' as const,
      color: 'purple'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers.toString(),
      icon: UserX,
      change: '-3%',
      trend: 'down' as const,
      color: 'red'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
                     border border-gray-100 hover:border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-full`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 