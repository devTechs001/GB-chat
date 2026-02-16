import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms and Conditions</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Last updated:</strong> February 16, 2026
          </p>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Welcome to GBChat! These terms and conditions outline the rules and regulations for the use of 
              GBChat's Application.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              By accessing this application, we assume you accept these terms and conditions. Do not continue 
              to use GBChat if you do not agree to take all of the terms and conditions stated on this page.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">2. Intellectual Property Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Unless otherwise stated, GBChat and/or its licensors own the intellectual property rights for 
              all material on GBChat. All intellectual property rights are reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              You are granted a limited license to access and use our application for personal, non-commercial 
              purposes in accordance with these terms.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">3. Restrictions</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              You are specifically restricted from all of the following:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Publishing any Application content in any media without prior written consent</li>
              <li>Selling, sublicensing, and/or commercializing Application content</li>
              <li>Using the Application in any way that is or may be damaging to the Application or affects 
                  user access negatively</li>
              <li>Engaging in data mining, data harvesting, or similar extraction activities</li>
              <li>Uploading or transmitting viruses, worms, or other harmful computer code</li>
              <li>Engaging in any conduct that restricts or inhibits anyone's use of the Application</li>
              <li>Making improper use of our services or forms to submit queries unrelated to support</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">4. User Content</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              In these Terms and Conditions, "Your Content" shall mean any audio, video, text, images, 
              or other material you choose to display on this Application. By displaying Your Content, 
              you grant GBChat a non-exclusive, worldwide, irrevocable, royalty-free, sublicensable 
              license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Your Content must be your own and must not be offensive, unlawful, misleading, or infringe 
              on intellectual property rights. GBChat reserves the right to remove any of Your Content 
              from this Application at any time.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">5. No Warranties</h2>
            <p className="text-gray-600 dark:text-gray-300">
              The Application is provided "as is," with all faults, and GBChat makes no representations 
              or warranties of any kind concerning the Application. GBChat disclaims all warranties by 
              law, whether express or implied.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300">
              In no event shall GBChat, nor any of its officers, directors, employees, or affiliates, 
              be liable for anything arising out of or in any way connected with your use of this 
              Application, whether such liability is under contract, tort, or otherwise.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">7. Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your privacy is important to us. Please review our Privacy Policy to understand how we 
              collect, use, and protect your personal information. By using our Application, you consent 
              to the collection and use of your information as described in our Privacy Policy.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">8. Changes to These Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              GBChat reserves the right to revise these terms at any time as we see fit, and by using 
              this Application you are expected to review these terms regularly.
            </p>
          </section>
          
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you have any questions about these Terms and Conditions, please contact us at: 
              support@gbchat.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;