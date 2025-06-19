"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Key, Smartphone, Eye, EyeOff } from "lucide-react";
import { useNotification } from "../Notification";

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
      } catch (error: any) {
        console.error("Failed to fetch initial security settings:", error);
        showNotification(
          `Failed to load security settings: ${error.message}`,
          "error"
        );
      } finally {
        setIsLoadingInitial(false);
      }
    };
    fetchSecuritySettings();
  }, []);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      showNotification("New passwords do not match", "error");
      return;
    }
    if (passwords.new.length < 8) {
      showNotification("Password must be at least 8 characters long", "error");
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
      showNotification(data.message, "success");
    } catch (error: any) {
      console.error("Password update error:", error);
      showNotification(error.message, "error");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (twoFactorEnabled) {
      // If 2FA is currently enabled, disable it
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
        showNotification(data.message, "success");
        setQrCodeImage(null);
        setTwoFactorSecret(null);
        setTwoFactorCodeInput("");
        setShowTwoFactorSetupFlow(false);
      } catch (error: any) {
        console.error("2FA disable error:", error);
        showNotification(error.message, "error");
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
      } catch (error: any) {
        console.error("2FA generate error:", error);
        showNotification(error.message, "error");
      } finally {
        setIsLoadingTwoFactor(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorSecret || !twoFactorCodeInput) {
      showNotification(
        "Please scan the QR code and enter the 6-digit code.",
        "error"
      );
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
      showNotification(data.message, "success");
      setQrCodeImage(null);
      setTwoFactorSecret(null);
      setTwoFactorCodeInput("");
      setShowTwoFactorSetupFlow(false);
    } catch (error: any) {
      console.error("2FA verification error:", error);
      showNotification(error.message, "error");
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
        Loading security settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Lock className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Change Password
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
                disabled={isLoadingPassword}
              />
              <button
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoadingPassword}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
                disabled={isLoadingPassword}
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoadingPassword}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                disabled={isLoadingPassword}
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoadingPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePasswordChange}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingPassword}
            >
              {isLoadingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            onClick={handleTwoFactorToggle}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              twoFactorEnabled
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            disabled={isLoadingTwoFactor}
          >
            {isLoadingTwoFactor
              ? "Updating..."
              : twoFactorEnabled
              ? "Disable"
              : "Enable"}
          </button>
        </div>

        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {twoFactorEnabled
                ? "Two-factor authentication is enabled"
                : "Two-factor authentication is disabled"}
            </p>
            <p className="text-sm text-gray-500">
              {twoFactorEnabled
                ? "Your account is protected with an additional security layer"
                : "Enable two-factor authentication for enhanced security"}
            </p>
          </div>
        </div>

        {/* 2FA Setup Flow Section */}
        {!twoFactorEnabled && showTwoFactorSetupFlow && qrCodeImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h4 className="text-md font-semibold text-blue-800 mb-3">
              Setup Two-Factor Authentication
            </h4>
            <p className="text-sm text-blue-700 mb-4">
              Scan the QR code below with your favorite authenticator app (e.g.,
              Google Authenticator, Authy). Then, enter the 6-digit code
              provided by the app to verify.
            </p>
            <div className="flex flex-col items-center justify-center mb-4">
              <img
                src={qrCodeImage}
                alt="2FA QR Code"
                width={180}
                height={180}
                className="rounded-md shadow-md bg-white p-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                If you cannot scan, manually enter this secret key:
              </p>
              <code className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
                {twoFactorSecret}
              </code>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <label
                htmlFor="2fa-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter 6-digit Code
              </label>
              <div className="relative">
                <input
                  id="2fa-code"
                  type="text"
                  value={twoFactorCodeInput}
                  onChange={(e) => setTwoFactorCodeInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                  placeholder="------"
                  maxLength={6}
                  disabled={isLoadingTwoFactor}
                />
                <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button
                onClick={handleVerify2FA}
                className="mt-4 w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isLoadingTwoFactor ||
                  !twoFactorCodeInput ||
                  twoFactorCodeInput.length !== 6
                }
              >
                {isLoadingTwoFactor ? "Verifying..." : "Verify and Enable 2FA"}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Smartphone className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Active Sessions
          </h3>
        </div>

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.device}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.current && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Current
                  </span>
                )}
                {!session.current && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
