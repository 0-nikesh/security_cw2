import axios from 'axios';
import React, { useState } from 'react';

const MFASetup = ({ user, onMFAEnabled }) => {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState(1); // 1: Generate QR, 2: Verify Code
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateMFASecret = async () => {
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:3000/api/mfa/setup',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setQrCode(response.data.qrCodeUrl);
            setSecret(response.data.secret);
            setStep(2);
        } catch (err) {
            setError('Failed to generate MFA secret. Please try again.');
            console.error('MFA setup error:', err);
        } finally {
            setLoading(false);
        }
    };

    const verifyMFACode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:3000/api/mfa/verify',
                { token: verificationCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('MFA enabled successfully!');
                onMFAEnabled && onMFAEnabled();
                setStep(1);
                setQrCode('');
                setSecret('');
                setVerificationCode('');
            }
        } catch (err) {
            setError('Invalid MFA code. Please try again.');
            console.error('MFA verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Multi-Factor Authentication (MFA)
            </h3>

            {step === 1 && (
                <div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Enable MFA to add an extra layer of security to your account using Google Authenticator.
                    </p>
                    <button
                        onClick={generateMFASecret}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Enable MFA'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                            Step 1: Scan QR Code
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Scan this QR code with Google Authenticator app:
                        </p>
                        {qrCode && (
                            <div className="flex justify-center mb-4">
                                <img src={qrCode} alt="MFA QR Code" className="border rounded" />
                            </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Secret Key (manual entry): <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{secret}</code>
                        </p>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                            Step 2: Enter Verification Code
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Enter the 6-digit code from Google Authenticator:
                        </p>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            maxLength="6"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={verifyMFACode}
                            disabled={loading || verificationCode.length !== 6}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify & Enable MFA'}
                        </button>
                        <button
                            onClick={() => {
                                setStep(1);
                                setQrCode('');
                                setSecret('');
                                setVerificationCode('');
                                setError('');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default MFASetup;
