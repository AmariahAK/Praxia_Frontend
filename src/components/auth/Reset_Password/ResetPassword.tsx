"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/api/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenError("Reset token is missing. Please use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }
    
    if (password !== password2) {
      setError("Passwords don't match.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const response = await authApi.resetPassword(token, password, password2);
      setIsSuccess(true);
      
      // Store token in localStorage for automatic login
      localStorage.setItem("token", response.access_token);
      
      // Redirect to Login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="w-full max-w-md p-8 bg-base shadow-lg rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text">Invalid Reset Link</h2>
            <p className="text-text-secondary mb-6">{tokenError}</p>
            <Link href="/auth/forgot_password" className="btn-primary px-6 py-2 rounded-full text-center font-medium inline-block">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="w-full max-w-md p-8 bg-base shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold primary-text">Reset Your Password</h1>
          {!isSuccess && (
            <p className="mt-2 text-text-secondary">
              Please enter your new password below.
            </p>
          )}
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-base text-text"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-text mb-1">
                Confirm New Password
              </label>
              <input
                id="password2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-base text-text"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="bg-accent bg-opacity-10 text-accent p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary px-4 py-2 rounded-full text-center font-medium flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text">Password Reset Successfully!</h2>
            <p className="text-text-secondary mb-6">
              Your password has been reset successfully. You are now being redirected to the Login.
            </p>
            <Link href="/auth/login" className="btn-primary px-6 py-2 rounded-full text-center font-medium inline-block">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
