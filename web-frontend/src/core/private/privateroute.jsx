import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, isAdminRequired }) => {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve the user from localStorage

    // Redirect to login if not authenticated
    if (!token) {
        return <Navigate to="/login" />;
    }

    // If `isAdminRequired` is true and the user is not an admin, deny access
    if (isAdminRequired && (!user || !user.isAdmin)) {
        return <Navigate to="/403" />; // Redirect to a "403 Forbidden" page
    }

    return children; // Render the protected component
};

export default PrivateRoute;
