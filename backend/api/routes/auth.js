import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcrypt";
import e from "express";
import crypto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();

const sessions = new Map();
const generateSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { username } });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    const sessionId = generateSessionId();

    sessions.set(sessionId, {
      userId: user.id,
      username: user.username,
      createdAt: new Date(),
    });

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.users.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/change-password", async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { username } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { username },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/check-session", async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return res
      .status(401)
      .json({ isAuthenticated: false, error: "No session ID found" });
  }

  const session = sessions.get(sessionId);

  if (session) {
    return res.json({ isAuthenticated: true, username: session.username });
  } else {
    res.clearCookie("sessionId");
    return res
      .status(401)
      .json({ isAuthenticated: false, error: "Invalid session" });
  }
});

router.post("/logout", (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    sessions.delete(sessionId);
  }

  res.clearCookie("sessionId");

  res.json({ message: "Logout successful" });
});

export default router;
