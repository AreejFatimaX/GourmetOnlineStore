// Import required modules
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Import user model and authMiddleware
const { authenticateAccessToken } = require("../../middleware/auth");
const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

// Add authentication middleware
router.post("/add-to-cart/:productId", authenticateAccessToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Ensure user is authenticated (middleware will handle this)
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const userId = req.user.userId;

    // Validate quantity
    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).send({ message: "Invalid quantity" });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
    } else {
      cart.items.push({ productId, quantity: parsedQuantity });
    }

    await cart.save();

    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

               
// View Cart Route
router.get("/cart", async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the decoded token
    const cart = await Cart.findOne({ userId }).populate("items.productId"); // Populate product details

    res.render("WebsitePages/ClientSide/cart", { cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Remove from Cart Route
router.post("/remove-from-cart/:productId", async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the decoded token
    const productId = req.params.productId;

    // Find the user's cart and remove the item
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      await cart.save();
    }

    res.redirect("/cart"); // Redirect to the cart page
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Register Route
router.post("/register", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    const { name, email, password, role } = req.body;
    console.log("Received registration data:", req.body); // Log the received data

    if (!role || !["admin", "customer"].includes(role)) {
      console.error("Invalid role:", role); // Log invalid role
      return res.status(400).send({ message: "Invalid role" });
    }

    if (!name || !email || !password) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.redirect("/login"); // Redirect to login page after successful registration
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).redirect("/login");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).redirect("/login");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET, // Ensure this is properly set
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    if (user.role === "admin") {
      res.status(200).redirect("/admin/dashboard")} 
    else {
      res.status(200).redirect("/placeOrder")
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  try {
    console.log("Logout request received");

    // Clear the access token cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Clear the user session
    req.session.user = null;

    // Redirect to the login page
    res.redirect("/login");
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;

