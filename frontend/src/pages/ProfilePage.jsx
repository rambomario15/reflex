import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);


function ProfilePage() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [lastLogin, setLastLogin] = useState("");
  const [aimTrainerHighscore, setAimTrainerHighscore] = useState(null);
  const [reactionTimeHighscore, setReactionTimeHighscore] = useState(null);
  const [trackingHighscore, setTrackingHighscore] = useState(null);
  const [aimTrainerScores, setAimTrainerScores] = useState(null);
  const [reactionTimeScores, setReactionTimeScores] = useState(null);
  const [trackingScores, setTrackingScores] = useState(null);
  const [selectedGame, setSelectedGame] = useState("aim");

  const handleGameChange = (event) => {
    setSelectedGame(event.target.value);

  };
  const navigate = useNavigate();

  // runs everytime you navigate, gets username from session ID
  const getUsername = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/check-session",
        {},
        {
          withCredentials: true,
        }
      );

      if (res.data.isAuthenticated) {
        setUsername(res.data.username);
        const now = new Date();
        setLastLogin(now.toLocaleDateString());
        return;
      } else {
        setUsername("N/A");
        return;
      }
    } catch (err) {
      setUsername("something went wrong...");
      return;
    }
  };

  useEffect(() => {
    getUsername();
  }, [navigate]);

  // Fetch highscore whenever username changes
  useEffect(() => {
    const getAllHighscores = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/profile/highscores",
          {
            params: { username },
            withCredentials: true,
          }
        );
        setAimTrainerHighscore(
          res.data["Aim Trainer"] ? res.data["Aim Trainer"].hits : "N/A"
        );
        setReactionTimeHighscore(
          res.data["Reaction Time"]
            ? res.data["Reaction Time"].reactionTime
            : "N/A"
        );
        setTrackingHighscore(
          res.data["Tracking"] ? res.data["Tracking"].accuracy : "N/A"
        );

        return res.data;
      } catch (err) {
        return null;
      }
    };

    if (
      username &&
      username !== "N/A" &&
      username !== "something went wrong..."
    ) {
      getAllHighscores();
    }
  }, [username]);
  useEffect(() => {
    const getAllScores = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/profile/get-graph-data",
          {
            params: { username },
            withCredentials: true,
          }
        );

        setAimTrainerScores(res.data["Aim Trainer"] || []);
        setReactionTimeScores(res.data["Reaction Time"] || []);
        setTrackingScores(res.data["Tracking"] || []);

        return res.data;
      } catch (err) {
        return null;
      }
    };

    if (
      username &&
      username !== "N/A" &&
      username !== "something went wrong..."
    ) {
      getAllScores();
    }
  }, [username]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!username) {
      setMessage("Error: Cannot change password without a username.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/change-password",
        {
          username,
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      setMessage(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setShowForm(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to change password");
    }
  };
  const sortScoresByTime = (scores) => {
    if (!scores) return [];
    return [...scores].sort(
      (a, b) => new Date(a.play_time) - new Date(b.play_time)
    );
  };

  // Sorted scores for all games
  const sortedAimScores = sortScoresByTime(aimTrainerScores);
  const sortedReactionScores = sortScoresByTime(reactionTimeScores);
  const sortedTrackingScores = sortScoresByTime(trackingScores);

  // Labels: format each score's date
  const aimChartLabels = sortedAimScores.map((s) =>
    new Date(s.play_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
  const reactionChartLabels = sortedReactionScores.map((s) =>
    new Date(s.play_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
  const trackingChartLabels = sortedReactionScores.map((s) =>
    new Date(s.play_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );

  // Values: hits for each score
  const aimChartDataValues = sortedAimScores.map((s) => s.hits);
  const reactionChartValues = sortedReactionScores.map((s) => s.reactionTime);
  const trackingChartValues = sortedTrackingScores.map((s) => s.accuracy);

  // Chart.js data
  const aimLineData = {
    labels: aimChartLabels,
    datasets: [
      {
        label: "Aim Trainer Score",
        data: aimChartDataValues,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        tension: 0.5,
        pointRadius: 4,
      },
    ],
  };
  const reactionLineData = {
    labels: reactionChartLabels,
    datasets: [
      {
        label: "Reaction Time Speed",
        data: reactionChartValues,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        tension: 0.5,
        pointRadius: 4,
      },
    ],
  };

  const aimLineOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
  };
  const reactionLineOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
  };
  return (
    <div>

      {username ? (
        <div
          className="profile-container"
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div
            className="profile-info"
            style={{ flex: 1, minWidth: "250px" }}
          >
            <h2 className="title">Profile Page</h2>

            <p>Username: {username}</p>
            <p>Last Login: {lastLogin}</p>

            <h3>
              Aim Trainer Highscore:{" "}
              <span style={{ fontWeight: "normal" }}>{aimTrainerHighscore}</span>
            </h3>
            <h3>
              Reaction Time Highscore:{" "}
              <span style={{ fontWeight: "normal" }}>
                {reactionTimeHighscore}
              </span>
            </h3>
            <h3>
              Tracking Highscore:{" "}
              <span style={{ fontWeight: "normal" }}>{trackingHighscore}</span>
            </h3>

            <br />
            <button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Change Password"}
            </button>
            {showForm && (
              <form onSubmit={handlePasswordChange}>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit">Update Password</button>
              </form>
            )}
          </div>

          <div
            className="profile-graph"
            style={{ flex: 2, minWidth: "400px" }}
          >
            <select
              onChange={handleGameChange}
              value={selectedGame}
              style={{ margin: "1rem", padding: "0.5rem", fontSize: "1rem", borderRadius: "8px", position: "absolute", right: "0.25rem", top: "4rem" }}
            >
              <option value="aim">Aim Trainer</option>
              <option value="reaction">Reaction Time</option>
            </select>
            {selectedGame == "aim" ?
              (
                aimTrainerScores && aimTrainerScores.length > 0 && (
                  <div style={{ marginBottom: "40px" }}>
                    <h3>Aim Trainer Scores Over Time</h3>
                    <Line data={aimLineData} options={aimLineOptions} />
                  </div>
                )
              ) : (
                reactionTimeScores && reactionTimeScores.length > 0 && (
                  <div style={{ marginBottom: "40px" }}>
                    <h3>Reaction Time Speed over Time</h3>
                    <Line data={reactionLineData} options={reactionLineOptions} />
                  </div>
                )
              )}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="title">Profile Page</h2>
          <p>No user information available. Please login.</p>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>

  );
}

export default ProfilePage;
