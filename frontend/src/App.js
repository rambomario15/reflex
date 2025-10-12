import express from "express";
import cors from "cors";
import authRoutes from "./api/routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
