const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

// GET /listings - Show all listings
router.get("/", async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.render("listings/index", { listings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Internal Server Error");
    }
});

// GET /listings/new - Show form to create new listing
router.get("/new", (req, res) => {
    res.render("listings/new");
});

// POST /listings - Create a new listing
router.post("/", async (req, res) => {
    try {
        const newListing = new Listing(req.body);
        await newListing.save();
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).send("Failed to create listing");
    }
});

module.exports = router;
