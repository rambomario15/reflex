import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
const router = express.Router();
const prisma = new PrismaClient();

// router.get("/aim-trainer/highscore", async (req, res) => {
//   const { username } = req.query;
//   try {
//     const user = await prisma.users.findUnique({
//       where: { username },
//     });
//     if (!user) {
//       return res.status(404).json({ message: `User not found: ${username}` });
//     }
//     const game = await prisma.games.findUnique({
//       where: { name: "Aim Trainer" },
//     });
//     if (!game) {
//       return res.status(404).json({ message: "Aim Trainer game not found" });
//     }
//     const highscore = await prisma.scores.findFirst({
//       where: {
//         user_id: user.id,
//         game_id: game.id,
//       },
//       orderBy: { hits: "desc" },
//     });
//     if (!highscore) {
//       return res.status(404).json({ message: "No scores found for this user" });
//     }
//     res.json(highscore);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching highscore", error: error.message });
//   }
// });

router.get("/highscores", async (req, res) => {
  const { username } = req.query;
  try {
    const user = await prisma.users.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: `User not found: ${username}` });
    }
    const gameNames = ["Aim Trainer", "Reaction Time", "Tracking"];
    const highscores = {};
    for (const name of gameNames) {
      const game = await prisma.games.findUnique({
        where: { name },
      });
      if (game) {
        if (name === "Aim Trainer") {
          const score = await prisma.scores.findFirst({
            where: {
              user_id: user.id,
              game_id: game.id,
            },
            orderBy: { hits: "desc" },
          });
          highscores[name] = score || null;
        } else if (name === "Reaction Time") {
          const score = await prisma.scores.findFirst({
            where: {
              user_id: user.id,
              game_id: game.id,
            },
            orderBy: { reactionTime: "asc" },
          });
          highscores[name] = score || null;
        } else if (name === "Tracking") {
          const score = await prisma.scores.findFirst({
            where: {
              user_id: user.id,
              game_id: game.id,
            },
            orderBy: { accuracy: "desc" },
          });
          highscores[name] = score || null;
        }
      }
    }
    res.json(highscores);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching highscores", error: error.message });
  }
});
export default router;
