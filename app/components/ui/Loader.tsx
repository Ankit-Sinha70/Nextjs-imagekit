"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = "Loading..." }: LoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center p-6 text-center text-gray-500 dark:text-gray-300"
    >
      <Loader2 className="mr-3 h-10 w-10 animate-spin text-blue-500" />
      <span className="text-lg font-medium">{message}</span>
    </motion.div>
  );
}
