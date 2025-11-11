import React, { useEffect, useState } from "react";
import axios from "axios";

function LeaderboardPage() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get("http://localhost:5000/update/leaderboard");
        setScores(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
    };

    fetchScores();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Aim Trainer Leaderboard</h2>

      <table
        style={{
          margin: "1rem auto",
          borderCollapse: "collapse",
          width: "80%",
          fontSize: "1.2rem",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#ddd" }}>
            <th style={{ padding: "10px", border: "1px solid black" }}>Rank</th>
            <th style={{ padding: "10px", border: "1px solid black" }}>User</th>
            <th style={{ padding: "10px", border: "1px solid black" }}>Score</th>
            <th style={{ padding: "10px", border: "1px solid black" }}>Accuracy</th>
            <th style={{ padding: "10px", border: "1px solid black" }}>Avg. Speed</th>
            <th style={{ padding: "10px", border: "1px solid black" }}>Date</th>
          </tr>
        </thead>

        <tbody>
          {scores.map((row, index) => (
            <tr key={row.id}>
              <td style={{ padding: "10px", border: "1px solid gray" }}>{index + 1}</td>
              <td style={{ padding: "10px", border: "1px solid gray" }}>{row.username}</td>
              <td style={{ padding: "10px", border: "1px solid gray" }}>{row.hits}</td>
              <td style={{ padding: "10px", border: "1px solid gray" }}>
                {row.accuracy !== null && row.accuracy !== undefined
                  ? `${row.accuracy}%`
                  : "—"}
              </td>
              <td style={{ padding: "10px", border: "1px solid gray" }}>
                {row.speed !== null && row.speed !== undefined
                  ? `${row.speed}s`
                  : "—"}
              </td>
              <td style={{ padding: "10px", border: "1px solid gray" }}>
                {new Date(row.play_time).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardPage;
