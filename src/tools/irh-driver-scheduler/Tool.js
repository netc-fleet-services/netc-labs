// hub/Tool.js — NETC Labs hub-loadable version of the Driver Scheduler.
//
// This is a self-contained DEMO that mirrors the visual language of the
// production Interstate Driver Scheduler: Gantt-style weekly timeline with
// shift bars positioned by start/end time, sticky day headers, weekly stats
// across the top, and a function filter. Data persists to localStorage; no
// backend, no auth.
//
// All element IDs are namespaced `irh-` and all CSS selectors are scoped to
// `.irh-` so this file won't collide with other hub tools.

const STORAGE_KEY     = 'netc-labs:irh-scheduler:v2';
// Older versions stored data under different keys with real-looking names —
// clean them up so the prior demo data doesn't linger in anyone's browser.
const STORAGE_KEY_OLD = ['netc-labs:irh-scheduler:v1'];

const FUNCTIONS = ['LDT', 'HDT', 'Transport', 'Road Service'];

// Maps a function string to the badge class suffix used in CSS.
const FN_BADGE = {
  'LDT':          'ldt',
  'HDT':          'hdt',
  'Transport':    'transport',
  'Road Service': 'road',
};

const OFF_REASONS = ['PTO', 'Sick', 'Unavailable', 'Other'];

const SHIFT_PRESETS = [
  { label: '6a – 6p',  startHour: 6,  endHour: 18 },
  { label: '6p – 6a',  startHour: 18, endHour: 30 },
  { label: '8a – 8p',  startHour: 8,  endHour: 20 },
  { label: '8p – 8a',  startHour: 20, endHour: 32 },
  { label: '7a – 3p',  startHour: 7,  endHour: 15 },
  { label: '3p – 11p', startHour: 15, endHour: 23 },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 168 hours in a week; each day = 100/7%, each hour = (100/7)/24%.
const WEEK_HOURS = 168;
const DAY_PCT    = 100 / 7;

// ── Demo seed ────────────────────────────────────────────────────────────────
// Demo names — clearly fictional, do not match any real driver roster.
const DEMO_FIRST = [
  'Avery', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Skyler', 'Drew', 'Sage',
  'Quinn', 'Reese', 'Rowan', 'Emerson', 'Hayden', 'Parker', 'Finley', 'Blair',
];
const DEMO_LAST = [
  'Vega',  'Nakai', 'Okafor', 'Petrov', 'Hassan', 'Park',  'Reyes', 'Mori',
  'Kade',  'Solis', 'Vance',  'Iyer',   'Costa',  'Ford',  'Holt',  'Marsh',
];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomName(used) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const name = `${pickRandom(DEMO_FIRST)} ${pickRandom(DEMO_LAST)}`;
    if (!used.has(name)) { used.add(name); return name; }
  }
  // Fallback if we somehow exhaust collisions.
  used.add(`Driver ${used.size + 1}`);
  return `Driver ${used.size}`;
}

function defaultState() {
  const used = new Set();
  const make = (id, fn) => ({ id, name: randomName(used), fn });
  return {
    drivers: [
      make('d1', 'LDT'),
      make('d2', 'LDT'),
      make('d3', 'HDT'),
      make('d4', 'HDT'),
      make('d5', 'Transport'),
      make('d6', 'Transport'),
      make('d7', 'Road Service'),
      make('d8', 'Road Service'),
    ],
    shifts: {},
  };
}

// Populate the visible week with a plausible-looking schedule on first load.
function seedCurrentWeek(state, weekStart) {
  const days = rangeOfWeek(weekStart).map(fmtDate);
  const set = (driverId, day, type, extra) => {
    state.shifts[`${day}-${driverId}`] = { type, ...extra };
  };
  days.slice(0, 5).forEach(d => set('d1', d, 'shift', { startHour: 6, endHour: 18 }));
  days.slice(1, 6).forEach(d => set('d2', d, 'shift', { startHour: 18, endHour: 30 }));
  set('d3', days[0], 'shift', { startHour: 6, endHour: 18 });
  set('d3', days[2], 'shift', { startHour: 6, endHour: 18 });
  set('d3', days[4], 'shift', { startHour: 6, endHour: 18 });
  set('d3', days[3], 'off',   { reason: 'PTO' });
  days.slice(0, 4).forEach(d => set('d4', d, 'shift', { startHour: 18, endHour: 30 }));
  days.slice(1, 6).forEach(d => set('d5', d, 'shift', { startHour: 7, endHour: 15 }));
  days.slice(0, 5).forEach(d => set('d6', d, 'shift', { startHour: 8, endHour: 20 }));
  set('d6', days[2], 'off', { reason: 'Sick' });
  [0,1,3,4].forEach(i => set('d7', days[i], 'shift', { startHour: 15, endHour: 23 }));
  [2,3,4,5,6].forEach(i => set('d8', days[i], 'shift', { startHour: 8, endHour: 20 }));
}

// ── Date helpers ─────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function startOfWeek(d) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = r.getDay();
  const back = dow === 0 ? 6 : dow - 1;
  r.setDate(r.getDate() - back);
  return r;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function rangeOfWeek(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}
function fmtWeekRange(d1, d2) {
  const opt = { month: 'short', day: 'numeric' };
  const s1 = d1.toLocaleDateString('en-US', opt);
  const s2 = d2.toLocaleDateString('en-US', opt);
  return d1.getFullYear() === d2.getFullYear()
    ? `${s1} – ${s2}, ${d2.getFullYear()}`
    : `${s1} ${d1.getFullYear()} – ${s2} ${d2.getFullYear()}`;
}

function fmtHour(h) {
  const h24 = ((h % 24) + 24) % 24;
  const ampm = h24 < 12 ? 'a' : 'p';
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}${ampm}`;
}
function fmtShiftLabel(s)  { return `${fmtHour(s.startHour)}–${fmtHour(s.endHour)}`; }
function shiftHours(s)     { return Math.max(0, s.endHour - s.startHour); }
function isOvernight(s)    { return s.endHour > 24; }

// ── Persistence ──────────────────────────────────────────────────────────────
function loadState() {
  // Purge any older versions of the demo so prior hardcoded names don't linger.
  for (const oldKey of STORAGE_KEY_OLD) {
    try { localStorage.removeItem(oldKey); } catch (_) { /* ignore */ }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.drivers) && p.shifts && typeof p.shifts === 'object') return p;
    }
  } catch (_) { /* ignore */ }
  const s = defaultState();
  seedCurrentWeek(s, startOfWeek(new Date()));
  return s;
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (_) { /* ignore quota errors */ }
}

// ── Hours math for the stats bar ─────────────────────────────────────────────
function weekHoursTotal(state, weekStart) {
  const days = rangeOfWeek(weekStart).map(fmtDate);
  let hours = 0, shifts = 0, off = 0;
  for (const drv of state.drivers) {
    for (const d of days) {
      const s = state.shifts[`${d}-${drv.id}`];
      if (!s) continue;
      if (s.type === 'shift') { hours += shiftHours(s); shifts++; }
      else if (s.type === 'off') off++;
    }
  }
  return { hours, shifts, off };
}

// ── Tool entry point ─────────────────────────────────────────────────────────
export function Tool() {
  const el = document.createElement('div');

  let weekStart = startOfWeek(new Date());
  let filter    = 'all';
  let state     = loadState();
  let openCell  = null;

  // ── Scoped styles (appended after innerHTML below so it isn't wiped out) ──
  const style = document.createElement('style');
  style.textContent = `
    .irh-root {
      --irh-accent:    #3b82f6;
      --irh-accent-2:  #2563eb;
      --irh-warn:      #f59e0b;
      --irh-err:       #ef4444;

      /* badge palette */
      --irh-ldt-bg:        rgba(59, 130, 246, 0.15);
      --irh-ldt-fg:        #93c5fd;
      --irh-hdt-bg:        rgba(236, 72, 153, 0.15);
      --irh-hdt-fg:        #f9a8d4;
      --irh-transport-bg:  rgba(34, 197, 94, 0.15);
      --irh-transport-fg:  #86efac;
      --irh-road-bg:       rgba(245, 158, 11, 0.15);
      --irh-road-fg:       #fcd34d;
      --irh-off-bg:        rgba(239, 68, 68, 0.18);
      --irh-off-fg:        #fca5a5;

      display:flex; flex-direction:column; gap:0.85rem; position:relative;
      font-size:13px; color:var(--on-surface);
    }
    /* Darken badge foreground in light theme so it stays readable. */
    .theme-light .irh-root,
    [data-theme="light"] .irh-root {
      --irh-ldt-fg:        #1d4ed8;
      --irh-hdt-fg:        #be185d;
      --irh-transport-fg:  #047857;
      --irh-road-fg:       #92400e;
      --irh-off-fg:        #b91c1c;
    }

    /* ── Tabs ── */
    .irh-tabs {
      display:flex; gap:0.25rem;
      border-bottom:1px solid var(--outline-variant);
    }
    .irh-tab {
      padding:0.55rem 1.05rem;
      background:transparent; border:1px solid transparent; border-bottom:none;
      border-radius:6px 6px 0 0;
      color:var(--on-surface-muted); font-size:13px; font-weight:600;
      font-family:inherit; cursor:pointer; margin-bottom:-1px;
    }
    .irh-tab:hover { color:var(--on-surface); }
    .irh-tab--active {
      background:var(--surface-container); border-color:var(--outline-variant);
      color:var(--on-surface);
    }

    /* ── Stats bar ── */
    .irh-stats {
      display:flex; gap:1rem; padding:0.85rem 1.05rem;
      background:var(--surface-container); border:1px solid var(--outline-variant);
      border-radius:0.5rem;
    }
    .irh-stat { flex:1; min-width:110px; }
    .irh-stat__label {
      font-size:10px; color:var(--on-surface-muted);
      text-transform:uppercase; letter-spacing:0.6px; font-weight:600;
    }
    .irh-stat__value {
      font-size:22px; font-weight:700; color:var(--on-surface);
      margin-top:3px; font-variant-numeric:tabular-nums;
    }
    .irh-stat__delta {
      font-size:11px; color:var(--on-surface-muted); margin-top:2px;
    }
    .irh-stat--current .irh-stat__value { color:var(--irh-accent); }

    /* ── Toolbar ── */
    .irh-toolbar {
      display:flex; flex-wrap:wrap; align-items:center; gap:0.45rem;
    }
    .irh-toolbar .irh-spacer { flex:1; }
    .irh-week-title {
      font-weight:700; color:var(--on-surface); font-size:14px;
      margin:0 0.5rem; min-width:18ch; text-align:center;
      font-variant-numeric:tabular-nums;
    }

    .irh-btn {
      display:inline-flex; align-items:center; justify-content:center; gap:6px;
      padding:6px 12px;
      background:var(--surface-high); border:1px solid var(--outline);
      color:var(--on-surface); border-radius:4px;
      font-size:12px; font-weight:500; font-family:inherit;
      cursor:pointer; transition:background 0.12s, border-color 0.12s;
    }
    .irh-btn:hover { background:color-mix(in srgb, var(--irh-accent) 10%, var(--surface-high));
                     border-color:var(--irh-accent); }
    .irh-btn--primary { background:var(--irh-accent); border-color:var(--irh-accent); color:#fff; }
    .irh-btn--primary:hover { background:var(--irh-accent-2); border-color:var(--irh-accent-2); }
    .irh-btn--ghost   { background:transparent; }
    .irh-btn--icon    { padding:6px 9px; min-width:32px; }

    .irh-select, .irh-input {
      background:var(--surface-high); border:1px solid var(--outline);
      color:var(--on-surface); border-radius:4px;
      padding:6px 9px; font-size:12px; font-family:inherit;
    }
    .irh-input:focus, .irh-select:focus { outline:none; border-color:var(--irh-accent); }

    .irh-field-label {
      display:flex; align-items:center; gap:0.3rem;
      font-size:11px; color:var(--on-surface-muted);
      text-transform:uppercase; letter-spacing:0.4px; font-weight:600;
    }

    /* ── Gantt ── */
    .irh-gantt {
      background:var(--surface-container); border:1px solid var(--outline-variant);
      border-radius:0.5rem; overflow:hidden;
    }
    .irh-gantt-scroll {
      overflow-x:auto;
    }
    .irh-gantt-inner { min-width:760px; }

    .irh-gantt-head {
      display:grid; grid-template-columns:220px 1fr;
      background:var(--surface-high); border-bottom:1px solid var(--outline-variant);
    }
    .irh-gantt-driver-col {
      padding:10px 14px; font-size:11px; font-weight:700;
      text-transform:uppercase; letter-spacing:0.5px;
      color:var(--on-surface-muted); border-right:1px solid var(--outline-variant);
    }
    .irh-gantt-axis { position:relative; height:48px; }
    .irh-gantt-day {
      position:absolute; top:0; bottom:0;
      padding:6px 0 0 8px;
      border-left:1px solid var(--outline-variant);
      font-size:11px; line-height:1.2; cursor:pointer;
      transition:background 0.1s;
    }
    .irh-gantt-day:first-child { border-left:none; }
    .irh-gantt-day:hover { background:color-mix(in srgb, var(--irh-accent) 6%, transparent); }
    .irh-gantt-day-dow {
      display:block; text-transform:uppercase; color:var(--on-surface-muted);
      font-size:10px; font-weight:700; letter-spacing:0.4px;
    }
    .irh-gantt-day-dom {
      display:block; color:var(--on-surface); font-size:13px; font-weight:700;
      margin-top:1px;
    }
    .irh-gantt-day--today .irh-gantt-day-dom { color:var(--irh-accent); }
    .irh-gantt-day--today {
      background:color-mix(in srgb, var(--irh-accent) 10%, transparent);
    }

    .irh-gantt-row {
      display:grid; grid-template-columns:220px 1fr;
      border-bottom:1px solid var(--outline-variant); min-height:56px;
    }
    .irh-gantt-row:last-child { border-bottom:none; }

    .irh-gantt-row-driver {
      padding:8px 14px; display:flex; flex-direction:column; justify-content:center; gap:4px;
      border-right:1px solid var(--outline-variant);
      background:var(--surface-container);
    }
    .irh-gantt-row-driver .irh-driver-name {
      font-weight:600; font-size:13px;
      display:flex; align-items:center; gap:0.4rem;
    }
    .irh-driver-remove {
      background:transparent; border:none; color:var(--on-surface-muted);
      cursor:pointer; font-size:14px; line-height:1; padding:0;
      opacity:0; transition:opacity 0.1s, color 0.1s;
    }
    .irh-gantt-row-driver:hover .irh-driver-remove { opacity:0.7; }
    .irh-driver-remove:hover { color:var(--irh-err); opacity:1; }

    .irh-gantt-row-track {
      position:relative; background:var(--surface-container);
    }
    .irh-gantt-row:nth-child(even) .irh-gantt-row-driver,
    .irh-gantt-row:nth-child(even) .irh-gantt-row-track {
      background:color-mix(in srgb, var(--surface-high) 35%, var(--surface-container));
    }

    /* Day dividers inside each track */
    .irh-gantt-divider {
      position:absolute; top:0; bottom:0; width:1px;
      background:var(--outline-variant); pointer-events:none;
    }
    .irh-gantt-day-cell {
      position:absolute; top:0; bottom:0; cursor:pointer;
      transition:background 0.1s;
    }
    .irh-gantt-day-cell:hover {
      background:color-mix(in srgb, var(--irh-accent) 5%, transparent);
    }
    .irh-gantt-day-cell--today {
      background:color-mix(in srgb, var(--irh-accent) 4%, transparent);
    }
    .irh-gantt-day-cell--open {
      background:color-mix(in srgb, var(--irh-accent) 14%, transparent) !important;
      box-shadow: inset 0 0 0 2px var(--irh-accent);
    }

    /* Now-line: vertical orange marker at the current time */
    .irh-gantt-now {
      position:absolute; top:0; bottom:0; width:0;
      border-left:2px solid var(--irh-warn);
      pointer-events:none; z-index:4;
    }
    .irh-gantt-axis .irh-gantt-now::before {
      content:''; position:absolute; top:-2px; left:-5px;
      width:8px; height:8px; border-radius:50%;
      background:var(--irh-warn);
    }

    /* Shift / off bars */
    .irh-bar {
      position:absolute; top:8px; bottom:8px;
      border-radius:4px; padding:0 8px;
      font-size:11px; font-weight:600; color:#fff;
      cursor:pointer; white-space:nowrap; overflow:hidden;
      display:flex; align-items:center; gap:6px;
      z-index:1;
      transition:filter 0.1s, box-shadow 0.1s;
      font-variant-numeric:tabular-nums;
    }
    .irh-bar:hover { filter:brightness(1.15); z-index:2; }
    .irh-bar--shift {
      background:var(--irh-accent); border:1px solid var(--irh-accent-2);
    }
    .irh-bar--overnight {
      background:linear-gradient(to right,
        var(--irh-accent) 0%, var(--irh-accent) 70%, var(--irh-warn) 100%);
      border:1px solid var(--irh-warn);
    }
    .irh-bar--off {
      background:var(--irh-off-bg); border:1px dashed rgba(239,68,68,0.45);
      color:var(--irh-off-fg); font-weight:500;
    }
    .irh-bar__end { margin-left:auto; opacity:0.85; padding-left:6px; }

    /* Empty state */
    .irh-empty-state {
      padding:2rem; text-align:center; color:var(--on-surface-muted);
      font-size:13px;
    }

    /* ── Category badges ── */
    .irh-badge {
      display:inline-block; padding:1px 7px; border-radius:4px;
      font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px;
      background:var(--surface-high); color:var(--on-surface-muted);
    }
    .irh-badge--ldt       { background:var(--irh-ldt-bg);       color:var(--irh-ldt-fg); }
    .irh-badge--hdt       { background:var(--irh-hdt-bg);       color:var(--irh-hdt-fg); }
    .irh-badge--transport { background:var(--irh-transport-bg); color:var(--irh-transport-fg); }
    .irh-badge--road      { background:var(--irh-road-bg);      color:var(--irh-road-fg); }

    /* ── Coverage row (bottom of gantt) ── */
    .irh-coverage-row {
      display:grid; grid-template-columns:220px 1fr;
      background:var(--surface-high); border-top:1px solid var(--outline-variant);
    }
    .irh-coverage-label {
      padding:8px 14px; font-size:11px; font-weight:700;
      text-transform:uppercase; letter-spacing:0.5px;
      color:var(--on-surface-muted); border-right:1px solid var(--outline-variant);
      display:flex; align-items:center;
    }
    .irh-coverage-track { position:relative; min-height:36px; }
    .irh-coverage-cell {
      position:absolute; top:0; bottom:0;
      display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:700; color:var(--on-surface);
      border-left:1px solid var(--outline-variant);
      font-variant-numeric:tabular-nums;
    }
    .irh-coverage-cell:first-child { border-left:none; }
    .irh-coverage-cell small {
      display:block; font-size:9px; font-weight:600; color:var(--on-surface-muted);
      text-transform:uppercase; letter-spacing:0.4px; margin-top:1px; text-align:center;
    }
    .irh-coverage-cell--under { color:var(--irh-err); }
    .irh-coverage-cell--over  { color:var(--irh-warn); }

    /* ── Add-driver bar ── */
    .irh-add-bar {
      display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;
      padding:0.55rem 0.75rem;
      background:var(--surface-container); border:1px solid var(--outline-variant);
      border-radius:0.5rem; font-size:12px;
    }
    .irh-add-bar label { display:flex; align-items:center; gap:0.4rem; color:var(--on-surface-muted); }

    /* ── Popover ── */
    .irh-popover {
      position:fixed; z-index:1000;
      background:var(--surface-container); border:1px solid var(--outline);
      border-radius:0.5rem; padding:0.85rem; min-width:260px;
      box-shadow:0 12px 36px rgba(0,0,0,0.45);
      font-size:12px;
    }
    .irh-pop-title { font-weight:700; font-size:13px; margin-bottom:2px; color:var(--on-surface); }
    .irh-pop-sub { font-size:11px; color:var(--on-surface-muted); margin-bottom:0.65rem; }
    .irh-pop-section + .irh-pop-section {
      margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--outline-variant);
    }
    .irh-pop-label {
      font-size:10px; text-transform:uppercase; letter-spacing:0.5px;
      color:var(--on-surface-muted); font-weight:700; margin-bottom:0.4rem;
    }
    .irh-pop-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:0.3rem; }
    .irh-pop-grid .irh-btn { padding:5px 6px; font-size:11px; }
    .irh-pop-close {
      position:absolute; top:6px; right:8px;
      background:none; border:none; color:var(--on-surface-muted);
      cursor:pointer; font-size:16px; line-height:1; padding:2px 5px;
    }
    .irh-pop-close:hover { color:var(--on-surface); }
    .irh-pop-current {
      background:var(--surface-high); border:1px solid var(--outline-variant);
      border-radius:0.3rem; padding:6px 9px; margin-bottom:0.55rem;
      font-size:11px; color:var(--on-surface);
    }
    .irh-pop-actions { display:flex; gap:0.35rem; margin-top:0.55rem; }

    /* ── Legend ── */
    .irh-legend {
      display:flex; flex-wrap:wrap; gap:0.85rem;
      font-size:11px; color:var(--on-surface-muted);
    }
    .irh-legend span { display:inline-flex; align-items:center; gap:5px; }
    .irh-legend-swatch {
      display:inline-block; width:14px; height:8px; border-radius:2px;
      border:1px solid transparent;
    }
  `;

  el.className = 'irh-root';
  el.innerHTML = `
    <!-- Tabs -->
    <div class="irh-tabs">
      <button class="irh-tab irh-tab--active" data-tab="all"          id="irh-tab-all">All drivers</button>
      <button class="irh-tab" data-tab="LDT"                          id="irh-tab-ldt">LDT</button>
      <button class="irh-tab" data-tab="HDT"                          id="irh-tab-hdt">HDT</button>
      <button class="irh-tab" data-tab="Transport"                    id="irh-tab-transport">Transport</button>
      <button class="irh-tab" data-tab="Road Service"                 id="irh-tab-road">Road Service</button>
    </div>

    <!-- Stats bar -->
    <div class="irh-stats" id="irh-stats"></div>

    <!-- Toolbar (week nav + actions) -->
    <div class="irh-toolbar">
      <button class="irh-btn irh-btn--icon" id="irh-prev"  title="Previous week">‹</button>
      <button class="irh-btn"               id="irh-today" title="Jump to current week">Today</button>
      <button class="irh-btn irh-btn--icon" id="irh-next"  title="Next week">›</button>
      <input  type="date" class="irh-input" id="irh-jump"  title="Jump to week" />
      <span class="irh-week-title" id="irh-week-title"></span>

      <span class="irh-spacer"></span>

      <button class="irh-btn"           id="irh-copy-last" title="Copy last week's schedule into this week">← Copy last week</button>
      <button class="irh-btn"           id="irh-clear"     title="Clear all shifts for this week">Clear week</button>
      <button class="irh-btn irh-btn--ghost" id="irh-reset" title="Reset drivers + schedule to demo defaults">Reset demo</button>
    </div>

    <!-- Gantt -->
    <div class="irh-gantt">
      <div class="irh-gantt-scroll">
        <div class="irh-gantt-inner" id="irh-gantt"></div>
      </div>
    </div>

    <!-- Add driver -->
    <div class="irh-add-bar">
      <label>Name <input class="irh-input" id="irh-new-name" placeholder="Driver name…" style="width:180px" /></label>
      <label>Function
        <select class="irh-select" id="irh-new-fn">
          ${FUNCTIONS.map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
      </label>
      <button class="irh-btn irh-btn--primary" id="irh-add-driver">+ Add driver</button>
      <span style="flex:1"></span>
      <div class="irh-legend">
        <span><span class="irh-legend-swatch" style="background:var(--irh-accent);border-color:var(--irh-accent-2)"></span>Shift</span>
        <span><span class="irh-legend-swatch" style="background:linear-gradient(to right,var(--irh-accent) 0,var(--irh-accent) 70%,var(--irh-warn) 100%);border-color:var(--irh-warn)"></span>Overnight</span>
        <span><span class="irh-legend-swatch" style="background:var(--irh-off-bg);border:1px dashed rgba(239,68,68,0.45)"></span>Off</span>
      </div>
    </div>
  `;

  // Append <style> AFTER innerHTML is set — setting innerHTML wipes existing
  // children, so the style block has to go on last.
  el.appendChild(style);

  const q = (id) => el.querySelector('#irh-' + id);

  // ── Derived data ─────────────────────────────────────────────────────────
  function visibleDrivers() {
    return filter === 'all' ? state.drivers : state.drivers.filter(d => d.fn === filter);
  }
  function shiftFor(driverId, dateStr) {
    return state.shifts[`${dateStr}-${driverId}`] || null;
  }
  function setShift(driverId, dateStr, value) {
    const k = `${dateStr}-${driverId}`;
    if (value === null) delete state.shifts[k];
    else state.shifts[k] = value;
    saveState(state);
  }

  // Convert an absolute hour-of-week (0–168) to a percentage of the timeline.
  function hourPct(dayIdx, hour) {
    return ((dayIdx * 24 + hour) / WEEK_HOURS) * 100;
  }

  // ── Stats bar ────────────────────────────────────────────────────────────
  function renderStats() {
    const thisWeek = weekHoursTotal(state, weekStart);
    const lastWeek = weekHoursTotal(state, addDays(weekStart, -7));
    const nextWeek = weekHoursTotal(state, addDays(weekStart,  7));
    q('stats').innerHTML = `
      <div class="irh-stat">
        <div class="irh-stat__label">Last week</div>
        <div class="irh-stat__value">${lastWeek.hours}h</div>
        <div class="irh-stat__delta">${lastWeek.shifts} shift${lastWeek.shifts === 1 ? '' : 's'}</div>
      </div>
      <div class="irh-stat irh-stat--current">
        <div class="irh-stat__label">This week</div>
        <div class="irh-stat__value">${thisWeek.hours}h</div>
        <div class="irh-stat__delta">${thisWeek.shifts} shift${thisWeek.shifts === 1 ? '' : 's'} · ${thisWeek.off} off</div>
      </div>
      <div class="irh-stat">
        <div class="irh-stat__label">Next week</div>
        <div class="irh-stat__value">${nextWeek.hours}h</div>
        <div class="irh-stat__delta">${nextWeek.shifts} shift${nextWeek.shifts === 1 ? '' : 's'}</div>
      </div>
    `;
  }

  // ── Gantt render ─────────────────────────────────────────────────────────
  function renderGantt() {
    const gantt   = q('gantt');
    const days    = rangeOfWeek(weekStart);
    const drivers = visibleDrivers();
    const todayStr = fmtDate(new Date());

    // Now-line position (only if today falls inside the visible week).
    const now = new Date();
    let nowPct = null;
    const todayIdx = days.findIndex(d => fmtDate(d) === todayStr);
    if (todayIdx >= 0) {
      const h = now.getHours() + now.getMinutes() / 60;
      nowPct = hourPct(todayIdx, h);
    }

    // ── Header (sticky day axis) ──
    let html = `
      <div class="irh-gantt-head">
        <div class="irh-gantt-driver-col">Driver / Function</div>
        <div class="irh-gantt-axis">
          ${days.map((d, i) => {
            const isToday = fmtDate(d) === todayStr;
            const left = (i * DAY_PCT).toFixed(4);
            return `
              <div class="irh-gantt-day ${isToday ? 'irh-gantt-day--today' : ''}"
                   style="left:${left}%;width:${DAY_PCT.toFixed(4)}%">
                <span class="irh-gantt-day-dow">${DAY_LABELS[i]}</span>
                <span class="irh-gantt-day-dom">${d.toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>
              </div>`;
          }).join('')}
          ${nowPct !== null ? `<div class="irh-gantt-now" style="left:${nowPct.toFixed(3)}%"></div>` : ''}
        </div>
      </div>
    `;

    // ── Body rows ──
    if (drivers.length === 0) {
      html += `<div class="irh-empty-state">
        No drivers in this view. Switch tabs above or add a driver below.
      </div>`;
    } else {
      for (const drv of drivers) {
        const badgeClass = `irh-badge irh-badge--${FN_BADGE[drv.fn]}`;

        // Per-day click zones (one per day, transparent overlay).
        let cells = '';
        for (let i = 0; i < 7; i++) {
          const dateStr = fmtDate(days[i]);
          const isToday = dateStr === todayStr;
          const isOpen  = openCell && openCell.driverId === drv.id && openCell.dateStr === dateStr;
          const left  = (i * DAY_PCT).toFixed(4);
          cells += `
            <div class="irh-gantt-day-cell ${isToday ? 'irh-gantt-day-cell--today' : ''} ${isOpen ? 'irh-gantt-day-cell--open' : ''}"
                 data-cell="${drv.id}|${dateStr}"
                 style="left:${left}%;width:${DAY_PCT.toFixed(4)}%"></div>`;
        }

        // Day dividers (visible vertical lines at day boundaries).
        let dividers = '';
        for (let i = 1; i < 7; i++) {
          dividers += `<div class="irh-gantt-divider" style="left:${(i * DAY_PCT).toFixed(4)}%"></div>`;
        }

        // Shift bars (positioned by start/end hour).
        let bars = '';
        for (let i = 0; i < 7; i++) {
          const dateStr = fmtDate(days[i]);
          const s = shiftFor(drv.id, dateStr);
          if (!s) continue;

          const left = hourPct(i, s.type === 'shift' ? s.startHour : 0);
          let width;
          let extraClass = '';
          let inner;

          if (s.type === 'shift') {
            width = (shiftHours(s) / WEEK_HOURS) * 100;
            extraClass = isOvernight(s) ? 'irh-bar--overnight' : 'irh-bar--shift';
            inner = `
              <span>${fmtHour(s.startHour)}</span>
              <span class="irh-bar__end">${fmtHour(s.endHour)}</span>`;
          } else {
            // Off bar: span the whole day.
            width = (24 / WEEK_HOURS) * 100;
            extraClass = 'irh-bar--off';
            inner = `<span>${escapeHtml(s.reason || 'Off')}</span>`;
          }

          // Clamp so we don't overflow the timeline.
          const clampedWidth = Math.min(width, 100 - left);

          bars += `
            <div class="irh-bar ${extraClass}"
                 data-cell="${drv.id}|${dateStr}"
                 style="left:${left.toFixed(3)}%;width:${clampedWidth.toFixed(3)}%"
                 title="${s.type === 'shift' ? fmtShiftLabel(s) + ' (' + shiftHours(s) + 'h)' : 'Off — ' + (s.reason || '')}">
              ${inner}
            </div>`;
        }

        html += `
          <div class="irh-gantt-row">
            <div class="irh-gantt-row-driver">
              <span class="irh-driver-name">
                ${escapeHtml(drv.name)}
                <button class="irh-driver-remove" data-remove-driver="${drv.id}" title="Remove driver">×</button>
              </span>
              <span><span class="${badgeClass}">${drv.fn}</span></span>
            </div>
            <div class="irh-gantt-row-track">
              ${dividers}
              ${cells}
              ${bars}
              ${nowPct !== null ? `<div class="irh-gantt-now" style="left:${nowPct.toFixed(3)}%"></div>` : ''}
            </div>
          </div>`;
      }

      // ── Coverage row ──
      let covCells = '';
      let covDividers = '';
      for (let i = 1; i < 7; i++) {
        covDividers += `<div class="irh-gantt-divider" style="left:${(i * DAY_PCT).toFixed(4)}%"></div>`;
      }
      for (let i = 0; i < 7; i++) {
        const dateStr = fmtDate(days[i]);
        let onDuty = 0, off = 0;
        for (const drv of drivers) {
          const s = shiftFor(drv.id, dateStr);
          if (s && s.type === 'shift') onDuty++;
          else if (s && s.type === 'off') off++;
        }
        const left = (i * DAY_PCT).toFixed(4);
        const cls = onDuty === 0 && drivers.length > 0 ? 'irh-coverage-cell--under' : '';
        covCells += `
          <div class="irh-coverage-cell ${cls}"
               style="left:${left}%;width:${DAY_PCT.toFixed(4)}%">
            <div>
              ${onDuty}
              <small>${off ? off + ' off' : 'on duty'}</small>
            </div>
          </div>`;
      }
      html += `
        <div class="irh-coverage-row">
          <div class="irh-coverage-label">Coverage</div>
          <div class="irh-coverage-track">${covDividers}${covCells}</div>
        </div>
      `;
    }

    gantt.innerHTML = html;
  }

  function renderHeader() {
    const days = rangeOfWeek(weekStart);
    q('week-title').textContent = fmtWeekRange(days[0], days[6]);
    q('jump').value = fmtDate(weekStart);

    // Tab highlighting
    el.querySelectorAll('.irh-tab').forEach(t => {
      t.classList.toggle('irh-tab--active', t.getAttribute('data-tab') === filter);
    });
  }

  function renderAll() {
    renderHeader();
    renderStats();
    renderGantt();
    if (openCell) renderPopover();
  }

  // ── Popover ──────────────────────────────────────────────────────────────
  function openPopover(driverId, dateStr, anchorEl) {
    closePopover();
    openCell = {
      driverId, dateStr,
      anchorRect: anchorEl.getBoundingClientRect(),
    };
    renderGantt();
    renderPopover();
  }
  function closePopover() {
    if (!openCell) return;
    const p = el.querySelector('.irh-popover');
    if (p) p.remove();
    openCell = null;
    renderGantt();
  }
  function renderPopover() {
    const existing = el.querySelector('.irh-popover');
    if (existing) existing.remove();
    if (!openCell) return;

    const drv = state.drivers.find(d => d.id === openCell.driverId);
    if (!drv) { openCell = null; return; }

    const current = shiftFor(openCell.driverId, openCell.dateStr);
    const dispDate = parseDate(openCell.dateStr).toLocaleDateString('en-US',
      { weekday:'short', month:'short', day:'numeric' });

    const pop = document.createElement('div');
    pop.className = 'irh-popover';
    pop.innerHTML = `
      <button class="irh-pop-close" id="irh-pop-close" aria-label="Close">×</button>
      <div class="irh-pop-title">${escapeHtml(drv.name)}</div>
      <div class="irh-pop-sub">
        ${dispDate} · <span class="irh-badge irh-badge--${FN_BADGE[drv.fn]}">${drv.fn}</span>
      </div>

      ${current ? `
        <div class="irh-pop-current">
          Current: ${current.type === 'shift'
            ? `<strong>${fmtShiftLabel(current)}</strong> (${shiftHours(current)}h)`
            : `<strong>Off — ${escapeHtml(current.reason || '')}</strong>`}
        </div>
      ` : ''}

      <div class="irh-pop-section">
        <div class="irh-pop-label">Set shift</div>
        <div class="irh-pop-grid">
          ${SHIFT_PRESETS.map((s, i) =>
            `<button class="irh-btn" data-shift="${i}">${s.label}</button>`
          ).join('')}
        </div>
      </div>

      <div class="irh-pop-section">
        <div class="irh-pop-label">Mark off</div>
        <div class="irh-pop-grid">
          ${OFF_REASONS.map(r =>
            `<button class="irh-btn" data-off="${r}">${r}</button>`
          ).join('')}
        </div>
      </div>

      ${current ? `
        <div class="irh-pop-actions">
          <button class="irh-btn irh-btn--ghost" id="irh-pop-clear" style="flex:1">Clear</button>
        </div>
      ` : ''}
    `;
    el.appendChild(pop);

    const r = openCell.anchorRect;
    const popW = pop.offsetWidth || 280;
    const popH = pop.offsetHeight || 300;
    const margin = 8;
    let left = r.left + r.width / 2 - popW / 2;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
    if (left < 8) left = 8;
    let top = r.bottom + margin;
    if (top + popH > window.innerHeight - 8) top = r.top - popH - margin;
    if (top < 8) top = 8;
    pop.style.left = left + 'px';
    pop.style.top  = top  + 'px';

    pop.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.id === 'irh-pop-close') { closePopover(); return; }
      if (t.id === 'irh-pop-clear') {
        setShift(openCell.driverId, openCell.dateStr, null);
        closePopover();
        renderStats();
        renderGantt();
        return;
      }
      const shiftIdx = t.getAttribute('data-shift');
      if (shiftIdx !== null) {
        const s = SHIFT_PRESETS[Number(shiftIdx)];
        setShift(openCell.driverId, openCell.dateStr,
                 { type:'shift', startHour:s.startHour, endHour:s.endHour });
        closePopover();
        renderStats();
        renderGantt();
        return;
      }
      const offReason = t.getAttribute('data-off');
      if (offReason) {
        setShift(openCell.driverId, openCell.dateStr, { type:'off', reason:offReason });
        closePopover();
        renderStats();
        renderGantt();
        return;
      }
    });
  }

  // ── Event wiring ─────────────────────────────────────────────────────────
  el.querySelectorAll('.irh-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      filter = tab.getAttribute('data-tab');
      closePopover();
      renderAll();
    });
  });

  q('prev').addEventListener('click',  () => { weekStart = addDays(weekStart, -7); closePopover(); renderAll(); });
  q('next').addEventListener('click',  () => { weekStart = addDays(weekStart,  7); closePopover(); renderAll(); });
  q('today').addEventListener('click', () => { weekStart = startOfWeek(new Date()); closePopover(); renderAll(); });
  q('jump').addEventListener('change', (e) => {
    const v = e.target.value;
    if (!v) return;
    weekStart = startOfWeek(parseDate(v));
    closePopover();
    renderAll();
  });

  q('copy-last').addEventListener('click', () => {
    const prevDays = rangeOfWeek(addDays(weekStart, -7)).map(fmtDate);
    const thisDays = rangeOfWeek(weekStart).map(fmtDate);
    for (const drv of state.drivers) {
      prevDays.forEach((pd, i) => {
        const src = state.shifts[`${pd}-${drv.id}`];
        if (src) state.shifts[`${thisDays[i]}-${drv.id}`] = { ...src };
        else delete state.shifts[`${thisDays[i]}-${drv.id}`];
      });
    }
    saveState(state);
    renderStats();
    renderGantt();
  });

  q('clear').addEventListener('click', () => {
    const thisDays = rangeOfWeek(weekStart).map(fmtDate);
    for (const drv of state.drivers) {
      for (const d of thisDays) delete state.shifts[`${d}-${drv.id}`];
    }
    saveState(state);
    renderStats();
    renderGantt();
  });

  q('reset').addEventListener('click', () => {
    if (!confirm('Reset drivers and schedule to demo defaults? This clears all local edits.')) return;
    state = defaultState();
    seedCurrentWeek(state, startOfWeek(new Date()));
    saveState(state);
    weekStart = startOfWeek(new Date());
    filter = 'all';
    closePopover();
    renderAll();
  });

  q('add-driver').addEventListener('click', () => {
    const name = q('new-name').value.trim();
    const fn   = q('new-fn').value;
    if (!name) { q('new-name').focus(); return; }
    state.drivers.push({ id: 'd' + Date.now().toString(36), name, fn });
    saveState(state);
    q('new-name').value = '';
    renderGantt();
  });
  q('new-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') q('add-driver').click();
  });

  // Delegated clicks inside the Gantt (cells, bars, remove-driver).
  q('gantt').addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    const removeBtn = t.closest('[data-remove-driver]');
    if (removeBtn) {
      const driverId = removeBtn.getAttribute('data-remove-driver');
      const drv = state.drivers.find(d => d.id === driverId);
      if (drv && confirm(`Remove ${drv.name} and all their shifts?`)) {
        state.drivers = state.drivers.filter(d => d.id !== driverId);
        for (const k of Object.keys(state.shifts)) {
          if (k.endsWith('-' + driverId)) delete state.shifts[k];
        }
        saveState(state);
        if (openCell && openCell.driverId === driverId) closePopover();
        renderStats();
        renderGantt();
      }
      e.stopPropagation();
      return;
    }

    const target = t.closest('[data-cell]');
    if (target) {
      const [driverId, dateStr] = target.getAttribute('data-cell').split('|');
      if (openCell && openCell.driverId === driverId && openCell.dateStr === dateStr) {
        closePopover();
      } else {
        openPopover(driverId, dateStr, target);
      }
      e.stopPropagation();
    }
  });

  // Outside-click & Esc close the popover.
  const docClick = (e) => {
    if (!openCell) return;
    if (!el.contains(e.target)) closePopover();
    else if (!e.target.closest('.irh-popover') && !e.target.closest('[data-cell]')) closePopover();
  };
  document.addEventListener('click', docClick);

  const onKey = (e) => { if (e.key === 'Escape' && openCell) closePopover(); };
  document.addEventListener('keydown', onKey);

  // Reanchor the popover if the page resizes / scrolls.
  const reposition = () => {
    if (!openCell) return;
    const cell = el.querySelector(`[data-cell="${openCell.driverId}|${openCell.dateStr}"]`);
    if (cell) { openCell.anchorRect = cell.getBoundingClientRect(); renderPopover(); }
    else closePopover();
  };
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);

  // Refresh the now-line once a minute so it tracks real time.
  const nowTimer = setInterval(() => { renderGantt(); }, 60_000);
  // Best-effort cleanup if this element is removed from the DOM.
  new MutationObserver((muts) => {
    for (const m of muts) {
      for (const node of m.removedNodes) {
        if (node === el) {
          clearInterval(nowTimer);
          document.removeEventListener('click', docClick);
          document.removeEventListener('keydown', onKey);
          window.removeEventListener('resize', reposition);
          window.removeEventListener('scroll', reposition, true);
        }
      }
    }
  }).observe(document.body, { childList:true, subtree:true });

  renderAll();
  return el;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[c]));
}
