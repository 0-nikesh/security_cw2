import React from 'react';

const PostCard = ({ user, date, text, tags, likes, comments, reposts, image }) => {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', padding: '15px' }}>
      <h3>{user}</h3>
      <p style={{ color: 'gray' }}>{date}</p>
      <p>{text}</p>
      {image && <img src={image} alt="Post" style={{ width: '100%', borderRadius: '8px' }} />}
      <div style={{ marginTop: '10px' }}>
        {tags.map((tag, index) => (
          <span key={index} style={{ marginRight: '8px', color: '#E53935' }}>#{tag}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <span>{likes} Likes</span>
        <span>{comments} Comments</span>
        <span>{reposts} Reposts</span>
      </div>
    </div>
  );
};

export default PostCard;
