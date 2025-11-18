import React, { useEffect, useState } from "react";
import "../style/HomePage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  // Check session on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/auth/check-session",
          {},
          { withCredentials: true }
        );

        if (res.data.isAuthenticated) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        setLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  const handleStart = () => {
    if (loggedIn) {
      navigate("/aim-trainer");     // user logged in → go to Aim Trainer
    } else {
      navigate("/login");          // not logged in → go to Login
    }
  };

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="home-title">Reflex Lab</h1>
        <p className="home-subtitle">
          A simple and effective aim trainer designed to sharpen your precision,
          reaction time, and tracking abilities.
        </p>

        <button className="start-btn" onClick={handleStart}>
          Start Training
        </button>
      </div>

      <footer className="home-footer">
        Created by Markell Peterson • Tyler Bullock • Ramsey Makan
      </footer>
    </div>
  );
}
