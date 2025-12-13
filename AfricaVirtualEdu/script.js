// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Membership evaluation logic =====
const evaluateBtn = document.getElementById("evaluateBtn");
const evaluationResult = document.getElementById("evaluationResult");

if (evaluateBtn) {
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

// ===== Terms & Conditions modal =====
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

// ===== Enrollment form (front-end only) =====
const enrollmentForm = document.getElementById("enrollmentForm");
const enrollmentMessage = document.getElementById("enrollmentMessage");

if (enrollmentForm) {
  enrollmentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // In a real app, send data to your backend API here (see explanation below).
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

// ===== Login modal (front-end only demo) =====
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

if (loginForm) {
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

// ===== Hamburger / nav toggle =====
const navToggle = document.getElementById("navToggle");
const nav = document.querySelector(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    navToggle.classList.toggle("nav-open-toggle", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Optional: close menu when a link is clicked (mobile)
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("nav-open")) {
        nav.classList.remove("nav-open");
        navToggle.classList.remove("nav-open-toggle");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}
