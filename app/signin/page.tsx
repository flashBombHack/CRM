"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value.trim() === "") {
      setIsEmailValid(false);
      setEmailError("");
    } else if (validateEmail(value)) {
      setIsEmailValid(true);
      setEmailError("");
    } else {
      setIsEmailValid(false);
      setEmailError("Please enter a valid email address");
    }
  };

  const handleContinue = () => {
    if (isEmailValid && email.trim() !== "") {
      // Smooth transition to sign-in form
      setShowSignInForm(true);
    }
  };

  const handleBackToCreateAccount = () => {
    setShowSignInForm(false);
    setPassword("");
    setShowPassword(false);
  };

  const isSignInButtonActive = email.trim() !== "" && password.trim() !== "" && isEmailValid && !isSubmitting;

  const handleSignIn = async () => {
    if (!isSignInButtonActive) return;

    setIsSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      // Navigation will happen in the auth context after successful login
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full flex overflow-hidden">
      {/* Left Side - Background Image */}
      <div className="hidden md:flex md:w-1/2 lg:w-1/2 relative bg-black">
        <Image
          src="/assets/SideBG.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 lg:w-1/2 flex items-center justify-center bg-white px-4 sm:px-6 py-2 sm:py-4 overflow-y-auto">
        <div className="w-full max-w-md relative">
          {/* Create Account Form */}
          <div
            className={`transition-opacity duration-500 ease-out ${
              showSignInForm
                ? "opacity-0 absolute inset-0 pointer-events-none w-full"
                : "opacity-100 relative w-full"
            }`}
          >
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/hudder-logo.png"
                alt="Huddersfield Town AFC Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 text-center">
              Create your account
            </h1>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-6"
            >
              <Image
                src="/assets/google-icon.png"
                alt="Google"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <span className="relative bg-white px-4 text-sm text-gray-500">Or</span>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  emailError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary focus:border-primary"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!isEmailValid || email.trim() === ""}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                isEmailValid && email.trim() !== ""
                  ? "bg-primary text-white hover:bg-primary-600 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            {/* Terms and Privacy */}
            <p className="mt-6 text-sm text-gray-600 text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Sign In Link */}
            <p className="mt-4 text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <button
                onClick={handleContinue}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Sign In Form */}
          <div
            className={`transition-opacity duration-500 ease-out ${
              showSignInForm
                ? "opacity-100 relative w-full"
                : "opacity-0 absolute inset-0 pointer-events-none w-full"
            }`}
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/hudder-logo.png"
                alt="Huddersfield Town AFC Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
              Sign In
            </h1>
            <p className="text-sm text-gray-600 mb-8 text-center">
              Fill your details to access your account
            </p>

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="signin-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  emailError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-primary focus:border-primary"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Password and Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Remember password</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="button"
              disabled={!isSignInButtonActive}
              onClick={handleSignIn}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                isSignInButtonActive
                  ? "bg-primary text-white hover:bg-primary-600 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            {/* Help Text */}
            <p className="mt-6 text-sm text-gray-500 text-center">
              Need help? Contact HR at{" "}
              <a href="mailto:help@fc.com" className="text-primary hover:underline">
                help@fc.com
              </a>
            </p>

            {/* Back to Create Account */}
            <p className="mt-4 text-sm text-gray-600 text-center">
              Don&apos;t have an account?{" "}
              <button
                onClick={handleBackToCreateAccount}
                className="text-primary hover:underline font-medium"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

