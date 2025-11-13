import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    try {
      const res = await axios.post("http://localhost:5000/auth/login", form, {
        withCredentials: true,
      });

      setMessage(res.data.message || "Login successful!");

      navigate("/profile");
    } catch (err) {
      const data = err.response?.data;
       if (err.response?.status === 429) {
    setMessage(data.message || "Too many attempts. Try again later.");
    return;
      }
      if (data?.error === "Invalid password") {
        setMessage(`Incorrect Username or Password`); // Changed so it doesn't reveal which one is wrong
      } else if (data?.error === "User not found") {
        setMessage(`User not found`);
      } else {
        setMessage(data?.error || "Login failed. Server error.");
      }
    }
  };

  return (
    <div class="login-page">
      <h1 class="title">Login</h1>
      <form onSubmit={handleSubmit} class="form">
        <input
          class="input-group"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={{ marginRight: "5px" }}
        />
        <input
          class="input-group"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ marginRight: "5px" }}
        />
        <button class="btn" type="submit">
          Login
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default LoginPage;
