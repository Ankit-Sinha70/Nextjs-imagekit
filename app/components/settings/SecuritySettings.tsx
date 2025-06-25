"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Key, Smartphone, Eye, EyeOff } from "lucide-react";
import { useNotification } from "../Notification";
import { toast } from "sonner";
import Loader from "../ui/Loader";
import Image from "next/image";

export default function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "New York, NY",
      lastActive: "2 hours ago",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "New York, NY",
      lastActive: "1 day ago",
      current: false,
    },
    {
      id: 3,
      device: "Firefox on Mac",
      location: "San Francisco, CA",
      lastActive: "3 days ago",
      current: false,
    },
  ]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingTwoFactor, setIsLoadingTwoFactor] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // New states for 2FA setup flow
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState<string>("");
  const [showTwoFactorSetupFlow, setShowTwoFactorSetupFlow] =
    useState<boolean>(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        setTwoFactorEnabled(data.twoFactorEnabled || false);
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch initial security settings.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("Failed to fetch initial security settings:", errorMessage, error);
        toast.error(errorMessage);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    fetchSecuritySettings();
  }, []);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoadingPassword(true);
    try {
      const response = await fetch("/api/security/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setPasswords({ current: "", new: "", confirm: "" });
      toast.success(data.message);
    } catch (error: unknown) {
      let errorMessage = "Failed to update password.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Password update error:", errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (twoFactorEnabled) {
      setIsLoadingTwoFactor(true);
      try {
        const response = await fetch("/api/security/two-factor", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled: false }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to disable two-factor authentication"
          );
        }

        setTwoFactorEnabled(data.twoFactorEnabled);
        toast.success(data.message);
        setQrCodeImage(null);
        setTwoFactorSecret(null);
        setTwoFactorCodeInput("");
        setShowTwoFactorSetupFlow(false);
      } catch (error: unknown) {
        let errorMessage = "Failed to disable two-factor authentication.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("2FA disable error:", errorMessage, error);
        toast.error(errorMessage);
      } finally {
        setIsLoadingTwoFactor(false);
      }
    } else {
      setIsLoadingTwoFactor(true);
      try {
        const response = await fetch("/api/2fa/generate", { method: "POST" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to generate 2FA secret and QR code."
          );
        }

        setQrCodeImage(data.qrCodeImage);
        setTwoFactorSecret(data.secret);
        setShowTwoFactorSetupFlow(true);
        showNotification(
          "Scan the QR code with your authenticator app.",
          "info"
        );
      } catch (error: unknown) {
        let errorMessage = "Failed to generate 2FA secret or QR code.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("2FA generate error:", errorMessage, error);
        toast.error(errorMessage);
      } finally {
        setIsLoadingTwoFactor(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorSecret || !twoFactorCodeInput) {
      toast.error("Please scan the QR code and enter the 6-digit code.");
      return;
    }

    setIsLoadingTwoFactor(true);
    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: twoFactorSecret,
          token: twoFactorCodeInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to verify 2FA code. Please try again."
        );
      }

      setTwoFactorEnabled(true);
      toast.success(data.message);
      setQrCodeImage(null);
      setTwoFactorSecret(null);
      setTwoFactorCodeInput("");
      setShowTwoFactorSetupFlow(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to verify 2FA code.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("2FA verification error:", errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setIsLoadingTwoFactor(false);
    }
  };

  const handleRevokeSession = (sessionId: number) => {
    setActiveSessions(
      activeSessions.filter((session) => session.id !== sessionId)
    );
    showNotification("Session revoked successfully", "success");
  };

  if (isLoadingInitial) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
        <Loader/>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Lock className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Change Password
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="current-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                disabled={isLoadingPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 focus:outline-none"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="new-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                disabled={isLoadingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 focus:outline-none"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                disabled={isLoadingPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handlePasswordChange}
            disabled={isLoadingPassword}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Two-Factor Authentication
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Enable 2FA</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Add an extra layer of security to your account.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              disabled={isLoadingTwoFactor}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 dark:after:bg-gray-200 dark:peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {showTwoFactorSetupFlow && twoFactorSecret && qrCodeImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg dark:border-blue-700 dark:bg-blue-900/20"
          >
            <h4 className="text-md font-semibold text-blue-800 mb-3 dark:text-blue-200">
              Set up Two-Factor Authentication
            </h4>
            <p className="text-sm text-blue-700 mb-4 dark:text-blue-300">
              Scan the QR code with your authenticator app (e.g., Google
              Authenticator, Authy) or manually enter the secret key.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <Image src={qrCodeImage} alt="QR Code" width={200} height={200} className="border border-gray-300 p-2 rounded-lg bg-white" />
              <p className="text-sm font-mono bg-gray-100 p-2 rounded-md dark:bg-gray-700 dark:text-gray-200">
                Secret Key: {twoFactorSecret}
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit code from app"
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-center dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={twoFactorCodeInput}
                onChange={(e) => setTwoFactorCodeInput(e.target.value)}
                maxLength={6}
              />
              <button
                onClick={handleVerify2FA}
                disabled={isLoadingTwoFactor}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingTwoFactor ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Sessions
          </h3>
        </div>
        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <p className="font-medium dark:text-gray-100">
                    {session.device}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.location} • Last active: {session.lastActive}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {session.current && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                    Current Session
                  </span>
                )}
                {!session.current && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">
          Manage and revoke active sessions for your account. Revoking a session
          will log out that device immediately.
        </p>
      </div>
    </div>
  );
}
