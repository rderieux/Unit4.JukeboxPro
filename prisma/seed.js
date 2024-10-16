const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");
const seed = async (
  numUsers = 5,
  numTracks = 20,
  numPlaylists = 10,
  numTracksInPlaylist = 8
) => {
  // TODO: Seed users
  const users = Array.from({ length: numUsers }, () => ({
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }));
  await prisma.user.createMany({ data: users });

  // Fetch all created users
  const allUsers = await prisma.user.findMany();

  const tracks = Array.from({ length: numTracks }, () => ({
    name: faker.music.songName(),
  }));
  await prisma.track.createMany({ data: tracks });

  // Fetch all created tracks
  const allTracks = await prisma.track.findMany();

  // Create playlists and assign to random users, with 8 random tracks
  for (let i = 0; i < numPlaylists; i++) {
    // Get a random user
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    // Generate an array of 8 tracks
    let playlistTracks = [];
    while (playlistTracks.length < 8) {
      playlistTracks.push(
        allTracks[Math.floor(Math.random() * allTracks.length)]
      );
    }

    await prisma.playlist.create({
      data: {
        name: faker.company.buzzAdjective() + " " + faker.company.buzzNoun(),
        description: faker.lorem.sentence(),
        owner: {
          connect: { id: randomUser.id },
        },
        tracks: {
          connect: playlistTracks.map((track) => ({ id: track.id })),
        },
      },
    });
  }
};
seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
