const express = require("express");
const router = express.Router();

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Login form submit
router.post("/login", (req, res) => {
  const { role } = req.body;

  if (role === "admin") {
    res.redirect("/admin/dashboard");
  } else {
    res.redirect("/student/dashboard");
  }
});

module.exports = router;
