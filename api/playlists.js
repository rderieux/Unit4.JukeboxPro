const express = require("express");
const router = express.Router();
module.exports = router;

const { authenticate } = require("./auth");
const prisma = require("../prisma");

router.get("/", authenticate, async (req, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: req.user.id },
    });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  const { name, description, trackIds } = req.body;

  try {
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        tracks: { connect: trackIds.map((id) => ({ id })) },
      },
    });
    res.json(playlist);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const playlist = await prisma.playlist.findUniqueOrThrow({
      where: { id: +id },
      include: { tracks: true },
    });
    if (playlist.ownerId !== req.user.id) {
      next({
        status: 403,
        message: `Your userid: ${req.user.id} is not the owner of the requested playlist.`,
      });
    }
    res.json(playlist);
  } catch (error) {
    next(error);
  }
});
