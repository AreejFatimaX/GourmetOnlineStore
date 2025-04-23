// routes/user/wishlist.routes.js
const express = require('express');
const router = express.Router();
const { authenticateAccessToken } = require('../middleware/auth');
const WishlistModel = require('../models/wishlist.model');
const Product = require('../models/product.model');

// Route to add a product to the wishlist
router.post('/add-to-wishlist/:productId', authenticateAccessToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Find or create a wishlist for the user
let wishlist = await WishlistModel.findOne({ userId });

    if (!wishlist) {
    wishlist = new WishlistModel({ userId, items: [] });
    }

    // Check if the product is already in the wishlist
    const productExists = wishlist.items.some(item => item.productId.toString() === productId);
    
    if (productExists) {
      return res.status(400).send({ message: 'Product already in wishlist' });
    }

    // Add the product to the wishlist
    wishlist.items.push({ productId });
    await wishlist.save();

    res.status(200).send({ message: 'Product added to wishlist', wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route to view the wishlist
router.get('/wishlist', authenticateAccessToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find the user's wishlist
  const wishlist = await WishlistModel.findOne({ userId }).populate('items.productId');
    
    if (!wishlist) {
return res.status(404).render("wishlist");
    }

    res.status(200).render('wishlist', { wishlist: wishlist.items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Route to remove a product from the wishlist
router.post('/remove-from-wishlist/:productId', authenticateAccessToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Find the user's wishlist and remove the item
const wishlist = await WishlistModel.findOne({ userId });

    if (!wishlist) {
      return res.status(404).render("../wishlist");
    }

    // Remove the product from the wishlist
    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
    await wishlist.save();

    res.status(200).send({ message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
