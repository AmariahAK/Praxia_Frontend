"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PasswordChanged() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="w-full max-w-md p-8 bg-base shadow-lg rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-text">Password Changed Successfully!</h2>
          <p className="text-text-secondary mb-6">
            Your password has been changed successfully. You will be redirected to the login in a few seconds.
          </p>
          <p className="text-text-secondary mb-6">
            If you didn&apos;t make this change, please contact our support team immediately.
          </p>
          <Link href="/auth/login" className="btn-primary px-6 py-2 rounded-full text-center font-medium inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
