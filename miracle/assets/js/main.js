document.documentElement.classList.add("js");

/* ===============================
   main.js 
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


function getBasePath() {
  const parts = getPathParts();
  const langIndex = parts.findIndex((p) => SUPPORTED_LANGS.includes(p));

  
  if (langIndex !== -1) {
    const baseParts = parts.slice(0, langIndex);
    return baseParts.length ? `/${baseParts.join("/")}` : "";
  }

  
  if (parts.length >= 2) return `/${parts[0]}/${parts[1]}`;
  if (parts.length === 1) return `/${parts[0]}`;
  return "";
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

function safeJoinUrl(...parts) {
  return parts.join("/").replace(/\/{2,}/g, "/");
}

/* ===============================
   Reveal animations
================================ */
(function revealInit() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

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
  if (y) y.textContent = "2026";
})();


/* ===============================
   Language dropdown
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

    wrap.querySelectorAll("a[data-lang]").forEach((a) => {
      const l = a.dataset.lang;
      if (!SUPPORTED_LANGS.includes(l)) {
        a.style.display = "none";
        return;
      }
      a.href = safeJoinUrl(base, l, page);
      a.setAttribute("aria-current", l === currentLang ? "true" : "false");
    });

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
   Counter animation
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
      const eased = 1 - Math.pow(1 - t, 3);
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
   Testimonials slider
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

  dots.forEach((btn, i) => btn.addEventListener("click", () => show(i)));

  if (reduceMotion) return;

  let timer = setInterval(() => show(index + 1), 5500);

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
   Portfolio   
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

  
  const base = getBasePath();
  const dataUrl = safeJoinUrl(base, "assets/data/projects.json");

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
            Could not load <b>${dataUrl}</b>.
            <br/>Check that the file exists and the path matches exactly.
          </p>
        </div>
      </article>
    `;
    return;
  }

  const normalize = (v) => String(v || "").trim().toLowerCase();
  const projectTags = (p) => (Array.isArray(p.tags) ? p.tags.map(normalize) : []);

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
      p.title,
      p.summary,
      p.country,
      p.year,
      ...(p.stack || []),
      ...(p.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return okFilter && hay.includes(query.toLowerCase());
  }

  function render() {
    const list = projects.filter(matches);

    grid.innerHTML =
      list
        .map(
          (p) => `
      <article class="card reveal">
        <div class="cardInner">
          <h3>${p.title || "Project"}</h3>
          <p style="margin-top:6px">${p.summary || ""}</p>

          <div style="height:10px"></div>
          <div class="chipRow">
            ${projectTags(p)
              .slice(0, 3)
              .map((t) => `<span class="chip">${t.toUpperCase()}</span>`)
              .join("")}
            ${p.country ? `<span class="chip">${p.country}</span>` : ""}
            ${p.year ? `<span class="chip">${p.year}</span>` : ""}
          </div>

          <div style="height:12px"></div>
          <button class="btn btnPrimary" type="button" data-open="${p.id}">View details ↗</button>
        </div>
      </article>
    `
        )
        .join("") ||
      `
      <article class="card">
        <div class="cardInner">
          <h3>No projects found</h3>
          <p class="fineprint" style="margin-top:6px">Try another filter or clear search.</p>
        </div>
      </article>
    `;

    grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

  function openModal(p) {
    if (!modal) return;
    if (!modalTitle || !modalSummary || !modalTags || !modalHighlights || !modalMetaLeft || !modalMetaRight || !modalLink)
      return;

    modalTitle.textContent = p.title || "Project";
    modalSummary.textContent = p.summary || "";

    modalMetaLeft.textContent = p.country ? `Location: ${p.country}` : "";
    modalMetaRight.textContent = p.year ? `Year: ${p.year}` : "";

    modalTags.innerHTML = (p.stack || []).map((s) => `<span class="chip">${s}</span>`).join("");
    modalHighlights.innerHTML = (p.highlights || []).map((h) => `<li>${h}</li>`).join("");

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

  if (filterBtns.length) {
    const currentBtn =
      filterBtns.find((b) => b.getAttribute("aria-current") === "true") || filterBtns[0];

    activeFilter = currentBtn?.dataset?.filter || "all";

    filterBtns.forEach((b) =>
      b.setAttribute("aria-current", String(b === currentBtn))
    );

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter || "all";
        filterBtns.forEach((b) => b.setAttribute("aria-current", String(b === btn)));
        render();
      });
    });
  }

  searchInput?.addEventListener("input", () => {
    query = searchInput.value.trim();
    render();
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (!btn) return;
    const id = btn.getAttribute("data-open");
    const p = projects.find((x) => String(x.id) === String(id));
    if (p) openModal(p);
  });

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
   Live WidgeT
================================ */
(function liveWidgetInit() {
  const clock = document.getElementById("liveClock");
  const latency = document.getElementById("liveLatency");
  const rate = document.getElementById("liveRate");
  const status = document.getElementById("liveStatus");
  if (!clock || !latency || !rate || !status) return;

  const texts = [
    "Building scalable foundations…",
    "Testing secure delivery…",
    "Optimizing performance…",
    "Deploying new features…",
    "Monitoring system health…",
  ];

  const pad = (n) => String(n).padStart(2, "0");

  setInterval(() => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const ms = Math.round(12 + Math.random() * 18);
    const r = Math.round(110 + Math.random() * 90);
    latency.textContent = `${ms} ms`;
    rate.textContent = `${r}/s`;

    status.textContent = `Now: ${texts[Math.floor(Math.random() * texts.length)]}`;
  }, 1000);
})();

/* ===============================
   Hero Canvas 
================================ */
(function initHeroLiveCanvas() {
  const canvas = document.getElementById("hero3d");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const clockEl = document.querySelector("[data-live-clock]");
  const statusEl = document.querySelector("[data-live-status]");
  const latencyEl = document.querySelector("[data-live-latency]");
  const throughputEl = document.querySelector("[data-live-throughput]");
  const msgEl = document.querySelector("[data-live-msg]");
  const bars = Array.from(document.querySelectorAll(".liveBars .bar"));

  const msgsFR = [
    "Optimisation des performances…",
    "Synchronisation des modules…",
    "Analyse des signaux temps réel…",
    "Validation sécurité & intégrations…",
    "Compilation & déploiement en cours…",
  ];

  const msgsEN = [
    "Optimizing performance…",
    "Synchronizing modules…",
    "Analyzing real-time signals…",
    "Validating security & integrations…",
    "Compiling & deploying…",
  ];

  const { lang } = getCurrentLangAndPage();
  const msgs = lang === "fr" ? msgsFR : msgsEN;

  function pad(n) { return String(n).padStart(2, "0"); }
  function updateClock() {
    const d = new Date();
    if (clockEl) clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function jitterMetrics() {
    if (reduceMotion) return;
    if (latencyEl) latencyEl.textContent = String(14 + Math.floor(Math.random() * 14));
    if (throughputEl) throughputEl.textContent = String(160 + Math.floor(Math.random() * 110));
    if (statusEl) statusEl.textContent = lang === "fr" ? "Stable" : "Stable";
    if (msgEl) msgEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];

    bars.forEach((b) => {
      const v = 20 + Math.floor(Math.random() * 65);
      b.style.setProperty("--v", `${v}%`);
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
  jitterMetrics();
  setInterval(jitterMetrics, 2200);

  let w = 0, h = 0, dpr = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(rect.width * dpr);
    h = Math.floor(rect.height * dpr);
    canvas.width = w;
    canvas.height = h;
  }

  const STAR_COUNT = 220;
  const stars = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.6, 1.8) * dpr,
        s: rand(0.10, 0.45) * dpr,
        a: rand(0.25, 0.9),
      });
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;

    ctx.clearRect(0, 0, w, h);

    // Soft 
    const g = ctx.createRadialGradient(w * 0.5, h * 0.2, 10, w * 0.5, h * 0.2, Math.max(w, h));
    g.addColorStop(0, "rgba(124,58,237,0.10)");
    g.addColorStop(0.35, "rgba(59,130,246,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const st of stars) {
      st.y += st.s * (dt / 16);
      if (st.y > h + 10) {
        st.y = -10;
        st.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${st.a})`;
      ctx.fill();
    }

    // Subtle shimmer
    if (!reduceMotion) {
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(tick);
  }

  resize();
  initStars();
  requestAnimationFrame(tick);

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => {
      resize();
      initStars();
    });
    ro.observe(canvas);
  } else {
    window.addEventListener("resize", () => {
      resize();
      initStars();
    });
  }
})();
