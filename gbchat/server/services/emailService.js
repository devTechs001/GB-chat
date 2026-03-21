import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.from - Sender email (optional, defaults to EMAIL_USER)
 * @returns {Promise<Object>} - Email send result
 */
export const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: from || process.env.EMAIL_USER || 'GBChat <noreply@gbchat.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for plain text
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    
    // In development, log but don't fail
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Development mode - Email not sent, but continuing...');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      return {
        success: true,
        messageId: 'dev-mode',
        response: 'Development mode - email not sent'
      };
    }
    
    throw error;
  }
};

/**
 * Send verification email
 * @param {Object} options - Verification email options
 * @param {string} options.to - Recipient email
 * @param {string} options.verificationLink - Verification link
 * @param {string} options.type - Type of verification (email, password_reset, etc.)
 */
export const sendVerificationEmail = async ({ to, verificationLink, type = 'email' }) => {
  const subjectMap = {
    email: 'Verify Your Email - GBChat',
    password_reset: 'Password Reset - GBChat',
    account_recovery: 'Account Recovery - GBChat',
    email_change: 'Verify New Email - GBChat'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #25D366; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .link { word-break: break-all; color: #25D366; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GBChat</h1>
          <p>Secure Messaging Platform</p>
        </div>
        <div class="content">
          <h2>${subjectMap[type] || 'Verify Your Email'}</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verificationLink}" class="button">Verify Email</a>
          <p>Or copy and paste this link:</p>
          <p class="link">${verificationLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} GBChat. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject: subjectMap[type], html });
};

/**
 * Send welcome email
 * @param {Object} options - Welcome email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User name
 */
export const sendWelcomeEmail = async ({ to, name }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #25D366; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to GBChat! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${name || 'there'}!</h2>
          <p>Thanks for joining GBChat - the ultimate messaging platform.</p>
          
          <h3>Features you'll love:</h3>
          <div class="feature">🔒 End-to-end encryption for secure messages</div>
          <div class="feature">📸 Status updates that disappear after 24 hours</div>
          <div class="feature">👥 Group chats with up to 256 participants</div>
          <div class="feature">📞 HD voice and video calls</div>
          <div class="feature">🎨 Custom themes and personalization</div>
          
          <p>Get started by logging in and exploring all the features!</p>
          
          <p>Need help? Check out our documentation or contact support.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} GBChat. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to, subject: 'Welcome to GBChat! 🎉', html });
};

/**
 * Send backup email with attachment
 * @param {Object} options - Backup email options
 * @param {string} options.to - Recipient email
 * @param {string} options.backupData - Backup data (JSON string)
 * @param {string} options.type - Backup type (full, chats, contacts, etc.)
 */
export const sendBackupEmail = async ({ to, backupData, type = 'full' }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `GBChat Backup - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      html: `
        <h2>Your GBChat Backup</h2>
        <p>Your backup is attached to this email.</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p>Please store this email in a safe place.</p>
        <p><em>Note: This backup contains sensitive data. Do not share this email.</em></p>
      `,
      attachments: [{
        filename: `gbchat-backup-${type}-${Date.now()}.json`,
        content: backupData,
        contentType: 'application/json'
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Backup email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Backup email failed:', error.message);
    throw error;
  }
};

/**
 * Send notification email
 * @param {Object} options - Notification email options
 * @param {string} options.to - Recipient email
 * @param {string} options.type - Notification type (new_device, password_change, etc.)
 * @param {Object} options.details - Additional details
 */
export const sendNotificationEmail = async ({ to, type, details = {} }) => {
  const notificationTypes = {
    new_device: {
      subject: 'New Device Login - GBChat',
      html: (details) => `
        <h2>New Device Login Detected</h2>
        <p>We noticed a login from a new device:</p>
        <ul>
          <li><strong>Device:</strong> ${details.device || 'Unknown'}</li>
          <li><strong>Location:</strong> ${details.location || 'Unknown'}</li>
          <li><strong>Time:</strong> ${details.time || new Date().toLocaleString()}</li>
        </ul>
        <p>If this was you, you can safely ignore this email.</p>
        <p>If this wasn't you, please change your password immediately.</p>
      `
    },
    password_change: {
      subject: 'Password Changed - GBChat',
      html: (details) => `
        <h2>Your Password Was Changed</h2>
        <p>Your GBChat password was changed successfully.</p>
        <p><strong>Time:</strong> ${details.time || new Date().toLocaleString()}</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    },
    account_locked: {
      subject: 'Account Temporarily Locked - GBChat',
      html: (details) => `
        <h2>Account Temporarily Locked</h2>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p><strong>Time:</strong> ${details.time || new Date().toLocaleString()}</p>
        <p>The account will be automatically unlocked in 30 minutes.</p>
        <p>If you didn't attempt to login, please secure your account.</p>
      `
    }
  };

  const config = notificationTypes[type];
  if (!config) {
    throw new Error(`Unknown notification type: ${type}`);
  }

  const html = config.html(details);
  return await sendEmail({ to, subject: config.subject, html });
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendBackupEmail,
  sendNotificationEmail
};
