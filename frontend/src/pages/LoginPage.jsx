// src/pages/LoginPage.jsx
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/api/login", form);
      setMessage(res.data.message || "Login successful!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="p-2 rounded bg-slate-700 border border-slate-600"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-2 rounded bg-slate-700 border border-slate-600"
            required
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Log In
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
        )}
      </div>
    </div>
  );
}
