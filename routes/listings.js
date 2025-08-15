const express = require("express");
const router = express.Router();

// Dummy listings array
const dummyListings = [
    { id: 1, title: "Software Engineer", location: "Remote", company: "Tech Corp" },
    { id: 2, title: "Frontend Developer", location: "Delhi", company: "Web Solutions" },
    { id: 3, title: "Backend Developer", location: "Bangalore", company: "CodeWorks" }
];

// GET all listings
router.get("/", (req, res) => {
    res.render("listings", { listings: dummyListings });
});

// GET single listing by ID
router.get("/:id", (req, res) => {
    const listing = dummyListings.find(l => l.id == req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listingDetails", { listing });
});

module.exports = router;
