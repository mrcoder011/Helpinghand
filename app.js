const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const app = express();

/* ================= APP CONFIG ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* ================= SAFE UPLOAD SETUP ================= */
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

const upload = multer({ storage });

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.redirect("/contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

/* ================= CONTACT FORM ================= */

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

  // Only check fields that actually exist in your form
  if (
    !fullName ||
    !dob ||
    !mobile ||
    !skills ||
    !company ||
    !designation ||
    !negotiable ||
    !location ||
    !workMode ||
    !resume
  ) {
    return res.send("❌ Missing required fields.");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gn2607@myamu.ac.in",
        pass: "xbtt hftj lxyd zspk",
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
        }
      ],
    };

    await transporter.sendMail(mailOptions);

    // Delete file after sending (important for Render)
    fs.unlinkSync(resume.path);

    res.send(`
      <div style="text-align:center;padding:40px;font-family:sans-serif;">
        <h2 style="color:green;">✅ Application submitted successfully!</h2>
        <a href="/contact">
          <button style="margin-top:20px;padding:12px 25px;
          background:#007bff;color:white;border:none;border-radius:6px;">
          🔙 Back
          </button>
        </a>
      </div>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Server error while sending email.");
  }
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});