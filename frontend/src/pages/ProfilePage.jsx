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
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
            setLastLogin(localStorage.getItem("createdAt") || "N/A");
        } else { }
    }, [navigate]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!username) {
            setMessage("Error: Cannot change password without a username.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/auth/change-password", {
                username,
                currentPassword,
                newPassword,
            }, {
                withCredentials: true,
            });

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
                    <p> Last Login: {lastLogin }</p>
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
