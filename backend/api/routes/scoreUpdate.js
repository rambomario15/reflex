import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/aim-trainer", async (req, res) => {
  // path: update/update-score
  const { username, score, misses, accuracy, speed } = req.body;
  if (score > 500) {
    return res
      .status(400)
      .json({ message: "Invalid score: Hits cannot exceed 500." });
  }
  try {
    // makes sure there is a user
    const user = await prisma.users.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
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

router.get("/leaderboard/:gameKey", async (req, res) => {
  try {
    const gameKey = req.params.gameKey;
    let gameName, orderByField, orderByDirection;

    if (gameKey === "aim") {
      gameName = "Aim Trainer";
      orderByField = "hits";
      orderByDirection = "desc";
    } else if (gameKey === "reaction") {
      gameName = "Reaction Time";
      orderByField = "reactionTime";
      orderByDirection = "asc";
    } else if (gameKey === "tracking") {
      gameName = "Tracking";
      orderByField = "accuracy";
      orderByDirection = "desc";
    } else {
      return res
        .status(400)
        .json({ message: "Invalid game specified in the URL." });
    }

    const game = await prisma.games.findUnique({
      where: { name: gameName },
    });

    if (!game) {
      return res
        .status(404)
        .json({ message: `${gameName} game not found in the database.` });
    }

    const scores = await prisma.scores.findMany({
      where: { game_id: game.id },
      orderBy: { [orderByField]: orderByDirection },
      take: 20,
      include: {
        users: true,
      },
    });

    const formatted = scores.map((s) => {
      const primaryScore = s[orderByField];
      if (gameKey === "reaction") {
        return {
          id: s.id,
          username: s.users.username,
          reactionTime: s.reactionTime,
          play_time: s.play_time,
        };
      } else if (gameKey === "aim") {
        return {
          id: s.id,
          username: s.users.username,
          hits: s.hits,
          misses: s.misses,
          accuracy: s.accuracy,
          speed: s.speed,
          play_time: s.play_time,
        };
      } else if (gameKey === "tracking") {
        return {
          id: s.id,
          username: s.users.username,
          accuracy: s.accuracy,
          play_time: s.play_time,
        };
      }
      return {};
    });

    res.json(formatted);
  } catch (err) {
    console.error("Dynamic Leaderboard fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reaction-time", async (req, res) => {
  const { username, reactionTime } = req.body;
  if (reactionTime <= 100) {
    return res.status(400).json({
      message: "Invalid reaction time: Score must be greater than 100ms.",
    });
  }
  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
    const game = await prisma.games.findUnique({
      where: { name: "Reaction Time" },
    });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    await prisma.scores.create({
      data: {
        user_id: user.id,
        game_id: game.id,
        play_time: new Date(),
        reactionTime: reactionTime,
      },
    });
    res.status(200).json({ message: "Score recorded successfully!" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err}` });
  }
});
router.post("/target-following", async (req, res) => {
  const { username, hoverTime } = req.body;
  if (parseFloat(hoverTime) > 600) {
    return res.status(400).json({
      message: `Invalid hover time: Score cannot exceed 600 seconds (10 minutes).`,
    });
  }
  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
    const game = await prisma.games.findUnique({
      where: { name: "Tracking" },
    });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    await prisma.scores.create({
      data: {
        user_id: user.id,
        game_id: game.id,
        play_time: new Date(),
        accuracy: hoverTime,
      },
    });
    res.status(200).json({ message: "Score recorded successfully!" });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err}` });
  }
});
export default router;
