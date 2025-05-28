"use client";

import { Suspense } from "react";
import ResetPassword from "@/components/auth/Reset_Password/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPassword />
    </Suspense>
  );
}
