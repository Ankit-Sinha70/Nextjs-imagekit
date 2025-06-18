'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import { useNotification } from '../Notification';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'security',
      title: 'Security Alerts',
      description: 'Get notified about login attempts and security updates',
      email: true,
      push: true,
      sms: false,
      inApp: true
    },
    {
      id: 'updates',
      title: 'System Updates',
      description: 'Receive notifications about new features and updates',
      email: true,
      push: false,
      sms: false,
      inApp: true
    },
    {
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Receive promotional emails and special offers',
      email: false,
      push: false,
      sms: false,
      inApp: false
    },
    {
      id: 'activity',
      title: 'Activity Notifications',
      description: 'Get notified about comments, likes, and other activities',
      email: true,
      push: true,
      sms: false,
      inApp: true
    }
  ]);

  const { showNotification } = useNotification();

  const handleToggle = (settingId: string, channel: keyof Omit<NotificationSetting, 'id' | 'title' | 'description'>) => {
    setSettings(settings.map(setting => 
      setting.id === settingId 
        ? { ...setting, [channel]: !setting[channel] }
        : setting
    ));
    showNotification('Notification settings updated', 'success');
  };

  const handleSaveAll = () => {
    showNotification('All notification settings saved!', 'success');
  };

  const handleReset = () => {
    setSettings(settings.map(setting => ({
      ...setting,
      email: setting.id === 'security' || setting.id === 'updates' || setting.id === 'activity',
      push: setting.id === 'security' || setting.id === 'activity',
      sms: false,
      inApp: setting.id === 'security' || setting.id === 'updates' || setting.id === 'activity'
    })));
    showNotification('Settings reset to defaults', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">Manage how you receive notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save All
          </button>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Notification Channels</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center p-3 border border-gray-200 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Email</span>
          </div>
          <div className="flex items-center p-3 border border-gray-200 rounded-lg">
            <Bell className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Push</span>
          </div>
          <div className="flex items-center p-3 border border-gray-200 rounded-lg">
            <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">SMS</span>
          </div>
          <div className="flex items-center p-3 border border-gray-200 rounded-lg">
            <Globe className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium">In-App</span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-md font-semibold text-gray-900">{setting.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm">Email</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.email}
                    onChange={() => handleToggle(setting.id, 'email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Push</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.push}
                    onChange={() => handleToggle(setting.id, 'push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Smartphone className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm">SMS</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.sms}
                    onChange={() => handleToggle(setting.id, 'sms')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm">In-App</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setting.inApp}
                    onChange={() => handleToggle(setting.id, 'inApp')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <MessageSquare className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Notification Summary</h4>
            <p className="text-sm text-blue-700 mt-1">
              You'll receive notifications through the channels you've enabled above. 
              You can change these settings at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 