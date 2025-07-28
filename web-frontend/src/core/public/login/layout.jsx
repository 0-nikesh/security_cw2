import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 font-open-sans p-4">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg p-0.5 shadow-xl w-full max-w-md">
        <div className="bg-white rounded-lg w-full px-8 py-10">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
