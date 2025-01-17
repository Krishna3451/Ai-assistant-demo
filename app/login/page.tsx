'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import Image from 'next/image';
import PhoneVerification from '@/components/auth/PhoneVerification';

export default function LoginPage() {
  const { user, error, isPhoneVerified, signInWithGoogle, setPhoneVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isPhoneVerified) {
      router.push('/');
    }
  }, [user, isPhoneVerified, router]);

  const handlePhoneVerificationComplete = () => {
    setPhoneVerified(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-500 to-blue-700 justify-center items-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-8">Welcome to Apka मित्र</h1>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Personal Connection</h3>
                <p className="text-blue-100">Experience learning with a friend who understands you</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-lg">🤝</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Trusted Guide</h3>
                <p className="text-blue-100">Learn and grow with a companion who's always there for you</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-lg">🌟</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Personalized Journey</h3>
                <p className="text-blue-100">Tailored guidance that adapts to your unique needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {user && !isPhoneVerified ? (
            <PhoneVerification onVerificationComplete={handlePhoneVerificationComplete} />
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Sign in to your account
                </h2>
                <div className="h-1 w-24 bg-blue-600 mx-auto mb-6"></div>
                <p className="text-gray-600 text-sm">
                  Get started with Google authentication
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <img
                    className="h-5 w-5 mr-2"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google Logo"
                  />
                  Continue with Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
