document.documentElement.classList.add("js");

/* ===============================
   main.js — Awaken (EN/FR only)
   Fixes:
   - Reveal failsafe (no partial/blank content)
   - Drawer
   - Footer year
   - Language dropdown links (GitHub Pages safe)
   - Counter animation (#countProjects[data-target])
   - Testimonials slider (dots + auto rotate)
   - Live widget (optional block on index)
================================ */

const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===============================
   Helpers
================================ */
const SUPPORTED_LANGS = ["en", "fr"];

function getPathParts() {
  return window.location.pathname.split("/").filter(Boolean);
}

// Works for:
// - https://paradis2019.github.io/wdd130/miracle/fr/index.html
// - local server /miracle/fr/index.html
function getBasePath() {
  const parts = getPathParts();
  const langIndex = parts.findIndex((p) => SUPPORTED_LANGS.includes(p));
  if (langIndex === -1) {
    // If not inside a lang folder, assume repo base is first 2 segments if present
    // Example GH pages: /wdd130/miracle/ -> base "/wdd130/miracle"
    if (parts.length >= 2) return `/${parts[0]}/${parts[1]}`;
    if (parts.length === 1) return `/${parts[0]}`;
    return "";
  }
  const baseParts = parts.slice(0, langIndex);
  return baseParts.length ? `/${baseParts.join("/")}` : "";
}

function getCurrentLangAndPage() {
  const parts = getPathParts();
  const langIndex = parts.findIndex((p) => SUPPORTED_LANGS.includes(p));
  if (langIndex === -1) return { lang: "en", page: "index.html" };
  const lang = parts[langIndex];
  const page = parts[langIndex + 1] || "index.html";
  return { lang, page };
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* ===============================
   Reveal animations (failsafe)
================================ */
(function revealInit() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  // If anything goes wrong, never keep content hidden.
  const FAILSAFE_MS = 900;
  const failsafe = setTimeout(() => {
    items.forEach((el) => el.classList.add("in"));
  }, FAILSAFE_MS);

  if (reduceMotion) {
    items.forEach((el) => el.classList.add("in"));
    clearTimeout(failsafe);
    return;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
    clearTimeout(failsafe);
    return;
  }

  items.forEach((el) => el.classList.add("in"));
  clearTimeout(failsafe);
})();

/* ===============================
   Mobile drawer
================================ */
(function drawerInit() {
  const drawer = document.getElementById("drawer");
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeBtn");
  const backdrop = document.getElementById("backdrop");
  if (!drawer || !menuBtn) return;

  const open = () => {
    drawer.classList.add("on");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    drawer.classList.remove("on");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  menuBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* ===============================
   Footer year
================================ */
(function yearInit() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

/* ===============================
   Language dropdown (EN/FR only)
   - main.js sets hrefs correctly for current page
================================ */
(function langDropdownInit() {
  const switchers = document.querySelectorAll("[data-lang-switch]");
  if (!switchers.length) return;

  const base = getBasePath();
  const { lang: currentLang, page } = getCurrentLangAndPage();

  switchers.forEach((wrap) => {
    const btn = wrap.querySelector(".langBtn");
    const current = wrap.querySelector("[data-lang-current]");

    if (current) current.textContent = currentLang.toUpperCase();

    // Rewrite links
    wrap.querySelectorAll("a[data-lang]").forEach((a) => {
      const l = a.dataset.lang;
      if (!SUPPORTED_LANGS.includes(l)) {
        a.style.display = "none"; // just in case old links exist
        return;
      }
      a.href = `${base}/${l}/${page}`.replace(/\/{2,}/g, "/");
      a.setAttribute("aria-current", l === currentLang ? "true" : "false");
    });

    // Dropdown open/close (only if button exists)
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) {
          wrap.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          wrap.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });
    }
  });
})();

/* ===============================
   Counter animation (index + vision)
   Needs: <span id="countProjects" data-target="12">0</span>
================================ */
(function counterInit() {
  const el = document.getElementById("countProjects");
  if (!el) return;

  const target = Number(el.getAttribute("data-target") || "0");
  if (!Number.isFinite(target) || target <= 0) return;

  if (reduceMotion) {
    el.textContent = String(target);
    return;
  }

  let started = false;

  const animate = () => {
    if (started) return;
    started = true;

    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = String(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };

    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            animate();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
  } else {
    animate();
  }
})();

/* ===============================
   Testimonials slider + dots
   Structure:
   - .quote[data-quote]
   - .dots .dotBtn (same order)
================================ */
(function testimonialsInit() {
  const quotes = Array.from(document.querySelectorAll("[data-quote]"));
  const dots = Array.from(document.querySelectorAll(".dotBtn"));
  if (quotes.length < 2 || dots.length < 2) return;

  let index = quotes.findIndex((q) => q.classList.contains("active"));
  if (index < 0) index = 0;

  function show(i) {
    index = (i + quotes.length) % quotes.length;
    quotes.forEach((q, idx) => q.classList.toggle("active", idx === index));
    dots.forEach((d, idx) =>
      d.setAttribute("aria-current", idx === index ? "true" : "false")
    );
  }

  dots.forEach((btn, i) => {
    btn.addEventListener("click", () => show(i));
  });

  if (reduceMotion) return;

  let timer = setInterval(() => show(index + 1), 5500);

  // pause on hover (desktop)
  const slider = document.querySelector(".slider");
  if (slider) {
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5500);
    });
  }
})();

/* ===============================
   Live "Innovation / Canvas" widget
   (Optional block in index.html)
   IDs used:
   - liveClock
   - liveLatency
   - liveRate
   - liveStatus
================================ */
(function liveWidgetInit() {
  const clock = document.getElementById("liveClock");
  const latency = document.getElementById("liveLatency");
  const rate = document.getElementById("liveRate");
  const status = document.getElementById("liveStatus");
  if (!clock || !latency || !rate || !status) return;

  const statuses = [
    "Building scalable foundations…",
    "Testing secure delivery…",
    "Optimizing performance…",
    "Deploying new features…",
    "Monitoring system health…",
  ];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  setInterval(() => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
      d.getSeconds()
    )}`;

    // “live” feeling numbers (fake but polished)
    const ms = Math.round(12 + Math.random() * 18);
    const r = Math.round(110 + Math.random() * 90);

    latency.textContent = `${ms} ms`;
    rate.textContent = `${r}/s`;

    const s = statuses[Math.floor(Math.random() * statuses.length)];
    status.textContent = `Now: ${s}`;
  }, 1000);
})();
