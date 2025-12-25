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


/* Hologram */

async function initHeroHologram() {
  const canvas = document.getElementById("hero3d");
  if (!canvas) return;

  const THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0.2, 4.2);

  // Light is optional for MeshBasicMaterial, but good if you change materials later
  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);

  // Load image (IMPORTANT: correct relative path from /en/ -> ../assets/...)
  const texLoader = new THREE.TextureLoader();
  const tex = await new Promise((resolve, reject) => {
    texLoader.load(
      "../assets/img/hologram.png",
      resolve,
      undefined,
      reject
    );
  });

  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // --- Hologram shader (scanlines + flicker + soft glow feel) ---
  const holoMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending, // glow-like
    uniforms: {
      uTex: { value: tex },
      uTime: { value: 0 },
      uOpacity: { value: 0.75 },
      uTint: { value: new THREE.Color("#41d9ff") }, // hologram cyan
      uLineDensity: { value: 240.0 },
      uFlicker: { value: 0.10 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vWobble;

      uniform float uTime;

      void main(){
        vUv = uv;
        vec3 p = position;

        // subtle 3D wobble
        float t = uTime * 0.9;
        p.x += sin(t + position.y * 2.0) * 0.03;
        p.y += cos(t * 0.7 + position.x * 2.0) * 0.02;

        vWobble = (sin(t + position.y * 3.0) + 1.0) * 0.5;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vWobble;

      uniform sampler2D uTex;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uTint;
      uniform float uLineDensity;
      uniform float uFlicker;

      float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main(){
        vec4 tex = texture2D(uTex, vUv);

        // If your png has transparency, use it
        float alpha = tex.a;

        // scanlines
        float lines = sin((vUv.y * uLineDensity) + (uTime * 12.0)) * 0.5 + 0.5;
        float lineMask = mix(0.55, 1.0, lines);

        // subtle noise shimmer
        float n = rand(vUv + uTime) * 0.12 + 0.94;

        // flicker
        float flick = 1.0 - (rand(vec2(uTime, vUv.y)) * uFlicker);

        // edge glow (fake, based on alpha)
        float edge = smoothstep(0.05, 0.65, alpha) * 0.65 + 0.35;

        vec3 color = uTint;
        color *= lineMask * n * flick;
        color *= edge;

        float outA = alpha * uOpacity;

        // Add a little brightness from the image itself
        color += tex.rgb * 0.15;

        gl_FragColor = vec4(color, outA);
      }
    `,
  });

  // Plane with your image ratio
  const imgW = tex.image.width || 1024;
  const imgH = tex.image.height || 1024;
  const aspect = imgW / imgH;

  const geo = new THREE.PlaneGeometry(2.0 * aspect, 2.0, 1, 1);
  const holo = new THREE.Mesh(geo, holoMat);
  holo.position.set(0, 0.05, 0);
  scene.add(holo);

  // “Ghost” back layer for extra 3D depth
  const ghost = new THREE.Mesh(
    geo.clone(),
    holoMat.clone()
  );
  ghost.material.uniforms.uOpacity.value = 0.35;
  ghost.scale.set(1.02, 1.02, 1.02);
  ghost.position.set(0.05, -0.03, -0.12);
  scene.add(ghost);

  // Resize (this is critical to avoid “partial page / blank canvas” issues)
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Animate
  let raf = 0;
  function tick(t) {
    const time = t * 0.001;

    holoMat.uniforms.uTime.value = time;
    ghost.material.uniforms.uTime.value = time;

    // slow 3D movement
    holo.rotation.y = Math.sin(time * 0.55) * 0.25;
    holo.rotation.x = Math.sin(time * 0.35) * 0.10;

    ghost.rotation.y = holo.rotation.y * 0.95;
    ghost.rotation.x = holo.rotation.x * 0.95;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroHologram().catch((e) => console.error("Hologram error:", e));
});

/* ------------------------*/

/*  DOMContentLoaded  

async function initHeroWebGL() {
  const canvas = document.getElementById("hero3d");
  if (!canvas) return;

  // Load Three.js (module) from CDN
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

  // Particles
  const COUNT = 1200;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    // spread in a soft sphere-ish volume
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

  // Resize properly (IMPORTANT)
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

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

    // gentle rotation
    points.rotation.y += dt * 0.12;
    points.rotation.x += dt * 0.05;

    // subtle floating motion
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3 + 1] += Math.sin(now * 0.001 + i) * dt * 0.02 * speeds[i];

      // keep particles in bounds
      if (pos[i3 + 1] > 2) pos[i3 + 1] = -2;
      if (pos[i3 + 1] < -2) pos[i3 + 1] = 2;
    }
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  raf = requestAnimationFrame(animate);

  // Pause when tab is hidden (optional but good)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      last = performance.now();
      raf = requestAnimationFrame(animate);
    }
  });
}

// Call this along with your other init code
document.addEventListener("DOMContentLoaded", () => {
  initHeroWebGL().catch((e) => console.error("Hero WebGL error:", e));
});

/* ------------------------- */

/* Canvas backup */

/* (function heroCanvasInit() {
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
})(); */
