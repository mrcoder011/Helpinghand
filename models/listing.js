const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String
});

module.exports = mongoose.model("Listing", listingSchema);
