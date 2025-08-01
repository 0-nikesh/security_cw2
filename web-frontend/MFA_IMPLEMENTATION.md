# MFA (Multi-Factor Authentication) Implementation Documentation

## Overview
Multi-Factor Authentication (MFA) is implemented to add an extra layer of security to user accounts. It uses Google Authenticator for generating time-based one-time passwords (TOTP).

---

## Where MFA is Implemented

### 1. **Settings Page**
- **File:** `src/core/private/settings.jsx`
- **Purpose:** Allows users to enable or disable MFA for their account.
- **How:**
  - Displays current MFA status (Enabled/Disabled).
  - Integrates the `MFASetup` component for setup and verification.
  - Calls backend endpoints to enable/disable MFA.

### 2. **MFA Setup Component**
- **File:** `src/components/MFASetup.jsx`
- **Purpose:** Guides users through the MFA setup process.
- **How:**
  - Generates a QR code and secret key for Google Authenticator via `/api/mfa/setup`.
  - User scans QR code or enters secret in Google Authenticator.
  - User enters the 6-digit code from the app to verify and enable MFA via `/api/mfa/verify`.
  - Handles errors and loading states.

### 3. **Login Page**
- **Files:**
  - `src/core/public/login/form.jsx`
  - `src/core/public/login/index.jsx`
- **Purpose:** Requires MFA code during login if enabled for the account.
- **How:**
  - After entering email and password, if MFA is enabled, the login form displays an input for the 6-digit MFA code.
  - The code is validated with the backend during login.
  - If MFA is not enabled, login proceeds as usual.

---

## Backend Endpoints Used
- `POST /api/mfa/setup` — Generates QR code and secret for Google Authenticator.
- `POST /api/mfa/verify` — Verifies the 6-digit code and enables MFA.
- `POST /api/mfa/disable` — Disables MFA for the user.
- `POST /api/users/login` — Handles login, requires MFA code if enabled.

---

## User Flow
1. **Enable MFA:**
   - Go to Settings → Security Settings → Enable MFA.
   - Scan QR code with Google Authenticator.
   - Enter the 6-digit code to verify and enable MFA.
2. **Login with MFA:**
   - Enter email and password.
   - If MFA is enabled, enter the 6-digit code from Google Authenticator.
   - Login completes only if the code is correct.
3. **Disable MFA:**
   - Go to Settings → Security Settings → Disable MFA.
   - Confirm action to remove MFA protection.

---

## Security Benefits
- Prevents unauthorized access even if password is compromised.
- Uses industry-standard TOTP via Google Authenticator.
- All sensitive actions (enable/disable/verify) require authentication.

---

## Files to Review for MFA Logic
- `src/core/private/settings.jsx`
- `src/components/MFASetup.jsx`
- `src/core/public/login/form.jsx`
- `src/core/public/login/index.jsx`

---

## Notes
- MFA status is checked and enforced on both frontend and backend.
- Error handling and user feedback are provided for all MFA actions.
- The UI guides users through setup, verification, and login steps.
