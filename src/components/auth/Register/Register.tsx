"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterRequest } from "@/types/user";
import { authApi } from "@/api/api";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords don't match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Add the actual API call to register the user
      await authApi.register(formData);
      
      // Show success message (we'll use state to display this)
      setSuccessMessage("Registration successful! Please check your email for verification before logging in.");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000); 
    } catch (error) {
      if (error instanceof Error) {
        // Check if error message contains field-specific errors
        const errorMessage = error.message;
        
        if (errorMessage.includes("email:")) {
          setErrors((prev) => ({ ...prev, email: errorMessage.split("email:")[1].trim() }));
        } else if (errorMessage.includes("password:")) {
          setErrors((prev) => ({ ...prev, password: errorMessage.split("password:")[1].trim() }));
        } else if (errorMessage.includes("full_name:")) {
          setErrors((prev) => ({ ...prev, full_name: errorMessage.split("full_name:")[1].trim() }));
        } else {
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      } else {
        setErrors((prev) => ({ ...prev, general: "An unexpected error occurred" }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-base shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center primary-text">Create Your Account</h2>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="full_name">
            Full Name
          </label>
          <input
            className={`shadow appearance-none border ${
              errors.full_name ? "border-red-500" : "border-neutral"
            } rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:shadow-outline focus:border-primary`}
            id="full_name"
            type="text"
            name="full_name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={handleChange}
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs italic mt-1">{errors.full_name}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className={`shadow appearance-none border ${
              errors.email ? "border-red-500" : "border-neutral"
            } rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:shadow-outline focus:border-primary`}
            id="email"
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className={`shadow appearance-none border ${
              errors.password ? "border-red-500" : "border-neutral"
            } rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:shadow-outline focus:border-primary`}
            id="password"
            type="password"
            name="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password2">
            Confirm Password
          </label>
          <input
            className={`shadow appearance-none border ${
              errors.password2 ? "border-red-500" : "border-neutral"
            } rounded w-full py-2 px-3 text-text leading-tight focus:outline-none focus:shadow-outline focus:border-primary`}
            id="password2"
            type="password"
            name="password2"
            placeholder="********"
            value={formData.password2}
            onChange={handleChange}
          />
          {errors.password2 && (
            <p className="text-red-500 text-xs italic mt-1">{errors.password2}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <button
            className={`btn-primary w-full py-2 px-4 rounded-full focus:outline-none focus:shadow-outline ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="primary-text hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
