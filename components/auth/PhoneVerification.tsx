'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

interface PhoneVerificationProps {
  onVerificationComplete: () => void;
}

export default function PhoneVerification({ onVerificationComplete }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        }
      });
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setupRecaptcha();
      
      // Format phone number to E.164 format
      let formattedNumber = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedNumber = '+' + phoneNumber;
      }

      const confirmation = await signInWithPhoneNumber(
        auth, 
        formattedNumber, 
        (window as any).recaptchaVerifier
      );
      
      setConfirmationResult(confirmation);
      setStep('code');
    } catch (error: any) {
      console.error('Error sending code:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      if (result.user) {
        onVerificationComplete();
      } else {
        setError('Verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Phone Verification</h2>
      
      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
