// main.js — shared behaviors for all pages

// Smooth scroll for anchor links
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.scrollBehavior = 'smooth';
}

// Drawer
const drawer = document.getElementById('drawer');
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const backdrop = document.getElementById('backdrop');

function openDrawer(){
  if(!drawer) return;
  drawer.classList.add('on');
  menuBtn?.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
}
function closeDrawer(){
  if(!drawer) return;
  drawer.classList.remove('on');
  menuBtn?.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
}
menuBtn?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);
drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

// Reveal on scroll
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent => {
    if(ent.isIntersecting){
      ent.target.classList.add('in');
      io.unobserve(ent.target);
    }
  });
}, {threshold: 0.16});
revealEls.forEach(el => io.observe(el));

// Footer year
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = String(new Date().getFullYear());

// Magnetic button hover
const magBtns = Array.from(document.querySelectorAll('.btn'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion){
  magBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
      const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
      btn.style.transform = `translate(${dx*2}px, ${dy*2}px)`;
    });
    btn.addEventListener('mouseleave', ()=> btn.style.transform = '');
  });
}

// Contact form (only if present)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name')||'').trim();
  if(note){
    note.textContent = name ? `Thanks, ${name}! Your message is ready to be connected to email/CRM.` : 'Thanks!';
    note.style.color = 'rgba(255,255,255,.72)';
  }
  form.reset();
});

// Testimonials (only if present)
const quotes = Array.from(document.querySelectorAll('[data-quote]'));
const dots = Array.from(document.querySelectorAll('.dotBtn'));
let qi = 0;
function showQuote(i){
  if(!quotes.length) return;
  qi = (i + quotes.length) % quotes.length;
  quotes.forEach((q, idx)=> q.classList.toggle('active', idx===qi));
  dots.forEach((d, idx)=> d.setAttribute('aria-current', String(idx===qi)));
}
dots.forEach((d, idx)=> d.addEventListener('click', ()=> showQuote(idx)));
if(quotes.length) setInterval(()=> showQuote(qi+1), 6500);

// Count-up (only if present)
const countEl = document.getElementById('countProjects');
let counted = false;
if(countEl){
  const countIO = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting && !counted){
        counted = true;
        const target = 120; // change to your real number
        const start = performance.now();
        const dur = 1300;
        function tick(t){
          const p = Math.min(1, (t - start) / dur);
          const eased = p*p*(3-2*p);
          const val = Math.floor(eased * target);
          countEl.textContent = String(val);
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.disconnect();
      }
    }
  }, {threshold: 0.35});
  countIO.observe(countEl);
}

// 3D hero (only on home)
const heroCanvas = document.getElementById('hero3d');
if(heroCanvas && !reduceMotion){
  const run = async ()=>{
    // Load three.js as an ESM module
    const THREE = await import('https://unpkg.com/three@0.161.0/build/three.module.js');

    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    const geo = new THREE.TorusKnotGeometry(0.95, 0.28, 220, 22);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.65,
      roughness: 0.25,
      emissive: 0x101020,
      emissiveIntensity: 0.55,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
    );
    mesh.add(wire);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2.5, 2, 3);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-3, 1, 2);
    scene.add(fill);

    const rim = new THREE.PointLight(0xffffff, 1.3, 20);
    rim.position.set(0, -1.8, -2);
    scene.add(rim);

    function resize(){
      const r = heroCanvas.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    let px = 0, py = 0;
    const onMove = (e)=>{
      const r = heroCanvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * 2 - 1;
      const y = (e.clientY - r.top) / r.height * 2 - 1;
      px = x; py = y;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const clock = new THREE.Clock();
    function animate(){
      const t = clock.getElapsedTime();
      mesh.rotation.y = t * 0.45 + px * 0.35;
      mesh.rotation.x = t * 0.25 + -py * 0.25;
      mesh.position.y = Math.sin(t*0.9) * 0.07;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  };

  run().catch(()=>{
    // If CDN is blocked, silently fail.
  });
}

// Instantly show above-the-fold reveals on page load
// window.addEventListener('DOMContentLoaded', () => {
 // document.querySelectorAll('.reveal').forEach(el => {
   // const r = el.getBoundingClientRect();
    //if (r.top < window.innerHeight * 0.9) el.classList.add('in');
 // });
//});
