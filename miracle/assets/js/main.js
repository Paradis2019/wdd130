/* ===============================
   main.js (SAFE FIXED VERSION)
   - Fixes blank pages caused by .reveal opacity:0
   - Adds reduceMotion definition
   - Robust reveal + portfolio + lang switch + hero canvas
================================ */

const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===============================
   Reveal animations (IMPORTANT)
================================ */
(function revealInit() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  // If user prefers reduced motion, show everything immediately
  if (reduceMotion) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  // IntersectionObserver supported
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
    return;
  }

  // Fallback: show everything
  items.forEach((el) => el.classList.add("in"));
})();

/* ===============================
   Mobile drawer (hamburger)
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
   Portfolio: projects + filters + search + modal
================================ */
(async function portfolioInit() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return; // only on portfolio page

  const searchInput = document.getElementById("projectSearch");
  const filterBtns = Array.from(document.querySelectorAll(".filterBtn"));

  // Modal
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
            Could not load <b>${dataUrl}</b>.<br/>
            If you opened this via <b>file://</b>, fetch may be blocked.
            Use a local server (VS Code Live Server / python -m http.server).
          </p>
        </div>
      </article>
    `;
    // make sure reveal doesn't keep this hidden
    grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    return;
  }

  const normalize = (v) => String(v || "").trim().toLowerCase();
  const projectTags = (p) =>
    Array.isArray(p.tags) ? p.tags.map(normalize) : [];

  const hasTag = (p, tag) => {
    const t = normalize(tag);
    if (!t) return false;
    if (projectTags(p).includes(t)) return true;
    return normalize(p.type) === t; // optional future support
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
          <button class="btn btnPrimary" type="button" data-open="${
            p.id
          }">View details ↗</button>
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

    // Ensure new reveals become visible (observer might not catch injected nodes quickly)
    grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

  function openModal(p) {
    if (!modal) return;

    // guard if modal markup missing
    if (
      !modalTitle ||
      !modalSummary ||
      !modalTags ||
      !modalHighlights ||
      !modalMetaLeft ||
      !modalMetaRight ||
      !modalLink
    )
      return;

    modalTitle.textContent = p.title || "Project";
    modalSummary.textContent = p.summary || "";

    modalMetaLeft.textContent = p.country ? `Location: ${p.country}` : "";
    modalMetaRight.textContent = p.year ? `Year: ${p.year}` : "";

    modalTags.innerHTML = (p.stack || [])
      .map((s) => `<span class="chip">${s}</span>`)
      .join("");

    modalHighlights.innerHTML = (p.highlights || [])
      .map((h) => `<li>${h}</li>`)
      .join("");

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
    const currentBtn =
      filterBtns.find((b) => b.getAttribute("aria-current") === "true") ||
      filterBtns[0];

    activeFilter = currentBtn?.dataset?.filter || "all";

    filterBtns.forEach((b) =>
      b.setAttribute("aria-current", String(b === currentBtn))
    );

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter || "all";
        filterBtns.forEach((b) =>
          b.setAttribute("aria-current", String(b === btn))
        );
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
    const p = projects.find((x) => String(x.id) === String(id));
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
   Language switcher (supports /miracle/ subfolder)
================================ */
(function langSwitchInit() {
  const switchers = document.querySelectorAll("[data-lang-switch]");
  if (!switchers.length) return;

  const supported = ["en", "fr", "id", "es"];
  const parts = window.location.pathname.split("/").filter(Boolean);

  // Find language folder
  const langIndex = parts.findIndex((p) => supported.includes(p));
  if (langIndex === -1) return;

  const currentLang = parts[langIndex];
  const page = parts[langIndex + 1] || "index.html";

  // Base path before language folder:
  // /REPO/en/services.html -> baseParts=["REPO"] -> base="/REPO"
  // /en/services.html      -> baseParts=[]      -> base=""
  const baseParts = parts.slice(0, langIndex);
  const base = baseParts.length ? "/" + baseParts.join("/") : "";

  switchers.forEach((sw) => {
    sw.querySelectorAll("a[data-lang]").forEach((a) => {
      const lang = a.dataset.lang;
      if (!supported.includes(lang)) return;

      a.href = `${base}/${lang}/${page}`.replace(/\/{2,}/g, "/");
      if (lang === currentLang) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  });
})();


/* ===============================
   Hero "3D" Canvas (2D animated)
================================ */
(function heroCanvasInit() {
  const heroCanvas = document.getElementById("hero3d");
  if (!heroCanvas) return;

  if (reduceMotion) return;

  // Make sure it has size (sometimes canvas is 0px height because parent collapses)
  // Your CSS sets heroRight min-height, so this should be OK, but we still guard.
  const ctx = heroCanvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let w = 1,
    h = 1,
    dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const r = heroCanvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(r.width));
    h = Math.max(1, Math.floor(r.height));

    heroCanvas.width = Math.floor(w * dpr);
    heroCanvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  let mx = 0,
    my = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = heroCanvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = ((e.clientY - r.top) / r.height) * 2 - 1;
    },
    { passive: true }
  );

  const N = 34;
  const pts = Array.from({ length: N }, (_, i) => ({
    a: Math.random() * Math.PI * 2,
    r: 0.18 + Math.random() * 0.42,
    s: 0.15 + Math.random() * 0.55,
    o: 0.22 + Math.random() * 0.55,
    p: i / N,
  }));

  function bg() {
    const gx = w * (0.5 + mx * 0.08);
    const gy = h * (0.45 + -my * 0.08);

    const g = ctx.createRadialGradient(
      gx,
      gy,
      0,
      gx,
      gy,
      Math.max(w, h) * 0.85
    );
    g.addColorStop(0, "rgba(124,58,237,0.22)");
    g.addColorStop(0.45, "rgba(59,130,246,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(
      w * 0.85,
      h * 0.2,
      0,
      w * 0.85,
      h * 0.2,
      Math.max(w, h) * 0.8
    );
    g2.addColorStop(0, "rgba(34,197,94,0.10)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  }

  function draw(t) {
    t *= 0.001;
    ctx.clearRect(0, 0, w, h);
    bg();

    const cx = w * 0.54 + mx * 18;
    const cy = h * 0.52 + -my * 16;
    const R = Math.min(w, h) * 0.42;

    const pos = pts.map((p, idx) => {
      const a = p.a + t * p.s + idx * 0.08;
      const rr =
        R * p.r * (0.85 + 0.2 * Math.sin(t * 0.8 + p.p * Math.PI * 2));
      return {
        x: cx + Math.cos(a) * rr,
        y: cy + Math.sin(a * 1.02) * rr * 0.92,
        o: p.o,
      };
    });

    ctx.lineWidth = 1;
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          const a = (1 - d / 120) * 0.22;
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.beginPath();
          ctx.moveTo(pos[i].x, pos[i].y);
          ctx.lineTo(pos[j].x, pos[j].y);
          ctx.stroke();
        }
      }
    }

    for (const p of pos) {
      const r = 2 + p.o * 2.2;
      ctx.fillStyle = `rgba(255,255,255,${0.22 + p.o * 0.35})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
