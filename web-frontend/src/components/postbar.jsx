import React, { useState } from "react";
import av from "../assets/icon/Abatars.png";

function Postbar() {
    const [input, setInput] = useState("");

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handlePostClick = () => {
        //console.log("Posted:", input);
        setInput(""); // Clear input after posting
    };

    return (
        <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-gray-50">
            {/* User Avatar */}
            <img
                src={av}
                alt="User Avatar"
                className="w-10 h-10 rounded-full mr-3"
            />
            {/* Input Field */}
            <input
                type="text"
                placeholder="Share your experience or Ask a Question..."
                value={input}
                onChange={handleInputChange}
                className="flex-1 border-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400"
            />
            {/* Post Button */}
            <button
                onClick={handlePostClick}
                className="ml-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
                Post
            </button>
        </div>
    );
}

export default Postbar;
