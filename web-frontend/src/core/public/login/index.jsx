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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ email: "", password: "" });

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError({ email: "", password: "" });

        if (!email || !password) {
            setError({
                email: !email ? "Email is required" : "",
                password: !password ? "Password is required" : "",
            });
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post("http://localhost:3000/api/users/login", {
                email,
                password,
            });

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
