import { BuildingOffice2Icon, ClockIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../components/navbar";
import RoutingMachine from "./RoutingMachine";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const GuidanceDetail = () => {
    const { id } = useParams();
    const [guidance, setGuidance] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestBranch, setNearestBranch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("info");

    const fetchGuidanceDetail = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/guidances/${id}`);
            setGuidance(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching guidance detail:", error.message);
            setError("Failed to load guidance details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting user location:", error.message);
                    setError("Unable to access your location. Please enable location services to find the nearest branch.");
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    const findNearestBranch = () => {
        if (guidance?.government_profile?.branches && userLocation) {
            let nearest = null;
            let minDistance = Infinity;

            guidance.government_profile.branches.forEach((branch) => {
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    branch.latitude,
                    branch.longitude
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = { ...branch, distance };
                }
            });

            setNearestBranch(nearest);
        }
    };

    useEffect(() => {
        fetchGuidanceDetail();
        getUserLocation();
    }, [id]);

    useEffect(() => {
        if (guidance && userLocation) {
            findNearestBranch();
        }
    }, [guidance, userLocation]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">Loading guidance details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">Error</h2>
                    <p className="text-center text-gray-600 dark:text-gray-300">{error}</p>
                    <button
                        onClick={fetchGuidanceDetail}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!guidance) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-700 dark:text-gray-300">No guidance information available.</p>
            </div>
        );
    }

    const { government_profile } = guidance;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{guidance.title}</h1>
                            <div className="mt-2 flex items-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {guidance.category}
                                </span>
                                {government_profile && (
                                    <Link
                                        to={`/government/${government_profile._id}`}
                                        className="ml-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                    >
                                        <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                                        {government_profile.name}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {nearestBranch && (
                            <div className="mt-4 md:mt-0 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nearest Branch</h3>
                                <p className="font-semibold text-gray-900 dark:text-white">{nearestBranch.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                                    <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                                    {nearestBranch.distance.toFixed(2)} km away
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === "info"
                                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            onClick={() => setActiveTab("info")}
                        >
                            Information
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === "location"
                                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            onClick={() => setActiveTab("location")}
                        >
                            Location & Directions
                        </button>
                        {government_profile?.branches?.length > 0 && (
                            <button
                                className={`px-6 py-3 text-sm font-medium ${activeTab === "branches"
                                    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                onClick={() => setActiveTab("branches")}
                            >
                                All Branches
                            </button>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "info" && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About this Service</h2>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    {guidance.description || "No detailed description available for this guidance."}
                                </p>

                                {/* Contact Information */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start">
                                            <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                                                <p className="text-gray-900 dark:text-white">{government_profile.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Hours</p>
                                                <p className="text-gray-900 dark:text-white">{government_profile.working_hours || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Required Documents & Process (placeholder content) */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Required Documents</h3>
                                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                                        <li>Valid identification (National ID, Passport)</li>
                                        <li>Completed application form</li>
                                        <li>Proof of address (Utility bill, not older than 3 months)</li>
                                        <li>Additional documents may be required based on your specific case</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === "location" && (
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Location & Directions</h2>
                                    <button
                                        onClick={getUserLocation}
                                        className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center text-sm transition duration-200"
                                    >
                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                        {userLocation ? "Refresh Location" : "Get My Location"}
                                    </button>
                                </div>

                                {/* Map */}
                                <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 mb-4">
                                    <MapContainer
                                        center={[government_profile.latitude, government_profile.longitude]}
                                        zoom={12}
                                        style={{ height: "500px", width: "100%" }}
                                        className="z-0"
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />

                                        {/* Main Office Marker */}
                                        <Marker position={[government_profile.latitude, government_profile.longitude]}>
                                            <Popup>
                                                <div className="p-1">
                                                    <strong className="block text-base mb-1">{government_profile.name}</strong>
                                                    <span className="text-sm text-gray-600">Main Office</span>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* Branches Markers */}
                                        {government_profile.branches &&
                                            government_profile.branches.map((branch, index) => (
                                                <Marker key={index} position={[branch.latitude, branch.longitude]}>
                                                    <Popup>
                                                        <div className="p-1">
                                                            <strong className="block text-base mb-1">{branch.name}</strong>
                                                            <address className="text-sm text-gray-600 not-italic">{branch.address}</address>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}

                                        {/* Route to Nearest Branch */}
                                        {userLocation && nearestBranch && (
                                            <RoutingMachine
                                                start={[userLocation.latitude, userLocation.longitude]}
                                                end={[nearestBranch.latitude, nearestBranch.longitude]}
                                            />
                                        )}
                                    </MapContainer>
                                </div>

                                {/* Nearest Branch Information */}
                                {nearestBranch && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Nearest Branch: {nearestBranch.name}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</p>
                                                <p className="text-gray-900 dark:text-white">{nearestBranch.address}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Distance</p>
                                                <p className="text-gray-900 dark:text-white">{nearestBranch.distance.toFixed(2)} kilometers from your location</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "branches" && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All Branches</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {government_profile.branches &&
                                        government_profile.branches.map((branch, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                <h3 className="font-medium text-gray-900 dark:text-white text-lg">{branch.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{branch.address}</p>
                                                {userLocation && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                                        {calculateDistance(
                                                            userLocation.latitude,
                                                            userLocation.longitude,
                                                            branch.latitude,
                                                            branch.longitude
                                                        ).toFixed(2)} km away
                                                    </p>
                                                )}
                                                <button
                                                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-sm flex items-center transition duration-200"
                                                    onClick={() => {
                                                        setNearestBranch(branch);
                                                        setActiveTab("location");
                                                    }}
                                                >
                                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                                    Get Directions
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuidanceDetail;