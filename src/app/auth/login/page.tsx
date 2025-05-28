"use client";

import { useEffect } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/Login/Login";

export default function LoginPage() {

  useEffect(() => {
    // Clear any existing tokens when user visits login page
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_key');
  }, []);

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold primary-text">Praxia</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden">
          {/* Left Side - Image and Info */}
          <div className="bg-primary md:w-1/2 p-8 text-white flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-[url('/images/healthcare.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
              <p className="mb-6">
                Log in to your Praxia account to continue your healthcare journey with AI-powered assistance.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access your health history
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Continue your chat sessions
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Get new health insights
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <div className="bg-base md:w-1/2 p-8 flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-text-secondary">
        <p>&copy; {new Date().getFullYear()} Praxia. All rights reserved.</p>
      </footer>
    </div>
  );
}
