const mongoose = require("mongoose")

let productschema = new mongoose.Schema({
    title : String,
    description : String,
    picture: String,
    price : Number,
    quantity:Number,
    isBoycotted : {type: Boolean, default: false}
})
let product = mongoose.model("product",productschema);

module.exports = product