//requiring all modules to use
const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const session = require('express-session');
const flash = require('connect-flash');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.static("uploads"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(express.json()); // Middleware to parse JSON requests

app.use(cors({
  origin: "http://localhost:8642",
  credentials: true,
}));

app.use(flash());


app.use(session(
  { secret: "secret", resave: false, saveUninitialized: false }
));

app.use(cookieParser());

// Routes

let productsRouter = require("./routes/admin/products.router");
let userRouter = require("./routes/user/user.router");

//let cartRouter = require("./routes/cart.router"); // Import cart router
//let orderRouter = require("./routes/order.router"); // Import order router

app.use(productsRouter);
app.use(userRouter);
// MongoDB Connection
require('dotenv').config();
const connectionstring = process.env.MONGO_URI;

mongoose.connect(connectionstring)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.get("/", (req, res) => {
  res.render("WebsitePages/ClientSide/landingpage");
});

app.get("/placeOrder", async (req, res) => {
  const Product = require("./models/product.model");
  const Category = require("./models/category.model");

  const searchQuery = req.query.searchQuery || ''; // Extract the search query from the URL
  const isBoycotted = req.query.isBoycotted; // Extract the featured filter (true or false)
  const sortBy = req.query.sortBy; // Extract the sorting option
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 8; // Number of products per page
  const skip = (page - 1) * limit; // Skip the previous pages' items

  try {
      // Define search options
      const searchOptions = {};

      // Add search query filter if present
      if (searchQuery) {
          searchOptions.$or = [
              { title: new RegExp(searchQuery, 'i') },
              { description: new RegExp(searchQuery, 'i') },
          ];
      }

      // Add featured filter if present
      if (isBoycotted !== undefined) {
          searchOptions.isBoycotted = isBoycotted === 'true'; // Convert to boolean
      }

      // Determine the sorting order based on the "sortBy" parameter
      let sortOptions = {};
      if (sortBy === 'highToLow') {
          sortOptions = { price: -1 }; // Sort by price in descending order (high to low)
      } else if (sortBy === 'lowToHigh') {
          sortOptions = { price: 1 }; // Sort by price in ascending order (low to high)
      }

      // Fetch filtered, sorted products with pagination
      const products = await Product.find(searchOptions)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit);

      // Get total product count for pagination
      const totalProducts = await Product.countDocuments(searchOptions);
      const totalPages = Math.ceil(totalProducts / limit);

      // Fetch all categories
      const categories = await Category.find();

      // Pass data to the template
      res.render("WebsitePages/ClientSide/placeOrder", {
          product: products,
          category: categories,
          searchQuery,
          isBoycotted: isBoycotted !== undefined ? isBoycotted : null, // Pass isBoycotted to the template
          sortBy,
          currentPage: page,
          totalPages,
          layout: "productsLayout.ejs",
      });
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Error fetching products");
  }
});

app.get("/login", (req, res) => {
  res.render("login",{layout:false});
});

app.get("/register", (req, res) => {
  res.render("register",{layout:false});
});

// Start the server
const PORT=8888;
app.listen(PORT, () => {
  console.log(`Server started at location: ${PORT}`);
});

//PASSWORD:Xtra@12345
//SP23-BSE-041@CUILAHORE//ADMIN
