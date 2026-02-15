const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session");

const app = express();

/* =========================
   SESSION CONFIG
========================= */
app.use(session({
  secret: "student_secret_key",
  resave: false,
  saveUninitialized: false
}));

/* Pass current user to all EJS (Navbar ke liye) */
app.use((req, res, next) => {
  res.locals.currentUser = req.session.student || null;
  next();
});

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
   LOGIN PROTECTION
========================= */
function isLoggedIn(req, res, next) {
  if (!req.session.student) {
    return res.redirect("/login");
  }
  next();
}

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

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/details", (req, res) => {
  res.render("details");
});

/* =========================
   JOB & INTERNSHIP
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
   DASHBOARD (PROTECTED)
========================= */
app.get("/student-dashboard", isLoggedIn, (req, res) => {
  res.render("student-dashboard");
});

app.get("/admin/dashboard", (req, res) => {
  res.render("admin-dashboard");
});

/* =========================
   LOGOUT
========================= */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* =========================
   CONTACT FORM (EMAIL + RESUME)
========================= */
const upload = multer({ dest: "uploads/" });
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
        pass: "xbtt hftj lxyd zspk", // later .env me shift karo
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
    res.send("✅ Message & Resume Sent Successfully!");
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
