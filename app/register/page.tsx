"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const debouncedEmail = useDebounce(email, 500);
  const debouncedPassword = useDebounce(password, 500);

  const registerMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration Failed");
      }
      return data;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    registerMutation.mutate({ email, password });
  };

  useEffect(() => {
    if (debouncedEmail) {
      // Add your email validation logic here
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (debouncedPassword) {
      // Add your password validation logic here
    }
  }, [debouncedPassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-xl w-full space-y-8 p-10 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] dark:bg-gray-800 dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-gray-900">
        <div className="animate-fade-in">
          <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-indigo-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-6">
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 dark:focus:ring-blue-400"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              {registerMutation.isPending ? (
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
                  Registering...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
