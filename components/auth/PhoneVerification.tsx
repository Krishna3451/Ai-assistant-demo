'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PhoneVerificationProps {
  onVerificationComplete: () => void;
}

export default function PhoneVerification({ onVerificationComplete }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format phone number to E.164 format
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = '+' + phoneNumber;
      }

      const response = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('code');
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending code:', error);
      setError('Network error: Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format phone number to E.164 format
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = '+' + phoneNumber;
      }

      const response = await fetch('/api/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: formattedNumber, 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (data.success && data.valid) {
        onVerificationComplete();
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Network error: Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {step === 'phone' ? 'Verify Your Phone' : 'Enter Verification Code'}
        </h2>
        <div className="h-1 w-24 bg-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-sm mb-8">
          {step === 'phone'
            ? 'Please enter your phone number to receive a verification code'
            : 'Enter the verification code sent to your phone'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="^\+?[1-9]\d{1,14}$"
                  title="Please enter a valid phone number with country code (e.g., +1234567890)"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">📱</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Include country code (e.g., +1 for US)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  pattern="\d{6}"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
            >
              Change phone number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
