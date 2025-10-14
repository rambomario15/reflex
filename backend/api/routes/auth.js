import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { username } });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (password !== user.password) {
      return res.status(400).json({
        error: "Invalid password",
        expected: user.password,
      });
    }
    res.cookie("username", username, {
      httpOnly: false,
      sameSite: "lax",
      secure: false
    });
    res.cookie("password", password, {
      httpOnly: false,
      sameSite: "lax",
      secure: false
    });
    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Signup body:", req.body);

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

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password,
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
router.post("/profile", async (req, res) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const parts = cookie.split('=');
      if (parts.length === 2) {
        acc[parts[0].trim()] = parts[1].trim();
      }
      return acc;
    }, {});
    res.send(`Manual cookie value: ${cookies.myManualCookie || 'Not found'}`);
  } else {
    res.send('No cookies found.');
  }
});
export default router;
