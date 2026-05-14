// src/tools/fullbay-wip/Tool.js
// Mock preview of the Fullbay WIP dashboard — all shops, orders, and amounts are fictional.

const MOCK_SHOPS = [
  {
    name: 'Dallas Main',
    orders: [
      { ro: 'RO-10481', unit: 'T-102', desc: 'Engine overhaul & cooling system flush',   status: 'In Progress', cost: 4820.00, tech: 'R. Garza'    },
      { ro: 'RO-10482', unit: 'T-107', desc: 'Brake system — front axle replacement',    status: 'Parts Hold',  cost: 2150.00, tech: 'M. Osei'     },
      { ro: 'RO-10483', unit: 'T-115', desc: 'PM service — oil, filters, belts',         status: 'In Progress', cost: 680.00,  tech: 'R. Garza'    },
      { ro: 'RO-10484', unit: 'T-120', desc: 'Electrical fault — alternator & wiring',   status: 'Waiting',     cost: 1340.00, tech: 'J. Herrera'  },
      { ro: 'RO-10485', unit: 'T-108', desc: 'Air compressor rebuild',                   status: 'In Progress', cost: 920.00,  tech: 'M. Osei'     },
    ],
  },
  {
    name: 'Houston South',
    orders: [
      { ro: 'RO-10490', unit: 'T-201', desc: 'Hydraulic lift — cylinder seal replacement',status: 'In Progress', cost: 3200.00, tech: 'C. Mendez'   },
      { ro: 'RO-10491', unit: 'T-205', desc: 'Transmission service — fluid & filter',    status: 'Complete',    cost: 1100.00, tech: 'T. Nwosu'    },
      { ro: 'RO-10492', unit: 'T-210', desc: 'Tire replacement — all 8 steer & drive',   status: 'In Progress', cost: 3840.00, tech: 'C. Mendez'   },
    ],
  },
  {
    name: 'San Antonio',
    orders: [
      { ro: 'RO-10500', unit: 'T-301', desc: 'Frame alignment & suspension rebuild',      status: 'Parts Hold',  cost: 5600.00, tech: 'P. Reyes'    },
      { ro: 'RO-10501', unit: 'T-305', desc: 'PM service — routine',                      status: 'Complete',    cost: 520.00,  tech: 'L. Banks'    },
      { ro: 'RO-10502', unit: 'T-308', desc: 'DEF system fault & injector cleaning',      status: 'In Progress', cost: 1890.00, tech: 'P. Reyes'    },
    ],
  },
  {
    name: 'Garland Annex',
    orders: [
      { ro: 'RO-10510', unit: 'T-401', desc: 'Wheel lift motor replacement',              status: 'In Progress', cost: 2240.00, tech: 'A. Diaz'     },
      { ro: 'RO-10511', unit: 'T-403', desc: 'Air ride suspension — driver side',         status: 'Waiting',     cost: 1750.00, tech: 'A. Diaz'     },
    ],
  },
];

const STATUS_COLOR = {
  'In Progress': '#60a5fa',
  'Parts Hold':  '#f59e0b',
  'Waiting':     '#a78bfa',
  'Complete':    '#22c55e',
};

function fmt(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export function Tool() {
  const el = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    .wip-run-bar { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:1.5rem; padding:1rem 1.25rem; background:var(--surface-high); border:1px solid var(--outline-variant); border-radius:0.75rem; }
    .wip-spinner { animation:wip-spin 0.9s linear infinite; }
    @keyframes wip-spin { to { transform:rotate(360deg); } }
    .wip-shop-block { margin-bottom:1.25rem; border:1px solid var(--outline-variant); border-radius:0.75rem; overflow:hidden; }
    .wip-shop-header { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:var(--surface-high); border-bottom:1px solid var(--outline-variant); }
    .wip-shop-name { font-size:0.9rem; font-weight:700; color:var(--on-surface); }
    .wip-shop-total { font-size:0.95rem; font-weight:800; color:var(--primary); }
    .wip-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
    .wip-table th { text-align:left; font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--on-surface-muted); padding:0.5rem 0.875rem; border-bottom:1px solid var(--outline-variant); }
    .wip-table td { padding:0.55rem 0.875rem; border-bottom:1px solid var(--outline-variant); color:var(--on-surface); vertical-align:top; }
    .wip-table tr:last-child td { border-bottom:none; }
    .wip-table tr:hover td { background:var(--surface-high); }
    .wip-status { display:inline-flex; align-items:center; padding:0.15rem 0.55rem; border-radius:9999px; font-size:0.65rem; font-weight:700; white-space:nowrap; }
    .wip-grand { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; background:var(--primary-container); border:1px solid var(--outline-variant); border-radius:0.75rem; margin-top:0.25rem; }
    .wip-history { margin-top:1.25rem; }
    .wip-hist-row { display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid var(--outline-variant); font-size:0.8rem; }
    .wip-hist-row:last-child { border-bottom:none; }
    .wip-metric-row { display:grid; grid-template-columns:repeat(4,1fr); gap:0.625rem; margin-bottom:1.25rem; }
    .wip-metric { background:var(--surface-high); border:1px solid var(--outline-variant); border-radius:0.625rem; padding:0.75rem; }
    .wip-metric-val { font-size:1.35rem; font-weight:800; color:var(--on-surface); line-height:1; }
    .wip-metric-lbl { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--on-surface-muted); margin-top:0.2rem; }
  `;
  el.appendChild(style);

  let phase = 'idle'; // idle | running | done
  let progress = 0;
  let progressTimer = null;

  function allOrders() { return MOCK_SHOPS.flatMap(s => s.orders); }

  function render() {
    const orders      = allOrders();
    const grandTotal  = orders.reduce((s, o) => s + o.cost, 0);
    const inProgress  = orders.filter(o => o.status === 'In Progress').length;
    const onHold      = orders.filter(o => o.status === 'Parts Hold' || o.status === 'Waiting').length;
    const complete    = orders.filter(o => o.status === 'Complete').length;

    el.innerHTML = '';
    el.appendChild(style);
    el.innerHTML += `
      <div>
        <div style="margin-bottom:1.25rem">
          <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Fullbay WIP</h2>
          <p class="text-on-surface-muted" style="font-size:0.875rem">Mock preview — all shops, orders, and amounts are fictional.</p>
        </div>

        <!-- Run bar -->
        <div class="wip-run-bar">
          <button id="wip-run" class="btn-primary" ${phase==='running'?'disabled':''} style="font-size:0.85rem">
            ${phase==='running'?'Running…':'▶ Run WIP Snapshot'}
          </button>
          ${phase==='running' ? `
            <svg class="wip-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span style="font-size:0.82rem;color:var(--on-surface-muted)">Fetching open service orders from Fullbay…</span>` : ''}
          ${phase==='done' ? `
            <div style="display:flex;align-items:center;gap:0.4rem">
              <span style="color:#22c55e;font-size:1rem">✓</span>
              <span style="font-size:0.82rem;color:var(--on-surface-muted)">Completed — ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div style="display:flex;gap:0.5rem;margin-left:auto">
              <button class="btn-secondary" style="font-size:0.78rem;padding:0.35rem 0.75rem">↓ Summary</button>
              <button class="btn-secondary" style="font-size:0.78rem;padding:0.35rem 0.75rem">↓ Detail</button>
            </div>` : ''}
        </div>

        ${phase === 'done' ? `
          <!-- Metrics -->
          <div class="wip-metric-row">
            <div class="wip-metric">
              <div class="wip-metric-val">${orders.length}</div>
              <div class="wip-metric-lbl">Open Orders</div>
            </div>
            <div class="wip-metric">
              <div class="wip-metric-val" style="color:#60a5fa">${inProgress}</div>
              <div class="wip-metric-lbl">In Progress</div>
            </div>
            <div class="wip-metric">
              <div class="wip-metric-val" style="color:#f59e0b">${onHold}</div>
              <div class="wip-metric-lbl">On Hold</div>
            </div>
            <div class="wip-metric">
              <div class="wip-metric-val" style="color:#22c55e">${complete}</div>
              <div class="wip-metric-lbl">Complete</div>
            </div>
          </div>

          <!-- Shop breakdown -->
          ${MOCK_SHOPS.map(shop => {
            const shopTotal = shop.orders.reduce((s, o) => s + o.cost, 0);
            return `
              <div class="wip-shop-block">
                <div class="wip-shop-header">
                  <span class="wip-shop-name">${shop.name}</span>
                  <span class="wip-shop-total">${fmt(shopTotal)} <span style="font-size:0.72rem;font-weight:500;color:var(--on-surface-muted)">(${shop.orders.length} orders)</span></span>
                </div>
                <table class="wip-table">
                  <thead><tr><th>RO #</th><th>Unit</th><th>Description</th><th>Tech</th><th>Status</th><th style="text-align:right">Cost</th></tr></thead>
                  <tbody>
                    ${shop.orders.map(o => `
                      <tr>
                        <td style="font-family:'Courier New',monospace;font-size:0.72rem;color:var(--on-surface-muted)">${o.ro}</td>
                        <td style="font-weight:700">${o.unit}</td>
                        <td style="max-width:220px">${o.desc}</td>
                        <td style="color:var(--on-surface-muted)">${o.tech}</td>
                        <td>
                          <span class="wip-status" style="background:${STATUS_COLOR[o.status]}22;color:${STATUS_COLOR[o.status]};border:1px solid ${STATUS_COLOR[o.status]}44">
                            ${o.status}
                          </span>
                        </td>
                        <td style="text-align:right;font-weight:600">${fmt(o.cost)}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>`;
          }).join('')}

          <!-- Grand total -->
          <div class="wip-grand">
            <span style="font-size:0.9rem;font-weight:700;color:var(--on-primary-container)">Grand Total — All Shops</span>
            <span style="font-size:1.35rem;font-weight:800;color:var(--on-primary-container)">${fmt(grandTotal)}</span>
          </div>

          <!-- Run history -->
          <div class="wip-history">
            <div class="tool-section-title" style="margin-bottom:0.5rem">Recent Runs</div>
            ${[
              ['Today 9:01 AM', fmt(grandTotal), 'done'],
              ['Yesterday 8:45 AM', '$22,480.00', 'done'],
              ['2026-04-21 9:12 AM', '$19,350.00', 'done'],
            ].map(([ts, total, status]) => `
              <div class="wip-hist-row">
                <span style="color:var(--on-surface-muted)">${ts}</span>
                <div style="display:flex;align-items:center;gap:0.75rem">
                  <span style="font-weight:700;color:var(--primary)">${total}</span>
                  <span style="font-size:0.68rem;font-weight:700;color:#22c55e;text-transform:uppercase">✓ ${status}</span>
                </div>
              </div>`).join('')}
          </div>
        ` : `
          <div style="background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:0.75rem;padding:2.5rem;text-align:center;color:var(--on-surface-muted)">
            <div style="font-size:2rem;margin-bottom:0.75rem">📋</div>
            <div style="font-size:0.92rem;font-weight:600;color:var(--on-surface);margin-bottom:0.25rem">No snapshot loaded</div>
            <div style="font-size:0.82rem">Click "Run WIP Snapshot" to fetch open service orders</div>
          </div>
        `}
      </div>
    `;

    const runBtn = el.querySelector('#wip-run');
    if (runBtn) runBtn.addEventListener('click', () => {
      if (phase === 'running') return;
      phase = 'running';
      render();
      setTimeout(() => { phase = 'done'; render(); }, 1800);
    });
  }

  render();
  return el;
}
