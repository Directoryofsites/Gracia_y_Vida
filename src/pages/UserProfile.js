import React from 'react';

const UserProfile = () => {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-info">
        <div className="profile-field">
          <label>Name:</label>
          <span>John Doe</span>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <span>john.doe@example.com</span>
        </div>
        <div className="profile-field">
          <label>Member Since:</label>
          <span>January 1, 2025</span>
        </div>
      </div>
      <button>Edit Profile</button>
    </div>
  );
};

export default UserProfile;