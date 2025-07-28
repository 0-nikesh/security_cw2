import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/navbar";

const Profile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([fetchUserProfile(), fetchUserPosts()]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("authToken");
        try {
            const response = await axios.get(`http://localhost:3000/api/users/${id}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.user);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchUserPosts = async () => {
        const token = localStorage.getItem("authToken");
        try {
            const response = await axios.get(`http://localhost:3000/api/posts/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPosts(response.data.posts);
        } catch (error) {
            console.error("Error fetching user posts:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">User not found</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">The profile you're looking for doesn't exist or is unavailable.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />

            {/* Cover Image */}
            <div className="relative w-full h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
                {user.cover ? (
                    <img
                        src={user.cover}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-75"></div>
                )}

                {/* Profile Header Container - Positioned at bottom of cover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <div className="container mx-auto flex items-end space-x-4">
                        <div className="relative">
                            <img
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                src={user.image || "https://ui-avatars.com/api/?name=" + user.fname + "+" + user.lname + "&background=random"}
                                alt={`${user.fname} ${user.lname}`}
                            />
                        </div>
                        <div className="pb-2">
                            <h1 className="text-2xl md:text-3xl font-bold">{user.fname} {user.lname}</h1>
                            <p className="text-gray-200">{user.location || "No location set"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Bio Section */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h2>
                        <p className="text-gray-700 dark:text-gray-300">{user.bio || "This user hasn't added a bio yet."}</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("posts")}
                                className={`px-6 py-3 text-sm font-medium transition ${activeTab === "posts"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                Posts
                            </button>
                            <button
                                onClick={() => setActiveTab("photos")}
                                className={`px-6 py-3 text-sm font-medium transition ${activeTab === "photos"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                Photos
                            </button>
                            <button
                                onClick={() => setActiveTab("info")}
                                className={`px-6 py-3 text-sm font-medium transition ${activeTab === "info"
                                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                Info
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "posts" && (
                            <div className="space-y-6">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden">
                                            <div className="p-4">
                                                <div className="flex items-center mb-3">
                                                    <img
                                                        className="w-10 h-10 rounded-full mr-3"
                                                        src={user.image || "https://ui-avatars.com/api/?name=" + user.fname + "+" + user.lname + "&background=random"}
                                                        alt={`${user.fname} ${user.lname}`}
                                                    />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-white">{user.fname} {user.lname}</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(post.created_at).toLocaleString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 mb-4">{post.caption}</p>
                                                {post.images && post.images.length > 0 && (
                                                    <div className="rounded-lg overflow-hidden">
                                                        <img
                                                            src={post.images[0]}
                                                            alt="Post"
                                                            className="w-full object-cover max-h-96 hover:opacity-95 transition"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                    <div className="flex space-x-4">
                                                        <button className="flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                            </svg>
                                                            Like
                                                        </button>
                                                        <button className="flex items-center text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                            </svg>
                                                            Comment
                                                        </button>
                                                    </div>
                                                    <button className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No posts yet</h3>
                                        <p className="mt-1 text-gray-500 dark:text-gray-400">This user hasn't shared any posts.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "photos" && (
                            <div>
                                {posts.some(post => post.images && post.images.length > 0) ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {posts
                                            .filter(post => post.images && post.images.length > 0)
                                            .map((post, index) => (
                                                <div key={`${post._id}-${index}`} className="aspect-square rounded-lg overflow-hidden shadow-sm hover:opacity-90 transition cursor-pointer">
                                                    <img src={post.images[0]} alt="Gallery" className="w-full h-full object-cover" />
                                                </div>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No photos</h3>
                                        <p className="mt-1 text-gray-500 dark:text-gray-400">This user hasn't uploaded any photos yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "info" && (
                            <div className="space-y-4">
                                <div className="flex border-b pb-4 border-gray-200 dark:border-gray-700">
                                    <div className="w-1/3 text-gray-500 dark:text-gray-400">Full Name</div>
                                    <div className="w-2/3 text-gray-900 dark:text-white font-medium">{user.fname} {user.lname}</div>
                                </div>
                                <div className="flex border-b pb-4 border-gray-200 dark:border-gray-700">
                                    <div className="w-1/3 text-gray-500 dark:text-gray-400">Location</div>
                                    <div className="w-2/3 text-gray-900 dark:text-white font-medium">{user.location || "Not specified"}</div>
                                </div>
                                <div className="flex border-b pb-4 border-gray-200 dark:border-gray-700">
                                    <div className="w-1/3 text-gray-500 dark:text-gray-400">Member Since</div>
                                    <div className="w-2/3 text-gray-900 dark:text-white font-medium">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : "Unknown"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;