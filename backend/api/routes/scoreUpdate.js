import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/aim-trainer", async (req, res) => {    // path: update/update-score
  const { username, score, misses, accuracy, speed } = req.body;

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
        misses: misses,
        accuracy: accuracy,
        speed: speed,
        play_time: new Date(),
      },
    });


    res.status(200).json({ message: "Score recorded successfully!" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err}` });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    // Find the Aim Trainer game ID
    const aimTrainer = await prisma.games.findUnique({
      where: { name: "Aim Trainer" }
    });

    if (!aimTrainer) {
      return res.status(404).json({ message: "Aim Trainer game not found" });
    }

    // Fetch top scores for that game
    const scores = await prisma.scores.findMany({
      where: { game_id: aimTrainer.id },
      orderBy: { hits: "desc" },
      take: 20,
      include: {
        users: true,
        games: true
      }
    });

    // Format results for frontend
    const formatted = scores.map((s) => ({
      id: s.id,
      username: s.users.username,
      hits: s.hits,
      misses: s.misses,
      accuracy: s.accuracy,
      speed: s.speed,
      play_time: s.play_time,
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reaction-time", async (req, res) => {    // path: update/reaction-time
  const { username, reactionTime } = req.body;
  try {
    // makes sure there is a user
    const user = await prisma.users.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
    // makes sure the game is in the game table
    const game = await prisma.games.findUnique({
      where: { name: "Reaction Time" },
    });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    // adds score to scores table
    await prisma.scores.create({
      data: {
        user_id: user.id,
        game_id: game.id,
        play_time: new Date(),
        reactionTime: reactionTime
      },
    });
    res.status(200).json({ message: "Score recorded successfully!" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err}` });
  }
});

export default router;
