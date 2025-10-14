import React, { useState, useEffect } from "react";

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
    return (
        <div>
            <h2>Profile Page</h2>
            {username ? (
                <div>
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
        </div>
    );
}

export default ProfilePage;
