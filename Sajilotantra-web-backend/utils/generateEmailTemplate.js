// utils/emailTemplates.js

export const generateEmailTemplate = (otp, fname = "User") => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #003D93; color: white; padding: 20px; text-align: center;">
      <img src="https://res.cloudinary.com/davmrc5zy/image/upload/v1737703134/logo_bdhepd.png" alt="Sajilotantra" style="width: 100px; margin-bottom: 10px;">
      <h1>Your OTP for Registration</h1>
    </div>
    <div style="padding: 20px;">
      <p>Hello <strong>${fname}</strong>,</p>
      <p>Your OTP for registration is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #DB133C; text-align: center;">${otp}</p>
      <p>This OTP will expire in <strong>1 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you,<br>Sajilotantra</p>
    </div>
    <div style="background-color: #f9f9f9; text-align: center; padding: 10px; font-size: 12px; color: #777;">
      <p>© ${new Date().getFullYear()} Sajilotantra. All rights reserved.</p>
      <p>
        <a href="https://yourcompany.com/terms" style="color: #003D93; text-decoration: none;">Terms of Service</a> | 
        <a href="https://yourcompany.com/privacy" style="color: #003D93; text-decoration: none;">Privacy Policy</a>
      </p>
    </div>
  </div>
`;
