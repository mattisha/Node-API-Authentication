const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema({
  email: {
    require: true,
    type: String,
    unique: true,
    lowercase: true,
  },
  password: {
    require: true,
    type: String,
  },
});

// hashing password
UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedSalt = await bcrypt.hash(this.password, salt);
    this.password = hashedSalt;
    next();
  } catch (error) {
    next(error);
  }
});
// comparing incoming password from the db
UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("user", UserSchema);
