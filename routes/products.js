const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

const JWT_SECRET = process.env.SESSION_SECRET || "supersecretkey";

const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "You must be logged in" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "fullName email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, category, brand, price } = req.body;
    if (!name || !category || !brand || !price)
      return res.status(400).json({ message: "All fields are required" });

    const product = await Product.create({
      name, category, brand, price,
      createdBy: req.userId,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { name, category, brand, price } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { name, category, brand, price },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(403).json({ message: "Not authorized or product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });
    if (!product) return res.status(403).json({ message: "Not authorized or product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
