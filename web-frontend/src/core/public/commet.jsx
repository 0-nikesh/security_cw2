import React, { useEffect, useState } from "react";

const fetchComments = async (postId) => {
    try {
        const response = await axios.get(`/api/posts/${postId}/comments`, {
            headers: { Authorization: `Bearer ${authToken}` }, // Include auth token
        });
        return response.data.comments; // Return comments array
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
};


const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const loadComments = async () => {
            const fetchedComments = await fetchComments(postId);
            setComments(fetchedComments);
        };

        loadComments();
    }, [postId]);

    return (
        <div className="comments-section">
            <h3>Comments</h3>
            {comments.map((comment) => (
                <div key={comment._id} className="comment">
                    <p>
                        <strong>{comment.user.fname} {comment.user.lname}</strong>: {comment.text}
                    </p>
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
};

export default CommentsSection;
