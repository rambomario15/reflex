import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function ReactionTime() {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [username, setUsername] = useState("");
    const [reactionTime, setReactionTime] = useState(null);
    const navigate = useNavigate();

    // Game state variables
    const [isAwaiting, setIsAwaiting] = useState(false); // true when showing red, waiting for random delay
    const [isReady, setIsReady] = useState(false);     // true when showing green, timer is running
    const startTimeRef = useRef(null);                   // Stores the time the green screen appeared
    const timeoutRef = useRef(null);                     // Stores the timeout ID for the green screen delay

    // --- Authentication and DB Logic (Keeping yours) ---
    const getUsername = async () => {
        try {
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

    useEffect(() => {
        getUsername();
    }, [navigate]);

    const updateDB = async (time) => {
        if (!username || time === null || time === "Too Early!") return; // <- ADDED CHECK
        try {
            const res = await axios.post("http://localhost:5000/update/reaction-time",
                { username, reactionTime: time },
                { withCredentials: true }
            );
        } catch (err) {
            console.error("Update score failed:", err);
        }
    }
    // --- End Authentication and DB Logic ---

    // --- Canvas Sizing Logic (Keeping yours) ---
    const [canvasSize, setCanvasSize] = useState(() => {
        if (typeof window === "undefined") return { width: 600, height: 400 };
        return {
            width: Math.max(300, Math.min(1200, Math.floor(window.innerWidth * 0.8))),
            height: Math.max(200, Math.min(900, Math.floor(window.innerHeight * 0.6))),
        };
    });

    useEffect(() => {
        const updateSize = () => {
            setCanvasSize({
                width: Math.max(300, Math.min(1200, Math.floor(window.innerWidth * 0.8))),
                height: Math.max(200, Math.min(900, Math.floor(window.innerHeight * 0.6))),
            });
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);
    // --- End Canvas Sizing Logic ---

    // --- Game Logic ---

    // Function to draw the canvas based on game state
    const drawCanvas = (color, text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set background color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        ctx.fillStyle = "white";
        ctx.font = "bold 36px 'Lucida Console', 'Monaco', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    };

    // Main game loop effect
    useEffect(() => {
        // Initial state: Red, Awaiting
        if (isPlaying) {
            setIsReady(false);
            setIsAwaiting(true);
            drawCanvas("#810505ff", "Wait for Green..."); // Red state

            // Set up a random timeout for the green color change
            const randomDelay = Math.random() * 4000 + 2000; // 2000ms (2s) to 6000ms (6s)
            timeoutRef.current = setTimeout(() => {
                // Change to Ready (Green) state
                setIsAwaiting(false);
                setIsReady(true);
                drawCanvas("#009900ff", "CLICK NOW!"); // Green state
                startTimeRef.current = performance.now(); // Start the internal timer
            }, randomDelay);
        } else {
            // Cleanup on game end or reset
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            // Draw initial state or final score state
            const initialColor = reactionTime !== null ? "#810505ff" : "#810505ff";
            const initialText = reactionTime !== null ? "Reaction Time Done" : "Click Start Test";
            drawCanvas(initialColor, initialText);
        }

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isPlaying, reactionTime]); // Reruns when isPlaying or reactionTime changes

    // Handle the canvas click
    const handleCanvasClick = () => {
        if (!isPlaying) {
            // If game is not playing, clicking the canvas does nothing (start button is used)
            return;
        }

        if (isReady) {
            // Case 1: Clicked while Green (Success)
            const endTime = performance.now();
            const timeTaken = Math.round(endTime - startTimeRef.current);

            // Update state
            setReactionTime(timeTaken);
            setIsPlaying(false);
            setIsReady(false);
            setIsAwaiting(false);

            // Update DB with the score
            updateDB(timeTaken);

        } else if (isAwaiting) {
            // Case 2: Clicked while Red (Too Early)
            // Stop the game, clear timeout, and set a specific error time
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a special value to indicate a false start
            setReactionTime("Too Early!");
            setIsPlaying(false);
            setIsReady(false);
            setIsAwaiting(false);

        }
    };

    const handleStartClick = () => {
        setReactionTime(null);
        setIsPlaying(true);
    };

    const handlePlayAgainClick = () => {
        setReactionTime(null);
        setIsPlaying(true);
    };

    // --- End Game Logic ---

    // Final render
    const canvasColor = isReady ? "#009900ff" : "#810505ff";
    let canvasInstruction = "";

    if (!isPlaying) {
        if (reactionTime === null) {
            canvasInstruction = "Click Start Test";
        } else if (reactionTime === "Too Early!") {
            canvasInstruction = "Too Early! Click Play Again to try.";
        } else {
            canvasInstruction = `Reaction Time: ${reactionTime} ms`;
        }
    } else if (isAwaiting) {
        canvasInstruction = "Wait for Green...";
    } else if (isReady) {
        canvasInstruction = "CLICK NOW!";
    }

    return (
        <div style={{ textAlign: "center", position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
            <h2
                style={{
                    fontFamily: '"Lucida Console", "Monaco", monospace',
                    fontSize: "36px",
                    textAlign: "center",
                    letterSpacing: "1px",
                }}
            >
                Reaction Time Test
            </h2>
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                style={{ border: "3px solid black", backgroundColor: canvasColor, width: "100%", height: "auto", cursor: "pointer" }}
            />
            <div style={{ marginTop: "20px" }}>
                {isPlaying ? (
                    <p style={{ fontSize: "24px", fontFamily: '"Lucida Console", "Monaco", monospace' }}>
                        {isAwaiting ? "Click when the screen turns green!" : "Click NOW!"}
                    </p>
                ) : reactionTime !== null && reactionTime !== "Too Early!" ? (
                    <div>
                        <p style={{ fontSize: "24px", fontFamily: '"Lucida Console", "Monaco", monospace' }}>
                            Your reaction time: **{reactionTime} ms**
                        </p>
                        <button
                            onClick={handlePlayAgainClick}
                            style={{ padding: "10px 20px", fontSize: "18px", cursor: "pointer" }}
                        >
                            Play Again
                        </button>
                    </div>
                ) : reactionTime === "Too Early!" ? (
                    <div>
                        <p style={{ fontSize: "24px", fontFamily: '"Lucida Console", "Monaco", monospace', color: 'red' }}>
                            **Too Early!**
                        </p>
                        <button
                            onClick={handlePlayAgainClick}
                            style={{ padding: "10px 20px", fontSize: "18px", cursor: "pointer" }}
                        >
                            Play Again
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleStartClick}
                        style={{ padding: "10px 20px", fontSize: "18px", cursor: "pointer" }}
                    >
                        Start Test
                    </button>
                )}
            </div>
        </div>
    );

}

export default ReactionTime;