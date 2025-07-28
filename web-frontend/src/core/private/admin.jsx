import React from "react";

const Admin = () => {
    return (
        <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
            <iframe
                src="http://localhost:3000/admin" // AdminJS backend URL
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                title="Admin Panel"
            />2
        </div>
    );
};

export default Admin;
