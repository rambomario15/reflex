import React, { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const START_SPEED = 1.5; // pixels per frame
const SPEED_INCREASE_INTERVAL = 3000; // every 3 seconds
const RADIUS = 40; // smaller circle
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 500;

function TargetFollowing() {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hoverTime, setHoverTime] = useState(0); // ms hovered
    const [username, setUsername] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [message, setMessage] = useState("Click Start to begin!"); // Keep for status feedback
    const navigate = useNavigate();

    const target = useRef({
        x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2,
        vx: START_SPEED,
        vy: START_SPEED,
        radius: RADIUS
    });

    const hoverStartRef = useRef(null);
    const speedTimerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isPlayingRef = useRef(false); // Crucial for animation loop

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

    const updateDB = async (hoverTime) => {
        try {
            const res = await axios.post("http://localhost:5000/update/target-following",
                { username, targetFollowing: (hoverTime / 1000).toFixed(3) },
                { withCredentials: true }
            );
        } catch (err) {
            console.error("Update score failed:", err);
        }
    }

    // End game logic
    const endGame = useCallback((saveResult = true) => {
        // Stop animation and timers
        cancelAnimationFrame(animationFrameRef.current);
        clearInterval(speedTimerRef.current);

        // Update refs and state
        isPlayingRef.current = false;
        setIsPlaying(false);
        setHasStarted(false);

        let finalTime = hoverTime;

        // Compute final hover time
        if (hoverStartRef.current !== null) {
            const delta = performance.now() - hoverStartRef.current;
            finalTime += delta;
            hoverStartRef.current = null;
            setHoverTime(finalTime);
        }

        if (saveResult) {
            setMessage("Game Over!");
            // Call updateDB with the final time in milliseconds
            updateDB(finalTime);
        } else {
            setMessage("Game stopped.");
        }
    }, [hoverTime, updateDB]);

    // DRAW gradient circle - Wrapped in useCallback for stability
    const drawCircle = useCallback((ctx) => {
        const { x, y, radius } = target.current;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // gradient fill
        const grad = ctx.createRadialGradient(
            x - radius / 3, y - radius / 3, radius * 0.2,
            x, y, radius
        );

        grad.addColorStop(0, "#7fb3ff"); // light center
        grad.addColorStop(1, "#0047ff"); // deep edge

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }, []); // Empty dependency array as target is a useRef object and is stable

    // MOVE circle each animation frame
    const updatePosition = useCallback(() => {
        const canvas = canvasRef.current;
        // Added check to ensure canvas is mounted before getting context
        if (!canvas) {
            animationFrameRef.current = requestAnimationFrame(updatePosition);
            return;
        }

        const ctx = canvas.getContext("2d");
        const t = target.current;

        if (isPlayingRef.current) {
            t.x += t.vx;
            t.y += t.vy;

            // bounce off walls
            if (t.x - t.radius < 0 || t.x + t.radius > canvas.width) t.vx *= -1;
            if (t.y - t.radius < 0 || t.y + t.radius > canvas.height) t.vy *= -1;
        }

        drawCircle(ctx);
        animationFrameRef.current = requestAnimationFrame(updatePosition);
    }, [drawCircle]);

    // detect if mouse is inside circle
    const handleMouseMove = useCallback((e) => {
        if (!isPlaying) return;

        const canvas = canvasRef.current;
        if (!canvas) return; // Added check for canvas null

        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const dx = mx - target.current.x;
        const dy = my - target.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const inside = dist <= target.current.radius;

        if (!hasStarted) {
            // Only start if user actually enters the circle
            if (inside) {
                setHasStarted(true);
                hoverStartRef.current = performance.now();
                setMessage("Keep the cursor inside!");
            }
            return; // Ignore everything until started
        }

        if (inside) {
            // start hover timer if not already started
            if (hoverStartRef.current === null) {
                hoverStartRef.current = performance.now();
            }
        } else {
            // user FAILED — stop game
            if (hoverStartRef.current !== null) {
                const delta = performance.now() - hoverStartRef.current;
                setHoverTime((prev) => prev + delta);
            }
            endGame(true);
        }
    }, [hasStarted, isPlaying, endGame]);

    // start game
    const startGame = useCallback(() => {
        setIsPlaying(true);
        isPlayingRef.current = true; // Set ref to true
        setHasStarted(false);
        setHoverTime(0);
        setMessage("Stay on the target!");

        hoverStartRef.current = null;

        // reset speed and position
        target.current.x = CANVAS_WIDTH / 2;
        target.current.y = CANVAS_HEIGHT / 2;
        target.current.vx = START_SPEED;
        target.current.vy = START_SPEED;

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            drawCircle(ctx);
        }

        // animation loop
        animationFrameRef.current = requestAnimationFrame(updatePosition);

        // speed-up interval
        speedTimerRef.current = setInterval(() => {
            // Increase speed by 10%
            target.current.vx *= 1.1;
            target.current.vy *= 1.1;
            setMessage(`Speed increased! Current speed: ${Math.abs(target.current.vx).toFixed(2)}`);
        }, SPEED_INCREASE_INTERVAL);
    }, [drawCircle, updatePosition]);

    // initial draw and cleanup
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            drawCircle(ctx);
        }

        // Cleanup function
        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            clearInterval(speedTimerRef.current);
        };
    }, [drawCircle]);

    return (
        <div style={{ textAlign: "center", position: "relative" }}>
            <h2
                style={{
                    fontFamily: '"Lucida Console", Monaco, monospace',
                    fontSize: "36px",
                    letterSpacing: "1px",
                }}
            >
                Target Following
            </h2>
            
            <p style={{marginBottom: "10px", color: "#666"}}>{message}</p>

            <div style={{ position: "relative", display: "inline-block" }}>
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={500}
                    style={{
                        border: "2px solid black",
                        backgroundColor: "white",
                        cursor: "crosshair",
                    }}
                    onMouseMove={handleMouseMove}
                />
            </div>

            {/* Start button */}
            <div style={{ marginTop: "1rem" }}>
                {!isPlaying ? (
                    <button
                        onClick={startGame}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        {hoverTime === 0 ? "Start Game" : "Restart Game"}
                    </button>
                ) : (
                    <button
                        onClick={() => endGame(false)}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                    >
                        Stop
                    </button>
                )}
            </div>

            {/* Game Over */}
            {!isPlaying && hoverTime > 0 && (
                <div style={{ marginTop: "1rem" }}>
                    <h3>Final Hover Time: {(hoverTime / 1000).toFixed(3)}s</h3>
                    <p><em>Saved to database!</em></p>
                </div>
            )}
        </div>
    );
}

export default TargetFollowing;
