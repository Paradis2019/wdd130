// ================================
// SIMPLE I18N (EN / FR)
// ================================
const translations = {
  en: {
    "header.donate": "Donate",
    "header.login": "Login",

    "mission.title": "Our Mission",
    "mission.body":
      "At Africa Virtual Education, our mission is to empower students across Africa by providing access to mentorship, education support, and learning opportunities.",
    "mission.quote":
      "“Education is the most powerful weapon which you can use to change the world.” — Nelson Mandela (South Africa)",

    "howWeServe.title": "How We Serve",

    "cards.membership.title": "Membership",
    "cards.membership.body":
      "Connect with a network of learners, mentors, and supporters dedicated to personal and academic growth.",
    "cards.membership.link": "Learn more →",

    "cards.mentorship.title": "Mentorship",
    "cards.mentorship.body":
      "Receive motivation, direction, and personalized guidance at every stage of your educational journey.",
    "cards.mentorship.link": "Learn more →",

    "cards.educationSupport.title": "Education Support",
    "cards.educationSupport.body":
      "Get access to scholarships, materials, and tuition support to overcome financial or material barriers.",
    "cards.educationSupport.link": "Learn more →",

    "cards.donation.title": "Donation",
    "cards.donation.body":
      "Your contribution funds scholarships, mentorship, and essential learning resources.",
    "cards.donation.link": "Learn more →",

    "cards.project.title": "Annual Projects",
    "cards.project.body":
      "Each year, we focus on a specific region or challenge to maximize impact.",
    "cards.project.link": "See this year’s project →",
  },

  fr: {
    "header.donate": "Faire un don",
    "header.login": "Connexion",

    "mission.title": "Notre mission",
    "mission.body":
      "Chez Africa Virtual Education, notre mission est d’accompagner les élèves à travers l’Afrique en leur offrant un accès au mentorat, au soutien éducatif et aux opportunités d’apprentissage.",
    "mission.quote":
      "« L’éducation est l’arme la plus puissante que l’on puisse utiliser pour changer le monde. » — Nelson Mandela (Afrique du Sud)",

    "howWeServe.title": "Comment nous servons",

    "cards.membership.title": "Adhésion",
    "cards.membership.body":
      "Rejoignez un réseau d’apprenants, de mentors et de soutiens engagés dans la croissance personnelle et académique.",
    "cards.membership.link": "En savoir plus →",

    "cards.mentorship.title": "Mentorat",
    "cards.mentorship.body":
      "Recevez de la motivation, des conseils et un accompagnement personnalisé à chaque étape de votre parcours éducatif.",
    "cards.mentorship.link": "En savoir plus →",

    "cards.educationSupport.title": "Soutien scolaire",
    "cards.educationSupport.body":
      "Accédez à des bourses, du matériel et une aide aux frais de scolarité pour surmonter les barrières financières.",
    "cards.educationSupport.link": "En savoir plus →",

    "cards.donation.title": "Don",
    "cards.donation.body":
      "Votre contribution finance les bourses, le mentorat et les ressources essentielles pour les élèves.",
    "cards.donation.link": "En savoir plus →",

    "cards.project.title": "Projets annuels",
    "cards.project.body":
      "Chaque année, nous concentrons nos efforts sur une région ou un défi spécifique pour maximiser l’impact.",
    "cards.project.link": "Voir le projet de cette année →",
  },
};

function applyTranslations(lang) {
  const dict = translations[lang] || translations.en;
  
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = dict[key];
    if (text) {
      el.textContent = text;
    }
  });
}

function initLanguage() {
  const select = document.getElementById("languageSelect");
  if (!select) return;

  const savedLang = localStorage.getItem("aveLang") || "en";
  select.value = savedLang;
  applyTranslations(savedLang);

  select.addEventListener("change", () => {
    const newLang = select.value;
    localStorage.setItem("aveLang", newLang);
    applyTranslations(newLang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
});

// ================================
// Set current year in footer
// ================================
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ================================
// (Optional) Terms & Conditions MODAL
// Only used if you have a modal with these IDs
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
// Login modal (front-end demo)
// ================================
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm && loginMessage) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "Logging in...";
    loginMessage.style.color = "#4a5568";

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Login failed");
      }

      loginMessage.textContent = "Logged in. Redirecting to your dashboard…";
      loginMessage.style.color = "#2f855a";

      setTimeout(() => {
        window.location.href = "member-dashboard.html";
      }, 700);
    } catch (err) {
      console.error("Login error:", err);
      loginMessage.textContent = err.message || "Login failed. Please try again.";
      loginMessage.style.color = "#c53030";
    }
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

    const file = href.split("#")[0] || "index.html";

    if (file === currentPath) {
      link.classList.add("active");
    }

    if (
      (currentPath === "" || currentPath === "index.html") &&
      (file === "" || file === "index.html")
    ) {
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

const STRIPE_CHECKOUT_URL = "https://your-stripe-checkout-link-here";
const PAYPAL_DONATION_URL =
  "https://www.paypal.com/donate/?hosted_button_id=YOUR_ID";

if (donateStripeBtn) {
  donateStripeBtn.addEventListener("click", () => {
    window.location.href = STRIPE_CHECKOUT_URL;
  });
}

if (donatePaypalLink) {
  donatePaypalLink.href = PAYPAL_DONATION_URL;
}

// ================================
// Hamburger menu: click to open, close on mouse leave
// ================================
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("mainNav");

if (navToggle && nav) {
  let hideTimeout = null;

  function openMenu() {
    nav.classList.add("nav-open");
    navToggle.classList.add("nav-open-toggle");
  }

  function closeMenu() {
    nav.classList.remove("nav-open");
    navToggle.classList.remove("nav-open-toggle");
  }

  function clearHideTimeout() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function scheduleHide() {
    clearHideTimeout();
    hideTimeout = setTimeout(() => {
      closeMenu();
    }, 150);
  }

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("nav-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  [navToggle, nav].forEach((el) => {
    el.addEventListener("mouseenter", () => {
      clearHideTimeout();
    });

    el.addEventListener("mouseleave", () => {
      scheduleHide();
    });
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
}

// ================================
// Contact form -> save to DB (contact.html)
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      contactMessageStatus.textContent =
        "Thank you! Your message has been sent.";
      contactMessageStatus.style.color = "#2f855a";
      contactForm.reset();
    } catch (err) {
      console.error(err);
      contactMessageStatus.textContent =
        "Sorry, there was a problem sending your message. Please try again.";
      contactMessageStatus.style.color = "#c53030";
    }
  });
}

// ================================
// FLOATING CONTACT WIDGET TOGGLE
// ================================
const contactToggle = document.getElementById("contactToggle");
const contactMenu = document.getElementById("contactMenu");

if (contactToggle && contactMenu) {
  contactToggle.addEventListener("click", () => {
    contactMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!contactToggle.contains(e.target) && !contactMenu.contains(e.target)) {
      contactMenu.classList.remove("show");
    }
  });
}

// ================================
// CHATBOT BUBBLE TOGGLE + GUIDED FLOW
// ================================
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");

const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotInputRow = document.getElementById("chatbotInputRow");
const chatbotTextInput = document.getElementById("chatbotTextInput");
const chatbotSendBtn = document.getElementById("chatbotSendBtn");

// CONFIG: your real contacts
const WHATSAPP_NUMBER = "13854914089"; // without +
const TELEGRAM_USERNAME = "YourTelegramName"; // replace when ready

let chatStep = 0;
let chatData = {
  topic: "",
  name: "",
  contact: "",
};

function resetChat() {
  chatStep = 0;
  chatData = { topic: "", name: "", contact: "" };
  if (chatbotMessages) chatbotMessages.innerHTML = "";
  if (chatbotTextInput) {
    chatbotTextInput.value = "";
    chatbotTextInput.placeholder = "Type your answer here...";
  }
  startConversation();
}

function addMessage(sender, text) {
  if (!chatbotMessages) return;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + sender;
  bubble.textContent = text;
  chatbotMessages.appendChild(bubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addChoices(choices) {
  if (!chatbotMessages) return;
  const wrapper = document.createElement("div");
  wrapper.className = "chat-choices";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "chat-choice-btn";
    btn.textContent = choice.label;
    btn.addEventListener("click", () => {
      handleChoice(choice.value, choice.label);
      wrapper.remove();
    });
    wrapper.appendChild(btn);
  });

  chatbotMessages.appendChild(wrapper);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function startConversation() {
  addMessage(
    "bot",
    "Hi 👋 I’m the AVE assistant. What would you like to talk about today?"
  );

  addChoices([
    { label: "Membership", value: "Membership" },
    { label: "Mentorship", value: "Mentorship" },
    { label: "Education Support", value: "Education Support" },
    { label: "Donation", value: "Donation" },
    { label: "Partnership", value: "Partnership" },
    { label: "Other", value: "Other" },
  ]);

  chatStep = 1;
}

function handleChoice(value, label) {
  addMessage("user", label);

  if (chatStep === 1) {
    chatData.topic = value;
    addMessage("bot", "Great, I can help with " + value + ". What is your name?");
    chatStep = 2;
    if (chatbotTextInput) {
      chatbotTextInput.placeholder = "Type your name here...";
    }
  } else if (chatStep === 3) {
    chatData.contact = value;
    finishConversation();
  }
}

function handleTextSubmit() {
  if (!chatbotTextInput) return;
  const text = chatbotTextInput.value.trim();
  if (!text) return;

  addMessage("user", text);

  if (chatStep === 2) {
    chatData.name = text;
    chatbotTextInput.value = "";

    addMessage(
      "bot",
      `Nice to meet you, ${chatData.name}. How would you like to continue?`
    );

    addChoices([
      { label: "WhatsApp", value: "whatsapp" },
      { label: "Telegram", value: "telegram" },
    ]);

    chatStep = 3;
    chatbotTextInput.placeholder =
      "You can also type more details if you want (optional)";
  } else {
    chatbotTextInput.value = "";
    addMessage("bot", "Thanks, I’ll include that in your message.");
  }
}

function finishConversation() {
  const baseText =
    `Hello, my name is ${chatData.name || "a new contact"}.\n` +
    `I’m interested in: ${
      chatData.topic || "Information about Africa Virtual Education"
    }.\n` +
    `Please contact me back.`;

  addMessage(
    "bot",
    "Perfect. Click one of the buttons below to open WhatsApp or Telegram with your message ready to send."
  );

  const finalLinks = document.createElement("div");
  finalLinks.className = "chat-final-links";

  const msgEncoded = encodeURIComponent(baseText);

  const waLink = document.createElement("a");
  waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msgEncoded}`;
  waLink.target = "_blank";
  waLink.className = "btn btn-primary";
  waLink.textContent = "Open in WhatsApp";

  const tgLink = document.createElement("a");
  tgLink.href = `https://t.me/share/url?url=&text=${msgEncoded}`;
  // or: `https://t.me/${TELEGRAM_USERNAME}?text=${msgEncoded}`;
  tgLink.target = "_blank";
  tgLink.className = "btn btn-secondary";
  tgLink.textContent = "Open in Telegram";

  finalLinks.appendChild(waLink);
  finalLinks.appendChild(tgLink);

  chatbotMessages.appendChild(finalLinks);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

if (chatbotToggle && chatbotWindow) {
  chatbotToggle.addEventListener("click", () => {
    const willOpen = chatbotWindow.classList.contains("hidden");
    chatbotWindow.classList.toggle("hidden");
    chatbotWindow.classList.toggle("show");
    if (willOpen) {
      resetChat();
    }
  });
}

if (chatbotClose && chatbotWindow) {
  chatbotClose.addEventListener("click", () => {
    chatbotWindow.classList.add("hidden");
    chatbotWindow.classList.remove("show");
  });
}

if (chatbotSendBtn && chatbotTextInput) {
  chatbotSendBtn.addEventListener("click", handleTextSubmit);

  chatbotTextInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  });
}

// ================================
// MEMBERSHIP PAGE LOGIC
// ================================

// --- Step 1: Evaluation ---
let evaluationPassed = false;

const evalBtn = document.getElementById("evaluateBtn");
const evalResult = document.getElementById("evaluationResult");

if (evalBtn && evalResult) {
  evalBtn.addEventListener("click", () => {
    const speak = document.querySelector('input[name="speakEnglish"]:checked');
    const understand = document.querySelector(
      'input[name="understandEnglish"]:checked'
    );
    const laptop = document.querySelector(
      'input[name="laptopAccess"]:checked'
    );

    if (!speak || !understand || !laptop) {
      evalResult.textContent = "Please answer all questions first.";
      evalResult.style.color = "#c05621";
      evaluationPassed = false;
      return;
    }

    if (
      speak.value === "no" ||
      understand.value === "no" ||
      laptop.value === "no"
    ) {
      evalResult.textContent =
        "You are not qualified for membership at this time.";
      evalResult.style.color = "#c53030";
      evaluationPassed = false;
    } else {
      evalResult.textContent =
        "You meet the basic evaluation criteria. Please review the Terms and complete the enrollment form below.";
      evalResult.style.color = "#2f855a";
      evaluationPassed = true;
    }
  });
}

// --- Step 3: Enrollment form -> POST /api/members ---
const enrollmentForm = document.getElementById("enrollmentForm");
const enrollmentMessage = document.getElementById("enrollmentMessage");

if (enrollmentForm && enrollmentMessage) {
  enrollmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!evaluationPassed) {
      enrollmentMessage.textContent =
        "Please complete the eligibility evaluation above and make sure you are qualified before submitting.";
      enrollmentMessage.style.color = "#c05621";
      return;
    }

    const termsAgree = document.getElementById("termsAgree");
    const termsFullName = document.getElementById("termsFullName");
    const termsDate = document.getElementById("termsDate");
    const finalAgree = document.getElementById("finalAgree");

    if (!termsAgree || !termsFullName || !termsDate || !finalAgree) {
      // if those fields don't exist, just skip this block
    } else {
      if (!termsAgree.checked) {
        enrollmentMessage.textContent =
          "You must agree to the Membership Terms and Conditions.";
        enrollmentMessage.style.color = "#c53030";
        return;
      }

      if (!termsFullName.value.trim() || !termsDate.value) {
        enrollmentMessage.textContent =
          "Please provide your full name and date as signature under the Terms and Conditions.";
        enrollmentMessage.style.color = "#c53030";
        return;
      }

      if (!finalAgree.checked) {
        enrollmentMessage.textContent =
          "Please confirm that your information is accurate and that you meet the eligibility criteria.";
        enrollmentMessage.style.color = "#c53030";
        return;
      }
    }

    const formData = new FormData(enrollmentForm);
    const payload = Object.fromEntries(formData.entries());

    payload.eval_speakEnglish =
      document.querySelector('input[name="speakEnglish"]:checked')?.value ||
      "";
    payload.eval_understandEnglish =
      document.querySelector(
        'input[name="understandEnglish"]:checked'
      )?.value || "";
    payload.eval_laptopAccess =
      document.querySelector('input[name="laptopAccess"]:checked')?.value ||
      "";

    if (termsFullName && termsDate) {
      payload.termsAgree = true;
      payload.termsFullName = termsFullName.value.trim();
      payload.termsDate = termsDate.value;
    }

    enrollmentMessage.textContent = "Submitting your enrollment…";
    enrollmentMessage.style.color = "#4a5568";

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Request failed");
      }

      enrollmentMessage.textContent =
        "Thank you! Your membership enrollment has been submitted. You will receive your username and password by email once approved.";
      enrollmentMessage.style.color = "#2f855a";

      enrollmentForm.reset();
    } catch (err) {
      console.error("Enrollment error:", err);
      enrollmentMessage.textContent =
        "Sorry, there was a problem submitting your enrollment. Please try again later.";
      enrollmentMessage.style.color = "#c53030";
    }
  });
}
