import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js"; // adjust path as needed

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { username } });

    if (!user)
      return res.status(400).json({ error: "User not found" });

    // Plain-text comparison with "expected" field
    if (password !== user.password) {
      return res.status(400).json({
        error: "Invalid password",
        expected: user.password, // make sure this is sent
      });
    }

    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
