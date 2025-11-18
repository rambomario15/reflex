import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./api/routes/auth.js";
import cookieParser from "cookie-parser";
import scoreRoutes from "./api/routes/scoreUpdate.js"
import profileRoutes from "./api/routes/profile.js";
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/update", scoreRoutes);
app.use("/profile", profileRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
