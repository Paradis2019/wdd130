// ================================
// Set current year in footer
// ================================
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ================================
// Membership evaluation logic
// (Used on membership.html)
// ================================
const evaluateBtn = document.getElementById("evaluateBtn");
const evaluationResult = document.getElementById("evaluationResult");

if (evaluateBtn && evaluationResult) {
  evaluateBtn.addEventListener("click", () => {
    const speak = document.querySelector('input[name="speakEnglish"]:checked');
    const understand = document.querySelector(
      'input[name="understandEnglish"]:checked'
    );
    const laptop = document.querySelector(
      'input[name="laptopAccess"]:checked'
    );

    if (!speak || !understand || !laptop) {
      evaluationResult.textContent = "Please answer all questions first.";
      evaluationResult.style.color = "#c05621"; // warning
      return;
    }

    // Disqualify if any "No" answer
    if (
      speak.value === "no" ||
      understand.value === "no" ||
      laptop.value === "no"
    ) {
      evaluationResult.textContent =
        "You are not qualified for membership at this time.";
      evaluationResult.style.color = "#c53030"; // red
    } else {
      evaluationResult.textContent =
        "You meet the basic evaluation criteria. Please complete the enrollment form below.";
      evaluationResult.style.color = "#2f855a"; // green
    }
  });
}

// ================================
// Terms & Conditions modal
// (Used on membership.html)
// ================================
const openTermsBtn = document.getElementById("openTermsBtn");
const termsModal = document.getElementById("termsModal");
const closeTermsBtn = document.getElementById("closeTermsBtn");

if (openTermsBtn && termsModal && closeTermsBtn) {
  openTermsBtn.addEventListener("click", () => {
    termsModal.classList.remove("hidden");
  });

  closeTermsBtn.addEventListener("click", () => {
    termsModal.classList.add("hidden");
  });

  termsModal.addEventListener("click", (e) => {
    if (e.target === termsModal) termsModal.classList.add("hidden");
  });
}

// ================================
// Enrollment form (front-end only)
// (Used on membership.html)
// ================================
const enrollmentForm = document.getElementById("enrollmentForm");
const enrollmentMessage = document.getElementById("enrollmentMessage");

if (enrollmentForm && enrollmentMessage) {
  enrollmentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // In a real app, send data to your backend API here.
    const formData = new FormData(enrollmentForm);
    const fullName = formData.get("fullName");
    const email = formData.get("email");

    console.log("Enrollment form submitted:", Object.fromEntries(formData));

    enrollmentMessage.textContent =
      "Thank you, " +
      fullName +
      ". Your enrollment form has been received. We will contact you at " +
      email +
      ".";
    enrollmentMessage.style.color = "#2f855a";

    enrollmentForm.reset();
  });
}

// ================================
// Login modal (front-end demo)
// (Used on both pages where modal exists)
// ================================
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginBtn && loginModal && closeLoginBtn) {
  loginBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
  });

  closeLoginBtn.addEventListener("click", () => {
    loginModal.classList.add("hidden");
  });

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.classList.add("hidden");
  });
}

if (loginForm && loginMessage) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // This is only a demo. Replace with real authentication.
    const data = new FormData(loginForm);
    const email = data.get("loginEmail");

    loginMessage.textContent =
      "Login demo only. In production, this should verify your email and password with the server.";
    loginMessage.style.color = "#2b6cb0";

    console.log("Login attempt:", email);
  });
}

// ================================
// Global nav highlight
// ================================
const navElement = document.getElementById("mainNav");
if (navElement) {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  navElement.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    // only compare the file part (ignore #hash)
    const file = href.split("#")[0] || "index.html";

    if (file === currentPath) {
      link.classList.add("active");
    }

    // Special case: index.html sections like index.html#mission
    if (
      (currentPath === "" || currentPath === "index.html") &&
      (file === "" || file === "index.html")
    ) {
      // keep only one active when on homepage
      if (href.includes("#mission")) {
        link.classList.add("active");
      }
    }
  });
}

// ================================
// Donation redirect buttons
// ================================
const donateStripeBtn = document.getElementById("donateStripeBtn");
const donatePaypalLink = document.getElementById("donatePaypalLink");

// Replace these with your real links later
const STRIPE_CHECKOUT_URL = "https://your-stripe-checkout-link-here";
const PAYPAL_DONATION_URL = "https://www.paypal.com/donate/?hosted_button_id=YOUR_ID";

if (donateStripeBtn) {
  donateStripeBtn.addEventListener("click", () => {
    window.location.href = STRIPE_CHECKOUT_URL;
  });
}

if (donatePaypalLink) {
  donatePaypalLink.href = PAYPAL_DONATION_URL;
}


// ================================
// Hamburger menu toggle
// (Used on all pages with header)
// ================================
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("mainNav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const openMenu = nav.classList.toggle("nav-open");
    navToggle.classList.toggle("nav-open-toggle", openMenu);
  });

  // Close menu when a link is clicked
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      navToggle.classList.remove("nav-open-toggle");
    });
  });
}

// ================================
// Contact form submission
// ================================
const contactForm = document.getElementById("contactForm");
const contactMessageStatus = document.getElementById("contactMessageStatus");

if (contactForm && contactMessageStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    contactMessageStatus.textContent = "Sending...";
    contactMessageStatus.style.color = "#555";

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      contactMessageStatus.textContent = "Thank you! Your message has been sent.";
      contactMessageStatus.style.color = "#2f855a";
      contactForm.reset();
    } catch (err) {
      console.error(err);
      contactMessageStatus.textContent =
        "Sorry, there was a problem sending your message. Please try again later.";
      contactMessageStatus.style.color = "#c53030";
    }
  });
}

// server.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// serve static files (your site)
app.use(express.static(path.join(__dirname, ".")));
app.use(bodyParser.json());

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Configure email transport (using your email provider)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AVE Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject: `[AVE Contact] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

