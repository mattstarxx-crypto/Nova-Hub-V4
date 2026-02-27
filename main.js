/* ═══════════════════════════════════════════
   NOVA HUB — main.js
   All interactivity for the unblocked games hub
═══════════════════════════════════════════ */

/* ─── STAR CANVAS ─── */
(function () {
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    stars = [];
    for (let i = 0; i < 250; i++) {
      stars.push({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height,
        r:    Math.random() * 1.4 + 0.2,
        a:    Math.random(),
        da:   (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        blue: Math.random() > 0.6
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.blue
        ? `rgba(100,200,255,${s.a})`
        : `rgba(255,255,255,${s.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();


/* ─── SHOOTING STARS ─── */
function spawnShoot() {
  const el = document.createElement('div');
  el.className = 'shoot';
  el.style.cssText = `top:${Math.random() * 65}%; left:0; --sd:${(Math.random() * 1.5 + 0.7).toFixed(2)}s`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
setInterval(spawnShoot, 3200);
setTimeout(spawnShoot, 900);


/* ─── HUD CLOCK ─── */
setInterval(() => {
  const el = document.getElementById('hud-time');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);


/* ═══════════════════════════════════════════
   GAMES DATA
   Loaded from games.json; falls back to
   inline data if running from file://
═══════════════════════════════════════════ */
let GAMES = [];
let activeCategory = 'all';

// Inline fallback — mirrors games.json exactly
const GAMES_FALLBACK = [
  { id:"basketrandom",   title:"Basket Random",   desc:"Chaotic pixel basketball",     icon:"🏀", badge:"HOT", url:"https://html5.gamedistribution.com/rvvASMiM/bf1268dccb5d43e7970bb3edaa54afc8/index.html?gd_sdk_referrer_url=https%3A%2F%2Fbasketrandom.io%2Fbasket-random&gd_zone_config=eyJwYXJlbnRVUkwiOiJodHRwczovL2Jhc2tldHJhbmRvbS5pby9iYXNrZXQtcmFuZG9tIiwicGFyZW50RG9tYWluIjoiYmFza2V0cmFuZG9tLmlvIiwidG9wRG9tYWluIjoiYmFza2V0cmFuZG9tLmlvIiwiaGFzSW1wcmVzc2lvbiI6dHJ1ZSwibG9hZGVyRW5hYmxlZCI6dHJ1ZSwiaG9zdCI6Imh0bWw1LmdhbWVkaXN0cmlidXRpb24uY29tIiwidmVyc2lvbiI6IjEuNS4xOCJ9", category:"sports" },
  { id:"soccerrandom",   title:"Soccer Random",   desc:"Wacky pixel soccer madness",   icon:"⚽", badge:"HOT", url:"https://html5.gamedistribution.com/rvvASMiM/308d826f20034d7b972f25258c8d0a44/index.html?gd_zone_config=eyJwYXJlbnRVUkwiOiJodHRwczovL3NvY2NlcnJhbmRvbS5pby8iLCJwYXJlbnREb21haW4iOiJzb2NjZXJyYW5kb20uaW8iLCJ0b3BEb21haW4iOiJzb2NjZXJyYW5kb20uaW8iLCJoYXNJbXByZXNzaW9uIjp0cnVlLCJsb2FkZXJFbmFibGVkIjp0cnVlLCJob3N0IjoiaHRtbDUuZ2FtZWRpc3RyaWJ1dGlvbi5jb20iLCJ2ZXJzaW9uIjoiMS41LjE4In0%3D", category:"sports" },
  { id:"boxingrandom",   title:"Boxing Random",   desc:"Punchy pixel boxing chaos",    icon:"🥊", badge:"HOT", url:"https://html5.gamedistribution.com/rvvASMiM/e8c02771085e4c8b9de3deda5e087e0e/index.html?gd_sdk_referrer_url=https%3A%2F%2Fwww.twoplayergames.org%2Fgame%2Fboxing-random&gd_zone_config=eyJwYXJlbnRVUkwiOiJodHRwczovL3d3dy50d29wbGF5ZXJnYW1lcy5vcmcvZ2FtZS9ib3hpbmctcmFuZG9tIiwicGFyZW50RG9tYWluIjoidHdvcGxheWVyZ2FtZXMub3JnIiwidG9wRG9tYWluIjoidHdvcGxheWVyZ2FtZXMub3JnIiwiaGFzSW1wcmVzc2lvbiI6ZmFsc2UsImxvYWRlckVuYWJsZWQiOnRydWUsImhvc3QiOiJodG1sNS5nYW1lZGlzdHJpYnV0aW9uLmNvbSIsInZlcnNpb24iOiIxLjUuMTgifQ%3D%3D", category:"sports" },
  { id:"volleyrandom",   title:"Volley Random",   desc:"Pixel beach volleyball chaos", icon:"🏐", badge:"NEW", url:"https://www.twoplayergames.org/gameframe/volley-random", category:"sports" },
  { id:"ragdollarchers", title:"Ragdoll Archers", desc:"Floppy bow & arrow battles",  icon:"🏹", badge:"HOT", url:"https://bitlifeonline.github.io/ragdoll-archers/", category:"arcade" },
  { id:"ragdollhit",       title:"Ragdoll Hit",        desc:"Smash floppy ragdolls silly",   icon:"💥", badge:"NEW", url:"https://freetoplayz.github.io/ragdoll-hit/",              category:"arcade" },
  { id:"getawayshootout",  title:"Getaway Shootout",   desc:"Wild 2P race & shoot chaos",    icon:"🔫", badge:"HOT", url:"https://htmlxm.github.io/h4/getaway-shootout",            category:"shooter" },
  { id:"rooftopsnipers",   title:"Rooftop Snipers",    desc:"Knock enemies off the roof",    icon:"🎯", badge:"HOT", url:"https://jasongamesdev.github.io/rooftop-snipers/",         category:"shooter" },
  { id:"slope",            title:"Slope",              desc:"Infinite ball runner",          icon:"⚡", badge:"FAST", url:"https://slope-game.github.io",                            category:"arcade" }
];

async function loadGames() {
  try {
    const res = await fetch('games.json');
    if (!res.ok) throw new Error('fetch failed');
    GAMES = await res.json();
  } catch (e) {
    console.warn('[Nova] Could not load games.json — using fallback data.');
    GAMES = GAMES_FALLBACK;
  }
  initUI();
}


/* ═══════════════════════════════════════════
   UI INIT — runs after games are loaded
═══════════════════════════════════════════ */
function initUI() {
  // HUD game count
  const hudCount = document.getElementById('hud-count');
  if (hudCount) hudCount.textContent = GAMES.length;

  // Home chips — first 7 HOT or NEW games
  const featured = GAMES.filter(g => g.badge === 'HOT' || g.badge === 'NEW').slice(0, 7);
  const chipsEl  = document.getElementById('home-chips');
  featured.forEach(g => {
    const d = document.createElement('div');
    d.className = 'h-chip';
    d.textContent = g.title;
    d.onclick = () => { enterApp('games'); openSite(g.url, g.title); };
    chipsEl.appendChild(d);
  });

  // Category filter buttons
  const cats = [...new Set(GAMES.map(g => g.category))].sort();
  const fb   = document.getElementById('filter-bar');
  cats.forEach(cat => {
    const d = document.createElement('div');
    d.className  = 'fcat';
    d.dataset.cat = cat;
    d.textContent = cat.toUpperCase();
    d.onclick = () => setCat(cat, d);
    fb.appendChild(d);
  });

  // Render all cards
  renderCards('all', '');
}


/* ═══════════════════════════════════════════
   CARD RENDERING
═══════════════════════════════════════════ */
function renderCards(cat, query) {
  const container = document.getElementById('game-cards');
  container.innerHTML = '';

  const q        = query.toLowerCase().trim();
  const filtered = GAMES.filter(g => {
    const matchCat = cat === 'all' || g.category === cat;
    const matchQ   = !q
      || g.title.toLowerCase().includes(q)
      || g.desc.toLowerCase().includes(q)
      || g.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">// NO GAMES FOUND — TRY A DIFFERENT SEARCH</div>';
  } else {
    filtered.forEach(g => {
      const card = document.createElement('div');
      card.className    = 'card';
      card.dataset.cat  = g.category;
      card.innerHTML    = `
        <div class="sweep"></div>
        <span class="c-bl"></span><span class="c-br"></span>
        <span class="card-icon">${g.icon}</span>
        ${g.badge ? `<div class="card-badge badge-${g.badge.toLowerCase()}">${g.badge}</div>` : ''}
        <div class="card-title">${g.title}</div>
        <div class="card-desc">${g.desc}</div>
        <div class="card-cat">${g.category}</div>
      `;
      card.onclick = () => openSite(g.url, g.title);
      container.appendChild(card);
    });
  }

  // Update visible count label
  const vc = document.getElementById('visible-count');
  if (vc) vc.textContent = `[${filtered.length}/${GAMES.length}]`;
}

function setCat(cat, el) {
  activeCategory = cat;
  document.querySelectorAll('.fcat').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  filterCards();
}

function filterCards() {
  const q = document.getElementById('game-search').value;
  renderCards(activeCategory, q);
}


/* ═══════════════════════════════════════════
   HOME SEARCH
═══════════════════════════════════════════ */
function homeSearch() {
  const q = document.getElementById('home-search-input').value.trim();
  enterApp('games');
  setTimeout(() => {
    document.getElementById('game-search').value = q;
    renderCards('all', q);
  }, 60);
}

document.getElementById('home-search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') homeSearch();
});


/* ═══════════════════════════════════════════
   PAGE / TAB STATE
═══════════════════════════════════════════ */
const homePage = document.getElementById('home-page');
const innerApp = document.getElementById('inner-app');

function enterApp() {
  homePage.style.display = 'none';
  innerApp.classList.add('open');
  document.getElementById('tab-games').classList.add('active');
  document.getElementById('games').classList.add('active');
  renderCards('all', '');
}

function enterAppFiltered(cat) {
  homePage.style.display = 'none';
  innerApp.classList.add('open');

  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));

  const tabMap = { shooter:'shooters', arcade:'arcade', puzzle:'puzzle', strategy:'strategy', racing:'racing', sports:'sports' };
  const tabEl  = document.getElementById('tab-' + (tabMap[cat] || 'games'));
  if (tabEl) tabEl.classList.add('active');

  activeCategory = cat;
  document.querySelectorAll('.fcat').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });

  document.getElementById('games').classList.add('active');
  renderCards(cat, '');
}

function goHome() {
  closeBrowser();
  innerApp.classList.remove('open');
  homePage.style.display = '';
}

function switchTab(id, btn) {
  closeBrowser();
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = 'all';
  document.querySelectorAll('.fcat').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
  document.getElementById('game-search').value = '';
  renderCards('all', '');
}

function switchTabFilter(tabId, cat, btn) {
  closeBrowser();
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = cat;
  document.querySelectorAll('.fcat').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  document.getElementById('game-search').value = '';
  renderCards(cat, '');
}


/* ═══════════════════════════════════════════
   BROWSER / IFRAME
═══════════════════════════════════════════ */
const browserView  = document.getElementById('browser-view');
const cardsArea    = document.getElementById('cards-area');
const siteFrame    = document.getElementById('site-frame');
const urlBar       = document.getElementById('browser-url-bar');
const frameLoading = document.getElementById('frame-loading');
const blockedNote  = document.getElementById('blocked-notice');

let currentUrl  = '';
let blockTimer  = null;

function openSite(url, label) {
  currentUrl = url;
  urlBar.textContent = label + '  —  ' + url;
  document.getElementById('loading-sub').textContent = url;

  browserView.classList.add('open');
  cardsArea.style.display = 'none';
  frameLoading.classList.add('show');
  blockedNote.classList.remove('show');
  siteFrame.style.visibility = 'hidden';
  siteFrame.src = '';
  clearTimeout(blockTimer);

  requestAnimationFrame(() => { siteFrame.src = url; });

  siteFrame.onload = () => {
    clearTimeout(blockTimer);
    frameLoading.classList.remove('show');
    siteFrame.style.visibility = 'visible';
    // Detect blank document (some blocked sites load but are empty)
    try {
      const doc = siteFrame.contentDocument;
      if (doc && doc.body && doc.body.innerHTML.trim() === '') showBlocked();
    } catch (e) {
      // Cross-origin — frame loaded fine, just can't read its content
    }
  };

  siteFrame.onerror = () => {
    clearTimeout(blockTimer);
    showBlocked();
  };

  // If still loading after 7s, assume it loaded cross-origin and just show it
  blockTimer = setTimeout(() => {
    if (frameLoading.classList.contains('show')) {
      frameLoading.classList.remove('show');
      siteFrame.style.visibility = 'visible';
    }
  }, 7000);
}

function showBlocked() {
  frameLoading.classList.remove('show');
  siteFrame.style.visibility = 'hidden';
  blockedNote.classList.add('show');
}

function closeBrowser() {
  clearTimeout(blockTimer);
  browserView.classList.remove('open');
  cardsArea.style.display = '';
  siteFrame.src = 'about:blank';
  siteFrame.style.visibility = 'visible';
  frameLoading.classList.remove('show');
  blockedNote.classList.remove('show');
  currentUrl = '';
  urlBar.textContent = 'about:blank';
}

function openNewWin() {
  if (currentUrl) window.open(currentUrl, '_blank');
}

function reloadFrame() {
  if (currentUrl) {
    frameLoading.classList.add('show');
    siteFrame.style.visibility = 'hidden';
    blockedNote.classList.remove('show');
    siteFrame.src = '';
    requestAnimationFrame(() => { siteFrame.src = currentUrl; });
  }
}


/* ─── KICK IT OFF ─── */
loadGames();
