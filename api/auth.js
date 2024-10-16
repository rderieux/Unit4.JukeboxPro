const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function createToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "3h" });
}

const prisma = require("../prisma");

router.use(async (req, res, next) => {
  // Grab token from headers only if it exists
  const authHeader = req.headers.authorization;
  // Slice off the first 7 characters (Bearer ), leaving the token
  const token = authHeader?.slice(7); // "Bearer <token>"
  // If there is no token move on to the next middleware
  if (!token) return next();

  // TODO: Find customer with ID decrypted from the token and attach to the request
  try {
    // Decodes the id from the token, using the secret code in env
    // Assigns the id to variable id
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });
    // Attach the found customer to the request object
    req.user = user;
    // Move to the next middleware
    next();
  } catch (error) {
    next(error);
  }
});

// TODO: POST /register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.register(username, password);
    const token = createToken(user.id);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

// TODO: POST /login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.login(username, password);
    const token = createToken(user.id);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

/** Checks the request for an authenticated customer. */
function authenticate(req, res, next) {
  if (req.user) {
    next();
  } else {
    next({ status: 401, message: "You must be logged in." });
  }
}

module.exports = {
  router,
  authenticate,
};
