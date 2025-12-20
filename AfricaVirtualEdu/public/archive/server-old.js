// server.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config(); // for future use if needed

const db = require("../db"); // <-- this uses db.js

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARE
// =========================

// Parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) from this folder
app.use(express.static(path.join(__dirname, ".")));

// =========================
// API ROUTES
// =========================

// 🔸 Save membership enrollment into DB
app.post("/api/members", (req, res) => {
  const {
    fullName,
    dateOfBirth,
    gender,
    country,
    email,
    phone,
    occupation,
    institution,
    reason,
    goals,
    communicationPref,
  } = req.body || {};

  if (!fullName || !email) {
    return res.status(400).json({ error: "Full name and email are required." });
  }

  const sql = `
    INSERT INTO members (
      full_name, date_of_birth, gender, country,
      email, phone, occupation, institution,
      reason, goals, communication_pref
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    fullName,
    dateOfBirth || "",
    gender || "",
    country || "",
    email,
    phone || "",
    occupation || "",
    institution || "",
    reason || "",
    goals || "",
    communicationPref || "",
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("DB insert error (members):", err);
      return res.status(500).json({ error: "Failed to save member." });
    }
    // this.lastID is the row ID just inserted
    res.json({ ok: true, id: this.lastID });
  });
});

// 🔸 Save contact message into DB
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const sql = `
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;
  const params = [name, email, subject || "", message];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("DB insert error (contact_messages):", err);
      return res.status(500).json({ error: "Failed to save message." });
    }
    res.json({ ok: true, id: this.lastID });
  });
});

// (Optional) a quick health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// =========================
// ADMIN: List members (simple protected API)
// =========================
const ADMIN_KEY = process.env.ADMIN_KEY || "changeme-admin-key";

app.get("/api/admin/members", (req, res) => {
  const key = req.query.key;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // You can select only the fields you want to see in the admin
  const sql = `
    SELECT
      id,
      full_name,
      email,
      country,
      phone,
      occupation,
      institution,
      reason,
      communication_pref,
      created_at
    FROM members
    ORDER BY created_at DESC
    LIMIT 200
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("DB query error (admin members):", err);
      return res.status(500).json({ error: "Failed to load members" });
    }
    res.json({ ok: true, members: rows });
  });
});
