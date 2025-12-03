import React, { useEffect, useState } from "react";
import axios from "axios";

function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [selectedGame, setSelectedGame] = useState("aim");

  const handleGameChange = (event) => {
    setSelectedGame(event.target.value);
  };

  const getTitle = () => {
    return selectedGame === "aim"
      ? "Aim Trainer Leaderboard"
      : "reaction"
      ? "Reaction Time Leaderboard"
      : "Tracking Game Leaderboard";
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/update/leaderboard/" + selectedGame
        );
        setScores(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
    };

    fetchScores();
  }, [selectedGame]);

  return (
    <div>
      <select
        onChange={handleGameChange}
        value={selectedGame}
        style={{
          margin: "1rem",
          padding: "0.5rem",
          fontSize: "1rem",
          borderRadius: "8px",
          position: "absolute",
          right: "0.25rem",
          top: "4rem",
        }}
      >
        <option value="aim">Aim Trainer</option>
        <option value="reaction">Reaction Time</option>
        <option value="tracking">Target Following</option>
      </select>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>{getTitle()}</h2>

        {selectedGame == "aim" ? (
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
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Rank
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  User
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Score
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Accuracy
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Avg. Speed
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {scores.map((row, index) => (
                <tr key={row.id}>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {row.username}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {row.hits}
                  </td>
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
        ) : selectedGame == "reaction" ? (
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
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Rank
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  User
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Reaction Time
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {scores.map((row, index) => (
                <tr key={row.id}>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {row.username}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {row.reactionTime}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {new Date(row.play_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : selectedGame == "tracking" ? (
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
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Rank
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  User
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Accuracy
                </th>
                <th style={{ padding: "10px", border: "1px solid black" }}>
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {scores.map((row, index) => (
                <tr key={row.id}>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {row.username}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {row.accuracy !== null &&
                    row.accuracy !== undefined &&
                    row.accuracy >= 0.01
                      ? `${row.accuracy} seconds`
                      : "—"}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid gray" }}>
                    {new Date(row.play_time).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p> oops smth went wrong </p>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;
