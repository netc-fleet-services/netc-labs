// src/tools/dispatch-board/Tool.js
// Mock preview of the Dispatch Board — no real job, driver, or route data.

const MOCK_JOBS = [
  { id: 'J-1041', type: 'Light Duty', status: 'assigned',   driver: 'M. Reyes',    origin: 'Oak Lawn',    dest: 'McKinney',      eta: '11:20 AM', miles: 28 },
  { id: 'J-1042', type: 'Heavy Duty', status: 'en-route',   driver: 'D. Harmon',   origin: 'Garland',     dest: 'Grand Prairie', eta: '11:45 AM', miles: 22 },
  { id: 'J-1043', type: 'Transport',  status: 'unassigned', driver: null,           origin: 'Mesquite',    dest: 'Fort Worth',    eta: '—',        miles: 38 },
  { id: 'J-1044', type: 'Road Svc',  status: 'complete',   driver: 'T. Okafor',   origin: 'Richardson',  dest: 'On-site',       eta: '10:55 AM', miles: 9  },
  { id: 'J-1045', type: 'Light Duty', status: 'unassigned', driver: null,           origin: 'Plano',       dest: 'Irving',        eta: '—',        miles: 31 },
  { id: 'J-1046', type: 'Heavy Duty', status: 'assigned',   driver: 'K. Simmons',  origin: 'Carrollton',  dest: 'Duncanville',   eta: '12:10 PM', miles: 19 },
  { id: 'J-1047', type: 'Transport',  status: 'en-route',   driver: 'B. Walsh',    origin: 'Frisco',      dest: 'Mansfield',     eta: '12:30 PM', miles: 44 },
  { id: 'J-1048', type: 'Road Svc',  status: 'unassigned', driver: null,           origin: 'Addison',     dest: 'On-site',       eta: '—',        miles: 6  },
];

const MOCK_DRIVERS = [
  { name: 'M. Reyes',   status: 'on-job',  truck: 'T-102', location: 'En route McKinney',   jobs: 2 },
  { name: 'D. Harmon',  status: 'on-job',  truck: 'T-105', location: 'Grand Prairie area',  jobs: 1 },
  { name: 'T. Okafor',  status: 'staging', truck: 'T-108', location: 'Dallas yard',          jobs: 3 },
  { name: 'K. Simmons', status: 'on-job',  truck: 'T-101', location: 'En route Duncanville', jobs: 1 },
  { name: 'B. Walsh',   status: 'on-job',  truck: 'T-107', location: 'Frisco area',          jobs: 2 },
  { name: 'C. Torres',  status: 'available', truck: 'T-103', location: 'Houston yard',       jobs: 0 },
  { name: 'P. Nguyen',  status: 'available', truck: 'T-109', location: 'Dallas yard',        jobs: 0 },
  { name: 'L. Grant',   status: 'off',     truck: 'T-104', location: '—',                   jobs: 0 },
];

const STATUS_COLOR = {
  assigned:   '#60a5fa',
  'en-route': '#22c55e',
  unassigned: '#f59e0b',
  complete:   '#6b7280',
};
const STATUS_LABEL = {
  assigned:   'Assigned',
  'en-route': 'En Route',
  unassigned: 'Unassigned',
  complete:   'Complete',
};
const DRIVER_STATUS_COLOR = { 'on-job': '#60a5fa', staging: '#f59e0b', available: '#22c55e', off: '#6b7280' };

export function Tool() {
  const el = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    .db-tabs { display:flex; gap:2px; border-bottom:1px solid var(--outline-variant); margin-bottom:1rem; }
    .db-tab {
      padding:0.45rem 1rem; font-size:0.8rem; font-weight:600; cursor:pointer;
      border:none; background:transparent; color:var(--on-surface-muted);
      border-bottom:2px solid transparent; margin-bottom:-1px;
      font-family:inherit; transition:color 0.15s, border-color 0.15s;
    }
    .db-tab.active { color:var(--primary); border-bottom-color:var(--primary); }
    .db-tab:hover:not(.active) { color:var(--on-surface); }
    .db-panel { display:none; }
    .db-panel.active { display:block; }
    .db-filters { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem; align-items:center; }
    .db-filter-btn {
      padding:0.3rem 0.75rem; border-radius:9999px; font-size:0.73rem; font-weight:600;
      cursor:pointer; border:1px solid var(--outline); background:transparent;
      color:var(--on-surface-muted); font-family:inherit; transition:all 0.15s;
    }
    .db-filter-btn.active { background:var(--primary-container); color:var(--on-primary-container); border-color:transparent; }
    .db-job-grid { display:flex; flex-direction:column; gap:0.5rem; }
    .db-job-card {
      background:var(--surface-high); border:1px solid var(--outline-variant);
      border-radius:0.625rem; padding:0.75rem 1rem;
      display:grid; grid-template-columns:auto 1fr auto auto; gap:0.5rem 1rem; align-items:center;
    }
    .db-job-id { font-size:0.7rem; font-weight:700; color:var(--on-surface-muted); font-family:'Courier New',monospace; }
    .db-status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .db-badge {
      display:inline-flex; align-items:center; padding:0.15rem 0.55rem;
      border-radius:9999px; font-size:0.65rem; font-weight:700; white-space:nowrap;
    }
    .db-driver-grid { display:flex; flex-direction:column; gap:0.4rem; }
    .db-driver-row {
      background:var(--surface-high); border:1px solid var(--outline-variant);
      border-radius:0.5rem; padding:0.6rem 0.875rem;
      display:grid; grid-template-columns:1fr auto auto; gap:0.5rem 1rem; align-items:center;
    }
    .db-metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; margin-bottom:1.25rem; }
    .db-metric { background:var(--surface-high); border:1px solid var(--outline-variant); border-radius:0.625rem; padding:0.875rem 1rem; }
    .db-metric-val { font-size:1.75rem; font-weight:800; color:var(--on-surface); line-height:1; margin-bottom:0.25rem; }
    .db-metric-lbl { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--on-surface-muted); }
  `;
  el.appendChild(style);

  let activeTab = 'planning';
  let activeFilter = 'all';

  function renderJobs(filter) {
    const jobs = filter === 'all' ? MOCK_JOBS : MOCK_JOBS.filter(j => j.status === filter);
    return jobs.map(j => `
      <div class="db-job-card">
        <div>
          <div class="db-job-id">${j.id}</div>
          <div style="font-size:0.72rem;color:var(--on-surface-muted);margin-top:1px">${j.type}</div>
        </div>
        <div>
          <div style="font-size:0.82rem;font-weight:600;color:var(--on-surface)">${j.origin} → ${j.dest}</div>
          <div style="font-size:0.72rem;color:var(--on-surface-muted);margin-top:1px">${j.miles} mi</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:0.78rem;font-weight:600;color:var(--on-surface)">${j.driver ?? '<span style="color:var(--on-surface-muted)">Unassigned</span>'}</div>
          <div style="font-size:0.7rem;color:var(--on-surface-muted);margin-top:1px">ETA ${j.eta}</div>
        </div>
        <div>
          <div class="db-badge" style="background:${STATUS_COLOR[j.status]}22;color:${STATUS_COLOR[j.status]};border:1px solid ${STATUS_COLOR[j.status]}44">
            ${STATUS_LABEL[j.status]}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderDrivers() {
    return MOCK_DRIVERS.map(d => `
      <div class="db-driver-row">
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:var(--on-surface)">${d.name}</div>
          <div style="font-size:0.72rem;color:var(--on-surface-muted);margin-top:1px">${d.location}</div>
        </div>
        <div style="font-size:0.72rem;color:var(--on-surface-muted);text-align:right">
          <div style="font-weight:600;color:var(--on-surface)">${d.truck}</div>
          <div>${d.jobs} job${d.jobs !== 1 ? 's' : ''} today</div>
        </div>
        <div class="db-badge" style="background:${DRIVER_STATUS_COLOR[d.status]}22;color:${DRIVER_STATUS_COLOR[d.status]};border:1px solid ${DRIVER_STATUS_COLOR[d.status]}44">
          ${d.status === 'on-job' ? 'On Job' : d.status === 'staging' ? 'Staging' : d.status === 'available' ? 'Available' : 'Off'}
        </div>
      </div>
    `).join('');
  }

  function render() {
    const unassigned = MOCK_JOBS.filter(j => j.status === 'unassigned').length;
    const enRoute    = MOCK_JOBS.filter(j => j.status === 'en-route').length;
    const complete   = MOCK_JOBS.filter(j => j.status === 'complete').length;
    const available  = MOCK_DRIVERS.filter(d => d.status === 'available').length;

    el.innerHTML = '';
    el.appendChild(style);
    el.innerHTML += `
      <div style="display:flex;flex-direction:column;gap:0">
        <div style="margin-bottom:1.25rem">
          <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Dispatch Board</h2>
          <p class="text-on-surface-muted" style="font-size:0.875rem">Mock preview — all jobs, drivers, and routes are fictional.</p>
        </div>

        <div class="db-tabs">
          ${['planning','drivers','metrics'].map(t => `
            <button class="db-tab${activeTab===t?' active':''}" data-tab="${t}">
              ${t==='planning'?'Planning Board':t==='drivers'?'Drivers':'Metrics'}
            </button>`).join('')}
        </div>

        <div class="db-panel${activeTab==='planning'?' active':''}">
          <div class="db-filters">
            <span style="font-size:0.72rem;font-weight:700;color:var(--on-surface-muted);text-transform:uppercase;letter-spacing:0.06em">Filter:</span>
            ${[['all','All'],['unassigned','Unassigned'],['assigned','Assigned'],['en-route','En Route'],['complete','Complete']].map(([val,lbl])=>`
              <button class="db-filter-btn${activeFilter===val?' active':''}" data-filter="${val}">${lbl}</button>`).join('')}
          </div>
          <div class="db-job-grid">${renderJobs(activeFilter)}</div>
        </div>

        <div class="db-panel${activeTab==='drivers'?' active':''}">
          <div class="db-driver-grid">${renderDrivers()}</div>
        </div>

        <div class="db-panel${activeTab==='metrics'?' active':''}">
          <div class="db-metric-grid">
            <div class="db-metric">
              <div class="db-metric-val">${MOCK_JOBS.length}</div>
              <div class="db-metric-lbl">Jobs Today</div>
            </div>
            <div class="db-metric">
              <div class="db-metric-val" style="color:#f59e0b">${unassigned}</div>
              <div class="db-metric-lbl">Unassigned</div>
            </div>
            <div class="db-metric">
              <div class="db-metric-val" style="color:#22c55e">${enRoute}</div>
              <div class="db-metric-lbl">En Route</div>
            </div>
            <div class="db-metric">
              <div class="db-metric-val" style="color:var(--primary)">${available}</div>
              <div class="db-metric-lbl">Available Drivers</div>
            </div>
          </div>
          <div style="background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:0.625rem;padding:1rem">
            <div class="tool-section-title" style="margin-bottom:0.75rem">Jobs by Type</div>
            ${['Light Duty','Heavy Duty','Transport','Road Svc'].map(type => {
              const count = MOCK_JOBS.filter(j=>j.type===type).length;
              const pct = Math.round((count/MOCK_JOBS.length)*100);
              return `
                <div style="margin-bottom:0.625rem">
                  <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                    <span style="font-size:0.78rem;color:var(--on-surface)">${type}</span>
                    <span style="font-size:0.78rem;font-weight:600;color:var(--on-surface)">${count}</span>
                  </div>
                  <div style="height:6px;background:var(--outline-variant);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${pct}%;background:var(--primary);border-radius:3px;transition:width 0.3s"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    el.querySelectorAll('.db-tab').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.tab; render(); });
    });
    el.querySelectorAll('.db-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeFilter = btn.dataset.filter; render(); });
    });
  }

  render();
  return el;
}
