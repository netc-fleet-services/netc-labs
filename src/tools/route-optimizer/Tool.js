// Nearest-neighbor route optimizer.
// Uses deterministic pseudo-coordinates derived from each stop string,
// so the same input always produces the same output without a geocoding API.

function hashPair(str) {
  let h1 = 0x9e3779b9, h2 = 0x6c62272e;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 0x9e3779b9) | 0;
    h2 = Math.imul(h2 ^ str.charCodeAt(i), 0x85ebca77) | 0;
  }
  return {
    x: ((h1 >>> 0) & 0xffff) / 0xffff,
    y: ((h2 >>> 0) & 0xffff) / 0xffff
  };
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function nearestNeighbor(points) {
  if (points.length === 0) return [];
  const visited = [0];
  const remaining = points.map((_, i) => i).slice(1);

  while (remaining.length) {
    const last = visited[visited.length - 1];
    let bestIdx = 0, bestDist = Infinity;
    remaining.forEach((ri, i) => {
      const d = dist(points[last].coord, points[ri].coord);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    visited.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }
  return visited;
}

export function Tool() {
  const el = document.createElement('div');
  let stops = [];

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.5rem">
      <div>
        <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Route Optimizer</h2>
        <p class="text-on-surface-muted" style="font-size:0.875rem">
          Add stops, then click <strong>Optimize</strong> to get the most efficient order.
        </p>
      </div>

      <div>
        <label class="tool-label">Add a Stop</label>
        <div style="display:flex;gap:0.5rem">
          <input id="stop-input" class="tool-input" type="text"
            placeholder="e.g. 123 Main St, Dallas TX" style="flex:1" />
          <button id="add-btn" class="btn-primary">Add</button>
        </div>
      </div>

      <div id="stops-section">
        <div class="tool-section-title" id="stops-label">Stops (0)</div>
        <div id="stops-list" style="display:flex;flex-direction:column;gap:0.4rem"></div>
      </div>

      <div style="display:flex;gap:0.5rem">
        <button id="optimize-btn" class="btn-primary" disabled>Optimize Route</button>
        <button id="clear-btn" class="btn-secondary">Clear All</button>
      </div>

      <div id="result" style="display:none">
        <div class="tool-section-title">Optimized Order</div>
        <div id="result-box" class="tool-result-box"></div>
        <p class="text-on-surface-muted" style="font-size:0.75rem;margin-top:0.5rem">
          ⓘ Optimization uses nearest-neighbor on simulated coordinates. Connect a routing API
          (Google Maps, OSRM) for real-world distances.
        </p>
      </div>
    </div>
  `;

  const input = el.querySelector('#stop-input');
  const addBtn = el.querySelector('#add-btn');
  const stopsList = el.querySelector('#stops-list');
  const stopsLabel = el.querySelector('#stops-label');
  const optimizeBtn = el.querySelector('#optimize-btn');
  const clearBtn = el.querySelector('#clear-btn');
  const result = el.querySelector('#result');
  const resultBox = el.querySelector('#result-box');

  function renderStops() {
    stopsLabel.textContent = `Stops (${stops.length})`;
    stopsList.innerHTML = '';
    stops.forEach((stop, i) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display:flex;align-items:center;gap:0.5rem;
        padding:0.625rem 0.875rem;
        background-color:var(--surface);
        border:1px solid var(--outline-variant);
        border-radius:0.5rem;
        font-size:0.875rem;
      `;
      row.innerHTML = `
        <span style="color:var(--primary);font-family:monospace;font-size:0.75rem;
          font-weight:700;min-width:1.25rem;text-align:center">${i + 1}</span>
        <span style="flex:1;color:var(--on-surface)">${escapeHTML(stop)}</span>
        <button data-i="${i}" class="remove-btn" style="background:none;border:none;cursor:pointer;
          color:var(--on-surface-muted);font-size:0.8rem;padding:0.2rem 0.4rem;border-radius:0.25rem"
          onmouseover="this.style.color='var(--error)'" onmouseout="this.style.color='var(--on-surface-muted)'">
          ✕
        </button>`;
      stopsList.appendChild(row);
    });
    optimizeBtn.disabled = stops.length < 2;
    result.style.display = 'none';
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  addBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (!val) return;
    stops.push(val);
    input.value = '';
    input.focus();
    renderStops();
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });

  stopsList.addEventListener('click', e => {
    const btn = e.target.closest('.remove-btn');
    if (btn) {
      stops.splice(parseInt(btn.dataset.i), 1);
      renderStops();
    }
  });

  clearBtn.addEventListener('click', () => { stops = []; renderStops(); });

  optimizeBtn.addEventListener('click', () => {
    const points = stops.map(s => ({ name: s, coord: hashPair(s) }));
    const order = nearestNeighbor(points);

    let totalDist = 0;
    for (let i = 0; i < order.length - 1; i++) {
      totalDist += dist(points[order[i]].coord, points[order[i + 1]].coord);
    }

    const lines = order.map((idx, i) => `${i + 1}. ${points[idx].name}`);
    lines.push('', `Relative path length: ${(totalDist * 100).toFixed(1)} units`);
    resultBox.textContent = lines.join('\n');
    result.style.display = 'block';
  });

  renderStops();
  return el;
}
