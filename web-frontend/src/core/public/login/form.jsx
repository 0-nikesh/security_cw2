import React, { useState } from "react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

// Use DOMPurify to sanitize input
function sanitizeInput(input) {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

const Form = ({ onSubmit, isLoading, error, setEmail, setPassword, mfaRequired, setMfaToken, mfaToken }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className={`w-full px-4 py-2 border ${
            error.email ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          onChange={(e) => setEmail(sanitizeInput(e.target.value))}
          required
        />
        {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
      </div>

      <div className="mb-6 relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          className={`w-full px-4 py-2 border ${
            error.password ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          onChange={(e) => setPassword(sanitizeInput(e.target.value))}
          required
        />
        <button
          type="button"
          className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "👁️‍🗨️" : "👁️"}
        </button>
        {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
      </div>

      {mfaRequired && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block text-blue-600 text-xl">
              <i className="fa-solid fa-shield-keyhole"></i>
            </span>
            <span className="font-semibold text-gray-800">Multi-Factor Authentication</span>
          </div>
          <label
            htmlFor="mfaToken"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter your 6-digit MFA code from Google Authenticator
          </label>
          <input
            type="text"
            id="mfaToken"
            value={mfaToken}
            maxLength="6"
            autoComplete="one-time-code"
            inputMode="numeric"
            placeholder="123456"
            className={`w-full px-4 py-2 border ${
              error.mfaToken ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest bg-blue-50 dark:bg-gray-700`}
            onChange={(e) => setMfaToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            required
          />
          {error.mfaToken && <p className="text-red-500 text-sm mt-2">{error.mfaToken}</p>}
          <p className="text-xs text-gray-500 mt-2">
            <span className="inline-block mr-1 text-blue-600"><i className="fa-solid fa-mobile-screen-button"></i></span>
            Open your Google Authenticator app and enter the code shown for this account.
          </p>
        </div>
      )}

      <button
        type="submit"
        className={`w-full bg-blue-600 py-2 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Login"}
      </button>
    </form>
  );
};

export default Form;
