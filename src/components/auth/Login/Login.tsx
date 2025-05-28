"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginRequest } from "@/types/user";
import { authApi } from "@/api/api";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Actually call the login API
      const response = await authApi.login(formData);
      
      // Check if login was successful
      if (response.access_token) {
        // Tokens are already stored in authApi.login
        // Redirect to chats
        router.push("/chats");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-base shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center primary-text">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border border-neutral rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="email"
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border border-neutral rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="password"
            type="password"
            name="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <button
            className={`btn-primary w-full py-2 px-4 rounded-full focus:outline-none focus:shadow-outline ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-2">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="primary-text hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-text-secondary text-sm">
            <Link href="/auth/forgot_password" className="primary-text hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
