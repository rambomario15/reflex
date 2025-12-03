import React, { useState } from "react";
import axios from "axios";
import "../style/LoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        { username, password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        window.location.href = "/";
      }
    } catch (err) {
      const data = err.response?.data;
      setMessage(data?.error || "Login failed.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1 className="login-title">Login to Reflex Lab</h1>

        <div className="input-group">
          <input
            className={`input-field ${message && !username ? "input-error" : ""}`}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {message && !username && <p className="error-text">Required</p>}
        </div>

        <div className="input-group">
          <input
            className={`input-field ${message && !password ? "input-error" : ""}`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {message && !password && <p className="error-text">Required</p>}
        </div>

        <button className="login-btn" type="submit">Login</button>

        {message && username && password && (
          <p className="error-global">{message}</p>
        )}
      </form>
    </div>
  );
}
