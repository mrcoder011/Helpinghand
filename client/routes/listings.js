const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

/* ===============================
   GET /listings → Show Page
================================ */
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/* ===============================
   GET /listings/new → Form
================================ */
router.get("/new", (req, res) => {
  res.render("listings/new");
});

/* ===============================
   POST /listings → Create
================================ */
router.post("/", async (req, res) => {
  try {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating listing");
  }
});

module.exports = router;
