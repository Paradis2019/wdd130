/* ===============================
   main.js (SAFE FIXED VERSION v2)
   - Prevents blank pages (reveal failsafe)
   - One language system (dropdown + normal links)
   - Correct GitHub Pages base path (/miracle/)
   - Robust drawer / portfolio / hero webgl
================================ */

const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===============================
   Helpers
================================ */
const SUPPORTED_LANGS = ["en", "fr", "id", "es"];

function getPathParts() {
  return window.location.pathname.split("/").filter(Boolean);
}

// Base path before language folder.
// Example GH Pages: /miracle/en/index.html
// -> base = "/miracle"
function getBasePath() {
  const parts = getPathParts();
  const langIndex = parts.findIndex((p) => SUPPORTED_LANGS.includes(p));
  if (langIndex === -1) {
    // Not inside /en|fr|id|es, assume first segment is repo base if exists
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
   Reveal animations (IMPORTANT)
================================ */
(function revealInit() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  // failsafe: if anything crashes, never keep content hidden
  const FAILSAFE_MS = 1200;
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
    clearTimeout(failsafe);
    return;
  }

  items.forEach((el) => el.classList.add("in"));
  clearTimeout(failsafe);
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
            If you opened this with <b>file://</b>, fetch is blocked.
            Use a local server (VS Code Live Server / python -m http.server).
          </p>
        </div>
      </article>
    `;
    return;
  }

  const normalize = (v) => String(v || "").trim().toLowerCase();
  const projectTags = (p) =>
    Array.isArray(p.tags) ? p.tags.map(normalize) : [];

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

    // injected reveals -> show immediately
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
        filterBtns.forEach((b) => b.setAttribute("aria-current", String(b === btn)));
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
   Language dropdown (ONLY ONE SYSTEM)
   - Updates links for current page
   - Works in /miracle/ subfolder
================================ */
(function langDropdownInit() {
  const switchers = document.querySelectorAll("[data-lang-switch]");
  if (!switchers.length) return;

  const base = getBasePath();
  const { lang: currentLang, page } = getCurrentLangAndPage();

  switchers.forEach((wrap) => {
    // If dropdown UI exists
    const btn = wrap.querySelector(".langBtn");
    const menu = wrap.querySelector(".langMenu");
    const current = wrap.querySelector("[data-lang-current]");

    if (current) current.textContent = currentLang.toUpperCase();

    // Rewrite all language links inside this switcher
    wrap.querySelectorAll("a[data-lang]").forEach((a) => {
      const lang = a.dataset.lang;
      if (!SUPPORTED_LANGS.includes(lang)) return;
      a.href = `${base}/${lang}/${page}`.replace(/\/{2,}/g, "/");
      a.setAttribute("aria-current", lang === currentLang ? "true" : "false");
    });

    // Dropdown open/close behavior
    if (btn && menu) {
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
   Hero WebGL (Three.js) - safe init
================================ */
let __heroWebglStarted = false;

async function initHeroWebGL() {
  if (__heroWebglStarted) return;
  __heroWebglStarted = true;

  const canvas = document.getElementById("hero3d");
  if (!canvas) return;

  try {
    const THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 5;

    const COUNT = 1200;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * 6;
      positions[i3 + 1] = (Math.random() - 0.5) * 3.8;
      positions[i3 + 2] = (Math.random() - 0.5) * 4;
      speeds[i] = 0.15 + Math.random() * 0.35;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;

      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let raf = 0;
    let last = performance.now();

    function animate(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      points.rotation.y += dt * 0.12;
      points.rotation.x += dt * 0.05;

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        pos[i3 + 1] += Math.sin(now * 0.001 + i) * dt * 0.02 * speeds[i];
        if (pos[i3 + 1] > 2) pos[i3 + 1] = -2;
        if (pos[i3 + 1] < -2) pos[i3 + 1] = 2;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(animate);
      }
    });
  } catch (e) {
    console.error("Hero WebGL error:", e);
    // if WebGL fails, do nothing (page should still be visible)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroWebGL();
});
