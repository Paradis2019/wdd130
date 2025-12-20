// server.js
// =========================================
// 1. LOAD DEPENDENCIES
// =========================================
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const session = require("express-session");

const db = require("./db"); // uses data/ave.db

const app = express();
const PORT = process.env.PORT || 3000;

// Admin key for protected admin routes
const ADMIN_KEY = process.env.ADMIN_KEY || "changeme-admin-key";

// =========================================
// 2. MIDDLEWARE
// =========================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware (ONLY ONCE)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname))); // serves from project root

// =========================================
// 2.5 AUTH GUARD
// =========================================
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  next();
}

// =========================================
// 3. API ROUTES
// =========================================

// ----- MEMBERSHIP SAVE (POST /api/members) -----
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
    return res
      .status(400)
      .json({ error: "Full name and email are required." });
  }

  const sql = `
    INSERT INTO members (
      full_name,
      date_of_birth,
      gender,
      country,
      email,
      phone,
      occupation,
      institution,
      reason,
      goals,
      communication_pref
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
    res.json({ ok: true, id: this.lastID });
  });
});

// ----- CONTACT SAVE (POST /api/contact) -----
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body || {};

  console.log("📩 Incoming contact message:", req.body);

  if (!name || !email || !message) {
    console.log("❌ Missing fields in contact", { name, email, subject, message });
    return res
      .status(400)
      .json({ error: "Name, email, and message are required." });
  }

  const sql = `
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, email, subject || "", message], function (err) {
    if (err) {
      console.error("DB insert error (contact_messages):", err);
      return res.status(500).json({ error: "Failed to save message." });
    }
    console.log("✅ Contact saved with id:", this.lastID);
    res.json({ ok: true, id: this.lastID });
  });
});

// =========================================
// AUTH ROUTES
// =========================================

// POST /api/auth/register  (admin-only) - create a user account
app.post("/api/auth/register", async (req, res) => {
  const {
    adminKey,          // <-- from admin page
    memberId,
    email,
    password,
    role,
    canFinanceHelp,
    canLaptopHelp,
    canMentorshipHelp,
    canVolunteer,
    whatsappChannel,
    telegramChannel,
  } = req.body || {};

  // check admin key
  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (
        member_id,
        email,
        password_hash,
        role,
        can_finance_help,
        can_laptop_help,
        can_mentorship_help,
        can_volunteer,
        whatsapp_channel,
        telegram_channel
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      memberId || null,
      email,
      hash,
      role || "member",
      canFinanceHelp ? 1 : 0,
      canLaptopHelp ? 1 : 0,
      canMentorshipHelp ? 1 : 0,
      canVolunteer ? 1 : 0,
      whatsappChannel || null,
      telegramChannel || null,
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error("DB insert error (users):", err);
        return res.status(500).json({ error: "Failed to create user." });
      }
      res.json({ ok: true, id: this.lastID });
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
  db.get(sql, [email], async (err, user) => {
    if (err) {
      console.error("DB query error (login):", err);
      return res.status(500).json({ error: "Server error" });
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Store minimal info in session
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  });
});

// GET /api/auth/me
app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ ok: false });
  }
  res.json({ ok: true, user: req.session.user });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /api/member/links  (protected)
app.get("/api/member/links", requireLogin, (req, res) => {
  const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
  db.get(sql, [req.session.user.id], (err, user) => {
    if (err || !user) {
      console.error("DB query error (member links):", err);
      return res.status(500).json({ error: "Failed to load user links" });
    }

    res.json({
      ok: true,
      links: {
        financeHelp: !!user.can_finance_help,
        laptopHelp: !!user.can_laptop_help,
        mentorshipHelp: !!user.can_mentorship_help,
        volunteer: !!user.can_volunteer,
        whatsappChannel: user.whatsapp_channel,
        telegramChannel: user.telegram_channel,
      },
    });
  });
});

// =========================================
// 4. ADMIN ROUTES
// =========================================

// ---- Admin: list members ----
app.get("/api/admin/members", (req, res) => {
  const key = req.query.key;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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

// ---- Admin: list contact messages ----
app.get("/api/admin/contacts", (req, res) => {
  const key = req.query.key;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      subject,
      message,
      created_at
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT 200
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("DB query error (admin contacts):", err);
      return res.status(500).json({ error: "Failed to load contacts" });
    }
    res.json({ ok: true, contacts: rows });
  });
});

// -----------------------------------------
// Simple health check
// -----------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

// =========================================
// 5. START SERVER
// =========================================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
