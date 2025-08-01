import io from '../app.js'; // Import io instance
import Notification from "../model/Notification.js"; // Ensure correct path to Notification model
import Post from "../model/Post.js";
import upload from "../utils/multer.js"; // Multer middleware for Cloudinary uploads
import createUserNotification from '../utils/notificationHelper.js';


const createPost = async (req, res) => {
  req.folder = `posts/${req.user.id}`; // Cloudinary folder for posts

  upload.array("images", 5)(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload failed", error: err });
    }

    try {
      const { caption, category } = req.body;

      if (!caption || !category) {
        return res.status(400).json({ message: "Caption and category are required." });
      }

      const newPost = new Post({
        caption,
        category,
        user_id: req.user.id,
        images: req.files.map((file) => file.path),
      });

      const savedPost = await newPost.save();

      res.status(201).json({ message: "Post created successfully", data: savedPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Error creating post" });
    }
  });
};


const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user_id", "fname lname image") // Fetch user details
      .sort({ created_at: -1 }); // Show recent posts first

    res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};


const getPostById = async (req, res) => {
  const { id } = req.params;

  // Validate that the id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Post ID" });
  }

  try {
    const post = await Post.findById(id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (post) res.json({ message: "Post deleted" });
  else res.status(404).json({ message: "Post not found" });
};


const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.liked_by.includes(userId)) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    post.liked_by.push(userId);
    post.like_count += 1;
    await post.save();

    if (post.user_id.toString() !== userId.toString()) {
      const notification = {
        title: "Post Liked",
        description: `Your post "${post.caption}" was liked by ${req.user.name || "a user"}.`,
        user_id: post.user_id,
        date_posted: new Date(),
      };

      // Save to database
      await Notification.create(notification);

      // Emit real-time notification
      io.to(post.user_id.toString()).emit("notification", notification);
      console.log(`Notification sent to user: ${post.user_id}`);
    }

    res.json({ message: "Post liked successfully", post });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
};


const addComment = async (req, res) => {
  const { commentText } = req.body; // Extract comment text

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add new comment
    const comment = {
      user: req.user._id, // ID of the authenticated user
      text: commentText,  // The comment text
    };

    post.comments.push(comment); // Add the comment to the post
    await post.save();

    // Send a notification to the post owner
    if (post.user_id.toString() !== req.user._id.toString()) {
      await createUserNotification(
        "New Comment",
        `Your post "${post.caption}" received a comment: "${commentText}".`,
        post.user_id
      );
    }

    res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments, // Return all comments for the post
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

const getCommentsForPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("comments.user", "fname lname image"); // Fetch user details

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      postId: post._id,
      comments: post.comments, // Return comments with user details
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch posts for a specific user
    const posts = await Post.find({ user_id: userId })
      .populate("user_id", "fname lname image") // Fetch user details
      .sort({ created_at: -1 }); // Show recent posts first

    res.json({ posts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Error fetching user posts" });
  }
};





export { addComment, createPost, deletePost, getAllPosts, getCommentsForPost, getPostById, getUserPosts, likePost };

