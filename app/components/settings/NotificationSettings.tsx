"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import Loader from "../ui/Loader";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

// Define the type for the incoming API data
interface ApiNotificationSettings {
  [key: string]: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

const transformApiDataToFrontend = (
  apiData: ApiNotificationSettings
): NotificationSetting[] => {
  const defaultSettings: NotificationSetting[] = [
    {
      id: "security",
      title: "Security Alerts",
      description: "Get notified about login attempts and security updates",
      email: false,
      push: false,
      sms: false,
      inApp: false,
    },
    {
      id: "updates",
      title: "System Updates",
      description: "Receive notifications about new features and updates",
      email: false,
      push: false,
      sms: false,
      inApp: false,
    },
    {
      id: "marketing",
      title: "Marketing Communications",
      description: "Receive promotional emails and special offers",
      email: false,
      push: false,
      sms: false,
      inApp: false,
    },
    {
      id: "activity",
      title: "Activity Notifications",
      description: "Get notified about comments, likes, and other activities",
      email: false,
      push: false,
      sms: false,
      inApp: false,
    },
  ];

  if (!apiData) return defaultSettings;

  return defaultSettings.map((defaultSetting) => {
    const apiSetting = apiData[defaultSetting.id];
    return {
      ...defaultSetting,
      email: apiSetting?.email ?? defaultSetting.email,
      push: apiSetting?.push ?? defaultSetting.push,
      sms: apiSetting?.sms ?? defaultSetting.sms,
      inApp: apiSetting?.inApp ?? defaultSetting.inApp,
    };
  });
};

// Helper function to transform frontend state to API data format
const transformFrontendDataToApi = (
  frontendData: NotificationSetting[]
): {
  [key: string]: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
} => {
  const apiData: {
    [key: string]: {
      email: boolean;
      push: boolean;
      sms: boolean;
      inApp: boolean;
    };
  } = {};
  frontendData.forEach((setting) => {
    apiData[setting.id] = {
      email: setting.email,
      push: setting.push,
      sms: setting.sms,
      inApp: setting.inApp,
    };
  });
  return apiData;
};

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const hasFetchedRef = useRef(false);

  const debouncedSettings = useDebounce(settings, 500);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setSettings(transformApiDataToFrontend(data));
        setHasFetchedInitial(true);
      } catch (error: unknown) {
        let errorMessage = "Failed to load notification settings.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error(
          "Failed to fetch notification settings:",
          errorMessage,
          error
        );
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (hasFetchedInitial && !isLoading && debouncedSettings.length > 0) {
      sendUpdateToApi(
        debouncedSettings,
        "Notification preferences updated successfully!",
        "Failed to update notification preferences."
      );
    }
  }, [debouncedSettings, hasFetchedInitial, isLoading]);

  const sendUpdateToApi = async (
    settingsToSend: NotificationSetting[],
    successMessage?: string,
    errorMessage?: string
  ) => {
    try {
      const apiData = transformFrontendDataToApi(settingsToSend);
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update settings");

      toast.success(
        successMessage || data.message || "Settings updated successfully."
      );
    } catch (error: unknown) {
      let finalErrorMessage = errorMessage || "Update failed";
      if (error instanceof Error) {
        finalErrorMessage = finalErrorMessage || error.message;
      }
      console.error("Notification update error:", finalErrorMessage, error);
      toast.error(finalErrorMessage);
    }
  };

  const handleToggle = (
    settingId: string,
    channel: keyof Omit<NotificationSetting, "id" | "title" | "description">
  ) => {
    setSettings((prevSettings) => {
      return prevSettings.map((setting) =>
        setting.id === settingId
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      );
    });
  };

  const handleSaveAll = () => {
    sendUpdateToApi(
      settings,
      "All notification settings saved!",
      "Failed to save all notification settings."
    );
  };

  const handleReset = () => {
    const defaultFrontendSettings = transformApiDataToFrontend({});
    setSettings(defaultFrontendSettings);
    sendUpdateToApi(
      defaultFrontendSettings,
      "Settings reset to defaults!",
      "Failed to reset settings."
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Manage how you receive notifications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Notification Channels
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center p-3 border border-gray-200 rounded-lg dark:border-gray-700">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Email</span>
          </div>
          <div className="flex items-center p-3 border border-gray-200 rounded-lg dark:border-gray-700">
            <Bell className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Push</span>
          </div>
          <div className="flex items-center p-3 border border-gray-200 rounded-lg dark:border-gray-700">
            <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">SMS</span>
          </div>
          <div className="flex items-center p-3 border border-gray-200 rounded-lg dark:border-gray-700">
            <Globe className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium">In-App</span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                  {setting.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
                  {setting.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm">Email</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`email-${setting.id}`}
                    checked={setting.email}
                    onChange={() => handleToggle(setting.id, "email")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Push</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`push-${setting.id}`}
                    checked={setting.push}
                    onChange={() => handleToggle(setting.id, "push")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center">
                  <Smartphone className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm">SMS</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`sms-${setting.id}`}
                    checked={setting.sms}
                    onChange={() => handleToggle(setting.id, "sms")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm">In-App</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`inApp-${setting.id}`}
                    checked={setting.inApp}
                    onChange={() => handleToggle(setting.id, "inApp")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950 dark:border-blue-800">
        <div className="flex items-start">
          <MessageSquare className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Notification Summary
            </h4>
            <p className="text-sm text-blue-700 mt-1 dark:text-blue-300">
              You&apos;ll receive notifications through the channels you&apos;ve
              enabled above. You can change these settings at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
