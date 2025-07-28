import axios from "axios";
import { Bookmark, ChevronLeft, Clock, Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/navbar";

const GovernmentProfileDetail = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    const fetchProfileDetail = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            if (!token) {
                setError("No token found. Please log in.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:3000/api/government/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProfile(response.data);
            setLoading(false);
        } catch (error) {
            setError("Error fetching profile details");
            setLoading(false);
            console.error("Error fetching profile detail:", error.message);
        }
    };

    useEffect(() => {
        fetchProfileDetail();
    }, [id]);

    const getImageSource = (thumbnail) => {
        if (!thumbnail) return "/api/placeholder/800/400";
        if (thumbnail.startsWith("data:image/")) return thumbnail;
        if (thumbnail.startsWith("http")) return thumbnail;
        return `http://localhost:3000/${thumbnail}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-pulse text-center">
                    <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="h-4 w-32 mx-auto bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-6 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="text-red-500 text-xl mb-4">Error</div>
                    <p className="text-gray-700 dark:text-gray-300">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            {/* Hero Section with Image */}
            <div className="relative h-64 md:h-80 lg:h-96 w-full">
                <img
                    src={getImageSource(profile.thumbnail)}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Back button */}
                <button
                    onClick={() => window.history.back()}
                    className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm p-2 rounded-full"
                >
                    <ChevronLeft className="text-white" size={20} />
                </button>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <Share2 className="text-white" size={20} />
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <Bookmark className="text-white" size={20} />
                    </button>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <div className="flex items-center mt-2">
                        <MapPin size={16} className="mr-1" />
                        <p className="text-sm opacity-90">{profile.address}</p>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "overview"
                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "locations"
                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                        onClick={() => setActiveTab("locations")}
                    >
                        Locations
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "services"
                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                        onClick={() => setActiveTab("services")}
                    >
                        Services
                    </button>
                </div>

                {/* Overview Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Description Section */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">About</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {profile.description || "No description available."}
                            </p>

                            {/* Contact Information */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.phone && (
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                                            <Phone className="text-blue-600 dark:text-blue-400" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="text-gray-800 dark:text-gray-200">{profile.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {profile.email && (
                                    <div className="flex items-center">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                                            <Mail className="text-green-600 dark:text-green-400" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-gray-800 dark:text-gray-200">{profile.email}</p>
                                        </div>
                                    </div>
                                )}

                                {profile.website && (
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                                            <Globe className="text-purple-600 dark:text-purple-400" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                                            <p className="text-gray-800 dark:text-gray-200">{profile.website}</p>
                                        </div>
                                    </div>
                                )}

                                {profile.hours && (
                                    <div className="flex items-center">
                                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
                                            <Clock className="text-amber-600 dark:text-amber-400" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Hours</p>
                                            <p className="text-gray-800 dark:text-gray-200">{profile.hours}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {profile.stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(profile.stats).map(([key, value]) => (
                                    <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{key.replace('_', ' ')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Locations Tab Content */}
                {activeTab === "locations" && (
                    <div className="space-y-6">
                        {/* Map Display */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Locations</h2>
                            <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <MapContainer
                                    center={[profile.latitude, profile.longitude]}
                                    zoom={12}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />

                                    {/* Main Office Marker */}
                                    <Marker position={[profile.latitude, profile.longitude]}>
                                        <Popup>{profile.name} (Main Office)</Popup>
                                    </Marker>

                                    {/* Branches Markers */}
                                    {profile.branches &&
                                        profile.branches.map((branch, index) => (
                                            <Marker key={index} position={[branch.latitude, branch.longitude]}>
                                                <Popup>
                                                    <strong>{branch.name}</strong>
                                                    <br />
                                                    {branch.address}
                                                </Popup>
                                            </Marker>
                                        ))}
                                </MapContainer>
                            </div>
                        </div>

                        {/* Branch Offices List */}
                        {profile.branches && profile.branches.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Branch Offices</h3>
                                <div className="space-y-4">
                                    {profile.branches.map((branch, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750"
                                        >
                                            <h4 className="font-medium text-gray-800 dark:text-gray-200">{branch.name}</h4>
                                            <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                                                <MapPin size={16} className="mr-1" />
                                                <p className="text-sm">{branch.address}</p>
                                            </div>
                                            {branch.phone && (
                                                <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                                                    <Phone size={16} className="mr-1" />
                                                    <p className="text-sm">{branch.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Services Tab Content */}
                {activeTab === "services" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Services</h2>
                            {profile.services && profile.services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.services.map((service, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750"
                                        >
                                            <h3 className="font-medium text-gray-800 dark:text-gray-200">{service.name}</h3>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No services information available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GovernmentProfileDetail;