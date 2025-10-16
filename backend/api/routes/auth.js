import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcrypt";


const router = express.Router();
const prisma = new PrismaClient();

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

    res.cookie("username", username, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: '/',
    });
    res.cookie("password", password, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: '/',
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
router.post("/logout", (req, res) => {
  res.clearCookie("username", { path: "/" });
  res.clearCookie("password", { path: "/" });
  res.json({ message: "Logged out successfully" });
});
export default router;
