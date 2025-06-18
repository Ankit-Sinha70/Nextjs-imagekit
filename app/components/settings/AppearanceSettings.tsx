'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Moon, Sun, Monitor, Eye, EyeOff } from 'lucide-react';
import { useNotification } from '../Notification';

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  preview: string;
}

export default function AppearanceSettings() {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);
  const [accentColor, setAccentColor] = useState('blue');

  const { showNotification } = useNotification();

  const themeOptions: ThemeOption[] = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'auto',
      name: 'Auto',
      description: 'Follows your system preference',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-100 border-gray-300'
    }
  ];

  const accentColors = [
    { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
    { id: 'green', name: 'Green', class: 'bg-green-500' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
    { id: 'red', name: 'Red', class: 'bg-red-500' },
    { id: 'orange', name: 'Orange', class: 'bg-orange-500' },
    { id: 'pink', name: 'Pink', class: 'bg-pink-500' }
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    showNotification(`Theme changed to ${newTheme}`, 'success');
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    showNotification(`Font size changed to ${size}`, 'success');
  };

  const handleCompactModeToggle = () => {
    setCompactMode(!compactMode);
    showNotification(
      compactMode ? 'Compact mode disabled' : 'Compact mode enabled',
      'success'
    );
  };

  const handleAnimationsToggle = () => {
    setShowAnimations(!showAnimations);
    showNotification(
      showAnimations ? 'Animations disabled' : 'Animations enabled',
      'success'
    );
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    showNotification(`Accent color changed to ${color}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Palette className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
            <p className="text-sm text-gray-500">Choose your preferred appearance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all ${
                theme === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-20 rounded ${option.preview} mb-3 flex items-center justify-center`}>
                <option.icon className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900">{option.name}</h4>
              <p className="text-sm text-gray-500">{option.description}</p>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Font Size</h4>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Small</span>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={fontSize === 'small' ? 0 : fontSize === 'medium' ? 1 : 2}
              onChange={(e) => {
                const sizes = ['small', 'medium', 'large'];
                handleFontSizeChange(sizes[parseInt(e.target.value)]);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <span className="text-sm text-gray-500">Large</span>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-gray-700">
            Current: {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
          </span>
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Accent Color</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleAccentColorChange(color.id)}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                accentColor === color.id 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-8 rounded ${color.class}`}></div>
              <span className="text-xs text-gray-600 mt-1 block">{color.name}</span>
              {accentColor === color.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Display Options</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Compact Mode</h5>
              <p className="text-sm text-gray-500">Reduce spacing for more content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={handleCompactModeToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Show Animations</h5>
              <p className="text-sm text-gray-500">Enable smooth transitions and effects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAnimations}
                onChange={handleAnimationsToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Preview</h4>
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">Sample Card</h5>
            <button className={`px-3 py-1 rounded text-white text-sm ${
              accentColor === 'blue' ? 'bg-blue-500' :
              accentColor === 'green' ? 'bg-green-500' :
              accentColor === 'purple' ? 'bg-purple-500' :
              accentColor === 'red' ? 'bg-red-500' :
              accentColor === 'orange' ? 'bg-orange-500' :
              'bg-pink-500'
            }`}>
              Button
            </button>
          </div>
          <p className="text-sm text-gray-600">
            This is how your interface will look with the current settings.
          </p>
        </div>
      </div>
    </div>
  );
} 