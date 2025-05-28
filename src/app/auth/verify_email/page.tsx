"use client";

import { Suspense } from "react";
import EmailVerification from "@/components/auth/Email_Verification/EmailVerification";

// Create a loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerification />
    </Suspense>
  );
}
