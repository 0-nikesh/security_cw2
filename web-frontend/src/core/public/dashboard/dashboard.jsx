import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Navbar from '../../../components/navbar';
import socket from '../../../socketService';

Modal.setAppElement('#root');

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [caption, setCaption] = useState('');
    const [category, setCategory] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingLikes, setIsLoadingLikes] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [commentText, setCommentText] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [visibleComments, setVisibleComments] = useState({});

    useEffect(() => {
        fetchPosts();
        fetchInitialNotifications();

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }

        socket.on("notification", (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        return () => socket.off("notification");
    }, []);

    const fetchInitialNotifications = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://localhost:3000/api/notifications/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // const fetchPosts = async () => {
    //     const token = localStorage.getItem('authToken');
    //     try {
    //         const response = await axios.get('http://localhost:3000/api/posts/all', {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });

    //         let postsWithUserDetails = await Promise.all(response.data.map(async (post) => {
    //             try {
    //                 const userResponse = await axios.get(`http://localhost:3000/api/users/${post.user_id}`, {
    //                     headers: { Authorization: `Bearer ${token}` },
    //                 });

    //                 return {
    //                     ...post,
    //                     user: userResponse.data
    //                 };
    //             } catch (error) {
    //                 console.error("Error fetching user details for post:", post._id, error);
    //                 return { ...post, user: { fname: "Unknown", lname: "User", image: "src/assets/icon/Abatars.png" } };
    //             }
    //         }));

    //         postsWithUserDetails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    //         setPosts(postsWithUserDetails);
    //     } catch (error) {
    //         console.error('Error fetching posts:', error);
    //     }
    // };


//     const fetchPosts = async () => {
//     const token = localStorage.getItem('authToken');
//     try {
//         const response = await axios.get('http://localhost:3000/api/posts/all', {
//             headers: { Authorization: `Bearer ${token}` },
//         });

//         const posts = response.data.posts; // <- Fix is here

//         let postsWithUserDetails = await Promise.all(posts.map(async (post) => {
//             try {
//                 const userResponse = await axios.get(`http://localhost:3000/api/users/${post.user_id}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 return {
//                     ...post,
//                     user: userResponse.data
//                 };
//             } catch (error) {
//                 console.error("Error fetching user details for post:", post._id, error);
//                 return {
//                     ...post,
//                     user: {
//                         fname: "Unknown",
//                         lname: "User",
//                         image: "src/assets/icon/Abatars.png"
//                     }
//                 };
//             }
//         }));

//         postsWithUserDetails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         setPosts(postsWithUserDetails);
//     } catch (error) {
//         console.error('Error fetching posts:', error);
//     }
// };

    const fetchPosts = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get('http://localhost:3000/api/posts/all', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const posts = response.data.posts.map(post => ({
            ...post,
            user: post.user_id // already populated by backend
        }));

        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
};


    const handleCommentChange = (postId, value) => {
        setCommentText(prev => ({ ...prev, [postId]: value }));
    };

    const handleCommentSubmit = async (postId) => {
        if (!commentText[postId]) return;

        setCommentLoading(prev => ({ ...prev, [postId]: true }));
        const token = localStorage.getItem('authToken');

        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/${postId}/comment`,
                { commentText: commentText[postId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: response.data.comments }
                        : post
                )
            );

            setCommentText(prev => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleCommentSection = (postId) => {
        setVisibleComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleImageUpload = (e) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => allowedTypes.includes(file.type));
        if (validFiles.length !== files.length) {
            alert("Only PNG, JPG, and JPEG files are allowed.");
        }
        setImageFiles([...imageFiles, ...validFiles]);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('category', category);
        imageFiles.forEach((file) => formData.append('images', file));

        const token = localStorage.getItem('authToken');

        try {
            await axios.post('http://localhost:3000/api/posts/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setCaption('');
            setCategory('');
            setImageFiles([]);
            setIsModalOpen(false);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLikePost = async (postId) => {
        const token = localStorage.getItem('authToken');
        setIsLoadingLikes((prev) => ({ ...prev, [postId]: true }));

        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/${postId}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, ...response.data.post } : post
                )
            );
        } catch (error) {
            console.error('Error liking post:', error);
        } finally {
            setIsLoadingLikes((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const hasUserLikedPost = (post) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user._id;
        return post.liked_by.includes(userId);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <Navbar />
            <div className="container mx-auto px-4 pt-20 pb-10">
                {/* Create Post Section */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md w-full max-w-2xl mx-auto mb-8 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={user?.image || "src/assets/icon/Abatars.png"}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400"
                        />
                        <div
                            onClick={openModal}
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-3 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                        >
                            <p>Share your experience...</p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={openModal}
                            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 shadow-md flex items-center gap-2"
                        >
                            <i className="fas fa-plus-circle"></i>
                            Create Post
                        </button>
                    </div>
                </div>

                {/* Modal for Creating Posts */}
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    className="flex items-center justify-center fixed inset-0 z-50"
                    overlayClassName="bg-black bg-opacity-60 fixed inset-0 z-40 backdrop-blur-sm"
                >
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md mx-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Post</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <select
                                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select a Category</option>
                                <option value="Problems">Problems</option>
                                <option value="Query">Query</option>
                                <option value="Suggestions">Suggestions</option>
                            </select>

                            <textarea
                                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 min-h-32 resize-none"
                                placeholder="What's on your mind?"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                required
                            />

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300">
                                <input
                                    type="file"
                                    multiple
                                    accept=".png,.jpg,.jpeg"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                >
                                    <i className="fas fa-images text-2xl mb-2"></i>
                                    <span>Add Photos</span>
                                    {imageFiles.length > 0 && (
                                        <span className="mt-2 text-blue-500 dark:text-blue-400">
                                            {imageFiles.length} {imageFiles.length === 1 ? 'file' : 'files'} selected
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-24"
                                    disabled={loading}
                                >
                                    {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
                                    {loading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* Posts Feed */}
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md w-full max-w-2xl mx-auto transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:shadow-lg"
                        >
                            {/* User Info Section */}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                    src={post.user?.image || "src/assets/icon/Abatars.png"}
                                    alt="User Profile"
                                />
                                <div>
                                    <div className="font-semibold text-gray-800 dark:text-white text-lg">
                                        {post.user?.fname && post.user?.lname ? `${post.user.fname} ${post.user.lname}` : "Anonymous User"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <i className="fas fa-clock text-xs"></i>
                                        {new Date(post.created_at).toLocaleString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            {/* Post Content */}
                            <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-line">{post.caption}</p>

                            {/* Post Images */}
                            {post.images.length > 0 && (
                                <div className="mb-4 rounded-xl overflow-hidden">
                                    <Swiper
                                        spaceBetween={0}
                                        slidesPerView={1}
                                        modules={[Navigation, Pagination]}
                                        pagination={{ clickable: true }}
                                        navigation
                                        className="rounded-xl"
                                    >
                                        {post.images.map((image, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="w-full h-72 sm:h-96 overflow-hidden rounded-xl">
                                                    <img
                                                        src={image}
                                                        alt={`Post image ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            )}

                            {/* Post Actions */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {/* Like Button */}
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${hasUserLikedPost(post)
                                        ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => handleLikePost(post._id)}
                                    disabled={isLoadingLikes[post._id]}
                                >
                                    <i className={`${hasUserLikedPost(post) ? 'fas' : 'far'} fa-heart`}></i>
                                    <span>{post.like_count}</span>
                                </button>

                                {/* Comment Button */}
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${visibleComments[post._id]
                                        ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => toggleCommentSection(post._id)}
                                >
                                    <i className="far fa-comment"></i>
                                    <span>{post.comments.length}</span>
                                </button>
                            </div>

                            {/* Comments Section */}
                            {visibleComments[post._id] && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                    {/* Display Existing Comments */}
                                    {post.comments.length > 0 ? (
                                        <div className="space-y-3">
                                            {post.comments.map((comment, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <img
                                                        src={comment.user?.image || "src/assets/icon/Abatars.png"}
                                                        alt="Commenter"
                                                        className="w-8 h-8 rounded-full object-cover mt-1"
                                                    />
                                                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex-1">
                                                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                            {comment.user?.fname && comment.user?.lname
                                                                ? `${comment.user.fname} ${comment.user.lname}`
                                                                : "Anonymous"}
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                            No comments yet. Be the first to comment!
                                        </div>
                                    )}

                                    {/* Comment Input */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <img
                                            src={user?.image || "src/assets/icon/Abatars.png"}
                                            alt="Your Avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentText[post._id] || ""}
                                                onChange={(e) => handleCommentChange(post._id, e.target.value)}
                                                className="w-full p-3 pr-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                            <button
                                                onClick={() => handleCommentSubmit(post._id)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                                                disabled={!commentText[post._id] || commentLoading[post._id]}
                                            >
                                                {commentLoading[post._id] ? (
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                ) : (
                                                    <i className="fas fa-paper-plane"></i>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Empty State */}
                    {posts.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-2xl mx-auto text-center">
                            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                                <i className="far fa-newspaper"></i>
                            </div>
                            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No posts yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to share your experience!</p>
                            <button
                                onClick={openModal}
                                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 shadow-md"
                            >
                                Create Post
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
