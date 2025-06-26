"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!showTwoFactorInput) {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          if (result.error === "TwoFactorRequired") {
            setShowTwoFactorInput(true);
            toast(
              "Two-factor authentication required. Please enter your code."
            );
          } else {
            toast(result.error);
          }
        } else if (result?.ok) {
          toast("Login successful!");
          router.push("/dashboard");
        }
      } else {
        const response = await fetch("/api/2fa/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token: twoFactorCode }),
        });

        const data = await response.json();

        if (response.ok) {
          const finalSignInResult = await signIn("credentials", {
            redirect: false,
            email,
            password,
            twoFactorCode,
          });

          if (finalSignInResult?.ok) {
            toast("Login successful with 2FA!");
            router.push("/dashboard");
          } else {
            toast(
              finalSignInResult?.error || "Login failed after 2FA verification."
            );
          }
        } else {
          toast(data.message || "Invalid 2FA code. Please try again.");
        }
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred during login.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Login error:", errorMessage, error);
      toast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-xl w-full space-y-8 p-10 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] dark:bg-gray-800 dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-gray-900">
        <div className="animate-fade-in">
          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-6">
            {!showTwoFactorInput && (
              <>
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 dark:focus:ring-blue-400"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 dark:focus:ring-blue-400"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {showTwoFactorInput && (
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label
                  htmlFor="two-factor-code"
                  className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
                >
                  Two-Factor Code
                </label>
                <input
                  id="two-factor-code"
                  name="two-factor-code"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-lg font-mono tracking-widest dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 dark:focus:ring-blue-400"
                  placeholder="------"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {showTwoFactorInput ? "Verifying 2FA..." : "Signing in..."}
                </span>
              ) : showTwoFactorInput ? (
                "Verify 2FA & Sign in"
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          Not a member?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
