import React, { useState } from "react";
import axios from "axios";
import '../style/style.css'; // Adjust the path as needed

function LoginPage() {

  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/login", form, {
        withCredentials: true,
      }); setMessage(res.data.message || "Login successful!");
    } catch (err) {
      const data = err.response?.data;
      if (data?.expected) {
        setMessage(
          `Invalid password. For testing, the correct password is: ${data.expected}`
        );
      } else {
        setMessage(data?.error || "Login failed.");
      }
    }
  };

  return (
    <div class="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} class="form">
        <input
          class="input-group"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={{ marginRight: '5px' }}

        />
        <input
          class="input-group"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ marginRight: '5px' }}

        />
        <button class="btn" type="submit">Login</button>
      </form>
      <br />
      <button
        class="btn"
        onClick={() => (window.location.href = "/signup")}
        style={{ padding: "0.5rem", cursor: "pointer", width: "100px" }}
      >
        Sign Up
      </button>
      <button
        class="btn"
        onClick={() => (window.location.href = "/profile")}
        style={{ padding: "0.5rem", cursor: "pointer", marginLeft: "1rem", width: "100px" }}
      >
        Profile Page
      </button>
      <p>{message}</p>
    </div>
  );
}

export default LoginPage;
