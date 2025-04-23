const mongoose = require("mongoose");
const express = require("express");
let router = express.Router();
let multer = require("multer");
let Product = require("../../models/product.model");
let Category = require("../../models/category.model");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Admin Dashboard Route
router.get("/admin/dashboard", async (req, res) => {
    let products = await Product.find();
    let categories = await Category.find();
    res.render("WebsitePages/AdminPanel/dashboard", { layout: "adminLayout.ejs", products,categories });
});



// Product Routes
router.get("/admin/products", async (req, res) => {
    const { searchQuery } = req.query;
    const searchOptions = searchQuery
        ? {
            $or: [
                { title: new RegExp(searchQuery, "i") },
                { description: new RegExp(searchQuery, "i") },
            ],
        }
        : {};

    let products = await Product.find(searchOptions);
    res.render("WebsitePages/AdminPanel/products", {
        layout: "adminLayout.ejs",
        products,
        searchQuery, // Pass the query back to the view for display
    });
});


router.get("/admin/products/create", (req, res) => {
    res.render("WebsitePages/AdminPanel/createProduct", { layout: "adminLayout.ejs" });
});

router.post("/admin/products/create", upload.single("file"), async (req, res) => {
    let product = new Product(req.body);
    if (req.file) product.picture = req.file.filename;
    product.isBoycotted = Boolean(req.body.isBoycotted);
    await product.save();
    res.redirect("/admin/products");
});

router.get("/admin/products/edit/:id", async (req, res) => {
    let product = await Product.findById(req.params.id);
    res.render("WebsitePages/AdminPanel/editProduct", { layout: "adminLayout.ejs", product });
});

router.post("/admin/products/edit/:id", async (req, res) => {
    let product = await Product.findById(req.params.id);
    product.title = req.body.title;
    product.description = req.body.description;
    product.price = req.body.price;
    product.quantity=req.body.quantity,
    product.isBoycotted = Boolean(req.body.isBoycotted);
    await product.save();
    return res.redirect("/admin/products");
});

router.get("/admin/products/delete/:id", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    return res.redirect("/admin/products");
});

// Category Routes
router.get("/admin/viewcatagories", async (req, res) => {
    let categories = await Category.find();
    res.render("WebsitePages/AdminPanel/category", { layout: "adminLayout.ejs", categories });
});

// Route for creating a category (POST)
router.post("/admin/products/createCategory", async (req, res) => {
    let category = new Category(req.body);
    await category.save();
    res.redirect("/admin/viewcatagories"); // Redirect to the categories page after creating
});

// Route for deleting a category
router.get("/admin/categories/delete/:id", async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    return res.redirect("/admin/viewcatagories"); // Redirect back to the categories page after deletion
});

// Route for editing a category (GET)
router.get("/admin/categories/edit/:id", async (req, res) => {
    let category = await Category.findById(req.params.id);
    res.render("WebsitePages/AdminPanel/editCategory", { layout: "adminLayout.ejs", category });
});

// Route for updating a category (POST)
router.post("/admin/categories/edit/:id", async (req, res) => {
    let category = await Category.findById(req.params.id);
    category.categoryName = req.body.categoryName;
    await category.save();
    return res.redirect("/admin/viewcatagories"); // Redirect back to the categories page after update
});

// Route for creating a category (GET)
router.get("/admin/products/createCategory", (req, res) => {
    res.render("WebsitePages/AdminPanel/createCategory", { layout: "adminLayout.ejs" });
});

module.exports = router;
