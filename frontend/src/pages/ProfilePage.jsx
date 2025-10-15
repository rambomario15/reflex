import React, { useState, useEffect } from "react";
import axios from "axios";
import '../style/style.css'; // Adjust the path as needed

function ProfilePage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("")
    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const userCookie = cookies.find((row) => row.startsWith("username="));
        if (userCookie) {
            const value = userCookie.split("=")[1];
            setUsername(value);
        }
        const passCookie = cookies.find((row) => row.startsWith("password="));
        if (passCookie) {
            const value = passCookie.split("=")[1];
            setPassword(value);
        }
    }, []);
    const logout = async (e) => {
        try {
            const res = await axios.post("http://localhost:5000/auth/logout", {}, {
                withCredentials: true,
            });
            alert(res.data.message || "Logged out successfully!");
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
            <h2>Profile Page</h2>
            {username ? (
                <div class="profile-info">
                    <p>Username: {username}</p>
                    <p>Password: {password}</p>
                </div>

            ) : (
                <p>No user logged in.</p>
            )}
            <br />
            <button
                onClick={() => (window.location.href = "/")}
                style={{ padding: "0.5rem", cursor: "pointer" }}
            >
                Login Page
            </button>
            <button
                onClick={logout}
                style={{ padding: "0.5rem", cursor: "pointer", marginLeft: "1rem" }}
            >
                Logout
            </button>

        </div>
    );
}

export default ProfilePage;
