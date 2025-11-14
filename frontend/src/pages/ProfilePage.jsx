import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [lastLogin, setLastLogin] = useState("");
  const [aimTrainerHighscore, setAimTrainerHighscore] = useState(null);
  const [reactionTimeHighscore, setReactionTimeHighscore] = useState(null);
  const [trackingHighscore, setTrackingHighscore] = useState(null);
  const navigate = useNavigate();

  // runs everytime you navigate, gets username from session ID
  const getUsername = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/check-session",
        {},
        {
          withCredentials: true,
        }
      );

      if (res.data.isAuthenticated) {
        setUsername(res.data.username);
        const now = new Date();
        setLastLogin(now.toLocaleDateString());
        return;
      } else {
        setUsername("N/A");
        return;
      }
    } catch (err) {
      setUsername("something went wrong...");
      return;
    }
  };

  useEffect(() => {
    getUsername();
  }, [navigate]);

  // Fetch highscore whenever username changes
  useEffect(() => {
    const getAllHighscores = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/profile/highscores",
          {
            params: { username },
            withCredentials: true,
          }
        );
        setAimTrainerHighscore(
          res.data["Aim Trainer"] ? res.data["Aim Trainer"].hits : null
        );
        setReactionTimeHighscore(
          res.data["Reaction Time"]
            ? res.data["Reaction Time"].reactionTime
            : null
        );
        setTrackingHighscore(
          res.data["Tracking"] ? res.data["Tracking"].accuracy : null
        );

        return res.data;
      } catch (err) {
        return null;
      }
    };

    if (
      username &&
      username !== "N/A" &&
      username !== "something went wrong..."
    ) {
      getAllHighscores();
    }
  }, [username]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!username) {
      setMessage("Error: Cannot change password without a username.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/change-password",
        {
          username,
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      setMessage(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setShowForm(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to change password");
    }
  };

  return (
    <div>
      <h2 class="title">Profile Page</h2>
      {username ? (
        <div class="profile-info">
          <p>Username: {username}</p>
          <p> Last Login: {lastLogin}</p>
          <h3>Aim Trainer Highscore: {aimTrainerHighscore}</h3>
          <h3>Reaction Time Highscore: {reactionTimeHighscore}</h3>
          <h3>Tracking Highscore: {trackingHighscore}</h3>
          <br />

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Change Password"}
          </button>
          {showForm && (
            <form onSubmit={handlePasswordChange}>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Update Password</button>
            </form>
          )}
        </div>
      ) : (
        <p>No user information available. Please login.</p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default ProfilePage;
