// src/tools/quote-calculator/Tool.js
// DEMO PREVIEW ONLY — zone-based pricing structure is entirely fictional.
// Rates, zones, and formula do NOT reflect actual NETC pricing. Do not use for real quotes.

// Zone-based flat rates: completely different structure from the real app.
// Real app uses per-mile routing via GraphHopper. This demo uses distance brackets
// so the formula cannot be reverse-engineered into actual rates.
const SERVICE_TYPES = [
  { id: 'light',     label: 'Light Duty',   desc: 'Passenger cars, light trucks, SUVs'      },
  { id: 'heavy',     label: 'Heavy Duty',   desc: 'Commercial trucks, semis, RVs'            },
  { id: 'transport', label: 'Transport',    desc: 'Flatbed equipment & vehicle transport'    },
  { id: 'road',      label: 'Road Service', desc: 'Jump starts, lockouts, tire changes'      },
];

// Fictional zone tiers — distance brackets with made-up flat rates per service type.
// These numbers do not reflect any real pricing and are intentionally structured
// differently from the actual calculation model.
const ZONES = [
  { label: 'Zone A',  desc: 'Local (0–10 mi)',       max: 10,  rates: { light: 120,  heavy: 280,  transport: 350,  road: 90  } },
  { label: 'Zone B',  desc: 'City (11–25 mi)',        max: 25,  rates: { light: 195,  heavy: 420,  transport: 560,  road: 130 } },
  { label: 'Zone C',  desc: 'Metro (26–50 mi)',       max: 50,  rates: { light: 310,  heavy: 640,  transport: 890,  road: 175 } },
  { label: 'Zone D',  desc: 'Regional (51–100 mi)',   max: 100, rates: { light: 510,  heavy: 980,  transport: 1350, road: 240 } },
  { label: 'Zone E',  desc: 'Long-haul (101+ mi)',    max: Infinity, rates: { light: 780, heavy: 1500, transport: 2100, road: 320 } },
];

const MOCK_QUOTES = [
  { id: 'Q-4481', type: 'Light Duty',   pickup: 'Plano, TX',      dropoff: 'Irving, TX',      zone: 'Zone C', total: 310,  date: '2026-04-22' },
  { id: 'Q-4480', type: 'Heavy Duty',   pickup: 'Garland, TX',    dropoff: 'Fort Worth, TX',  zone: 'Zone C', total: 640,  date: '2026-04-21' },
  { id: 'Q-4479', type: 'Transport',    pickup: 'Mesquite, TX',   dropoff: 'Waco, TX',        zone: 'Zone D', total: 1350, date: '2026-04-20' },
  { id: 'Q-4478', type: 'Road Service', pickup: 'Richardson, TX', dropoff: 'On-site',         zone: 'Zone A', total: 90,   date: '2026-04-19' },
  { id: 'Q-4477', type: 'Light Duty',   pickup: 'Carrollton, TX', dropoff: 'Duncanville, TX', zone: 'Zone B', total: 195,  date: '2026-04-18' },
];

export function Tool() {
  const el = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    .qc-type-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.5rem; margin-bottom:1.25rem; }
    @media(min-width:640px) { .qc-type-grid { grid-template-columns:repeat(4,1fr); } }
    .qc-type-btn {
      padding:0.625rem 0.5rem; border-radius:0.625rem; border:2px solid var(--outline-variant);
      background:var(--surface-high); cursor:pointer; font-family:inherit; text-align:left;
      transition:border-color 0.15s, background 0.15s; outline:none;
    }
    .qc-type-btn.active { border-color:var(--primary); background:var(--primary-container); }
    .qc-type-btn:hover:not(.active) { border-color:var(--outline); }
    .qc-type-label { font-size:0.82rem; font-weight:700; color:var(--on-surface); display:block; }
    .qc-type-btn.active .qc-type-label { color:var(--on-primary-container); }
    .qc-type-desc { font-size:0.68rem; color:var(--on-surface-muted); margin-top:1px; display:block; }
    .qc-type-btn.active .qc-type-desc { color:var(--on-primary-container); opacity:0.8; }
    .qc-zone-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:0.4rem; margin-bottom:1.25rem; }
    .qc-zone-btn {
      padding:0.5rem 0.25rem; border-radius:0.5rem; border:2px solid var(--outline-variant);
      background:var(--surface-high); cursor:pointer; font-family:inherit; text-align:center;
      transition:border-color 0.15s, background 0.15s; outline:none;
    }
    .qc-zone-btn.active { border-color:var(--primary); background:var(--primary-container); }
    .qc-zone-btn:hover:not(.active) { border-color:var(--outline); }
    .qc-zone-label { font-size:0.78rem; font-weight:700; color:var(--on-surface); display:block; }
    .qc-zone-btn.active .qc-zone-label { color:var(--on-primary-container); }
    .qc-zone-desc { font-size:0.6rem; color:var(--on-surface-muted); margin-top:1px; display:block; line-height:1.3; }
    .qc-zone-btn.active .qc-zone-desc { color:var(--on-primary-container); opacity:0.8; }
    .qc-breakdown { border:1px solid var(--outline-variant); border-radius:0.625rem; overflow:hidden; }
    .qc-row { display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; border-bottom:1px solid var(--outline-variant); font-size:0.85rem; }
    .qc-row:last-child { border-bottom:none; }
    .qc-total-row { background:var(--primary-container); }
    .qc-total-row .qc-lbl { color:var(--on-primary-container); font-weight:700; }
    .qc-total-row .qc-val { color:var(--on-primary-container); font-size:1.2rem; font-weight:800; }
    .qc-lbl { color:var(--on-surface-muted); }
    .qc-val { font-weight:600; color:var(--on-surface); }
    .qc-tabs { display:flex; gap:2px; border-bottom:1px solid var(--outline-variant); margin-bottom:1rem; }
    .qc-tab {
      padding:0.45rem 1rem; font-size:0.8rem; font-weight:600; cursor:pointer;
      border:none; background:transparent; color:var(--on-surface-muted);
      border-bottom:2px solid transparent; margin-bottom:-1px; font-family:inherit;
      transition:color 0.15s, border-color 0.15s;
    }
    .qc-tab.active { color:var(--primary); border-bottom-color:var(--primary); }
    .qc-hist-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
    .qc-hist-table th { text-align:left; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--on-surface-muted); padding:0.5rem 0.75rem; border-bottom:1px solid var(--outline-variant); }
    .qc-hist-table td { padding:0.5rem 0.75rem; border-bottom:1px solid var(--outline-variant); color:var(--on-surface); }
    .qc-hist-table tr:last-child td { border-bottom:none; }
    .qc-hist-table tr:hover td { background:var(--surface-high); }
    .qc-disclaimer {
      display:flex; align-items:flex-start; gap:0.5rem;
      background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.35);
      border-radius:0.5rem; padding:0.625rem 0.875rem;
      font-size:0.75rem; color:var(--on-surface-muted); line-height:1.5;
      margin-bottom:1.25rem;
    }
    .qc-disclaimer strong { color:var(--on-surface); }
  `;
  el.appendChild(style);

  let activeService = 'light';
  let activeZone = ZONES[1];
  let pickup = '';
  let dropoff = '';
  let activeTab = 'calculator';

  function render() {
    const svc   = SERVICE_TYPES.find(s => s.id === activeService);
    const rate  = activeZone.rates[activeService];

    el.innerHTML = '';
    el.appendChild(style);
    el.innerHTML += `
      <div>
        <div style="margin-bottom:1rem">
          <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Quote Calculator</h2>
          <p class="text-on-surface-muted" style="font-size:0.875rem">Demo preview of the quoting tool.</p>
        </div>

        <div class="qc-disclaimer">
          <span style="font-size:1rem;flex-shrink:0">⚠</span>
          <span><strong>Demo only — fictional rates.</strong> Pricing zones and amounts shown here are made up and do not reflect actual NETC rates or pricing structure. Do not use these figures for real quotes.</span>
        </div>

        <div class="qc-tabs">
          ${[['calculator','Calculator'],['history','Quote History']].map(([id,lbl])=>`
            <button class="qc-tab${activeTab===id?' active':''}" data-tab="${id}">${lbl}</button>`).join('')}
        </div>

        <div ${activeTab !== 'calculator' ? 'style="display:none"' : ''}>

          <div style="margin-bottom:1rem">
            <label class="tool-label">Service Type</label>
            <div class="qc-type-grid">
              ${SERVICE_TYPES.map(s => `
                <button class="qc-type-btn${activeService === s.id ? ' active' : ''}" data-svc="${s.id}">
                  <span class="qc-type-label">${s.label}</span>
                  <span class="qc-type-desc">${s.desc}</span>
                </button>`).join('')}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
            <div>
              <label class="tool-label">Pickup Location</label>
              <input id="qc-pickup" class="tool-input" placeholder="e.g. Plano, TX" value="${pickup}" />
            </div>
            <div>
              <label class="tool-label">Drop-off Location</label>
              <input id="qc-dropoff" class="tool-input" placeholder="e.g. Irving, TX" value="${dropoff}" />
            </div>
          </div>

          <div style="margin-bottom:1.25rem">
            <label class="tool-label">Distance Zone <span style="font-weight:400;text-transform:none;letter-spacing:0">(select the bracket that covers the trip distance)</span></label>
            <div class="qc-zone-grid">
              ${ZONES.map(z => `
                <button class="qc-zone-btn${activeZone.label === z.label ? ' active' : ''}" data-zone="${z.label}">
                  <span class="qc-zone-label">${z.label}</span>
                  <span class="qc-zone-desc">${z.desc}</span>
                </button>`).join('')}
            </div>
          </div>

          <div class="qc-breakdown">
            <div class="qc-row">
              <span class="qc-lbl">Service Type</span>
              <span class="qc-val">${svc.label}</span>
            </div>
            <div class="qc-row">
              <span class="qc-lbl">Distance Zone</span>
              <span class="qc-val">${activeZone.label} — ${activeZone.desc}</span>
            </div>
            <div class="qc-row">
              <span class="qc-lbl">Zone Rate <span style="font-size:0.7rem;opacity:0.6">(fictional demo rate)</span></span>
              <span class="qc-val">$${rate.toFixed(2)}</span>
            </div>
            <div class="qc-row qc-total-row">
              <span class="qc-lbl">Demo Quote Total</span>
              <span class="qc-val">$${rate.toFixed(2)}</span>
            </div>
          </div>

          <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
            <button class="btn-secondary" style="flex:1;font-size:0.82rem">Save Quote</button>
            <button class="btn-primary" style="flex:1;font-size:0.82rem">↓ Export PDF</button>
          </div>

          <p style="font-size:0.7rem;color:var(--on-surface-muted);margin-top:0.75rem;text-align:center">
            Rates shown are fictional placeholders. Actual quotes are calculated by the live app using real routing and configured pricing.
          </p>
        </div>

        <div ${activeTab !== 'history' ? 'style="display:none"' : ''}>
          <div style="border:1px solid var(--outline-variant);border-radius:0.625rem;overflow:hidden">
            <table class="qc-hist-table">
              <thead>
                <tr><th>Quote #</th><th>Type</th><th>Route</th><th>Zone</th><th style="text-align:right">Demo Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                ${MOCK_QUOTES.map(q => `
                  <tr>
                    <td style="font-family:'Courier New',monospace;font-size:0.75rem;color:var(--on-surface-muted)">${q.id}</td>
                    <td>${q.type}</td>
                    <td style="font-size:0.75rem;color:var(--on-surface-muted)">${q.pickup} → ${q.dropoff}</td>
                    <td><span style="font-size:0.72rem;font-weight:600;color:var(--on-surface-muted)">${q.zone}</span></td>
                    <td style="text-align:right;font-weight:700;color:var(--primary)">$${q.total.toFixed(2)}</td>
                    <td style="font-size:0.75rem;color:var(--on-surface-muted)">${q.date}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <p style="font-size:0.7rem;color:var(--on-surface-muted);margin-top:0.625rem;text-align:center">
            All amounts are fictional demo values — not actual quotes.
          </p>
        </div>
      </div>
    `;

    el.querySelectorAll('.qc-tab').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.tab; render(); });
    });
    el.querySelectorAll('.qc-type-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeService = btn.dataset.svc; render(); });
    });
    el.querySelectorAll('.qc-zone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeZone = ZONES.find(z => z.label === btn.dataset.zone);
        render();
      });
    });
    const puInput = el.querySelector('#qc-pickup');
    if (puInput) puInput.addEventListener('input', () => { pickup = puInput.value; });
    const doInput = el.querySelector('#qc-dropoff');
    if (doInput) doInput.addEventListener('input', () => { dropoff = doInput.value; });
  }

  render();
  return el;
}
