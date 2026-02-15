const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  email: String,
  password: String
});

module.exports = mongoose.model("Student", studentSchema);
