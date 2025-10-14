import React, { useState, useEffect } from "react";

function ProfilePage() {
    const [username, setUsername] = useState("");
    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const userCookie = cookies.find((row) => row.startsWith("username="));
        if (userCookie) {
            const value = userCookie.split("=")[1];
            setUsername(value);
        }
    }, []);
    return (
        <div>
            <h2>Profile Page</h2>
            {username ? (
                <p>Username: {username}</p>
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
