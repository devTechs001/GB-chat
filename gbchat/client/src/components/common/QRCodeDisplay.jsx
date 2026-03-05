import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCodeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const QRCodeDisplay = ({ onClose, onLinkSuccess }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [linked, setLinked] = useState(false);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    generateQR();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (expiresAt && !linked) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const diff = expiry - now;
        
        if (diff <= 0) {
          setTimeLeft(0);
          handleRefreshQR();
        } else {
          setTimeLeft(diff);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [expiresAt, linked]);

  useEffect(() => {
    if (deviceId && !linked) {
      pollIntervalRef.current = setInterval(() => {
        checkQRStatus();
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [deviceId, linked]);

  const generateQR = async () => {
    try {
      setLoading(true);
      const response = await api.post('/devices/generate-qr');
      const { qrCode, deviceId, expiresAt } = response.data;
      
      setQrCode(qrCode);
      setDeviceId(deviceId);
      setExpiresAt(expiresAt);
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate QR:', error);
      toast.error('Failed to generate QR code');
      setLoading(false);
    }
  };

  const checkQRStatus = async () => {
    try {
      const response = await api.get(`/devices/qr-status/${deviceId}`);
      const { isActive, linkedAt } = response.data;
      
      if (isActive && linkedAt) {
        setLinked(true);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        toast.success('Device linked successfully!');
        setTimeout(() => {
          onLinkSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const handleRefreshQR = async () => {
    await generateQR();
    toast.info('QR code refreshed');
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
            <QrCodeIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Link a Device
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Scan the QR code to link this device to your account
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : linked ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircleSolid className="w-20 h-20 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Device Linked!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your device has been successfully linked
            </p>
          </motion.div>
        ) : (
          <>
            <div className="relative">
              <div className="bg-white p-4 rounded-xl shadow-lg inline-block mx-auto">
                {qrCode && (
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                )}
              </div>
              
              {/* Expiry indicator */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full border border-yellow-300 dark:border-yellow-700">
                  <ClockIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Expires in {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <DevicePhoneMobileIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-1">On your mobile device:</p>
                  <p>Open GBChat → Settings → Linked Devices → Link Device</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-1">Secure Connection</p>
                  <p>Your data is encrypted end-to-end</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefreshQR}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh
              </Button>
              <Button onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QRCodeDisplay;
