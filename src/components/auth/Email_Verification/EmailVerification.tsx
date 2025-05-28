"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/api/api";

export default function EmailVerification() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerifying(false);
        setError("Verification token is missing. Please check your email link.");
        return;
      }

      try {
        const response = await authApi.verifyEmail(token);
        setIsSuccess(true);
        
        // Store token in localStorage for automatic login
        localStorage.setItem("token", response.access_token);
        
        // Redirect to Login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred during verification");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="w-full max-w-md p-8 bg-base shadow-lg rounded-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold primary-text">Email Verification</h1>
        </div>

        {isVerifying && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Verifying your email...</p>
          </div>
        )}

        {!isVerifying && isSuccess && (
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text">Email Verified Successfully!</h2>
            <p className="text-text-secondary mb-6">
              Your email has been verified. You are now being redirected to the Login.
            </p>
            <Link href="/auth/login" className="btn-primary px-6 py-2 rounded-full text-center font-medium inline-block">
              Go to Login
            </Link>
          </div>
        )}

        {!isVerifying && !isSuccess && (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-text">Verification Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="space-y-4">
              <Link href="/auth/login" className="btn-primary px-6 py-2 rounded-full text-center font-medium inline-block">
                Go to Login
              </Link>
              <div className="mt-4">
                <button 
                  onClick={() => router.push("/auth/resend-verification")}
                  className="text-primary hover:underline"
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
