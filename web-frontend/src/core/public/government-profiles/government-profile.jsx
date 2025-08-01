// // src/pages/GovernmentProfiles.js
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../../../components/navbar";

// const GovernmentProfiles = () => {
//     const [profiles, setProfiles] = useState([]);
//     const navigate = useNavigate();

//     const fetchGovernmentProfiles = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             if (!token) {
//                 //console.log("No token found. Please log in.");
//                 return;
//             }

//             const response = await axios.get("http://localhost:3000/api/government/", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             setProfiles(response.data);
//         } catch (error) {
//             console.error("Error fetching government profiles:", error.message);
//         }
//     };

//     useEffect(() => {
//         fetchGovernmentProfiles();
//     }, []);

//     const getImageSource = (thumbnail) => {
//         if (thumbnail.startsWith("data:image/")) return thumbnail;
//         if (thumbnail.startsWith("http")) return thumbnail;
//         return `http://localhost:3000/${thumbnail}`;
//     };

//     const handleCardClick = (id) => {
//         navigate(`/government/${id}`);
//     };

//     return (
//         <div className="min-h-screen bg-primary dark:bg-surface-dark">
//             <Navbar />
//             <div className="p-4 md:p-10 max-w-7xl mx-auto">
//                 <h2 className="text-2xl md:text-3xl font-bold text-center text-text dark:text-text-dark mb-6">
//                     Government Profiles
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {profiles.map((profile, index) => (
//                         <div
//                             key={index}
//                             className="bg-white dark:bg-surface-dark shadow-lg rounded-xl p-4 hover:shadow-xl transition-all cursor-pointer"
//                             onClick={() => handleCardClick(profile._id)}
//                         >
//                             <div className="flex items-center space-x-4">
//                                 <img
//                                     src={getImageSource(profile.thumbnail)}
//                                     alt={profile.name}
//                                     className="w-16 h-16 rounded-lg object-cover"
//                                 />
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-text dark:text-text-dark">{profile.name}</h3>
//                                     <p className="text-sm text-gray-600 dark:text-gray-400">{profile.address}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GovernmentProfiles;


import axios from "axios";
import { Building, Filter, MapPin, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";

const GovernmentProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const navigate = useNavigate();

    const fetchGovernmentProfiles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            if (!token) {
                setError("No token found. Please log in.");
                setLoading(false);
                return;
            }

            const response = await axios.get("http://localhost:3000/api/government/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProfiles(response.data);
            setFilteredProfiles(response.data);
            setLoading(false);
        } catch (error) {
            setError("Error fetching government profiles");
            setLoading(false);
            console.error("Error fetching government profiles:", error.message);
        }
    };

    useEffect(() => {
        fetchGovernmentProfiles();
    }, []);

    useEffect(() => {
        const results = profiles.filter(profile =>
            profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (profile.address && profile.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (profile.description && profile.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (selectedCategory !== "All") {
            const categoryFiltered = results.filter(profile =>
                profile.category === selectedCategory
            );
            setFilteredProfiles(categoryFiltered);
        } else {
            setFilteredProfiles(results);
        }
    }, [searchTerm, profiles, selectedCategory]);

    const getImageSource = (thumbnail) => {
        if (!thumbnail) return "/api/placeholder/400/400";
        if (thumbnail.startsWith("data:image/")) return thumbnail;
        if (thumbnail.startsWith("http")) return thumbnail;
        return `http://localhost:3000/${thumbnail}`;
    };

    const handleCardClick = (id) => {
        navigate(`/government/${id}`);
    };

    // Extract categories from profiles for filter
    const categories = ["All", ...new Set(profiles.filter(p => p.category).map(p => p.category))];

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Sample categories if not present in actual data
    const sampleCategories = ["Federal", "State", "Municipal", "Public Services"];

    // Helper function to truncate text
    const truncateText = (text, maxLength) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="p-4 md:p-10 max-w-7xl mx-auto">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                                    <div className="flex space-x-4 items-center mb-4">
                                        <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="p-4 md:p-10 max-w-md mx-auto">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
                        <div className="text-red-500 text-4xl mb-4">!</div>
                        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Error Loading Profiles</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={() => fetchGovernmentProfiles()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="p-4 md:p-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Government Profiles
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Find and connect with government institutions, agencies, and public service providers.
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by name, location, or services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                                </button>
                            )}
                        </div>

                        <div className="relative min-w-[200px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter size={18} className="text-gray-400" />
                            </div>
                            <select
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {(categories.length > 1 ? categories : ["All", ...sampleCategories]).map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter Pills (only shown if there are actual categories) */}
                {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCategory === category
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? "result" : "results"}
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCategory !== "All" && ` in ${selectedCategory}`}
                </div>

                {/* No Results Message */}
                {filteredProfiles.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                        <Building size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No government profiles found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}

                {/* Profile Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.map((profile) => (
                        <div
                            key={profile._id}
                            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col"
                            onClick={() => handleCardClick(profile._id)}
                        >
                            <div className="h-40 overflow-hidden">
                                <img
                                    src={getImageSource(profile.thumbnail)}
                                    alt={profile.name}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                            <div className="p-5 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                        {profile.name}
                                    </h3>
                                    {profile.category && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                            {profile.category}
                                        </span>
                                    )}
                                    {!profile.category && Math.random() > 0.5 && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                            {getRandomItem(sampleCategories)}
                                        </span>
                                    )}
                                </div>

                                {profile.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {truncateText(profile.description, 100)}
                                    </p>
                                )}

                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                    <MapPin size={16} className="mr-1" />
                                    <p className="truncate">{profile.address || "Location not specified"}</p>
                                </div>
                            </div>

                            {/* Additional metadata footer */}
                            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{profile.branches ? `${profile.branches.length} Branches` : "Main Office"}</span>
                                    <span>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Recently Updated"}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GovernmentProfiles;