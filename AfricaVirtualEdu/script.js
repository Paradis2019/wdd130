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

  // Load saved language or default to English
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
// (Used on pages where modal exists)
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
    }, 150); // close quickly after mouse leaves
  }

  // Click on hamburger → open/close
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("nav-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // While mouse is over toggle or menu → keep open
  [navToggle, nav].forEach((el) => {
    el.addEventListener("mouseenter", () => {
      clearHideTimeout();
      // do NOT auto-open here, just prevent closing if already open
    });

    el.addEventListener("mouseleave", () => {
      // when mouse leaves both, schedule close
      scheduleHide();
    });
  });

  // Clicking a link still closes the menu
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
}


// ================================
// Contact form submission
// (Used on contact.html)
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

// ================================
// FLOATING CONTACT WIDGET TOGGLE
// ================================
const contactToggle = document.getElementById("contactToggle");
const contactMenu = document.getElementById("contactMenu");

if (contactToggle && contactMenu) {
  contactToggle.addEventListener("click", () => {
    contactMenu.classList.toggle("show");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !contactToggle.contains(e.target) &&
      !contactMenu.contains(e.target)
    ) {
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
const WHATSAPP_NUMBER = "13854914089";        // your WhatsApp, without +
const TELEGRAM_USERNAME = "YourTelegramName"; // replace when ready

let chatStep = 0;
let chatData = {
  topic: "",
  name: "",
  contact: "", // "whatsapp" or "telegram"
};

function resetChat() {
  chatStep = 0;
  chatData = { topic: "", name: "", contact: "" };
  if (chatbotMessages) {
    chatbotMessages.innerHTML = "";
  }
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
    `I’m interested in: ${chatData.topic || "Information about Africa Virtual Education"}.\n` +
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

// open / close
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

// send
if (chatbotSendBtn && chatbotTextInput) {
  chatbotSendBtn.addEventListener("click", handleTextSubmit);

  chatbotTextInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  });
}
