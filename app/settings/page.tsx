'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardSection from '../components/dashboard/DashboardSection';
import SettingsNavigation from '../components/settings/SettingsNavigation';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import { User, Shield, Bell, Palette } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // Scroll to top of the content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardSection title="Profile Settings">
              <ProfileSettings />
            </DashboardSection>
          </motion.div>
        );
      
      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardSection title="Security Settings">
              <SecuritySettings />
            </DashboardSection>
          </motion.div>
        );
      
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardSection title="Notification Preferences">
              <NotificationSettings />
            </DashboardSection>
          </motion.div>
        );
      
      case 'appearance':
        return (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardSection title="Appearance Settings">
              <AppearanceSettings />
            </DashboardSection>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto">
        <div className="">
          {/* Settings Navigation Menu */}
          <SettingsNavigation
            sections={sections}
            activeSection={activeSection}
            onSectionChange={scrollToSection}
          />

          {/* Active Section Content */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {renderActiveSection()}
            </AnimatePresence>
          </div>

          <div className="space-y-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Additional settings cards can go here */}
            </motion.div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
