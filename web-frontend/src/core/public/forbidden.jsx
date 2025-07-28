import React from "react";

const Forbidden = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div>
                <h1 className="text-5xl font-bold text-red-600">403</h1>
                <p className="text-lg mt-4">You are not authorized to access this page.</p>
            </div>
        </div>
    );
};

export default Forbidden;
