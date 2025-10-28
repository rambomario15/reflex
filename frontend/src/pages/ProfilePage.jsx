import React, { useState, useEffect } from "react";
import axios from "axios";

function ProfilePage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const userCookie = cookies.find((row) => row.startsWith("username="));
        if (userCookie) {
            const value = userCookie.split("=")[1];
            setUsername(value);
        }
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/auth/change-password", {
                username,
                currentPassword,
                newPassword,
            });
            setMessage(res.data.message);
            setCurrentPassword("");
            setNewPassword("");
            setShowForm(false);

            
            document.cookie = `password=${newPassword}; path=/`;
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
                    <p>Password: {"*".repeat(password.length)}</p>

                    
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
                <p>No user logged in.</p>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}

export default ProfilePage;
