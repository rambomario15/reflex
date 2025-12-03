import React, { useState } from "react";
import axios from "axios";
import "../style/SignupPage.css";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("Required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/signup",
        { username, email, password }
      );

      if (res.status === 201) {
        window.location.href = "/login";
      }
    } catch (err) {
      const data = err.response?.data;
      setMessage(data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSubmit}>
        <h1 className="signup-title">Reflex Lab Sign Up</h1>

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
            className={`input-field ${message && !email ? "input-error" : ""}`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message && !email && <p className="error-text">Required</p>}
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

        <button className="signup-btn" type="submit">
          Create Account
        </button>

        {message && username && email && password && (
          <p className="error-global">{message}</p>
        )}
      </form>
    </div>
  );
}
