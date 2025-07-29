import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../../assets/icon/login-logo.svg";
import Form from "./form";
import Layout from "./layout";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mfaToken, setMfaToken] = useState("");
    const [mfaRequired, setMfaRequired] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ email: "", password: "", mfaToken: "" });

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError({ email: "", password: "", mfaToken: "" });

        if (!email || !password) {
            setError({
                email: !email ? "Email is required" : "",
                password: !password ? "Password is required" : "",
                mfaToken: ""
            });
            return;
        }

        if (mfaRequired && (!mfaToken || mfaToken.length !== 6)) {
            setError({
                email: "",
                password: "",
                mfaToken: "Please enter a valid 6-digit MFA code"
            });
            return;
        }

        try {
            setIsLoading(true);
            const loginData = { email, password };
            // Add MFA token if required
            if (mfaRequired && mfaToken) {
                loginData.mfaToken = mfaToken;
            }
            const response = await axios.post("http://localhost:3000/api/users/login", loginData);
            // If backend requests MFA, show the field
            if (response.data.mfaRequired) {
                setMfaRequired(true);
                toast.info("Please enter your MFA code to complete login.");
                return;
            }
            // If login is successful
            const { token, user } = response.data;
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
            toast.success("Login successful!");
            if (user.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Error during login:", err.message);
            console.log("Full error response:", err.response?.data);
            
            // If backend requests MFA via error response
            if (err.response?.data?.mfaRequired) {
                setMfaRequired(true);
                toast.info("Please enter your MFA code to complete login.");
                return;
            }
            
            // Check if the error message contains MFA requirement
            if (err.response?.data?.message?.includes("MFA token required") || 
                err.response?.data?.message?.includes("MFA") ||
                err.response?.data?.message?.includes("token required")) {
                setMfaRequired(true);
                toast.info("Please enter your MFA code to complete login.");
                return;
            }
            
            // Handle MFA-specific errors
            if (err.response?.status === 400 && err.response?.data?.message?.includes("MFA")) {
                setError({ email: "", password: "", mfaToken: err.response.data.message });
                return;
            }
            
            toast.error(err.response?.data?.message || err.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex justify-center mb-6">
                <img src={logo} alt="Logo" className="w-24 h-24" />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h1>
            <p className="text-sm text-gray-600 text-center mb-6">
                Welcome Back! You have been missed.
            </p>
            <Form
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error}
                setEmail={setEmail}
                setPassword={setPassword}
                mfaRequired={mfaRequired}
                setMfaToken={setMfaToken}
                mfaToken={mfaToken}
            />
            <div className="mt-4 text-center">
                <a
                    href="#"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Forgot Password?
                </a>
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Sign Up
                    </span>
                </p>
            </div>
        </Layout>
    );
};

export default Login;
