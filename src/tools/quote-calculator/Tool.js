// src/tools/quote-calculator/Tool.js
// Functional quote calculator preview — all pricing rates are illustrative examples only.
// Uses user-entered mileage, not real routing. No real addresses, rates, or customer data.

const SERVICE_TYPES = [
  {
    id: 'light',
    label: 'Light Duty',
    desc: 'Passenger cars, light trucks, SUVs',
    hookRate: 95,
    mileRate: 4.50,
    fuelSurcharge: 0.15,
  },
  {
    id: 'heavy',
    label: 'Heavy Duty',
    desc: 'Commercial trucks, semis, RVs',
    hookRate: 195,
    mileRate: 8.75,
    fuelSurcharge: 0.20,
  },
  {
    id: 'transport',
    label: 'Transport',
    desc: 'Flatbed equipment & vehicle transport',
    hookRate: 250,
    mileRate: 11.00,
    fuelSurcharge: 0.22,
  },
  {
    id: 'road',
    label: 'Road Service',
    desc: 'Jump starts, lockouts, tire changes',
    hookRate: 75,
    mileRate: 3.25,
    fuelSurcharge: 0.12,
  },
];

const MOCK_QUOTES = [
  { id: 'Q-4481', type: 'Light Duty',  pickup: 'Plano, TX',      dropoff: 'Irving, TX',       miles: 31, total: 261.00, date: '2026-04-22' },
  { id: 'Q-4480', type: 'Heavy Duty',  pickup: 'Garland, TX',    dropoff: 'Fort Worth, TX',   miles: 38, total: 703.75, date: '2026-04-21' },
  { id: 'Q-4479', type: 'Transport',   pickup: 'Mesquite, TX',   dropoff: 'Waco, TX',         miles: 97, total: 1400.50,date: '2026-04-20' },
  { id: 'Q-4478', type: 'Road Service',pickup: 'Richardson, TX', dropoff: 'On-site',          miles: 9,  total: 122.25, date: '2026-04-19' },
  { id: 'Q-4477', type: 'Light Duty',  pickup: 'Carrollton, TX', dropoff: 'Duncanville, TX',  miles: 24, total: 220.00, date: '2026-04-18' },
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
  `;
  el.appendChild(style);

  let activeService = 'light';
  let miles = '';
  let pickup = '';
  let dropoff = '';
  let surchargeOverride = null;
  let activeTab = 'calculator';

  function calc(svc, mi, override) {
    if (!mi || isNaN(mi) || mi <= 0) return null;
    const hook = svc.hookRate;
    const tow  = mi * svc.mileRate;
    const fuelRate = override !== null ? override / 100 : svc.fuelSurcharge;
    const fuel = (hook + tow) * fuelRate;
    const subtotal = hook + tow + fuel;
    const tax  = subtotal * 0.0825;
    const total = subtotal + tax;
    return { hook, tow, fuel, fuelPct: fuelRate * 100, tax, total, subtotal };
  }

  function render() {
    const svc = SERVICE_TYPES.find(s => s.id === activeService);
    const result = calc(svc, parseFloat(miles), surchargeOverride);

    el.innerHTML = '';
    el.appendChild(style);
    el.innerHTML += `
      <div>
        <div style="margin-bottom:1.25rem">
          <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Quote Calculator</h2>
          <p class="text-on-surface-muted" style="font-size:0.875rem">Mock preview — rates shown are illustrative examples only.</p>
        </div>

        <div class="qc-tabs">
          ${[['calculator','Calculator'],['history','Quote History']].map(([id,lbl])=>`
            <button class="qc-tab${activeTab===id?' active':''}" data-tab="${id}">${lbl}</button>`).join('')}
        </div>

        <div ${activeTab!=='calculator'?'style="display:none"':''}>
          <!-- service type -->
          <div style="margin-bottom:1rem">
            <label class="tool-label">Service Type</label>
            <div class="qc-type-grid">
              ${SERVICE_TYPES.map(s => `
                <button class="qc-type-btn${activeService===s.id?' active':''}" data-svc="${s.id}">
                  <span class="qc-type-label">${s.label}</span>
                  <span class="qc-type-desc">${s.desc}</span>
                </button>`).join('')}
            </div>
          </div>

          <!-- addresses -->
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

          <!-- mileage + surcharge -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem">
            <div>
              <label class="tool-label">Distance (miles)</label>
              <input id="qc-miles" class="tool-input" type="number" min="1" placeholder="0" value="${miles}" />
            </div>
            <div>
              <label class="tool-label">Fuel Surcharge % <span style="font-weight:400;text-transform:none;letter-spacing:0">(default ${(svc.fuelSurcharge*100).toFixed(0)}%)</span></label>
              <input id="qc-fuel" class="tool-input" type="number" min="0" max="50" step="1"
                placeholder="${(svc.fuelSurcharge*100).toFixed(0)}"
                value="${surchargeOverride !== null ? surchargeOverride : ''}" />
            </div>
          </div>

          ${result ? `
            <div class="qc-breakdown">
              <div class="qc-row"><span class="qc-lbl">Hook / Base Rate</span><span class="qc-val">$${result.hook.toFixed(2)}</span></div>
              <div class="qc-row"><span class="qc-lbl">Tow Rate (${parseFloat(miles).toFixed(1)} mi × $${svc.mileRate.toFixed(2)})</span><span class="qc-val">$${result.tow.toFixed(2)}</span></div>
              <div class="qc-row"><span class="qc-lbl">Fuel Surcharge (${result.fuelPct.toFixed(0)}%)</span><span class="qc-val">$${result.fuel.toFixed(2)}</span></div>
              <div class="qc-row"><span class="qc-lbl">Subtotal</span><span class="qc-val">$${result.subtotal.toFixed(2)}</span></div>
              <div class="qc-row"><span class="qc-lbl">Tax (8.25%)</span><span class="qc-val">$${result.tax.toFixed(2)}</span></div>
              <div class="qc-row qc-total-row"><span class="qc-lbl">Total</span><span class="qc-val">$${result.total.toFixed(2)}</span></div>
            </div>
            <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
              <button class="btn-secondary" style="flex:1;font-size:0.82rem">Save Quote</button>
              <button class="btn-primary" style="flex:1;font-size:0.82rem">↓ Export PDF</button>
            </div>` : `
            <div style="background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:0.625rem;padding:1.5rem;text-align:center;color:var(--on-surface-muted);font-size:0.85rem">
              Enter a distance to calculate a quote
            </div>`}
        </div>

        <div ${activeTab!=='history'?'style="display:none"':''}>
          <div style="border:1px solid var(--outline-variant);border-radius:0.625rem;overflow:hidden">
            <table class="qc-hist-table">
              <thead><tr><th>Quote #</th><th>Type</th><th>Route</th><th style="text-align:right">Miles</th><th style="text-align:right">Total</th><th>Date</th></tr></thead>
              <tbody>
                ${MOCK_QUOTES.map(q=>`
                  <tr>
                    <td style="font-family:'Courier New',monospace;font-size:0.75rem;color:var(--on-surface-muted)">${q.id}</td>
                    <td>${q.type}</td>
                    <td style="font-size:0.75rem;color:var(--on-surface-muted)">${q.pickup} → ${q.dropoff}</td>
                    <td style="text-align:right">${q.miles}</td>
                    <td style="text-align:right;font-weight:700;color:var(--primary)">$${q.total.toFixed(2)}</td>
                    <td style="font-size:0.75rem;color:var(--on-surface-muted)">${q.date}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    el.querySelectorAll('.qc-tab').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.tab; render(); });
    });
    el.querySelectorAll('.qc-type-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeService = btn.dataset.svc; surchargeOverride = null; render(); });
    });
    const miInput = el.querySelector('#qc-miles');
    if (miInput) miInput.addEventListener('input', () => { miles = miInput.value; render(); });
    const puInput = el.querySelector('#qc-pickup');
    if (puInput) puInput.addEventListener('input', () => { pickup = puInput.value; });
    const doInput = el.querySelector('#qc-dropoff');
    if (doInput) doInput.addEventListener('input', () => { dropoff = doInput.value; });
    const fuelInput = el.querySelector('#qc-fuel');
    if (fuelInput) fuelInput.addEventListener('input', () => {
      const v = parseFloat(fuelInput.value);
      surchargeOverride = isNaN(v) ? null : v;
      render();
    });
  }

  render();
  return el;
}
