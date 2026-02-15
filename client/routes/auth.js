const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");

/* =========================
   SHOW LOGIN PAGE
========================= */
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

/* =========================
   HANDLE LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.render("login", { error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.render("login", { error: "Wrong password" });
    }

    /* IMPORTANT — Save FULL student object for navbar */
    req.session.student = student;

    res.redirect("/student-dashboard");

  } catch (err) {
    console.log("Login error:", err);
    res.render("login", { error: "Something went wrong" });
  }
});

/* =========================
   LOGOUT
========================= */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
