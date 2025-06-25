"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Camera } from "lucide-react";
import { useNotification } from "../Notification";
import Loader from "../ui/Loader";

interface ProfileData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  notificationPreferences: {
    security: { email: boolean; push: boolean; sms: boolean; inApp: boolean };
    updates: { email: boolean; push: boolean; sms: boolean; inApp: boolean };
    marketing: { email: boolean; push: boolean; sms: boolean; inApp: boolean };
    activity: { email: boolean; push: boolean; sms: boolean; inApp: boolean };
  };
  appearanceSettings: {
    theme: "light" | "dark" | "auto";
    fontSize: "small" | "medium" | "large";
    compactMode: boolean;
    showAnimations: boolean;
    accentColor: string;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    twoFactorEnabled: false,
    notificationPreferences: {
      security: { email: false, push: false, sms: false, inApp: false },
      updates: { email: false, push: false, sms: false, inApp: false },
      marketing: { email: false, push: false, sms: false, inApp: false },
      activity: { email: false, push: false, sms: false, inApp: false },
    },
    appearanceSettings: {
      theme: "light",
      fontSize: "medium",
      compactMode: false,
      showAnimations: true,
      accentColor: "blue",
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();

        setProfile(result);
      } catch (e: unknown) {
        let errorMessage = "Failed to load profile.";
        if (e instanceof Error) {
          errorMessage = e.message;
        }
        setError(errorMessage);
        showNotification("Failed to load profile!", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [showNotification]);

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

      Object.entries(profile).forEach(([key, value]) => {
        if (key === "avatar" && newAvatarFile) {
          return;
        }

        // --- FIX IS HERE: Handle boolean and other types explicitly ---
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value || ""));
        }
      });
      if (newAvatarFile) {
        formData.append("avatarFile", newAvatarFile);
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      if (result.success && result.profile) {
        setProfile(result.profile);
      } else {
        setProfile(result);
      }

      setNewAvatarFile(null);
      setIsEditing(false);
      showNotification("Profile updated successfully!", "success");
    } catch (e: unknown) {
      let errorMessage = "Failed to save profile.";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      showNotification("Failed to save profile!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    showNotification("Changes discarded", "info");
  };

  if (isLoading) {
    // Check only for isLoading during initial load
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Personal Information
        </h3>
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
              {isLoading ? "Saving..." : "Save Changes"}
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
                <Image
                  src={profile.avatar}
                  alt="Profile Avatar"
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {profile.firstName?.charAt(0)}
                  {profile?.lastName?.charAt(0)}
                </div>
              )}

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:shadow-none"
                >
                  <Camera className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center dark:text-gray-300">
              {isEditing ? "Click to change photo" : "Profile photo"}
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
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={profile?.firstName || ""} // Add || '' for controlled component
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={profile?.lastName || ""} // Add || '' for controlled component
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={profile?.email || ""} // Add || '' for controlled component
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={profile?.phone || ""} // Add || '' for controlled component
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={profile?.location || ""} // Add || '' for controlled component
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Bio
              </label>
              <textarea
                value={profile?.bio || ""} // Add || '' for controlled component
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:disabled:bg-gray-700"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
