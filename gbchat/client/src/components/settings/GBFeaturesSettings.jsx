import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Palette,
  MessageSquare,
  Image,
  Users,
  Zap,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Pin,
  Send,
  Filter,
  Check,
  X,
  Settings,
  Moon,
  Sun,
  Type,
  Home,
  Smartphone
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GBFeaturesSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('privacy');
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGBFeatures();
  }, []);

  const fetchGBFeatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gb-features', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeatures(response.data.data);
    } catch (error) {
      console.error('Error fetching GB features:', error);
      toast.error('Failed to load GB features');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (section, feature) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/gb-features/toggle',
        { section, feature },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeatures(response.data.data);
      toast.success(`Feature ${response.data.data[section][feature] ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle feature');
    }
  };

  const updateSection = async (section, data) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/gb-features',
        { section, data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeatures(response.data.data);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'customization', label: 'Themes', icon: Palette },
    { id: 'messaging', label: 'Messages', icon: MessageSquare },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 md:p-6 flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold">GB Features</h1>
        <p className="text-green-100 text-sm mt-1">
          Unlock advanced WhatsApp features
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {activeTab === 'privacy' && (
          <PrivacySettings
            features={features}
            onToggle={toggleFeature}
            onUpdate={updateSection}
          />
        )}
        {activeTab === 'customization' && (
          <CustomizationSettings
            features={features}
            onToggle={toggleFeature}
            onUpdate={updateSection}
          />
        )}
        {activeTab === 'messaging' && (
          <MessagingSettings
            features={features}
            onToggle={toggleFeature}
            onUpdate={updateSection}
          />
        )}
        {activeTab === 'media' && (
          <MediaSettings
            features={features}
            onToggle={toggleFeature}
            onUpdate={updateSection}
          />
        )}
        {activeTab === 'groups' && (
          <GroupSettings
            features={features}
            onToggle={toggleFeature}
            onUpdate={updateSection}
          />
        )}
        {activeTab === 'advanced' && (
          <AdvancedSettings
            features={features}
            onToggle={toggleFeature}
            onUpdate={updateSection}
          />
        )}
      </div>
    </div>
  );
};

// Privacy Settings Component
const PrivacySettings = ({ features, onToggle, onUpdate }) => {
  const privacy = features?.privacy || {};

  const toggleItems = [
    {
      key: 'hideOnlineStatus',
      title: 'Hide Online Status',
      description: 'Appear offline while still seeing others online',
      icon: EyeOff
    },
    {
      key: 'freezeLastSeen',
      title: 'Freeze Last Seen',
      description: 'Keep your last seen timestamp frozen',
      icon: Clock
    },
    {
      key: 'hideBlueTicks',
      title: 'Hide Blue Ticks',
      description: 'Send messages without read receipts',
      icon: Eye
    },
    {
      key: 'hideSecondTick',
      title: 'Hide Second Tick',
      description: 'Hide message delivery ticks',
      icon: Check
    },
    {
      key: 'hideForwardLabel',
      title: 'Hide Forward Label',
      description: 'Forward messages without "Forwarded" label',
      icon: Send
    },
    {
      key: 'antiStatusView',
      title: 'Anti-Status View',
      description: 'View status without sender knowing',
      icon: EyeOff
    },
    {
      key: 'antiDeleteStatus',
      title: 'Anti-Delete Status',
      description: 'Save status before it gets deleted',
      icon: Shield
    },
    {
      key: 'antiRevoke',
      title: 'Anti-Revoke',
      description: 'Prevent message deletion by sender',
      icon: Lock
    },
    {
      key: 'viewOnceBypass',
      title: 'View Once Bypass',
      description: 'Save view-once media',
      icon: Image
    },
    {
      key: 'incognitoMode',
      title: 'Incognito Mode',
      description: 'Browse without leaving traces',
      icon: Shield
    }
  ];

  return (
    <div className="space-y-3">
      {toggleItems.map((item) => {
        const Icon = item.icon;
        const enabled = privacy[item.key] || false;

        return (
          <div
            key={item.key}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    enabled
                      ? 'bg-green-100 dark:bg-green-900 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggle('privacy', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Customization Settings Component
const CustomizationSettings = ({ features, onToggle, onUpdate }) => {
  const customization = features?.customization || {};
  const [selectedTheme, setSelectedTheme] = useState(
    customization.customTheme?.themeId || 'default'
  );
  const [selectedFont, setSelectedFont] = useState(
    customization.customFont?.fontFamily || 'Inter'
  );
  const [fontSize, setFontSize] = useState(
    customization.customFont?.fontSize || 14
  );
  const [primaryColor, setPrimaryColor] = useState(
    customization.customTheme?.primaryColor || '#25D366'
  );

  const themes = [
    { id: 'default', name: 'Default', colors: ['#25D366', '#128C7E'] },
    { id: 'dark', name: 'Dark', colors: ['#1a1a1a', '#2d2d2d'] },
    { id: 'blue', name: 'Ocean', colors: ['#007bff', '#0056b3'] },
    { id: 'purple', name: 'Royal', colors: ['#6f42c1', '#563d7c'] },
    { id: 'red', name: 'Passion', colors: ['#dc3545', '#c82333'] },
    { id: 'orange', name: 'Sunset', colors: ['#fd7e14', '#e36a0d'] },
    { id: 'pink', name: 'Rose', colors: ['#e83e8c', '#d63384'] },
    { id: 'teal', name: 'Nature', colors: ['#20c997', '#1aa179'] }
  ];

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Merriweather'
  ];

  const iconPacks = ['default', 'minimal', 'colorful', 'outline'];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Theme Selection
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setSelectedTheme(theme.id);
                onUpdate('customization', {
                  customTheme: {
                    ...customization.customTheme,
                    themeId: theme.id,
                    primaryColor: theme.colors[0],
                    secondaryColor: theme.colors[1]
                  }
                });
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id
                  ? 'border-green-600 ring-2 ring-green-200'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div
                className="w-full h-8 rounded mb-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                }}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {theme.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Custom Colors
        </h3>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Primary Color
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm font-mono">{primaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Font Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Font Family
            </label>
            <select
              value={selectedFont}
              onChange={(e) => {
                setSelectedFont(e.target.value);
                onUpdate('customization', {
                  customFont: {
                    ...customization.customFont,
                    fontFamily: e.target.value,
                    fontSize
                  }
                });
              }}
              className="mt-1 w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>
      </div>

      {/* Icon Pack */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Icon Pack
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {iconPacks.map((pack) => (
            <button
              key={pack}
              onClick={() =>
                onUpdate('customization', {
                  ...customization,
                  iconPack: pack
                })
              }
              className={`p-3 rounded-lg border-2 transition-all capitalize ${
                customization.iconPack === pack
                  ? 'border-green-600 ring-2 ring-green-200'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs">{pack}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Widget Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Home Screen Widget
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Show chat widget on home screen
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdate('customization', {
                widgetSettings: {
                  ...customization.widgetSettings,
                  enabled: !customization.widgetSettings?.enabled
                }
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              customization.widgetSettings?.enabled
                ? 'bg-green-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                customization.widgetSettings?.enabled
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// Messaging Settings Component
const MessagingSettings = ({ features, onToggle, onUpdate }) => {
  const messaging = features?.messaging || {};

  return (
    <div className="space-y-4">
      {/* Schedule Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Schedule Messages
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send messages at scheduled times
              </p>
            </div>
          </div>
          <button
            onClick={() => onToggle('messaging', 'scheduleMessages')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              messaging.scheduleMessages
                ? 'bg-green-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                messaging.scheduleMessages ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Auto Delete */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Auto-Delete Messages
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically delete messages after timer
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdate('messaging', {
                autoDelete: {
                  ...messaging.autoDelete,
                  enabled: !messaging.autoDelete?.enabled
                }
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              messaging.autoDelete?.enabled
                ? 'bg-green-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                messaging.autoDelete?.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {messaging.autoDelete?.enabled && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '24h', value: 24 },
              { label: '2d', value: 48 },
              { label: '7d', value: 168 },
              { label: '30d', value: 720 }
            ].map((timer) => (
              <button
                key={timer.value}
                onClick={() =>
                  onUpdate('messaging', {
                    autoDelete: { ...messaging.autoDelete, timer: timer.value }
                  })
                }
                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                  messaging.autoDelete.timer === timer.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {timer.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DND Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Moon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Do Not Disturb
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Silence notifications during scheduled time
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdate('messaging', {
                dndMode: {
                  ...messaging.dndMode,
                  enabled: !messaging.dndMode?.enabled
                }
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              messaging.dndMode?.enabled
                ? 'bg-green-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                messaging.dndMode?.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {messaging.dndMode?.enabled && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Start Time
              </label>
              <input
                type="time"
                value={messaging.dndMode.startTime || '22:00'}
                onChange={(e) =>
                  onUpdate('messaging', {
                    dndMode: {
                      ...messaging.dndMode,
                      startTime: e.target.value
                    }
                  })
                }
                className="mt-1 w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                End Time
              </label>
              <input
                type="time"
                value={messaging.dndMode.endTime || '07:00'}
                onChange={(e) =>
                  onUpdate('messaging', {
                    dndMode: {
                      ...messaging.dndMode,
                      endTime: e.target.value
                    }
                  })
                }
                className="mt-1 w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Filters Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <Filter className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Chat Filters
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Organize chats with custom filters
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create custom filters to organize your chats by category (e.g., Work,
          Family, Friends). Filters appear at the top of your chat list for
          quick access.
        </p>
      </div>
    </div>
  );
};

// Media Settings Component
const MediaSettings = ({ features, onToggle, onUpdate }) => {
  const media = features?.media || {};

  return (
    <div className="space-y-3">
      {[
        {
          key: 'hdUpload',
          title: 'HD Quality Upload',
          description: 'Upload photos and videos in HD quality',
          icon: Image
        },
        {
          key: 'mediaZoom',
          title: 'Media Zoom',
          description: 'Pinch to zoom on images and videos',
          icon: Image
        },
        {
          key: 'galleryViewer',
          title: 'Gallery Viewer',
          description: 'Built-in gallery viewer for media',
          icon: Image
        },
        {
          key: 'autoSaveStatus',
          title: 'Auto-Save Status',
          description: 'Automatically save viewed status updates',
          icon: Shield
        }
      ].map((item) => {
        const Icon = item.icon;
        const enabled = media[item.key] || false;

        return (
          <div
            key={item.key}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    enabled
                      ? 'bg-green-100 dark:bg-green-900 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggle('media', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        );
      })}

      {/* Auto-Download Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mt-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          Auto-Download Settings
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile Data
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {['photos', 'videos', 'audio', 'documents'].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    onUpdate('media', {
                      autoDownload: {
                        ...media.autoDownload,
                        mobileData: {
                          ...media.autoDownload?.mobileData,
                          [type]: !media.autoDownload?.mobileData?.[type]
                        }
                      }
                    })
                  }
                  className={`p-2 rounded text-xs capitalize ${
                    media.autoDownload?.mobileData?.[type]
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wi-Fi
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {['photos', 'videos', 'audio', 'documents'].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    onUpdate('media', {
                      autoDownload: {
                        ...media.autoDownload,
                        wifi: {
                          ...media.autoDownload?.wifi,
                          [type]: !media.autoDownload?.wifi?.[type]
                        }
                      }
                    })
                  }
                  className={`p-2 rounded text-xs capitalize ${
                    media.autoDownload?.wifi?.[type]
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Group Settings Component
const GroupSettings = ({ features, onToggle, onUpdate }) => {
  const groups = features?.groups || {};

  return (
    <div className="space-y-3">
      {[
        {
          key: 'joinViaLink',
          title: 'Join Groups via Link',
          description: 'Join groups directly from invitation links',
          icon: Users
        },
        {
          key: 'autoJoinGroups',
          title: 'Auto-Join Groups',
          description: 'Automatically join suggested groups',
          icon: Users
        }
      ].map((item) => {
        const Icon = item.icon;
        const enabled = groups[item.key] || false;

        return (
          <div
            key={item.key}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    enabled
                      ? 'bg-green-100 dark:bg-green-900 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggle('groups', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        );
      })}

      {/* Group Info Customization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Group Info Customization
        </h3>
        <div className="space-y-3">
          {[
            {
              key: 'customGroupIcons',
              label: 'Custom Group Icons'
            },
            {
              key: 'groupDescription',
              label: 'Extended Group Description'
            },
            {
              key: 'groupRules',
              label: 'Group Rules'
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {setting.label}
              </span>
              <button
                onClick={() =>
                  onUpdate('groups', {
                    groupInfoCustomization: {
                      ...groups.groupInfoCustomization,
                      [setting.key]: !groups.groupInfoCustomization?.[setting.key]
                    }
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  groups.groupInfoCustomization?.[setting.key]
                    ? 'bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    groups.groupInfoCustomization?.[setting.key]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Advanced Settings Component
const AdvancedSettings = ({ features, onToggle, onUpdate }) => {
  const advanced = features?.advanced || {};

  return (
    <div className="space-y-3">
      {[
        {
          key: 'copySentMessages',
          title: 'Copy Sent Messages',
          description: 'Keep copy of sent messages in clipboard',
          icon: MessageSquare
        },
        {
          key: 'extendedStatusLimit',
          title: 'Extended Status Limit',
          description: 'Upload 60-second status (instead of 30s)',
          icon: Clock
        },
        {
          key: 'exactTimestamps',
          title: 'Exact Timestamps',
          description: 'Show exact time instead of relative',
          icon: Clock
        },
        {
          key: 'confirmClearChats',
          title: 'Confirm Clear Chats',
          description: 'Ask for confirmation before clearing chats',
          icon: Shield
        },
        {
          key: 'archiveOnSwipe',
          title: 'Archive on Swipe',
          description: 'Archive chats by swiping left',
          icon: Filter
        },
        {
          key: 'enterToSend',
          title: 'Enter to Send',
          description: 'Press Enter to send messages',
          icon: Send
        },
        {
          key: 'doubleTapToReply',
          title: 'Double Tap to Reply',
          description: 'Double tap message to reply',
          icon: MessageSquare
        }
      ].map((item) => {
        const Icon = item.icon;
        const enabled = advanced[item.key] || false;

        return (
          <div
            key={item.key}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    enabled
                      ? 'bg-green-100 dark:bg-green-900 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggle('advanced', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        );
      })}

      {/* Call Quality */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mt-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Maximum Call Quality
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {['SD', 'HD', 'FHD'].map((quality) => (
            <button
              key={quality}
              onClick={() =>
                onUpdate('advanced', {
                  maxCallQuality: quality
                })
              }
              className={`p-3 rounded-lg font-medium transition-all ${
                advanced.maxCallQuality === quality
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {quality}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GBFeaturesSettings;
