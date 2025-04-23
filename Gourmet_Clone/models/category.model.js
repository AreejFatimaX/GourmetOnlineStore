const mongoose = require("mongoose")

let Categoryschema = new mongoose.Schema({
    categoryName : String,
})

let category = mongoose.model("category",Categoryschema);
module.exports = category