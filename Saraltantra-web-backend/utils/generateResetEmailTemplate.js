const generatePasswordResetEmail = (resetLink, fname = "User") => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
      <!-- Header -->
      <div style="background-color: #003D93; color: #ffffff; padding: 20px; text-align: center;">
        <img src="https://res.cloudinary.com/davmrc5zy/image/upload/v1737703134/logo_bdhepd.png" alt="Sajilotantra Logo" style="width: 80px; border-radius: 50%; margin-bottom: 10px;">
        <h1 style="font-size: 24px; margin: 0;">Password Reset Request</h1>
      </div>

      <!-- Content -->
      <div style="padding: 20px; text-align: left;">
        <p style="font-size: 16px; margin: 0; margin-bottom: 10px;">
          Hello <strong>${fname}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0; margin-bottom: 20px;">
          You recently requested to reset your password. Click the button below to proceed with resetting your password:
        </p>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${resetLink}" style="background-color: #003D93; color: #ffffff; text-decoration: none; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #555; margin: 0; margin-bottom: 20px;">
          If you did not request this password reset, please ignore this email. This link will expire in <strong>10 minutes</strong>.
        </p>
        <p style="font-size: 16px; margin: 0; margin-bottom: 10px;">
          Thank you,<br>
          <strong>Sajilotantra Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Sajilotantra. All rights reserved.</p>
        <p style="margin: 5px 0;">
          <a href="https://yourcompany.com/terms" style="color: #003D93; text-decoration: none;">Terms of Service</a> | 
          <a href="https://yourcompany.com/privacy" style="color: #003D93; text-decoration: none;">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
`;

export default generatePasswordResetEmail;
