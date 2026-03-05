import React from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const AboutSection = () => {
  const features = [
    { name: 'End-to-End Encryption', icon: LockClosedIcon, description: 'Your messages are secured with military-grade encryption' },
    { name: 'Cross-Platform Sync', icon: GlobeAltIcon, description: 'Seamlessly switch between devices without losing context' },
    { name: 'AI-Powered Features', icon: SparklesIcon, description: 'Smart replies, message suggestions, and intelligent assistance' },
    { name: 'Group Messaging', icon: UserGroupIcon, description: 'Connect with up to 256 people in a single group' },
    { name: 'Rich Media Sharing', icon: ChatBubbleLeftRightIcon, description: 'Share photos, videos, documents, and voice messages' },
    { name: 'Privacy First', icon: ShieldCheckIcon, description: 'Your data belongs to you - we never sell or share it' },
  ];

  const team = [
    { role: 'Development', color: 'from-blue-500 to-cyan-500' },
    { role: 'Design', color: 'from-purple-500 to-pink-500' },
    { role: 'Security', color: 'from-green-500 to-emerald-500' },
    { role: 'Support', color: 'from-orange-500 to-amber-500' },
  ];

  const stats = [
    { label: 'Active Users', value: '10M+' },
    { label: 'Messages Daily', value: '500M+' },
    { label: 'Countries', value: '150+' },
    { label: 'Languages', value: '45+' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <HeartIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">GBChat</h2>
              <p className="text-white/80 text-sm">Version 2.0.0</p>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Connecting people through innovative technology while respecting privacy and user experience.
            Built with love for communities worldwide.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Mission</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          GBChat is committed to providing a secure, reliable, and feature-rich communication platform 
          that empowers individuals and communities. We believe in privacy as a fundamental right, 
          innovation as a driving force, and inclusivity as a core value. Our goal is to break down 
          communication barriers while giving users full control over their data and experience.
        </p>
      </motion.div>

      {/* Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <feature.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{feature.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Built By</h3>
        <div className="flex flex-wrap gap-3">
          {team.map((member) => (
            <div
              key={member.role}
              className={`px-4 py-2 rounded-full bg-gradient-to-r ${member.color} text-white text-sm font-medium`}
            >
              {member.role}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <CodeBracketIcon className="w-4 h-4" />
          <span>Powered by modern web technologies</span>
        </div>
      </motion.div>

      {/* Legal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal Information</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <a
                href="/terms"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms and Conditions
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Understanding your rights and responsibilities when using GBChat
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <a
                href="/privacy"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                How we collect, use, and protect your personal information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Have questions, feedback, or need support? We're here to help!
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="font-medium">Email:</span>
            <a href="mailto:support@gbchat.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@gbchat.com
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="font-medium">Support Hours:</span>
            <span>24/7</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="font-medium">Response Time:</span>
            <span>Within 24 hours</span>
          </div>
        </div>
      </motion.div>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p>© {new Date().getFullYear()} GBChat. All rights reserved.</p>
        <p className="mt-1">Made with ❤️ for users worldwide</p>
      </div>
    </div>
  );
};

export default AboutSection;
