const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
// Creates new instance of Prisma client and extends it with custom methods
// for the user model
const prisma = new PrismaClient().$extends({
  // Extends the user model with custom methods for registration and login
  model: {
    user: {
      async register(username, password, saltRounds = 10) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const customer = await prisma.customer.create({
          data: { email: username, password: hashedPassword },
        });
        return customer;
      },
      async login(username, password) {
        const customer = await prisma.customer.findUniqueOrThrow({
          where: { username },
        });
        const valid = await bcrypt.compare(password, customer.password);
        if (!valid) throw Error("Invalid password");
        return customer;
      },
    },
  },
});

module.exports = prisma;
