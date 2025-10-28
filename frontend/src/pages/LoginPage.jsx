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

    try {
      const res = await axios.post("http://localhost:5000/auth/login", form, {
        withCredentials: true,
      });

      setMessage(res.data.message || "Login successful!");

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", form.username);

      navigate("/profile");

    } catch (err) {
      const data = err.response?.data;
      if (data?.error == "Invalid password") {
        setMessage(
          `Incorrect Password`
        );
      } else {
        setMessage(data?.error || "Login failed.");
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
      <p>{message}</p>
    </div>
  );
}

export default LoginPage;
