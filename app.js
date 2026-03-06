const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// listing routes try block
try {
    const listingRoutes = require("./routes/listings");
    app.use("/listings", listingRoutes);
} catch (err) {
    console.warn("⚠️ Skipping /listings routes — MongoDB not connected.");
}


// MAIN ROUTES

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


// uploads folder ensure
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}


// CONTACT FORM EMAIL

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
                }
            ],
        };

        await transporter.sendMail(mailOptions);

        res.send(`
            <div style="text-align:center;padding:40px;font-family:sans-serif;">
                <h2 style="color:green;">✅ Application submitted successfully!</h2>
                <a href="/listings">
                    <button style="margin-top:20px;padding:12px 25px;
                    background:#007bff;color:white;border:none;border-radius:6px;">
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


app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});