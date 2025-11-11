import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./api/routes/auth.js";
import cookieParser from "cookie-parser";
import scoreRoutes from "./api/routes/scoreUpdate.js"
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,             // 10 requests max
  message: "Too many attempts. Try again later.",
});

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/auth", authLimiter);
app.use("/update", scoreRoutes)

app.listen(5000, () => console.log("Server running on port 5000"));
