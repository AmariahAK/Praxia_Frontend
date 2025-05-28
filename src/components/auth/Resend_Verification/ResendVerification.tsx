"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/api/api";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await authApi.resendVerificationEmail(email);
      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="w-full max-w-md p-8 bg-base shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold primary-text">Resend Verification Email</h1>
          {!isSuccess && (
            <p className="mt-2 text-text-secondary">
              Enter your email address and we&apos;ll send you a new verification link.
            </p>
          )}
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-base text-text"
                placeholder="Enter your email"
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
                  Sending...
                </>
              ) : (
                "Send Verification Link"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text">Check Your Email</h2>
            <p className="text-text-secondary mb-6">
              We&apos;ve sent a new verification link to <span className="font-semibold">{email}</span>. 
              Please check your inbox and follow the instructions to verify your account.
            </p>
            <p className="text-text-secondary mb-6">
              The link will expire in 24 hours.
            </p>
            <div className="space-y-4">
              <Link href="/auth/login" className="btn-primary px-6 py-2 rounded-full text-center font-medium inline-block">
                Back to Login
              </Link>
              <div className="mt-4">
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-primary hover:underline"
                >
                  Try a different email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
