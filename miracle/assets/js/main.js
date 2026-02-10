document.documentElement.classList.add("js");

/* ===============================
   main.js (Awaken EN/FR Version)
   - Reveal failsafe (prevents "partial page")
   - Drawer (hamburger)
   - Footer year
   - Language dropdown (EN/FR only)
   - Testimonials dots
   - Counter animation (data-target)
   - Portfolio loader (projects.json)
   - Optional Hero WebGL safe
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

// Base path before language folder.
// Example: /awaken/en/index.html => base="/awaken"
function getBasePath() {
  const parts = getPathParts();
  const langIndex = parts.findIndex((p) => SUPPORTED_LANGS.includes(p));
  if (langIndex === -1) {
    return parts.length ? `/${parts[0]}` : "";
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

/* ===============================
   Reveal animations (FAILSAFE)
================================ */
(function revealInit() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  // failsafe: if JS crashes or observer doesn't fire, show content
  const FAILSAFE_MS = 1000;
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
================================ */
(function langDropdownInit() {
  const switchers = document.querySelectorAll("[data-lang-switch]");
  if (!switchers.length) return;

  const base = getBasePath();
  const { lang: currentLang, page } = getCurrentLangAndPage();

  switchers.forEach((wrap) => {
    // set label
    const current = wrap.querySelector("[data-lang-current]");
    if (current) current.textContent = currentLang.toUpperCase();

    // rewrite only EN/FR links
    wrap.querySelectorAll("a[data-lang]").forEach((a) => {
      const lang = a.dataset.lang;
      if (!SUPPORTED_LANGS.includes(lang)) {
        a.remove(); // remove anything not EN/FR
        return;
      }
      a.href = `${base}/${lang}/${page}`.replace(/\/{2,}/g, "/");
      a.setAttribute("aria-current", lang === currentLang ? "true" : "false");
    });

    // open/close dropdown
    const btn = wrap.querySelector(".langBtn");
    if (!btn) return;

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
  });
})();

/* ===============================
   Testimonials dots (Vision + Home)
================================ */
(function testimonialsInit() {
  const slider = document.querySelector(".slider");
  if (!slider) return;

  const quotes = Array.from(slider.querySelectorAll("[data-quote]"));
  const dots = Array.from(slider.querySelectorAll(".dotBtn"));
  if (!quotes.length || !dots.length) return;

  function show(i) {
    quotes.forEach((q, idx) => q.classList.toggle("active", idx === i));
    dots.forEach((d, idx) => d.setAttribute("aria-current", idx === i ? "true" : "false"));
  }

  dots.forEach((btn, i) => btn.addEventListener("click", () => show(i)));
})();

/* ===============================
   Counter (data-target)
================================ */
(function counterInit() {
  const el = document.getElementById("countProjects");
  if (!el) return;

  const target = Number(el.getAttribute("data-target") || "12");
  const duration = 1100;

  if (reduceMotion) {
    el.textContent = String(target);
    return;
  }

  let started = false;

  function animate() {
    if (started) return;
    started = true;

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animate();
          io.disconnect();
        }
      }
    }, { threshold: 0.4 });
    io.observe(el);
  } else {
    animate();
  }
})();

/* ===============================
   Portfolio (projects.json)
================================ */
(async function portfolioInit() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  const searchInput = document.getElementById("projectSearch");
  const filterBtns = Array.from(document.querySelectorAll(".filterBtn"));

  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalSummary = document.getElementById("modalSummary");
  const modalTags = document.getElementById("modalTags");
  const modalHighlights = document.getElementById("modalHighlights");
  const modalMetaLeft = document.getElementById("modalMetaLeft");
  const modalMetaRight = document.getElementById("modalMetaRight");
  const modalLink = document.getElementById("modalLink");

  let projects = [];
  let activeFilter = "all";
  let query = "";

  const dataUrl = "../assets/data/projects.json";

  try {
    const res = await fetch(dataUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${dataUrl} (${res.status})`);
    projects = await res.json();
  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <article class="card">
        <div class="cardInner">
          <h3>Portfolio data not loading</h3>
          <p class="fineprint" style="margin-top:6px">
            Could not load <b>${dataUrl}</b>. If you opened with <b>file://</b>, fetch is blocked.
            Use a local server (Live Server / python -m http.server).
          </p>
        </div>
      </article>
    `;
    return;
  }

  const normalize = (v) => String(v || "").trim().toLowerCase();
  const projectTags = (p) => Array.isArray(p.tags) ? p.tags.map(normalize) : [];

  const hasTag = (p, tag) => {
    const t = normalize(tag);
    if (!t) return false;
    if (projectTags(p).includes(t)) return true;
    return normalize(p.type) === t;
  };

  function matches(p) {
    const okFilter = activeFilter === "all" || hasTag(p, activeFilter);
    if (!query) return okFilter;

    const hay = [
      p.title, p.summary, p.country, p.year,
      ...(p.stack || []), ...(p.tags || []),
    ].join(" ").toLowerCase();

    return okFilter && hay.includes(query.toLowerCase());
  }

  function render() {
    const list = projects.filter(matches);
    grid.innerHTML = list.map(p => `
      <article class="card reveal">
        <div class="cardInner">
          <h3>${p.title || "Project"}</h3>
          <p style="margin-top:6px">${p.summary || ""}</p>

          <div style="height:10px"></div>
          <div class="chipRow">
            ${(projectTags(p).slice(0,3)).map(t => `<span class="chip">${t.toUpperCase()}</span>`).join("")}
            ${p.country ? `<span class="chip">${p.country}</span>` : ""}
            ${p.year ? `<span class="chip">${p.year}</span>` : ""}
          </div>

          <div style="height:12px"></div>
          <button class="btn btnPrimary" type="button" data-open="${p.id}">View details ↗</button>
        </div>
      </article>
    `).join("") || `
      <article class="card">
        <div class="cardInner">
          <h3>No projects found</h3>
          <p class="fineprint" style="margin-top:6px">Try another filter or clear search.</p>
        </div>
      </article>
    `;

    // reveal injected items immediately
    grid.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  function openModal(p) {
    if (!modal) return;
    modalTitle.textContent = p.title || "Project";
    modalSummary.textContent = p.summary || "";
    modalMetaLeft.textContent = p.country ? `Location: ${p.country}` : "";
    modalMetaRight.textContent = p.year ? `Year: ${p.year}` : "";

    modalTags.innerHTML = (p.stack || []).map(s => `<span class="chip">${s}</span>`).join("");
    modalHighlights.innerHTML = (p.highlights || []).map(h => `<li>${h}</li>`).join("");

    if (p.link && String(p.link).trim()) {
      modalLink.href = p.link;
      modalLink.style.display = "inline-flex";
    } else {
      modalLink.style.display = "none";
    }

    modal.classList.add("on");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("on");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Filters
  if (filterBtns.length) {
    const currentBtn = filterBtns.find(b => b.getAttribute("aria-current") === "true") || filterBtns[0];
    activeFilter = currentBtn?.dataset?.filter || "all";
    filterBtns.forEach(b => b.setAttribute("aria-current", String(b === currentBtn)));

    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter || "all";
        filterBtns.forEach(b => b.setAttribute("aria-current", String(b === btn)));
        render();
      });
    });
  }

  // Search
  searchInput?.addEventListener("input", () => {
    query = searchInput.value.trim();
    render();
  });

  // Open modal
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (!btn) return;
    const id = btn.getAttribute("data-open");
    const p = projects.find(x => String(x.id) === String(id));
    if (p) openModal(p);
  });

  // Close modal
  modal?.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.classList.contains("modalBackdrop")) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  render();
})();

/* ===============================
   Contact form -> inbox (FormSubmit)
================================ */
(function contactFormInit() {
  const form = document.getElementById("projectForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitProject");
  const note = document.getElementById("formNote");

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    if (note) note.textContent = "";

    const fd = new FormData(form);

    // honeypot spam
    if (fd.get("_honey")) {
      if (note) note.textContent = "Thanks — message sent.";
      if (submitBtn) submitBtn.textContent = "Sent ✓";
      return;
    }

    try {
      const action = form.getAttribute("action");
      const res = await fetch(action, { method: "POST", mode: "cors", body: fd });
      if (!res.ok) throw new Error("Network error");

      if (note) note.textContent = "Thanks — message sent. We’ll reply within 24–48 hours.";
      if (submitBtn) submitBtn.textContent = "Sent ✓";
      form.reset();
    } catch (err) {
      console.error(err);
      if (note) note.textContent = "Couldn’t send via form. Please use Quick email.";
    } finally {
      if (submitBtn && submitBtn.textContent !== "Sent ✓") submitBtn.textContent = "Send brief ↗";
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
