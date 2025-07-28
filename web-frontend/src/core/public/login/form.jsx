import React, { useState } from "react";
import { toast } from "react-toastify";

// Simple sanitize function to strip HTML tags
function sanitizeInput(input) {
  return input.replace(/<[^>]*>?/gm, "");
}

const Form = ({ onSubmit, isLoading, error, setEmail, setPassword }) => {
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
