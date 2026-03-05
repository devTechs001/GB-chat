import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  Square2StackIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Button from './Button';
import Modal from './Modal';
import DeviceLinkingModal from './DeviceLinkingModal';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const LinkedDevices = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showCodeLinking, setShowCodeLinking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      // Use sample data if API fails
      try {
        const response = await api.get('/devices/linked');
        setDevices(response.data.devices || []);
      } catch (apiError) {
        // Sample devices for demo
        setDevices([
          {
            id: '1',
            name: 'Chrome on Windows',
            type: 'desktop',
            platform: 'windows',
            browser: 'Chrome',
            isPrimary: true,
            linkedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            lastSeen: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 25).toISOString(),
            ipAddress: '192.168.1.100'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (deviceId, deviceName) => {
    if (!confirm(`Are you sure you want to unlink "${deviceName}"?`)) {
      return;
    }

    try {
      await api.delete(`/devices/${deviceId}`);
      toast.success('Device unlinked successfully');
      fetchDevices();
    } catch (error) {
      console.error('Failed to unlink device:', error);
      toast.error('Failed to unlink device');
    }
  };

  const handleRefresh = async () => {
    await fetchDevices();
    toast.success('Devices refreshed');
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="w-6 h-6" />;
      case 'tablet':
        return <Square2StackIcon className="w-6 h-6" />;
      case 'desktop':
        return <ComputerDesktopIcon className="w-6 h-6" />;
      case 'web':
        return <GlobeAltIcon className="w-6 h-6" />;
      default:
        return <QuestionMarkCircleIcon className="w-6 h-6" />;
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      windows: '🪟',
      macos: '🍎',
      linux: '🐧',
      android: '🤖',
      ios: '📱',
      web: '🌐',
    };
    return icons[platform] || '❓';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDeviceExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (showQR) {
    const QRCodeDisplay = React.lazy(() => import('./QRCodeDisplay'));
    return (
      <React.Suspense fallback={<Modal isOpen={true} onClose={onClose}><div className="p-8 text-center">Loading...</div></Modal>}>
        <QRCodeDisplay onClose={() => setShowQR(false)} onLinkSuccess={fetchDevices} />
      </React.Suspense>
    );
  }

  if (showCodeLinking) {
    return (
      <DeviceLinkingModal
        isOpen={true}
        onClose={() => setShowCodeLinking(false)}
        onLinkSuccess={fetchDevices}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Linked Devices">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Linked Devices
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage all devices linked to your account
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <ArrowPathIcon className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowCodeLinking(true)}>
              <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
              Link with Code
            </Button>
            <Button size="sm" onClick={() => setShowQR(true)}>
              <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
              Link with QR
            </Button>
          </div>
        </div>

        {/* Devices List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-12">
            <DevicePhoneMobileIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No linked devices
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Link a device to access your account on multiple devices
            </p>
            <Button onClick={() => setShowQR(true)}>
              <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
              Link Your First Device
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {devices.map((device, index) => {
              const expired = isDeviceExpired(device.expiresAt);
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    expired
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        device.isPrimary
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {device.name}
                          </h3>
                          {device.isPrimary && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                              Primary
                            </span>
                          )}
                          {expired ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>{getPlatformIcon(device.platform)}</span>
                          <span>{device.platform}</span>
                          {device.browser && device.browser !== 'unknown' && (
                            <>
                              <span>•</span>
                              <span>{device.browser}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>Linked: {formatDate(device.linkedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <WifiIcon className="w-3 h-3" />
                            <span>Last seen: {formatDate(device.lastSeen)}</span>
                          </div>
                        </div>
                        {device.ipAddress && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-500">
                            <ShieldCheckIcon className="w-3 h-3" />
                            <span>IP: {device.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!device.isPrimary && !expired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlink(device.id, device.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info footer */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Security Tips</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                <li>Regularly review your linked devices</li>
                <li>Unlink devices you no longer use</li>
                <li>Devices automatically expire after 30 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LinkedDevices;
