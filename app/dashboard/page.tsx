'use client';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardSection from '../components/dashboard/DashboardSection';
import VideoUpload from '../components/VideoUpload';
import VideoList from '../components/VideoList';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DashboardSection title="Upload Video">
            <VideoUpload />
          </DashboardSection>
          
          <DashboardSection title="Your Videos">
            <VideoList />
          </DashboardSection>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
            </motion.div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
} 