import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MFASetup from '../../components/MFASetup.jsx';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                'http://localhost:3000/api/user/profile',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setUser(response.data.user);
            setMfaEnabled(response.data.user.mfaEnabled || false);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMFAEnabled = () => {
        setLoading(true);
        fetchUserProfile()
            .then(() => {
                // After fetching, check the latest MFA status
                if (user && user.mfaEnabled) {
                    setMfaEnabled(true);
                } else {
                    setMfaEnabled(false);
                }
            })
            .catch((err) => {
                console.error('Error refreshing MFA status:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const disableMFA = async () => {
        if (!window.confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(
                'http://localhost:3000/api/mfa/disable',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setMfaEnabled(false);
            alert('MFA has been disabled.');
            fetchUserProfile();
        } catch (error) {
            console.error('Failed to disable MFA:', error);
            alert('Failed to disable MFA. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* User Profile Section */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profile Information</h2>
                            {user && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.username}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MFA Status</label>
                                        <p className="mt-1 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                mfaEnabled 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {mfaEnabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Security Settings</h2>
                            
                            {/* MFA Section */}
                            {!mfaEnabled ? (
                                <MFASetup user={user} onMFAEnabled={handleMFAEnabled} />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                        Multi-Factor Authentication (MFA)
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-600 dark:text-green-400 font-medium">
                                                ✓ MFA is currently enabled on your account
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                Your account is protected with two-factor authentication using Google Authenticator.
                                            </p>
                                        </div>
                                        <button
                                            onClick={disableMFA}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Disable MFA
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Security Information */}
                        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                Security Best Practices
                            </h3>
                            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>Enable Multi-Factor Authentication for enhanced security</li>
                                <li>Use a strong, unique password for your account</li>
                                <li>Regularly review your account activity</li>
                                <li>Keep your recovery codes in a safe place</li>
                                <li>Log out from shared or public devices</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
