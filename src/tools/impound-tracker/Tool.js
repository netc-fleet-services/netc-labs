// src/tools/impound-tracker/Tool.js
// Mock preview of the Impound Tracker — all vehicles, values, and records are fictional.

const MOCK_VEHICLES = [
  { id: 'IMP-0081', year: 2018, make: 'Ford',       model: 'F-150',      color: 'Silver',  lot: 'Dallas',      daysIn: 12,  value: 9800,  status: 'hold',    disposition: 'sell' },
  { id: 'IMP-0082', year: 2015, make: 'Chevrolet',  model: 'Malibu',     color: 'Black',   lot: 'Dallas',      daysIn: 47,  value: 4200,  status: 'titled',  disposition: 'sell' },
  { id: 'IMP-0083', year: 2011, make: 'Honda',      model: 'Civic',      color: 'White',   lot: 'Houston',     daysIn: 94,  value: 1800,  status: 'titled',  disposition: 'scrap' },
  { id: 'IMP-0084', year: 2020, make: 'Toyota',     model: 'Camry',      color: 'Red',     lot: 'Dallas',      daysIn: 8,   value: 14500, status: 'hold',    disposition: 'sell' },
  { id: 'IMP-0085', year: 2016, make: 'Dodge',      model: 'Charger',    color: 'Blue',    lot: 'Houston',     daysIn: 31,  value: 7100,  status: 'titled',  disposition: 'sell' },
  { id: 'IMP-0086', year: 2009, make: 'Nissan',     model: 'Altima',     color: 'Grey',    lot: 'Dallas',      daysIn: 198, value: 850,   status: 'titled',  disposition: 'scrap' },
  { id: 'IMP-0087', year: 2019, make: 'GMC',        model: 'Sierra',     color: 'White',   lot: 'San Antonio', daysIn: 22,  value: 18200, status: 'hold',    disposition: 'sell' },
  { id: 'IMP-0088', year: 2013, make: 'Jeep',       model: 'Wrangler',   color: 'Green',   lot: 'Houston',     daysIn: 65,  value: 6400,  status: 'titled',  disposition: 'sell' },
  { id: 'IMP-0089', year: 2021, make: 'Hyundai',    model: 'Elantra',    color: 'Blue',    lot: 'Dallas',      daysIn: 5,   value: 12100, status: 'hold',    disposition: 'sell' },
  { id: 'IMP-0090', year: 2007, make: 'Saturn',     model: 'Vue',        color: 'Silver',  lot: 'San Antonio', daysIn: 410, value: 400,   status: 'titled',  disposition: 'scrap' },
  { id: 'IMP-0091', year: 2017, make: 'Kia',        model: 'Sorento',    color: 'White',   lot: 'Dallas',      daysIn: 76,  value: 5900,  status: 'titled',  disposition: 'sell' },
  { id: 'IMP-0092', year: 2014, make: 'Ford',       model: 'Escape',     color: 'Orange',  lot: 'Houston',     daysIn: 130, value: 2300,  status: 'titled',  disposition: 'scrap' },
];

function agingBand(days) {
  if (days <= 30)  return { label: '0–30 days',  color: '#22c55e' };
  if (days <= 90)  return { label: '1–3 months', color: '#f59e0b' };
  if (days <= 180) return { label: '3–6 months', color: '#fb923c' };
  if (days <= 365) return { label: '6–12 months',color: '#ef4444' };
  return               { label: '1+ year',       color: '#a855f7' };
}

const lots = ['all', 'Dallas', 'Houston', 'San Antonio'];

export function Tool() {
  const el = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    .imp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:0.75rem; }
    .imp-card {
      background:var(--surface-high); border:1px solid var(--outline-variant);
      border-radius:0.75rem; overflow:hidden; cursor:pointer;
      transition:border-color 0.15s, box-shadow 0.15s;
    }
    .imp-card:hover { border-color:var(--outline); box-shadow:0 4px 16px rgba(0,0,0,0.18); }
    .imp-photo {
      height:100px; background:var(--outline-variant);
      display:flex; align-items:center; justify-content:center;
      font-size:2rem; color:var(--on-surface-muted); position:relative;
    }
    .imp-aging-badge {
      position:absolute; top:6px; right:6px;
      padding:2px 7px; border-radius:99px; font-size:0.6rem; font-weight:700;
      font-family:inherit;
    }
    .imp-body { padding:0.625rem 0.75rem; }
    .imp-id { font-size:0.68rem; font-weight:700; color:var(--on-surface-muted); font-family:'Courier New',monospace; }
    .imp-title { font-size:0.88rem; font-weight:700; color:var(--on-surface); margin:2px 0; }
    .imp-meta { font-size:0.72rem; color:var(--on-surface-muted); }
    .imp-footer { display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; }
    .imp-disp {
      font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:99px;
      text-transform:uppercase; letter-spacing:0.05em;
    }
    .imp-value { font-size:0.88rem; font-weight:800; color:var(--primary); }
    .imp-lot-tabs { display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:1rem; }
    .imp-lot-btn {
      padding:0.3rem 0.75rem; border-radius:9999px; font-size:0.73rem; font-weight:600;
      cursor:pointer; border:1px solid var(--outline); background:transparent;
      color:var(--on-surface-muted); font-family:inherit; transition:all 0.15s;
    }
    .imp-lot-btn.active { background:var(--primary-container); color:var(--on-primary-container); border-color:transparent; }
    .imp-drawer {
      position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:999;
      display:flex; align-items:flex-end; justify-content:center;
    }
    .imp-drawer-panel {
      background:var(--surface-container); border-radius:1rem 1rem 0 0;
      padding:1.5rem; width:100%; max-width:540px; max-height:80vh; overflow-y:auto;
    }
    .imp-metric-row { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; margin-bottom:1.25rem; }
    .imp-metric { background:var(--surface-high); border:1px solid var(--outline-variant); border-radius:0.625rem; padding:0.75rem 1rem; }
    .imp-metric-val { font-size:1.5rem; font-weight:800; color:var(--on-surface); line-height:1; }
    .imp-metric-lbl { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--on-surface-muted); margin-top:0.2rem; }
  `;
  el.appendChild(style);

  let activeLot = 'all';
  let selected = null;

  function fmt(n) { return '$' + n.toLocaleString(); }

  function renderDrawer(v) {
    const band = agingBand(v.daysIn);
    return `
      <div class="imp-drawer" id="imp-drawer">
        <div class="imp-drawer-panel">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
            <div>
              <div class="imp-id">${v.id}</div>
              <h3 style="font-size:1.2rem;font-weight:800;color:var(--on-surface);margin:4px 0">${v.year} ${v.make} ${v.model}</h3>
              <div style="font-size:0.8rem;color:var(--on-surface-muted)">${v.color} &bull; ${v.lot} lot</div>
            </div>
            <button id="imp-close" class="btn-secondary" style="padding:0.4rem 0.75rem;font-size:0.78rem">Close</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
            ${[
              ['Days on Lot', `${v.daysIn}`],
              ['Aging Band',  `<span style="color:${band.color};font-weight:700">${band.label}</span>`],
              ['Est. Value',  `<span style="color:var(--primary);font-weight:700">${fmt(v.value)}</span>`],
              ['Status',      v.status === 'hold' ? 'Legal Hold' : 'Titled'],
              ['Disposition', v.disposition === 'sell' ? 'List for Sale' : 'Scrap'],
              ['Lot Location', v.lot],
            ].map(([lbl,val])=>`
              <div style="background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:0.5rem;padding:0.6rem 0.75rem">
                <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--on-surface-muted);margin-bottom:0.2rem">${lbl}</div>
                <div style="font-size:0.9rem;color:var(--on-surface)">${val}</div>
              </div>`).join('')}
          </div>
          <div style="background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:0.5rem;padding:0.75rem;font-size:0.78rem;color:var(--on-surface-muted);font-style:italic">
            Photo upload, sale price, and TowBook sync available in the full app.
          </div>
        </div>
      </div>`;
  }

  function render() {
    const vehicles = activeLot === 'all' ? MOCK_VEHICLES : MOCK_VEHICLES.filter(v => v.lot === activeLot);
    const totalValue = vehicles.reduce((s, v) => s + v.value, 0);
    const pending    = vehicles.filter(v => v.disposition === 'sell').length;

    el.innerHTML = '';
    el.appendChild(style);
    el.innerHTML += `
      <div style="display:flex;flex-direction:column;gap:0">
        <div style="margin-bottom:1rem">
          <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Impound Tracker</h2>
          <p class="text-on-surface-muted" style="font-size:0.875rem">Mock preview — all vehicles and values are fictional.</p>
        </div>

        <div class="imp-metric-row">
          <div class="imp-metric">
            <div class="imp-metric-val">${vehicles.length}</div>
            <div class="imp-metric-lbl">Vehicles on Lot</div>
          </div>
          <div class="imp-metric">
            <div class="imp-metric-val" style="color:var(--primary)">${'$' + (totalValue/1000).toFixed(0) + 'k'}</div>
            <div class="imp-metric-lbl">Est. Total Value</div>
          </div>
          <div class="imp-metric">
            <div class="imp-metric-val" style="color:#22c55e">${pending}</div>
            <div class="imp-metric-lbl">Listed for Sale</div>
          </div>
        </div>

        <div class="imp-lot-tabs">
          ${lots.map(l => `<button class="imp-lot-btn${activeLot===l?' active':''}" data-lot="${l}">${l==='all'?'All Lots':l}</button>`).join('')}
        </div>

        <div class="imp-grid">
          ${vehicles.map(v => {
            const band = agingBand(v.daysIn);
            return `
              <div class="imp-card" data-id="${v.id}">
                <div class="imp-photo">
                  🚗
                  <div class="imp-aging-badge" style="background:${band.color}33;color:${band.color};border:1px solid ${band.color}55">
                    ${band.label}
                  </div>
                </div>
                <div class="imp-body">
                  <div class="imp-id">${v.id}</div>
                  <div class="imp-title">${v.year} ${v.make} ${v.model}</div>
                  <div class="imp-meta">${v.color} &bull; ${v.lot} &bull; ${v.daysIn}d on lot</div>
                  <div class="imp-footer">
                    <div class="imp-disp" style="background:${v.disposition==='sell'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'};color:${v.disposition==='sell'?'#22c55e':'#ef4444'}">
                      ${v.disposition === 'sell' ? 'Sell' : 'Scrap'}
                    </div>
                    <div class="imp-value">${fmt(v.value)}</div>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>

        ${selected ? renderDrawer(selected) : ''}
      </div>
    `;

    el.querySelectorAll('.imp-lot-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeLot = btn.dataset.lot; render(); });
    });
    el.querySelectorAll('.imp-card').forEach(card => {
      card.addEventListener('click', () => {
        selected = MOCK_VEHICLES.find(v => v.id === card.dataset.id);
        render();
      });
    });
    const closeBtn = el.querySelector('#imp-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { selected = null; render(); });
    const drawer = el.querySelector('#imp-drawer');
    if (drawer) drawer.addEventListener('click', e => { if (e.target === drawer) { selected = null; render(); } });
  }

  render();
  return el;
}
