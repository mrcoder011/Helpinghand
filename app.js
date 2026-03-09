const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const app = express();

/* ================= MULTER SETUP ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= VIEW ENGINE ================= */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= MIDDLEWARE ================= */

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* ================= ENSURE UPLOADS FOLDER ================= */

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* ================= LISTING ROUTES ================= */

try {
  const listingRoutes = require("./routes/listings");
  app.use("/listings", listingRoutes);
} catch (err) {
  console.warn("⚠️ Skipping /listings routes — MongoDB not connected.");
}

/* ================= MAIN ROUTES ================= */

app.get("/", (req, res) => {
  res.render("listings/index");
});

app.get("/details", (req, res) => {
  res.render("details");
});

app.get("/jintern", (req, res) => {
  res.render("listings/jintern");
});

app.get("/core", (req, res) => {
  res.render("core");
});
app.get("/course", (req, res) => {
  res.render("course");
});

app.get("/mentor", (req, res) => {
  res.render("mentor");
});

app.get("/senior", (req, res) => {
  res.render("senior");
});

app.get("/resume", (req, res) => {
  res.render("resume");
});

app.get("/mock", (req, res) => {
  res.render("mock");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/jobs", (req, res) => {
  res.render("jobs");
});

app.get("/intern", (req, res) => {
  res.render("intern");
});

app.get("/soon", (req, res) => {
  res.render("soon");
});

/* ================= CONTACT FORM ================= */

app.post("/contact", upload.any(), async (req, res) => {

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

  let resume = null;
  let screenshot = null;

  // detect uploaded files
  req.files.forEach(file => {
    if (file.fieldname === "resume") {
      resume = file;
    }
    if (file.fieldname === "paymentScreenshot") {
      screenshot = file;
    }
  });

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
    !resume ||
    !screenshot
  ) {
    return res.send("❌ Missing required fields.");
  }

  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gn2607@myamu.ac.in",
        pass: "ujifgzjdyusfavho"
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
          path: resume.path
        },
        {
          filename: screenshot.originalname,
          path: screenshot.path
        }
      ],
    };

    await transporter.sendMail(mailOptions);

    res.send(`
 <div style="text-align:center;padding:50px;font-family:'Poppins',sans-serif;background:#f8fafc;border-radius:10px;max-width:650px;margin:auto;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

    <h2 style="color:#16a34a;font-size:28px;margin-bottom:10px;">
        ✅ Application Submitted Successfully
    </h2>

    <p style="font-size:16px;color:#444;line-height:1.6;">
        Thank you for submitting your application. Your details have been received successfully.
    </p>

    <p style="font-size:16px;color:#444;line-height:1.6;">
        Our team will review your information and verify your application.  
        Once the verification is completed, we will contact you on your registered phone number with further details.
    </p>

    <div style="margin-top:25px;padding:15px;background:#ecfdf5;border-radius:8px;color:#065f46;font-size:15px;">
        📩 Please keep your phone available.  
        Our team may contact you shortly for verification or next steps.
    </div>

</div>

        <a href="/">
          <button style="
          margin-top:20px;
          padding:12px 25px;
          background:#007bff;
          color:white;
          border:none;
          border-radius:6px;
          cursor:pointer;">
          🔙 Back to Home
          </button>
        </a>
      </div>
    `);

  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).send("❌ Server error while sending email.");
  }

});

/* ================= SERVER ================= */

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
