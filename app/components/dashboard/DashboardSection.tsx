'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardSectionProps {
  title: string;
  children: ReactNode;
}

export default function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow p-6 mb-6"
    >
      <motion.h2
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-medium mb-4"
      >
        {title}
      </motion.h2>
      {children}
    </motion.div>
  );
} 