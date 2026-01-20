const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

const app = express();

/* =========================
   DATABASE CONNECTION
========================= */
mongoose.connect("mongodb://127.0.0.1:27017/majorProject", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to DB"))
.catch(err => console.log("DB Error:", err));

/* =========================
   APP CONFIG
========================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   ROUTES
========================= */

// Listings routes
const listingRoutes = require("./routes/listings");
app.use("/listings", listingRoutes);

// Auth routes (Login)
const authRoutes = require("./routes/auth");
app.use(authRoutes);

/* =========================
   MAIN PAGES
========================= */
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/details", (req, res) => {
  res.render("details");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

/* =========================
   JOB & INTERNSHIP PAGES
========================= */
app.get("/jobs", (req, res) => {
  res.render("jobs");
});

app.get("/intern", (req, res) => {
  res.render("intern");
});

app.get("/soon", (req, res) => {
  res.render("soon");
});

/* =========================
   DASHBOARDS
========================= */
app.get("/student/dashboard", (req, res) => {
  res.render("student-dashboard");
});

app.get("/admin/dashboard", (req, res) => {
  res.render("admin-dashboard");
});

/* =========================
   CONTACT FORM (EMAIL + RESUME)
========================= */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.post("/contact", upload.single("resume"), async (req, res) => {
  const { name, email, message } = req.body;
  const resume = req.file;

  if (!name || !email || !message || !resume) {
    return res.send("❌ Missing required fields.");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gn2607@myamu.ac.in",
        pass: "xbtt hftj lxyd zspk", // ⚠️ later env variable me daalna
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "gn2607@myamu.ac.in",
      subject: `New Application from ${name}`,
      text: `From: ${name} (${email})\n\nMessage:\n${message}`,
      attachments: [
        {
          filename: resume.originalname,
          path: resume.path,
        }
      ],
    };

    await transporter.sendMail(mailOptions);
    res.send("✅ Message & resume sent successfully!");
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).send("Error sending message.");
  }
});

/* =========================
   SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
