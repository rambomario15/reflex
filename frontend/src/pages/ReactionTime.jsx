import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function ReactionTime() {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [username, setUsername] = useState("");
    const [reactionTime, setReactionTime] = useState(null);
    const navigate = useNavigate();

    const [isAwaiting, setIsAwaiting] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const startTimeRef = useRef(null);
    const timeoutRef = useRef(null);

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

    const drawCanvas = (color, text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 36px 'Lucida Console', 'Monaco', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    };

    useEffect(() => {
        if (isPlaying) {
            setIsReady(false);
            setIsAwaiting(true);
            drawCanvas("#810505ff", "");

            const randomDelay = Math.random() * 4000 + 1000;
            timeoutRef.current = setTimeout(() => {
                setIsAwaiting(false);
                setIsReady(true);
                drawCanvas("#009900ff", "");
                startTimeRef.current = performance.now();
            }, randomDelay);
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            const initialColor = reactionTime !== null ? "#810505ff" : "#810505ff";
            const initialText = reactionTime !== null ? "Reaction Time Done" : "Click Start Test";
            drawCanvas(initialColor, initialText);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isPlaying, reactionTime]);

    const handleCanvasClick = () => {
        if (!isPlaying) {
            return;
        }

        if (isReady) {
            const endTime = performance.now();
            const timeTaken = Math.round(endTime - startTimeRef.current);

            setReactionTime(timeTaken);
            setIsPlaying(false);
            setIsReady(false);
            setIsAwaiting(false);

            updateDB(timeTaken);

        } else if (isAwaiting) {

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

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