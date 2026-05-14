// src/tools/statement-reconciler/Tool.js
// Mock preview of the Statement Reconciler — all vendor names, amounts, and line items are fictional.

const VENDORS = [
  'Advantage Parts', 'ArcSource Supplies', 'Brookline Diesel', 'Castle Auto Glass',
  'CDK Global', 'Fleet Pride', 'Napa Auto Parts', 'O\'Reilly Auto', 'Speedco',
  'Transport Pro Supplies', 'Western Truck Parts',
];

const MOCK_RESULTS = {
  'Advantage Parts': {
    matched: [
      { date: '2026-04-02', desc: 'Oil Filter — 5pk',          stmt: 84.50,  qb: 84.50,  delta: 0       },
      { date: '2026-04-05', desc: 'Serpentine Belt Set',        stmt: 142.00, qb: 142.00, delta: 0       },
      { date: '2026-04-09', desc: 'Brake Pad Kit',              stmt: 218.75, qb: 218.75, delta: 0       },
      { date: '2026-04-11', desc: 'Air Filter — Heavy Duty',    stmt: 67.20,  qb: 67.20,  delta: 0       },
      { date: '2026-04-14', desc: 'Coolant — 5 Gallon',         stmt: 95.00,  qb: 95.00,  delta: 0       },
      { date: '2026-04-18', desc: 'Hydraulic Fluid',            stmt: 131.40, qb: 131.40, delta: 0       },
      { date: '2026-04-21', desc: 'Wiper Blade Set',            stmt: 42.80,  qb: 42.80,  delta: 0       },
    ],
    variances: [
      { date: '2026-04-07', desc: 'Transmission Filter',        stmt: 189.00, qb: 175.00, delta: -14.00  },
      { date: '2026-04-16', desc: 'Fuel Injector Cleaner',      stmt: 58.95,  qb: 45.00,  delta: -13.95  },
      { date: '2026-04-23', desc: 'Wheel Stud Kit',             stmt: 33.60,  qb: 0,      delta: -33.60  },
    ],
  },
};

function buildMockResultsFor(vendor) {
  if (MOCK_RESULTS[vendor]) return MOCK_RESULTS[vendor];
  const seed = vendor.length;
  const matched = Array.from({length: 5 + (seed % 4)}, (_, i) => ({
    date: `2026-04-${String(i * 3 + 1).padStart(2,'0')}`,
    desc: ['Brake Fluid','Oil Filter','Coolant Hose','Air Filter','Fuel Line','Gasket Set','Wheel Bearing'][i % 7],
    stmt: Math.round((80 + (seed + i) * 17.3) * 100) / 100,
    qb:   Math.round((80 + (seed + i) * 17.3) * 100) / 100,
    delta: 0,
  }));
  const variances = Array.from({length: 1 + (seed % 3)}, (_, i) => {
    const stmt = Math.round((120 + seed * 5.1 + i * 22) * 100) / 100;
    const qb   = Math.round(stmt * 0.88 * 100) / 100;
    return { date: `2026-04-${String(i * 7 + 8).padStart(2,'0')}`, desc: ['Drive Belt','Strut Mount','Control Arm'][i % 3], stmt, qb, delta: Math.round((qb - stmt) * 100) / 100 };
  });
  return { matched, variances };
}

function fmt(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);
}

export function Tool() {
  const el = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    .rec-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
    .rec-table th {
      text-align:left; font-size:0.68rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.07em; color:var(--on-surface-muted); padding:0.5rem 0.75rem;
      border-bottom:1px solid var(--outline-variant); background:var(--surface-high);
    }
    .rec-table td { padding:0.5rem 0.75rem; border-bottom:1px solid var(--outline-variant); color:var(--on-surface); }
    .rec-table tr:last-child td { border-bottom:none; }
    .rec-table tr:hover td { background:var(--surface-high); }
    .rec-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; margin-bottom:1.25rem; }
    .rec-metric { background:var(--surface-high); border:1px solid var(--outline-variant); border-radius:0.625rem; padding:0.75rem 1rem; }
    .rec-metric-val { font-size:1.5rem; font-weight:800; line-height:1; }
    .rec-metric-lbl { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--on-surface-muted); margin-top:0.2rem; }
    .rec-section-title { font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--on-surface-muted); margin:1.25rem 0 0.5rem; }
    .rec-status-banner {
      display:flex; align-items:center; gap:0.5rem; padding:0.625rem 1rem;
      border-radius:0.5rem; font-size:0.8rem; font-weight:600;
    }
  `;
  el.appendChild(style);

  let selectedVendor = '';
  let phase = 'select'; // select | running | results

  function renderSelect() {
    return `
      <div style="max-width:520px">
        <div style="margin-bottom:1.25rem">
          <label class="tool-label">Select Vendor</label>
          <select id="rec-vendor" class="tool-select">
            <option value="">— Choose a vendor —</option>
            ${VENDORS.map(v => `<option value="${v}"${v===selectedVendor?' selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem">
          ${['Vendor Statement (PDF)','QuickBooks Export (CSV)'].map(label => `
            <div style="border:2px dashed var(--outline);border-radius:0.625rem;padding:1.25rem;text-align:center">
              <div style="font-size:1.5rem;margin-bottom:0.5rem">📄</div>
              <div style="font-size:0.78rem;font-weight:600;color:var(--on-surface-muted)">${label}</div>
              <div style="font-size:0.7rem;color:var(--on-surface-muted);margin-top:0.25rem">Drag & drop or click to upload</div>
              <button class="btn-secondary" style="margin-top:0.75rem;font-size:0.75rem;padding:0.35rem 0.875rem">Choose File</button>
            </div>`).join('')}
        </div>
        <button id="rec-run" class="btn-primary" style="width:100%;padding:0.625rem" ${selectedVendor?'':'disabled'}>
          Run Reconciliation
        </button>
        ${!selectedVendor ? '<p style="font-size:0.75rem;color:var(--on-surface-muted);margin-top:0.5rem;text-align:center">Select a vendor to enable</p>' : ''}
      </div>`;
  }

  function renderRunning() {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;gap:1rem">
        <svg class="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <div style="font-size:0.95rem;font-weight:600;color:var(--on-surface)">Reconciling ${selectedVendor}…</div>
        <div style="font-size:0.8rem;color:var(--on-surface-muted)">Matching line items against QuickBooks export</div>
      </div>`;
  }

  function renderResults() {
    const data = buildMockResultsFor(selectedVendor);
    const matchedTotal   = data.matched.reduce((s, r) => s + r.stmt, 0);
    const varianceTotal  = data.variances.reduce((s, r) => s + Math.abs(r.delta), 0);
    const allRows        = [...data.matched, ...data.variances];
    const grandStmt      = allRows.reduce((s, r) => s + r.stmt, 0);
    const grandQb        = allRows.reduce((s, r) => s + r.qb, 0);

    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">
          <div>
            <div style="font-size:1rem;font-weight:700;color:var(--on-surface)">${selectedVendor}</div>
            <div style="font-size:0.78rem;color:var(--on-surface-muted)">April 2026 statement</div>
          </div>
          <div style="display:flex;gap:0.5rem">
            <button id="rec-back" class="btn-secondary" style="font-size:0.78rem;padding:0.4rem 0.875rem">← Back</button>
            <button class="btn-primary" style="font-size:0.78rem;padding:0.4rem 0.875rem">↓ Export PDF</button>
          </div>
        </div>

        <div class="rec-summary">
          <div class="rec-metric">
            <div class="rec-metric-val" style="color:#22c55e">${data.matched.length}</div>
            <div class="rec-metric-lbl">Matched</div>
          </div>
          <div class="rec-metric">
            <div class="rec-metric-val" style="color:#ef4444">${data.variances.length}</div>
            <div class="rec-metric-lbl">Variances</div>
          </div>
          <div class="rec-metric">
            <div class="rec-metric-val" style="color:var(--primary)">${fmt(varianceTotal)}</div>
            <div class="rec-metric-lbl">Total Delta</div>
          </div>
          <div class="rec-metric">
            <div class="rec-metric-val">${fmt(grandStmt)}</div>
            <div class="rec-metric-lbl">Stmt Total</div>
          </div>
        </div>

        ${data.variances.length > 0 ? `
          <div class="rec-status-banner" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);margin-bottom:1rem">
            <span style="font-size:1rem">⚠</span>
            <span style="color:#ef4444">${data.variances.length} variance${data.variances.length>1?'s':''} found — ${fmt(varianceTotal)} total discrepancy</span>
          </div>` : `
          <div class="rec-status-banner" style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);margin-bottom:1rem">
            <span style="font-size:1rem">✓</span>
            <span style="color:#22c55e">All items match — no discrepancies found</span>
          </div>`}

        ${data.variances.length > 0 ? `
          <div class="rec-section-title">⚠ Variances</div>
          <div style="border:1px solid var(--outline-variant);border-radius:0.625rem;overflow:hidden;margin-bottom:1rem">
            <table class="rec-table">
              <thead><tr>
                <th>Date</th><th>Description</th><th style="text-align:right">Statement</th>
                <th style="text-align:right">QuickBooks</th><th style="text-align:right">Delta</th>
              </tr></thead>
              <tbody>
                ${data.variances.map(r => `
                  <tr>
                    <td style="color:var(--on-surface-muted)">${r.date}</td>
                    <td>${r.desc}</td>
                    <td style="text-align:right">${fmt(r.stmt)}</td>
                    <td style="text-align:right">${r.qb === 0 ? '<span style="color:var(--on-surface-muted)">—</span>' : fmt(r.qb)}</td>
                    <td style="text-align:right;color:#ef4444;font-weight:700">${fmt(r.delta)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}

        <div class="rec-section-title">✓ Matched Items (${data.matched.length})</div>
        <div style="border:1px solid var(--outline-variant);border-radius:0.625rem;overflow:hidden">
          <table class="rec-table">
            <thead><tr>
              <th>Date</th><th>Description</th><th style="text-align:right">Amount</th>
            </tr></thead>
            <tbody>
              ${data.matched.map(r => `
                <tr>
                  <td style="color:var(--on-surface-muted)">${r.date}</td>
                  <td>${r.desc}</td>
                  <td style="text-align:right;color:#22c55e;font-weight:600">${fmt(r.stmt)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function render() {
    el.innerHTML = '';
    el.appendChild(style);
    el.innerHTML += `
      <div style="display:flex;flex-direction:column;gap:0">
        <div style="margin-bottom:1.25rem">
          <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Statement Reconciler</h2>
          <p class="text-on-surface-muted" style="font-size:0.875rem">Mock preview — all vendors, amounts, and line items are fictional.</p>
        </div>
        <div id="rec-content">
          ${phase === 'select'  ? renderSelect()  :
            phase === 'running' ? renderRunning() :
                                  renderResults()}
        </div>
      </div>`;

    const vendorSel = el.querySelector('#rec-vendor');
    if (vendorSel) vendorSel.addEventListener('change', () => { selectedVendor = vendorSel.value; render(); });

    const runBtn = el.querySelector('#rec-run');
    if (runBtn) runBtn.addEventListener('click', () => {
      if (!selectedVendor) return;
      phase = 'running';
      render();
      setTimeout(() => { phase = 'results'; render(); }, 1400);
    });

    const backBtn = el.querySelector('#rec-back');
    if (backBtn) backBtn.addEventListener('click', () => { phase = 'select'; render(); });
  }

  render();
  return el;
}
