// models/wishlist.model.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

// Ensure the model is not overwritten in production environments
const wishlist = mongoose.models.wishlist || mongoose.model('wishlist', wishlistSchema);

module.exports = wishlist;
