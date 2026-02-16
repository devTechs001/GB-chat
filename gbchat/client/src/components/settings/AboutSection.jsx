import React from 'react';

const AboutSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About GBChat</h2>
        <p className="text-gray-600 dark:text-gray-300">
          GBChat is a modern messaging platform designed to provide secure, reliable, and 
          feature-rich communication experiences. Our mission is to connect people through 
          innovative technology while respecting privacy and user experience.
        </p>
      </div>

      <div className="pt-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Legal Information</h3>
        <div className="flex flex-wrap gap-4">
          <a 
            href="/terms" 
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </a>
          <a 
            href="/privacy" 
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Contact Us</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Have questions or feedback? Reach out to us at support@gbchat.com
        </p>
      </div>
    </div>
  );
};

export default AboutSection;