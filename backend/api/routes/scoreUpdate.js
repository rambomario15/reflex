import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/update-score", async (req, res) => {    // path: update/update-score
  const { username, score } = req.body;

  try {
    // makes sure there is a user
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
    // makes sure the game is in the game table
    // ex: Aim Trainer, Reaction Time
    const game = await prisma.games.findUnique({
      where: { name: "Aim Trainer" },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // adds score to scores table
    await prisma.scores.create({
      data: {
        user_id: user.id,
        game_id: game.id,
        hits: score,
        play_time: new Date(),
      },
    });

    res.status(200).json({ message: "Score recorded successfully!" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err}` });
  }
});


export default router;
