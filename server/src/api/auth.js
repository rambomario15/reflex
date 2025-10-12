import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = express.Router();

// Example user table in ReflexDB:
// model User {
//   id       Int    @id @default(autoincrement())
//   username String @unique
//   password String
// }

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    res.json({ message: "Login successful", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
