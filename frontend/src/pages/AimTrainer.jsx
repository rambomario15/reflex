import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TIME_LIMIT = 30        // change to wtv you want

function AimTrainer() {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT); // TIME_LIMIT-second timer
    const [isPlaying, setIsPlaying] = useState(false);
    const [hitTimes, setHitTimes] = useState([]); // track reaction times
    const [misses, setMisses] = useState(0); // track misses
    const lastHitTime = useRef(null);
    const target = useRef({ x: 100, y: 100, radius: 36 });
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    // this gets run every time you navigate to the page, sets username for db updating purposes
    const getUsername = async () => {
        try {
            // checks session id to get username if logged in
            const res = await axios.post("http://localhost:5000/auth/check-session", {}, {
                withCredentials: true
            });

            if (res.data.isAuthenticated) {
                setUsername(res.data.username)
                return;
            } else {
                setUsername("")
                return;
            }
        } catch (err) {
            return;
        }
    }

    // runs getUsername() everytime you navigate to this page
    useEffect(() => {
        getUsername();
    }, [navigate]);

    // updates the db with the score
    const updateDB = async () => {
        // calculate average speed (modified from avgTime)
    const avgSpeed =
        hitTimes.length > 0
            ? (hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length).toFixed(3)
            : null;

    // calculate accuracy
    const accuracy =
        (score + misses) > 0
            ? ((score / (score + misses)) * 100).toFixed(2)
            : null;

        try {
            const res = await axios.post("http://localhost:5000/update/aim-trainer",
                { username, score, misses,accuracy,speed: avgSpeed },    // can update this line with wtv we want to store in db
                { withCredentials: true }
            );
        } catch (err) {
            console.error("Update score failed:", err);
        }
    }

    // draw target
    const drawTarget = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const { x, y, radius } = target.current;

        // Outer red ring
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red"; // red
        ctx.fill();

        // Middle white ring
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.66, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();

        // Inner red circle
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.33, 0, 2 * Math.PI);
        ctx.fillStyle = "red"; // red
        ctx.fill();
    };

    // move target to a random location
    const moveTarget = (ctx) => {
        const radius = target.current.radius;
        target.current.x = radius + Math.random() * (ctx.canvas.width - 2 * radius);
        target.current.y = radius + Math.random() * (ctx.canvas.height - 2 * radius);
        drawTarget(ctx);
    };

    // handle clicks
    const handleCanvasClick = (e) => {
        if (!isPlaying) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - target.current.x;
        const dy = y - target.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < target.current.radius) {
            const now = Date.now();

            console.log("Clicked inside target!");

            if (lastHitTime.current !== null) {
                const reactionTime = (now - lastHitTime.current) / 1000;
                setHitTimes((prev) => [...prev, reactionTime]);
                console.log(`Recorded reaction time: ${reactionTime}s`);
                console.log("hitTimes array:", [...hitTimes, reactionTime]); // show what will be stored
            } else {
                console.log("First hit, no reaction time recorded");
            }
            lastHitTime.current = now;
            console.log("Updated lastHitTime to:", lastHitTime.current);

            setScore((prev) => prev + 1);
            const ctx = canvasRef.current.getContext("2d");
            moveTarget(ctx);
        } else {
            console.log("Missed target");
            setMisses(prev => prev + 1);
        }
    };

    // start/resume game
    const startGame = () => {
        if (timeLeft === 0 || timeLeft === TIME_LIMIT) {
            // New game (either fresh start or after previous game ended)
            setScore(0);           // reset score
            setHitTimes([]);       // reset reaction times
            setTimeLeft(TIME_LIMIT);       // reset timer
            lastHitTime.current = Date.now(); // start reaction timer
            setIsPlaying(true);
        } else if (!isPlaying && timeLeft > 0) {
            // Resume from pause
            lastHitTime.current = Date.now(); // reset reference for reaction times
            setIsPlaying(true);
        }
    };

    const pauseGame = () => {
        setIsPlaying(false);
    };

    // timer countdown
    useEffect(() => {
        if (!isPlaying) return;
        if (timeLeft <= 0) {
            setIsPlaying(false);
            updateDB(); // where we update score
            return;
        }
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [isPlaying, timeLeft]);

    // initial draw
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        drawTarget(ctx);
    }, []);

    const avgTime =
        hitTimes.length > 0
            ? (hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length).toFixed(2)
            : 0;

    return (
        <div style={{ textAlign: "center", position: "relative" }}>
            <h2
                style={{
                    fontFamily: '"Lucida Console", "Monaco", monospace',
                    fontSize: "36px",
                    textAlign: "center",
                    letterSpacing: "1px",
                }}
            >
                Aim Trainer
            </h2>
            <div style={{ position: "relative", display: "inline-block" }}>
                {/* Top-left: Time */}
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        color: "black",
                        fontWeight: "bold",
                        textAlign: "left",
                        fontSize: "24px",
                        fontFamily: "'Verdana', Geneva, sans-serif",
                    }}
                >
                    TIME<br />{timeLeft}s
                </div>

                {/* Top-right: Score */}
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        color: "black",
                        fontWeight: "bold",
                        textAlign: "right",
                        fontSize: "24px",
                        fontFamily: "'Verdana', Geneva, sans-serif",
                    }}
                >
                    SCORE<br />{score}
                </div>

                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={500}
                    style={{
                        border: "2px solid black",
                        backgroundColor: "white",
                        cursor: "crosshair",
                    }}
                    onClick={handleCanvasClick}
                ></canvas>
            </div>

            {/* Start/Pause/Resume button */}
            <div style={{ marginTop: "1rem" }}>
                {isPlaying ? (
                    <button
                        onClick={pauseGame}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        Pause Game
                    </button>
                ) : timeLeft === 0 ? (
                    <button
                        onClick={startGame}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        New Game
                    </button>
                ) : (
                    <button
                        onClick={startGame}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        {timeLeft === TIME_LIMIT ? "Start Game" : "Resume Game"}
                    </button>
                )}
            </div>


            {/* End of game message */}
            {!isPlaying && timeLeft <= 0 && (
                <div style={{ marginTop: "1rem" }}>
                    <h3>Time’s up! Final Score: {score}</h3>
                    <p>Average Time per Target: {avgTime}s</p>
                    <p><em>Saved to database!</em></p>
                </div>
            )}
        </div>
    );

}

export default AimTrainer;