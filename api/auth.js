const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function createToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "3h" });
}
