const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {type:String, required:true},
  email: {type:String, required:true},
  password:{type:String, required:true},
  role: { type: String, enum: ["admin", "customer"] }, 
});

// Use `mongoose.models` to check if the model already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;