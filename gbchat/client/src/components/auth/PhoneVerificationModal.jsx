import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PhoneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import useAuthStore from '../../store/useAuthStore';

const PhoneVerificationModal = ({ isOpen, onClose, onSuccess }) => {
  const { initiatePhoneVerification, phoneLogin, resendVerificationCode, isLoading } = useAuthStore();
  const [step, setStep] = useState('phone'); // 'phone' or 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);

  const validatePhone = () => {
    const newErrors = {};
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    if (!code) {
      newErrors.code = 'Verification code is required';
    } else if (code.length !== 6) {
      newErrors.code = 'Code must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validatePhone()) return;

    const result = await initiatePhoneVerification(phone);
    if (result.success) {
      setStep('code');
      setCountdown(60); // Start 60-second countdown
      startCountdown();
    }
  };

  const startCountdown = () => {
    let timeLeft = 60;
    setCountdown(timeLeft);
    const timer = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) return;

    const result = await phoneLogin(phone, code);
    if (result.success) {
      onSuccess();
      onClose();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return; // Prevent spamming

    const result = await resendVerificationCode(phone);
    if (result.success) {
      setCountdown(60);
      startCountdown();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  {step === 'phone' ? 'Enter Phone Number' : 'Verify Code'}
                </Dialog.Title>

                {step === 'phone' ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`block w-full pl-10 pr-3 py-2 border ${
                            errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        loading={isLoading}
                        disabled={isLoading}
                      >
                        Send Code
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Enter the 6-digit code sent to <span className="font-semibold">{phone}</span>
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className={`block w-full px-3 py-2 border ${
                          errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
                        placeholder="123456"
                      />
                      {errors.code && (
                        <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Didn't receive the code?
                      </p>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={countdown > 0}
                        className={`text-sm font-medium ${
                          countdown > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-primary-600 hover:text-primary-500'
                        }`}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                      </button>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStep('phone')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        loading={isLoading}
                        disabled={isLoading}
                      >
                        Verify
                      </Button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PhoneVerificationModal;