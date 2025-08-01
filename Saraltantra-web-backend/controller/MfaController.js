import speakeasy from "speakeasy";
import qrcode from "qrcode";
import User from "../model/User.js";

// Generate MFA secret and QR code for Google Authenticator
export const generateMfaSecret = async (req, res) => {
    const userId = req.user._id;
    const secret = speakeasy.generateSecret({ name: "Sajilotantra" });
    // Save secret.base32 to user's profile in DB
    await User.findByIdAndUpdate(userId, { mfaSecret: secret.base32 });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ secret: secret.base32, qrCodeUrl });
};

// Verify MFA token during login
export const verifyMfaToken = async (req, res) => {
    const { token } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || !user.mfaSecret) {
        return res.status(400).json({ message: "MFA not enabled for this user." });
    }
    const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token
    });
    if (verified) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid MFA code" });
    }
};
