import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import navlogo from "../assets/icon/nav-logo.svg";
import socket from '../socketService';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Theme toggle handler
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  // Initialize user data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      fetchUserDetails(storedUser._id);
    } else {
      setIsLoading(false);
    }

    // Initialize theme
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/notifications/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(response.data);
        setUnreadCount(response.data.filter(notif => !notif.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Socket listener for new notifications
  useEffect(() => {
    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prevCount) => prevCount + 1);

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.description,
          icon: '/notification-icon.png'
        });
      }
    });

    return () => socket.off("notification");
  }, []);

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);

    try {
      const response = await axios.get(`http://localhost:3000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
  };

  // Mark notifications as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await axios.post("http://localhost:3000/api/notifications/mark-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await axios.post(`http://localhost:3000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle clicks outside of dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation links array for DRY code
  const navLinks = [
    { name: "Home", icon: "fa-house", link: "/dashboard" },
    { name: "Events", icon: "fa-calendar-days", link: "/events" },
    { name: "Government", icon: "fa-building", link: "/government" },
    { name: "Map", icon: "fa-map-location-dot", link: "/map" },
    { name: "Documents", icon: "fa-file-alt", link: "/documents" }
  ];

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Invalid Date";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // Return relative time for recent notifications
    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    // Fall back to date format for older notifications
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Navbar Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/dashboard" className="flex-shrink-0">
                <img src={navlogo} alt="Logo" className="h-8 w-auto sm:h-10" />
              </a>

              {/* Desktop Navigation Links */}
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.link}
                    className={({ isActive }) =>
                      `text-base font-medium transition-colors duration-200 ${isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
              </button>
            </div>

            {/* Right Side: Theme Toggle, Notifications, Profile */}
            <div className="hidden md:flex items-center space-x-5">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md p-2 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <i className="fa-solid fa-sun text-lg"></i>
                ) : (
                  <i className="fa-solid fa-moon text-lg"></i>
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md p-2 focus:outline-none relative"
                  aria-label="View notifications"
                >
                  <i className="fa-solid fa-bell text-lg"></i>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="px-4 py-3 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                              onClick={() => markAsRead(notif._id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 dark:text-white text-sm">{notif.title}</p>
                                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{notif.description}</p>
                                  {/* <p className="text-gray-400 text-xs mt-1">{formatTimestamp(notif.timestamp)}</p> */}
                                </div>
                                {!notif.read && (
                                  <span className="h-2 w-2 rounded-full bg-blue-600 mt-1"></span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                            <i className="fa-regular fa-bell-slash text-2xl mb-2"></i>
                            <p>No notifications yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                  aria-label="Open user menu"
                >
                  {isLoading ? (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  ) : (
                    <>
                      <img
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        src={user?.image || user.image || "https://ui-avatars.com/api/?name=" + user.fname + "+" + user.lname + "&background=random"}
                        alt="Profile"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300 hidden lg:block">
                        {user?.fname ? `${user.fname} ${user.lname || ''}` : "Guest User"}
                      </span>
                      <i className="fa-solid fa-chevron-down text-xs ml-2 text-gray-500 dark:text-gray-400"></i>
                    </>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.fname && user?.lname ? `${user.fname} ${user.lname}` : "Guest User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {user?.email || "No email available"}
                      </p>
                    </div>
                    <div className="py-1">
                      <NavLink
                        to={`/profile/${user?._id || JSON.parse(localStorage.getItem("user"))?._id}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <i className="fa-solid fa-user mr-2"></i> Profile
                      </NavLink>
                      <NavLink
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <i className="fa-solid fa-gear mr-2"></i> Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <i className="fa-solid fa-right-from-bracket mr-2"></i> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div ref={menuRef} className="md:hidden mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.link}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium ${isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`fa-solid ${item.icon} mr-2`}></i>
                    {item.name}
                  </NavLink>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user?.image || user.image || "https://ui-avatars.com/api/?name=" + user.fname + "+" + user.lname + "&background=random"}
                      alt="Profile"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {user?.fname && user?.lname ? `${user.fname} ${user.lname}` : "Guest User"}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {user?.email || "No email available"}
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {darkMode ? (
                      <i className="fa-solid fa-sun text-lg"></i>
                    ) : (
                      <i className="fa-solid fa-moon text-lg"></i>
                    )}
                  </button>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <NavLink
                    to={`/profile/${user?._id || JSON.parse(localStorage.getItem("user"))?._id}`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fa-solid fa-user mr-2"></i> Profile
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="fa-solid fa-gear mr-2"></i> Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <i className="fa-solid fa-right-from-bracket mr-2"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile Footer Navigation */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-40">
        <nav className="flex justify-around py-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.link}
              className={({ isActive }) => `
                flex flex-col items-center px-2 py-1 
                ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
                }
              `}
            >
              <i className={`fa-solid ${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </footer>

      {/* Mobile Notification Fab Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg relative"
          aria-label="View notifications"
        >
          <i className="fa-solid fa-bell"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Mobile Notification Panel */}
        {isNotificationOpen && (
          <div ref={notificationRef} className="absolute bottom-16 right-0 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    onClick={() => markAsRead(notif._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white text-sm">{notif.title}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{notif.description}</p>
                        {/* <p className="text-gray-400 text-xs mt-1">{formatTimestamp(notif.timestamp)}</p> */}
                      </div>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 mt-1"></span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  <i className="fa-regular fa-bell-slash text-2xl mb-2"></i>
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </div>
  );
};

export default Navbar;