const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

router.get("/", async (req, res, next) => {
  try {
    const tracks = await prisma.track.findMany();
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const track = await prisma.track.findUniqueOrThrow({
      where: { id: +id },
    });

    let response = { track };

    if (req.user) {
      const userPlaylists = await prisma.playlist.findMany({
        where: {
          ownerId: req.user.id,
          tracks: {
            some: {
              id: +id,
            },
          },
        },
      });

      reponse.userPlaylists = userPlaylists;
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
});
