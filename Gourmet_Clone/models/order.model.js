const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    total_amount: { type: Number, required: true },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash'], // Only cash payment allowed
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered'],  // Enum to restrict status values
        default: 'Pending',  // Default status is 'Pending'
      },
    address: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("orders", orderSchema);
