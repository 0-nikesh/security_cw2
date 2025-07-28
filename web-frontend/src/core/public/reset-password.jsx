import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post("http://localhost:3000/api/users/reset-password", {
                token,
                newPassword,
            });
            toast.success("Password reset successfully!");
            navigate("/login"); // Redirect to login page
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 font-open-sans p-4">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg p-0.5 shadow-xl w-full max-w-md">
                <div className="bg-white rounded-lg w-full px-8 py-10">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-blue-600 py-2 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting Password..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
