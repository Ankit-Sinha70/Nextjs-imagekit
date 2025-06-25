"use client";

import { useState, useEffect } from "react";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import { useNotification } from "../Notification";
import { useTheme } from "next-themes";
import Loader from "../ui/Loader";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  preview: string;
}

interface AppearanceSettingsState {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showAnimations: boolean;
  accentColor: string;
}

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppearanceSettingsState>({
    theme: (theme as "light" | "dark" | "system") || "light",
    fontSize: "medium",
    compactMode: false,
    showAnimations: true,
    accentColor: "blue",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  const themeOptions: ThemeOption[] = [
    {
      id: "light",
      name: "Light",
      description: "Clean and bright interface",
      icon: Sun,
      preview: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    },
    {
      id: "dark",
      name: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
      preview: "bg-gray-900 border-gray-700",
    },
    {
      id: "system",
      name: "Auto",
      description: "Follows your system preference",
      icon: Monitor,
      preview:
        "bg-gradient-to-r from-white to-gray-100 border-gray-300 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600",
    },
  ];

  const accentColors = [
    { id: "blue", name: "Blue", class: "bg-blue-500" },
    { id: "green", name: "Green", class: "bg-green-500" },
    { id: "purple", name: "Purple", class: "bg-purple-500" },
    { id: "red", name: "Red", class: "bg-red-500" },
    { id: "orange", name: "Orange", class: "bg-orange-500" },
    { id: "pink", name: "Pink", class: "bg-pink-500" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/appearance");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AppearanceSettingsState = await response.json();
        console.log("data", data);
        setSettings(data);
        setTheme(data.theme);
      } catch (error) {
        let errorMessage = "Failed to load appearance settings.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("Failed to fetch appearance settings:", error);
        showNotification(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [setTheme, showNotification]);

  useEffect(() => {
    if (theme && settings.theme !== theme) {
      setSettings((prev) => ({
        ...prev,
        theme: theme as "light" | "dark" | "system",
      }));
    }
  }, [theme, settings.theme]);

  const sendUpdateToApi = async (newSettings: AppearanceSettingsState) => {
    try {
      const response = await fetch("/api/appearance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update appearance settings");
      }
      showNotification(data.message, "success");
    } catch (error: unknown) {
      let errorMessage = "Failed to update appearance settings";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Appearance update error:", error);
      showNotification(errorMessage, "error");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    const updatedSettings = { ...settings, theme: newTheme };
    setSettings(updatedSettings);
    setTheme(newTheme);
    sendUpdateToApi(updatedSettings);
  };

  const handleFontSizeChange = (size: "small" | "medium" | "large") => {
    const updatedSettings = { ...settings, fontSize: size };
    setSettings(updatedSettings);
    sendUpdateToApi(updatedSettings);
  };

  const handleCompactModeToggle = () => {
    const updatedSettings = { ...settings, compactMode: !settings.compactMode };
    setSettings(updatedSettings);
    sendUpdateToApi(updatedSettings);
  };

  const handleAnimationsToggle = () => {
    const updatedSettings = {
      ...settings,
      showAnimations: !settings.showAnimations,
    };
    setSettings(updatedSettings);
    sendUpdateToApi(updatedSettings);
  };

  const handleAccentColorChange = (color: string) => {
    const updatedSettings = { ...settings, accentColor: color };
    setSettings(updatedSettings);
    sendUpdateToApi(updatedSettings);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-sm border border-gray-100 p-6 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-950 rounded-lg transition-colors duration-300 text-gray-900 dark:!text-gray-100 debug-theme-applied">
      {/* Theme Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <div className="flex items-center mb-6">
          <Palette className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Theme
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 ">
              Choose your preferred appearance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <div
              key={option.id}
              onClick={() =>
                handleThemeChange(option.id as "light" | "dark" | "system")
              }
              className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all ${
                theme === option.id
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-700"
              }`}
            >
              <div
                className={`w-full h-20 rounded ${option.preview} mb-3 flex items-center justify-center`}
              >
                <option.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {option.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {option.description}
              </p>
              {theme === option.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Font Size
        </h4>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Small
          </span>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={
                settings.fontSize === "small"
                  ? 0
                  : settings.fontSize === "medium"
                  ? 1
                  : 2
              }
              onChange={(e) => {
                const sizes: ("small" | "medium" | "large")[] = [
                  "small",
                  "medium",
                  "large",
                ];
                handleFontSizeChange(sizes[parseInt(e.target.value)]);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider dark:bg-gray-700"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Large
          </span>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Current:{" "}
            {settings.fontSize.charAt(0).toUpperCase() +
              settings.fontSize.slice(1)}
          </span>
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Accent Color
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleAccentColorChange(color.id)}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                settings.accentColor === color.id
                  ? "border-gray-900 scale-110 dark:border-gray-100 dark:bg-gray-700"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-800"
              }`}
            >
              <div className={`w-full h-8 rounded ${color.class}`}></div>
              <span className="text-xs text-gray-600 mt-1 block dark:text-gray-300">
                {color.name}
              </span>
              {settings.accentColor === color.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center dark:bg-gray-100">
                  <div className="w-2 h-2 bg-white rounded-full dark:bg-gray-900"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Display Options
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Compact Mode
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Reduce spacing for more content
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={handleCompactModeToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Show Animations
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Enable smooth transitions and effects
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showAnimations}
                onChange={handleAnimationsToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700`}
      >
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Preview
        </h4>
        <div
          className={`p-4 rounded-lg border dark:bg-gray-900 dark:border-gray-700 bg-gray-50`}
        >
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium dark:text-gray-100">Sample Card</h5>
            <button
              className={`px-3 py-1 rounded text-white text-sm ${
                settings.accentColor === "blue"
                  ? "bg-blue-500"
                  : settings.accentColor === "green"
                  ? "bg-green-500"
                  : settings.accentColor === "purple"
                  ? "bg-purple-500"
                  : settings.accentColor === "red"
                  ? "bg-red-500"
                  : settings.accentColor === "orange"
                  ? "bg-orange-500"
                  : "bg-pink-500"
              }`}
            >
              Button
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            This is how your interface will look with the current settings.
          </p>
        </div>
      </div>
    </div>
  );
}
