import React, { useState, useEffect } from "react";
import axios from "axios";
import '../style/style.css';

function ProfilePage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("");
    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const userCookie = cookies.find((row) => row.startsWith("username="));
        if (userCookie) {
            const value = userCookie.split("=")[1];
            setUsername(value);
        }
    }, []);
    const logout = async (e) => {
        try {
            const res = await axios.post("http://localhost:5000/auth/logout", {}, {
                withCredentials: true,
            });
            setMessage(res.data.message || "Logged out successfully");
            setUsername("");
            setPassword("");
            window.location.href = "/";
        } catch (err) {
            const data = err.response?.data;
            alert(data?.error || "Logout failed.");
        }
    };
    return (
        <div>
            <h2 class="title">Profile Page</h2>
            {username ? (
                <div class="profile-info">
                    <p>Username: {username}</p>
                </div>

            ) : (
                <p>No user logged in.</p>
            )}
            <br />
            <button
                class="btn"
                onClick={() => (window.location.href = "/")}
                style={{ padding: "0.5rem", cursor: "pointer" }}
            >
                Login Page
            </button>
            <button
                class="btn"
                onClick={logout}
                style={{ padding: "0.5rem", cursor: "pointer", marginLeft: "1rem" }}
            >
                Logout
            </button>
            {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
        </div>
    );
}

export default ProfilePage;
