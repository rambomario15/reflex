import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLoggedIn);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#333",
        padding: "0.75rem 1rem",
      }}
    >
      <Link
        to="/"
        className={`navbar-link ${
          location.pathname === "/" ? "navbar-active" : ""
        }`}
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        Reflex Lab
      </Link>

      <div style={{ display: "flex", gap: "1rem" }}>
        {!loggedIn && (
          <>
            <Link
              to="/login"
              className={`navbar-link ${
                location.pathname === "/login" ? "navbar-active" : ""
              }`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={`navbar-link ${
                location.pathname === "/signup" ? "navbar-active" : ""
              }`}
            >
              Sign Up
            </Link>
          </>
        )}

        {loggedIn && (
          <Link
            to="/profile"
            className={`navbar-link ${
              location.pathname === "/profile" ? "navbar-active" : ""
            }`}
          >
            Profile
          </Link>
        )}

        {loggedIn && (
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
