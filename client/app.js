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

app.use((req, res, next) => {
  res.locals.currentUser = req.session.student || null;
  next();
});

/* =========================
   DATABASE
========================= */
mongoose.connect("mongodb://127.0.0.1:27017/majorProject")
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
   MULTER (RENDER SAFE)
========================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

/* =========================
   ROUTES
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

/* =========================
   CONTACT FORM (FIXED)
========================= */
app.post("/contact", upload.single("resume"), async (req, res) => {

  const {
    fullName,
    dob,
    mobile,
    skills,
    company,
    designation,
    negotiable,
    location,
    workMode
  } = req.body;

  const resume = req.file;

  // Check text fields
  if (
    !fullName ||
    !dob ||
    !mobile ||
    !skills ||
    !company ||
    !designation ||
    !negotiable ||
    !location ||
    !workMode
  ) {
    return res.send("❌ Some text fields are missing.");
  }

  // Check file
  if (!resume) {
    return res.send("❌ Resume not uploaded properly.");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gn2607@myamu.ac.in",
        pass: "xbtt hftj lxyd zspk", // move to .env later
      },
    });

    const mailOptions = {
      from: `"${fullName}" <gn2607@myamu.ac.in>`,
      to: "gn2607@myamu.ac.in",
      subject: `New Application from ${fullName}`,
      text: `
Full Name: ${fullName}
DOB: ${dob}
Mobile: ${mobile}
Reason: ${skills}
Course/Branch: ${company}
Designation: ${designation}
Currently Pursuing: ${negotiable}
Location: ${location}
Preferred Mode: ${workMode}
      `,
      attachments: [
        {
          filename: resume.originalname,
          path: resume.path,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Delete uploaded file after sending
    fs.unlinkSync(resume.path);

    res.send("✅ Application Sent Successfully!");

  } catch (error) {
    console.error("Mail Error:", error);
    res.status(500).send("❌ Error sending message.");
  }
});

/* =========================
   SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});