'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { useNotification } from '../Notification';
// Removed import of IProfile to avoid Mongoose Document type conflicts on frontend

// Define a type for the profile data relevant to the frontend component
interface ProfileData {
  _id?: string; // MongoDB _id is optional on frontend initial state
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  notificationPreferences: {
    security: { email: boolean; push: boolean; sms: boolean; inApp: boolean; };
    updates: { email: boolean; push: boolean; sms: boolean; inApp: boolean; };
    marketing: { email: boolean; push: boolean; sms: boolean; inApp: boolean; };
    activity: { email: boolean; push: boolean; sms: boolean; inApp: boolean; };
  };
  appearanceSettings: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    showAnimations: boolean;
    accentColor: string;
  };
  createdAt?: string; // Optional timestamps from Mongoose
  updatedAt?: string;
  __v?: number; // Mongoose version key
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileData>({
    // Initialize with default values matching ProfileData schema
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    twoFactorEnabled: false,
    notificationPreferences: {
      security: { email: false, push: false, sms: false, inApp: false },
      updates: { email: false, push: false, sms: false, inApp: false },
      marketing: { email: false, push: false, sms: false, inApp: false },
      activity: { email: false, push: false, sms: false, inApp: false },
    },
    appearanceSettings: {
      theme: 'light', fontSize: 'medium', compactMode: false, showAnimations: true, accentColor: 'blue'
    }
  });
  console.log('profile', profile)

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('result', result)
        if (result.success && result.data) {
          setProfile(result.data);
        } else if (result.success && result.profile) {
          setProfile(result.profile);
        } else {
          throw new Error(result.message || 'Failed to fetch profile data.');
        }
      } catch (e: any) {
        setError('Failed to load profile: ' + e.message);
        showNotification('Failed to load profile!', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAvatarFile(file);
      setProfile((prevProfile) => ({
        ...prevProfile,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();

      // Append all profile fields to FormData
      Object.entries(profile).forEach(([key, value]) => {
        if (key === 'avatar' && newAvatarFile) {
          // If a new avatar file is selected, we'll append it separately.
          return;
        }

        // For nested objects, stringify them before appending to FormData
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value)); // Ensure all values are strings
        }
      });

      // If a new avatar file was selected, append it as 'avatarFile'
      if (newAvatarFile) {
        formData.append('avatarFile', newAvatarFile);
      }
      
      // Also, ensure the profile's _id is included in the FormData
      if (profile._id) { // Check if _id exists before appending
        formData.append('_id', profile._id);
      }


      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      // The backend now returns { success: true, profile: updatedProfile }
      setProfile(result.profile); // Update local state with the saved profile data
      setNewAvatarFile(null); // Clear the temporary file state
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (e: any) {
      setError('Failed to save profile: ' + e.message);
      showNotification('Failed to save profile!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    showNotification('Changes discarded', 'info');
  };

  if (isLoading) { // Check only for isLoading during initial load
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile Avatar" className="w-32 h-32 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {profile.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                </div>
              )}
              
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center">
              {isEditing ? 'Click to change photo' : 'Profile photo'}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={profile?.firstName || ''} // Add || '' for controlled component
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={profile?.lastName || ''} // Add || '' for controlled component
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={profile?.email || ''} // Add || '' for controlled component
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={profile?.phone || ''} // Add || '' for controlled component
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={profile?.location || ''} // Add || '' for controlled component
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profile?.bio || ''} // Add || '' for controlled component
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 