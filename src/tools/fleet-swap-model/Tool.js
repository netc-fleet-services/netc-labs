// Fleet Lifecycle Swap Tool — faithful port of fleet-swap-model/script.js
// All math is identical to the original. Colors and panel styles use the
// hub's CSS variables so the tool looks native to the site in both themes.

const DEFAULTS = {
  purchasePrice:   185000,
  annualMiles:     45000,
  baseMaintenance: 6000,
  maintEscalation: 25,
  revenuePerDay:   1800,
  resaleY2: 72, resaleY3: 60, resaleY4: 50, resaleY5: 42,
  resaleY6: 35, resaleY7: 29, resaleY8: 24,
};

const CONDITION_PROFILES = {
  easy:      { base: 3, threshold: 45000, exponent: 1.00 },
  typical:   { base: 5, threshold: 45000, exponent: 1.11 },
  punishing: { base: 7, threshold: 45000, exponent: 1.25 },
};

const COMMA_FIELDS = new Set([
  'purchasePrice','annualMiles','baseMaintenance','revenuePerDay',
]);

const FIELDS = Object.keys(DEFAULTS);

const money  = (n) => '$' + Math.round(n).toLocaleString();
const num    = (n) => Math.round(n).toLocaleString();
const parseN = (s) => { const n = parseFloat(String(s).replace(/[,$\s]/g,'')); return isNaN(n)?0:n; };
const fmtIn  = (n, f) => COMMA_FIELDS.has(f) ? Math.round(n).toLocaleString('en-US') : String(n);
const mLabel = (m) => { const y=Math.floor(m/12), mo=m%12; return mo===0?`Year ${y}`:`Year ${y} · M${mo}`; };

// ── Core math (copied verbatim from original) ─────────────────────────────────
function project(root) {
  const q = (id) => root.querySelector('#fsm-'+id);
  const v = {};
  for (const f of FIELDS) v[f] = parseN(q(f).value);

  const cond = q('operatingConditions').value;
  const profile = CONDITION_PROFILES[cond] || CONDITION_PROFILES.typical;
  v.baseDowntime      = profile.base;
  v.downtimeThreshold = profile.threshold;
  v.downtimeExponent  = profile.exponent;

  const r = v.maintEscalation / 100;

  const resaleAnchors = {
    0: 100, 1: (100 + v.resaleY2) / 2,
    2: v.resaleY2, 3: v.resaleY3, 4: v.resaleY4, 5: v.resaleY5,
    6: v.resaleY6, 7: v.resaleY7, 8: v.resaleY8,
  };
  function resalePctAt(tYears) {
    const y  = Math.max(0, Math.min(8, tYears));
    const lo = Math.floor(y), hi = Math.min(8, lo+1);
    return (resaleAnchors[lo] + (resaleAnchors[hi]-resaleAnchors[lo])*(y-lo)) / 100;
  }

  const months = [];
  let cumMaint = 0, cumLost = 0;

  for (let m = 1; m <= 96; m++) {
    const tYears      = m / 12;
    const cumMiles    = v.annualMiles * tYears;
    const yearIdx     = Math.ceil(m / 12);
    const monthlyMaint= (v.baseMaintenance * Math.pow(1+r, yearIdx-1)) / 12;
    const rawDowntime = v.baseDowntime * Math.pow(cumMiles/v.downtimeThreshold, v.downtimeExponent);
    const annualDT    = Math.min(60, rawDowntime);
    const monthlyLost = (annualDT/12) * v.revenuePerDay;

    cumMaint += monthlyMaint;
    cumLost  += monthlyLost;

    const resaleValue  = v.purchasePrice * resalePctAt(tYears);
    const depreciation = v.purchasePrice - resaleValue;
    const cumOpCost    = cumMaint + cumLost;
    const totalCost    = depreciation + cumOpCost;
    const costPerYear  = totalCost / tYears;

    months.push({ m, tYears, cumMiles, resaleValue, depreciation,
                  cumMaint, cumLost, cumOpCost, totalCost, costPerYear });
  }

  let opt = months[23];
  for (let i = 23; i < months.length; i++) {
    if (months[i].costPerYear < opt.costPerYear) opt = months[i];
  }

  let crossover = null;
  for (const p of months) {
    if (p.cumOpCost >= p.resaleValue) { crossover = p; break; }
  }

  const scenarios = [];
  for (let y = 2; y <= 8; y++) {
    const row = months[y*12-1];
    scenarios.push({
      year: y, cumMiles: row.cumMiles, resaleValue: row.resaleValue,
      depreciation: row.depreciation, cumMaint: row.cumMaint,
      cumLost: row.cumLost, tco: row.totalCost, tcoPerYear: row.costPerYear,
    });
  }
  const winnerYearly = scenarios.reduce((a,b) => a.tcoPerYear < b.tcoPerYear ? a : b);

  const yearRows = [];
  for (let y = 1; y <= 8; y++) {
    const row  = months[y*12-1];
    const prev = y===1 ? {cumMaint:0,cumLost:0} : months[(y-1)*12-1];
    yearRows.push({
      year: y, cumMiles: row.cumMiles,
      maintenance: row.cumMaint - prev.cumMaint,
      downtimeDays: Math.min(60, v.baseDowntime*Math.pow(row.cumMiles/v.downtimeThreshold, v.downtimeExponent)),
      lostRevenue: row.cumLost - prev.cumLost,
      cumMaint: row.cumMaint, cumLost: row.cumLost,
    });
  }

  return { months, opt, crossover, scenarios, winnerYearly, yearRows, v };
}

// ── Validation (verbatim) ─────────────────────────────────────────────────────
function validate(root) {
  const q = (id) => root.querySelector('#fsm-'+id);
  const v = {};
  for (const f of FIELDS) v[f] = parseN(q(f).value);
  const w = [], bad = new Set();

  if (v.purchasePrice   <= 0) { w.push('Purchase Price must be greater than zero.');                                   bad.add('purchasePrice'); }
  if (v.annualMiles     <= 0) { w.push('Annual Miles must be greater than zero.');                                     bad.add('annualMiles'); }
  if (v.revenuePerDay   <= 0) { w.push('Revenue per Operating Day must be greater than zero.');                        bad.add('revenuePerDay'); }
  if (v.baseMaintenance <  0) {                                                                                         bad.add('baseMaintenance'); }
  if (v.maintEscalation <  0) { w.push('Maintenance escalation is negative — maintenance is shrinking, which is unusual.'); bad.add('maintEscalation'); }
  if (v.maintEscalation >100) { w.push('Maintenance escalation above 100%/yr is extreme — double-check this value.');  bad.add('maintEscalation'); }

  const resales = [100, v.resaleY2, v.resaleY3, v.resaleY4, v.resaleY5, v.resaleY6, v.resaleY7, v.resaleY8];
  for (let i = 1; i < resales.length; i++) {
    if (resales[i] > 100 || resales[i] < 0) {
      w.push(`Resale % Year ${i+1} must be between 0 and 100.`); bad.add('resaleY'+(i+1));
    }
    if (resales[i] > resales[i-1]) {
      w.push(`Resale % Year ${i+1} (${resales[i]}%) is higher than Year ${i} (${resales[i-1]}%). Trucks don't appreciate.`);
      bad.add('resaleY'+(i+1));
    }
  }
  if (v.baseMaintenance > v.purchasePrice * 0.5) {
    w.push('Year 1 base maintenance is more than half the purchase price — likely a typo.'); bad.add('baseMaintenance');
  }
  return { warnings: w, invalidFields: bad };
}

// ── SVG helpers (verbatim) ────────────────────────────────────────────────────
function buildPath(points, xScale, yScale) {
  return points.map((p,i) => (i===0?'M':'L') + xScale(p.x).toFixed(1)+','+yScale(p.y).toFixed(1)).join(' ');
}

// CSS-variable-aware style block injected into every SVG so charts adapt to theme.
const SVG_STYLE = `<style>
  .cg   { stroke: var(--outline-variant); }
  .cl   { fill: var(--on-surface-muted); font-family: 'Inter', sans-serif; }
  .m-bg { fill: var(--primary-container); }
  .m-at { fill: var(--on-primary-container); font-family: 'Inter', sans-serif; font-size: 11px; }
  .m-mt { fill: var(--on-surface); font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; }
  .m-do { fill: var(--on-surface-muted); stroke: var(--primary); }
</style>`;

// Chart 1 — Resale value vs cumulative operating cost (crossover chart)
function renderValueChart(root, months, crossover, purchasePrice) {
  const W=760,H=300,padL=80,padR=30,padT=20,padB=42;
  const innerW=W-padL-padR, innerH=H-padT-padB;

  const valueLine = months.map(m => ({ x:m.m, y:m.resaleValue }));
  const costLine  = months.map(m => ({ x:m.m, y:m.cumOpCost  }));

  const yMax  = Math.max(purchasePrice, ...costLine.map(p=>p.y)) * 1.08;
  const xMax  = 96;
  const xScale = x => padL+(x/xMax)*innerW;
  const yScale = y => padT+innerH-(y/yMax)*innerH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${SVG_STYLE}`;

  for (let i=0; i<=4; i++) {
    const val=yMax/4*i, y=yScale(val);
    svg += `<line class="cg" x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}"/>`;
    svg += `<text class="cl" x="${padL-10}" y="${y+4}" text-anchor="end" font-size="11">${money(val)}</text>`;
  }
  for (let y=1; y<=8; y++) {
    const x=xScale(y*12);
    svg += `<line class="cg" x1="${x}" y1="${padT+innerH}" x2="${x}" y2="${padT+innerH+4}"/>`;
    svg += `<text class="cl" x="${x}" y="${padT+innerH+20}" text-anchor="middle" font-size="11">Year ${y}</text>`;
  }

  const costArea = buildPath(costLine,xScale,yScale)
    + ` L${xScale(96)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;
  svg += `<path d="${costArea}" fill="#C2410C" fill-opacity="0.08"/>`;
  svg += `<path d="${buildPath(valueLine,xScale,yScale)}" fill="none" stroke="#5B89D6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  svg += `<path d="${buildPath(costLine,xScale,yScale)}"  fill="none" stroke="#C2410C" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;

  if (crossover) {
    const cx=xScale(crossover.m), cy=yScale(crossover.resaleValue);
    svg += `<line x1="${cx}" y1="${padT}" x2="${cx}" y2="${padT+innerH}" stroke-width="1.5" stroke-dasharray="5 4" class="m-do"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="6" class="m-bg" stroke-width="2"/>`;
    const lx = cx+10 > W-padR-140 ? cx-148 : cx+10;
    svg += `<rect class="m-bg" x="${lx}" y="${padT+6}" width="140" height="38" rx="4"/>`;
    svg += `<text class="m-at" x="${lx+8}" y="${padT+22}">CROSSOVER</text>`;
    svg += `<text class="m-mt" x="${lx+8}" y="${padT+37}">${mLabel(crossover.m)}</text>`;
  }

  svg += `</svg>`;
  root.querySelector('#fsm-chart1').innerHTML = svg;
}

// Chart 2 — Cost per year U-curve with optimal swap marker
function renderCostChart(root, months, opt) {
  const W=760,H=260,padL=80,padR=30,padT=20,padB=42;
  const innerW=W-padL-padR, innerH=H-padT-padB;

  const data = months.filter(m=>m.m>=24).map(m => ({ x:m.m, y:m.costPerYear }));
  const yMin = Math.min(...data.map(d=>d.y))*0.95;
  const yMax = Math.max(...data.map(d=>d.y))*1.05;
  const xMin=24, xMax=96;
  const xScale = x => padL+((x-xMin)/(xMax-xMin))*innerW;
  const yScale = y => padT+innerH-((y-yMin)/(yMax-yMin))*innerH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${SVG_STYLE}`;

  for (let i=0; i<=4; i++) {
    const val=yMin+(yMax-yMin)/4*i, y=yScale(val);
    svg += `<line class="cg" x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}"/>`;
    svg += `<text class="cl" x="${padL-10}" y="${y+4}" text-anchor="end" font-size="11">${money(val)}</text>`;
  }
  for (let y=2; y<=8; y++) {
    const x=xScale(y*12);
    svg += `<line class="cg" x1="${x}" y1="${padT+innerH}" x2="${x}" y2="${padT+innerH+4}"/>`;
    svg += `<text class="cl" x="${x}" y="${padT+innerH+20}" text-anchor="middle" font-size="11">Year ${y}</text>`;
  }

  const area = buildPath(data,xScale,yScale)
    + ` L${xScale(data[data.length-1].x)},${padT+innerH} L${xScale(data[0].x)},${padT+innerH} Z`;
  svg += `<path d="${area}" fill="var(--primary)" fill-opacity="0.07"/>`;
  svg += `<path d="${buildPath(data,xScale,yScale)}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;

  const ox=xScale(opt.m), oy=yScale(opt.costPerYear);
  svg += `<line x1="${ox}" y1="${padT}" x2="${ox}" y2="${padT+innerH}" stroke-width="2" stroke-dasharray="5 4" class="m-do"/>`;
  svg += `<circle cx="${ox}" cy="${oy}" r="7" class="m-bg" stroke-width="2"/>`;
  const lx = ox+10 > W-padR-160 ? ox-168 : ox+10;
  svg += `<rect class="m-bg" x="${lx}" y="${oy-44}" width="160" height="40" rx="4"/>`;
  svg += `<text class="m-at" x="${lx+8}" y="${oy-28}">OPTIMAL SWAP</text>`;
  svg += `<text class="m-mt" x="${lx+8}" y="${oy-12}">${mLabel(opt.m)} · ${money(opt.costPerYear)}/yr</text>`;

  svg += `</svg>`;
  root.querySelector('#fsm-chart2').innerHTML = svg;
}

// ── Main render ───────────────────────────────────────────────────────────────
function render(root) {
  const q = (id) => root.querySelector('#fsm-'+id);

  // Warnings
  const { warnings, invalidFields } = validate(root);
  FIELDS.forEach(f => q(f).classList.toggle('fsm-invalid', invalidFields.has(f)));

  if (warnings.length) {
    q('warnings').innerHTML = `
      <div class="fsm-warnings">
        <strong style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em">
          Check these assumptions
        </strong>
        <ul style="margin:0.5rem 0 0;padding-left:1.25rem">
          ${warnings.map(w=>`<li>${w}</li>`).join('')}
        </ul>
      </div>`;
  } else {
    q('warnings').innerHTML = '';
  }

  const { months, opt, crossover, scenarios, winnerYearly, yearRows } = project(root);

  // Summary cards
  q('summaryCards').innerHTML = `
    <div class="fsm-card fsm-card-hl">
      <div class="fsm-card-label">Recommended Swap</div>
      <div class="fsm-card-value">${mLabel(opt.m)}</div>
    </div>
    <div class="fsm-card">
      <div class="fsm-card-label">Cost / Year at Optimum</div>
      <div class="fsm-card-value">${money(opt.costPerYear)}</div>
    </div>
    <div class="fsm-card">
      <div class="fsm-card-label">Miles at Swap</div>
      <div class="fsm-card-value">${num(opt.cumMiles)}</div>
    </div>
    <div class="fsm-card">
      <div class="fsm-card-label">Resale Recovered</div>
      <div class="fsm-card-value">${money(opt.resaleValue)}</div>
    </div>
  `;

  // Charts
  renderValueChart(root, months, crossover, parseN(q('purchasePrice').value));
  renderCostChart(root, months, opt);

  // Scenario table
  let html = `<table class="fsm-table"><thead><tr>
    <th>Swap After</th><th>Miles</th><th>Resale</th>
    <th>Depreciation</th><th>Maintenance</th><th>Lost Rev.</th>
    <th>Total Cost</th><th>Cost / Year</th>
  </tr></thead><tbody>`;
  for (const s of scenarios) {
    html += `<tr class="${s.year===winnerYearly.year?'fsm-winner':''}">
      <td>Year ${s.year}</td>
      <td>${num(s.cumMiles)}</td>
      <td>${money(s.resaleValue)}</td>
      <td>${money(s.depreciation)}</td>
      <td>${money(s.cumMaint)}</td>
      <td>${money(s.cumLost)}</td>
      <td>${money(s.tco)}</td>
      <td>${money(s.tcoPerYear)}</td>
    </tr>`;
  }
  html += `</tbody></table>
    <div class="fsm-recommendation">
      Lowest annual cost of ownership occurs at:
      <span class="fsm-rec-big">${mLabel(opt.m)} &mdash; ${money(opt.costPerYear)}/year</span>
      ${crossover
        ? `Your operating costs cross resale value at <strong>${mLabel(crossover.m)}</strong> — that's when you've spent as much keeping the truck as it's worth on the market.`
        : `Operating costs never exceed resale value in the 8-year window — extend the analysis or tighten your maintenance assumptions.`}
    </div>`;
  q('results').innerHTML = html;

  // Year-by-year schedule
  let sched = `<table class="fsm-table"><thead><tr>
    <th>Year</th><th>Cum. Miles</th><th>Maintenance</th>
    <th>Downtime Days</th><th>Lost Revenue</th>
    <th>Cum. Maint.</th><th>Cum. Lost Rev.</th>
  </tr></thead><tbody>`;
  for (const y of yearRows) {
    sched += `<tr>
      <td>Year ${y.year}</td>
      <td>${num(y.cumMiles)}</td>
      <td>${money(y.maintenance)}</td>
      <td>${y.downtimeDays.toFixed(1)}</td>
      <td>${money(y.lostRevenue)}</td>
      <td>${money(y.cumMaint)}</td>
      <td>${money(y.cumLost)}</td>
    </tr>`;
  }
  sched += `</tbody></table>`;
  q('schedule').innerHTML = sched;
}

// ── Export CSV (verbatim logic) ───────────────────────────────────────────────
function exportCSV(root) {
  const { scenarios, opt } = project(root);
  const rows = [
    ['Swap After','Cum Miles','Resale','Depreciation','Cum Maintenance','Cum Lost Revenue','Total Cost','Cost Per Year'],
    ...scenarios.map(s => [`Year ${s.year}`,Math.round(s.cumMiles),Math.round(s.resaleValue),
      Math.round(s.depreciation),Math.round(s.cumMaint),Math.round(s.cumLost),
      Math.round(s.tco),Math.round(s.tcoPerYear)]),
    [],
    ['Optimal Month',opt.m,'Cost/Year',Math.round(opt.costPerYear),'Miles',Math.round(opt.cumMiles)],
  ];
  const csv  = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const a    = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `fleet-swap-${new Date().toISOString().slice(0,10)}.csv`,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Tool entry point ──────────────────────────────────────────────────────────
export function Tool() {
  const el = document.createElement('div');

  // Scoped styles — all selectors prefixed with .fsm- to avoid leaking
  const style = document.createElement('style');
  style.textContent = `
    .fsm-grid  { display:grid; grid-template-columns:300px minmax(0, 1fr); gap:1.5rem; }
    .fsm-grid > * { min-width: 0; } /* prevent SVG intrinsic width from blowing out the 1fr column */
    @media(max-width:780px){ .fsm-grid { grid-template-columns:1fr; } }

    .fsm-panel { background:var(--surface-container); border:1px solid var(--outline-variant);
                 border-radius:0.625rem; padding:1.25rem; }
    .fsm-panel + .fsm-panel { margin-top:1.25rem; }

    .fsm-panel-title { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em;
                       color:var(--on-surface-muted); margin:0 0 1rem; font-weight:700; }

    .fsm-label { display:block; font-size:0.78rem; color:var(--on-surface); margin-top:0.875rem; position:relative; }
    .fsm-label:first-child { margin-top:0; }

    .fsm-help {
      display:inline-flex; align-items:center; justify-content:center;
      width:14px; height:14px; border-radius:50%;
      background:var(--outline); color:var(--on-surface-muted);
      font-size:9px; font-family:sans-serif; cursor:help; margin-left:4px;
      vertical-align:middle; position:relative;
    }
    .fsm-help:hover::after {
      content: attr(data-tip);
      position:absolute; left:0; top:100%; margin-top:6px;
      background:var(--surface-high); color:var(--on-surface);
      border:1px solid var(--outline); padding:8px 10px; border-radius:6px;
      font-size:0.7rem; font-family:sans-serif; width:220px; z-index:20;
      line-height:1.45; box-shadow:0 6px 20px rgba(0,0,0,0.25);
    }

    .fsm-field {
      width:100%; padding:0.45rem 0.625rem; margin-top:0.25rem;
      background:var(--surface-high); border:1px solid var(--outline);
      border-radius:0.375rem; color:var(--on-surface); font-size:0.8125rem;
      font-family:inherit; transition:border-color 0.15s;
    }
    .fsm-field:focus { outline:none; border-color:var(--primary);
      box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 15%,transparent); }
    .fsm-field.fsm-invalid { border-color:#F59E0B;
      background:color-mix(in srgb,#F59E0B 8%,var(--surface-high)); }

    .fsm-warnings {
      background:color-mix(in srgb,#F59E0B 12%,var(--surface));
      border:1px solid #F59E0B; border-left:4px solid #F59E0B;
      border-radius:6px; padding:0.75rem 1rem; margin-bottom:1.25rem;
      font-size:0.8125rem; color:var(--on-surface); line-height:1.5;
    }

    .fsm-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:0.875rem; margin-bottom:1.25rem; }
    @media(max-width:640px){ .fsm-cards { grid-template-columns:repeat(2,1fr); } }

    .fsm-card {
      background:var(--surface-container); border:1px solid var(--outline-variant);
      border-radius:0.625rem; padding:1rem;
    }
    .fsm-card-hl {
      background:var(--primary-container); border-color:var(--primary-container);
    }
    .fsm-card-label { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.08em;
                      color:var(--on-surface-muted); }
    .fsm-card-hl .fsm-card-label { color:var(--on-primary-container); opacity:0.75; }
    .fsm-card-value { font-size:1.375rem; font-weight:800; color:var(--on-surface);
                      margin-top:0.25rem; font-family:'Inter',sans-serif; }
    .fsm-card-hl .fsm-card-value { color:var(--on-primary-container); }

    .fsm-chart-title { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em;
                       color:var(--on-surface-muted); margin-bottom:0.25rem; }
    .fsm-chart-wrap { width:100%; overflow:hidden; } /* contain SVG annotations */
    .fsm-chart-wrap svg { width:100%; max-width:100%; height:auto; display:block; }

    .fsm-legend { display:flex; gap:1rem; flex-wrap:wrap; font-size:0.75rem;
                  color:var(--on-surface-muted); margin-top:0.75rem; }
    .fsm-legend span { display:inline-flex; align-items:center; gap:5px; }
    .fsm-swatch { display:inline-block; width:22px; height:3px; border-radius:2px; }

    .fsm-table { width:100%; border-collapse:collapse; font-size:0.78rem; }
    .fsm-table th, .fsm-table td { text-align:right; padding:0.5rem 0.75rem;
      border-bottom:1px solid var(--outline-variant); }
    .fsm-table th:first-child, .fsm-table td:first-child { text-align:left; }
    .fsm-table thead th { background:var(--surface-high); color:var(--on-surface-muted);
      font-weight:700; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.05em; }
    .fsm-table tbody tr:hover { background:var(--surface-high); }
    .fsm-winner { background:color-mix(in srgb,var(--primary-container) 45%,transparent) !important;
                  font-weight:700; }

    .fsm-recommendation {
      margin-top:1.25rem; padding:1.125rem 1.375rem;
      background:var(--primary-container); color:var(--on-primary-container);
      border-radius:0.625rem; border-left:4px solid var(--primary);
      font-size:0.9rem; line-height:1.55;
    }
    .fsm-rec-big { font-size:1.2rem; font-weight:800; color:var(--primary);
                   display:block; margin:0.3rem 0 0.5rem; }

    details.fsm-details { margin-top:1.25rem; border:1px solid var(--outline-variant);
      border-radius:0.625rem; background:var(--surface-container); overflow:hidden; }
    details.fsm-details summary { padding:0.875rem 1.125rem; cursor:pointer;
      font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em;
      color:var(--on-surface-muted); user-select:none; }
    details.fsm-details summary:hover { color:var(--on-surface); }
    details.fsm-details[open] summary { border-bottom:1px solid var(--outline-variant); }
    details.fsm-details .fsm-sched-content { padding:0.5rem 1rem 1rem; overflow-x:auto; }

    .fsm-actions { display:flex; gap:0.5rem; margin-top:1rem; flex-wrap:wrap; }
  `;
  el.appendChild(style);

  el.innerHTML += `
    <div id="fsm-warnings"></div>
    <div class="fsm-cards" id="fsm-summaryCards"></div>

    <div class="fsm-grid">

      <!-- ── Left: Assumptions panel ─────────────────── -->
      <div class="fsm-panel">
        <p class="fsm-panel-title">Assumptions</p>

        <label class="fsm-label">Purchase Price ($)
          <span class="fsm-help" data-tip="Total out-the-door cost of the truck including tax and upfit.">?</span>
          <input type="text" inputmode="decimal" class="fsm-field" id="fsm-purchasePrice" value="185,000">
        </label>

        <label class="fsm-label">Annual Miles
          <span class="fsm-help" data-tip="Expected miles driven per year. Drives downtime growth.">?</span>
          <input type="text" inputmode="decimal" class="fsm-field" id="fsm-annualMiles" value="45,000">
        </label>

        <label class="fsm-label">Base Maintenance Year 1 ($)
          <span class="fsm-help" data-tip="Maintenance spend in the first year of service.">?</span>
          <input type="text" inputmode="decimal" class="fsm-field" id="fsm-baseMaintenance" value="6,000">
        </label>

        <label class="fsm-label">Maintenance Escalation (%/yr)
          <span class="fsm-help" data-tip="How much yearly maintenance grows each year.">?</span>
          <input type="text" inputmode="decimal" class="fsm-field" id="fsm-maintEscalation" value="25">
        </label>

        <label class="fsm-label">Revenue per Operating Day ($)
          <span class="fsm-help" data-tip="Revenue the truck generates on a normal working day. Used to value downtime.">?</span>
          <input type="text" inputmode="decimal" class="fsm-field" id="fsm-revenuePerDay" value="1,800">
        </label>

        <label class="fsm-label">Operating Conditions
          <span class="fsm-help" data-tip="How hard the truck gets worked. Drives how quickly downtime grows with miles.">?</span>
          <select id="fsm-operatingConditions" class="fsm-field">
            <option value="easy">Easy — highway miles, light loads</option>
            <option value="typical" selected>Typical — mixed duty</option>
            <option value="punishing">Punishing — heavy loads, rough terrain</option>
          </select>
        </label>

        <p class="fsm-panel-title" style="margin-top:1.25rem">Resale Value by Year</p>

        ${[2,3,4,5,6,7,8].map(y => `
          <label class="fsm-label">Year ${y} (%)
            <input type="text" inputmode="decimal" class="fsm-field" id="fsm-resaleY${y}"
              value="${DEFAULTS['resaleY'+y]}">
          </label>`).join('')}

        <div class="fsm-actions">
          <button class="btn-secondary" id="fsm-resetBtn" style="font-size:0.8rem">Reset Defaults</button>
        </div>
      </div>

      <!-- ── Right: Charts + results ─────────────────── -->
      <div>
        <div class="fsm-panel">
          <p class="fsm-chart-title">Truck Value vs. Money Spent Keeping It</p>
          <div class="fsm-chart-wrap" id="fsm-chart1"></div>
          <div class="fsm-legend">
            <span><span class="fsm-swatch" style="background:#5B89D6"></span>Resale Value (declining)</span>
            <span><span class="fsm-swatch" style="background:#C2410C"></span>Cumulative Cost to Operate</span>
            <span><span class="fsm-swatch" style="background:var(--primary)"></span>Crossover Point</span>
          </div>
        </div>

        <div class="fsm-panel">
          <p class="fsm-chart-title">Annual Cost of Ownership</p>
          <div class="fsm-chart-wrap" id="fsm-chart2"></div>
          <div class="fsm-legend">
            <span><span class="fsm-swatch" style="background:var(--primary)"></span>Cost Per Year of Ownership</span>
            <span><span class="fsm-swatch" style="background:var(--primary-container)"></span>Optimal Replacement Month</span>
          </div>
        </div>

        <div class="fsm-panel">
          <p class="fsm-panel-title">Swap Scenario Comparison</p>
          <div style="overflow-x:auto" id="fsm-results"></div>
          <div class="fsm-actions">
            <button class="btn-secondary" id="fsm-exportBtn" style="font-size:0.8rem">Export CSV</button>
            <button class="btn-secondary" id="fsm-printBtn"  style="font-size:0.8rem">Print / PDF</button>
          </div>
        </div>

        <details class="fsm-details">
          <summary>Year-by-Year Schedule</summary>
          <div class="fsm-sched-content" id="fsm-schedule"></div>
        </details>
      </div>

    </div>
  `;

  // ── Wire up events ──────────────────────────────────────────────────────────
  const q = (id) => el.querySelector('#fsm-'+id);

  function reformatField(f) {
    const n = parseN(q(f).value);
    q(f).value = fmtIn(n, f);
  }

  FIELDS.forEach(f => {
    q(f).addEventListener('input',  () => render(el));
    q(f).addEventListener('blur',   () => { reformatField(f); render(el); });
  });
  q('operatingConditions').addEventListener('change', () => render(el));

  q('resetBtn').addEventListener('click', () => {
    FIELDS.forEach(f => { q(f).value = fmtIn(DEFAULTS[f], f); });
    q('operatingConditions').value = 'typical';
    render(el);
  });

  q('exportBtn').addEventListener('click', () => exportCSV(el));
  q('printBtn').addEventListener('click',  () => window.print());

  // Initial render
  render(el);

  return el;
}
