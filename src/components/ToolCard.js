function buildPreview(tool) {
  switch (tool.previewType) {
    case 'fleet-swap':
      return `
        <div class="preview-mockup" style="justify-content:center">
          <svg viewBox="0 0 220 100" style="width:100%;height:auto;display:block;overflow:visible">
            <!-- grid lines -->
            <line x1="30" y1="10" x2="210" y2="10" stroke="var(--outline-variant)" stroke-width="0.5"/>
            <line x1="30" y1="38" x2="210" y2="38" stroke="var(--outline-variant)" stroke-width="0.5"/>
            <line x1="30" y1="66" x2="210" y2="66" stroke="var(--outline-variant)" stroke-width="0.5"/>
            <line x1="30" y1="88" x2="210" y2="88" stroke="var(--outline-variant)" stroke-width="0.5"/>
            <!-- resale value line (declining, blue) -->
            <path d="M30,12 C60,14 90,22 120,36 C150,50 170,62 210,80"
              fill="none" stroke="#5B89D6" stroke-width="2.5" stroke-linecap="round"/>
            <!-- cumulative cost line (rising, orange) -->
            <path d="M30,86 C55,78 80,66 110,52 C135,40 165,28 210,18"
              fill="none" stroke="#C2410C" stroke-width="2.5" stroke-linecap="round"/>
            <!-- crossover dot + dashed line -->
            <line x1="122" y1="10" x2="122" y2="88" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <circle cx="122" cy="44" r="4.5" fill="var(--primary-container)" stroke="var(--primary)" stroke-width="1.5"/>
            <!-- label -->
            <rect x="128" y="28" width="62" height="20" rx="3" fill="var(--primary-container)"/>
            <text x="133" y="37" font-family="Inter,sans-serif" font-size="6.5" fill="var(--on-primary-container)" font-weight="600">CROSSOVER</text>
            <text x="133" y="45" font-family="Inter,sans-serif" font-size="6" fill="var(--on-primary-container)">Year 4 · M3</text>
          </svg>
        </div>`;

    case 'driver-inspections':
      return `
        <div class="preview-mockup" style="padding:10px 12px;overflow:hidden">
          <!-- header row -->
          <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
            <div style="flex:2;height:7px;border-radius:3px;background:var(--primary);opacity:0.7"></div>
            <div style="flex:1;height:7px;border-radius:3px;background:var(--outline-variant)"></div>
            <div style="flex:1;height:7px;border-radius:3px;background:var(--outline-variant)"></div>
            <div style="flex:1;height:7px;border-radius:3px;background:var(--outline-variant)"></div>
          </div>
          <!-- rows -->
          ${[
            ['0.85','0.55','1','ok'],
            ['0.7','0.45','0.9','warn'],
            ['0.9','0.35','0.8','ok'],
            ['0.65','0.5','0.85','fail'],
            ['0.8','0.6','0.95','ok'],
          ].map(([n,r,c,s]) => {
            const dot = s==='ok'?'#22c55e':s==='warn'?'#f59e0b':'#ef4444';
            return `<div style="display:flex;gap:6px;margin-bottom:4px;align-items:center">
              <div style="flex:2;height:6px;border-radius:3px;background:var(--outline-variant);opacity:${n}"></div>
              <div style="flex:1;height:6px;border-radius:3px;background:var(--outline-variant);opacity:${r}"></div>
              <div style="flex:1;height:6px;border-radius:3px;background:var(--outline-variant);opacity:${c}"></div>
              <div style="flex:1;display:flex;justify-content:center">
                <div style="width:8px;height:8px;border-radius:50%;background:${dot}"></div>
              </div>
            </div>`;
          }).join('')}
        </div>`;

    case 'irh-driver-scheduler':
      return `
        <div class="preview-mockup" style="padding:10px 12px;gap:4px;overflow:hidden">
          <!-- day-of-week header -->
          <div style="display:flex;gap:4px;margin-bottom:5px">
            <div style="flex:0 0 38px;height:6px;border-radius:3px;background:var(--outline-variant);opacity:0.5"></div>
            ${['M','T','W','T','F','S','S'].map(() =>
              `<div style="flex:1;height:6px;border-radius:3px;background:var(--outline-variant);opacity:0.7"></div>`
            ).join('')}
          </div>
          <!-- driver rows with shift bars -->
          ${[
            [1,1,1,1,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,0,1,1,1,0],
            [1,1,1,0,0,1,1],
            [0,0,1,1,1,1,1],
          ].map((row, i) => {
            const colors = ['#5B89D6','#22c55e','#f59e0b','#5B89D6','#22c55e'];
            const c = colors[i];
            return `<div style="display:flex;gap:4px;align-items:center;margin-bottom:3px">
              <div style="flex:0 0 38px;height:6px;border-radius:3px;background:var(--outline-variant);opacity:0.6"></div>
              ${row.map(on =>
                on
                  ? `<div style="flex:1;height:8px;border-radius:2px;background:${c};opacity:0.75"></div>`
                  : `<div style="flex:1;height:8px;border-radius:2px;background:var(--outline-variant);opacity:0.25"></div>`
              ).join('')}
            </div>`;
          }).join('')}
        </div>`;

    case 'maintenance-tracker':
      return `
        <div class="preview-mockup" style="padding:10px 12px;gap:5px;overflow:hidden">
          <!-- Ready -->
          <div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:6px;padding:5px 8px;margin-bottom:4px">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
              <div style="width:7px;height:7px;border-radius:50%;background:#22c55e"></div>
              <div style="height:5px;width:50px;border-radius:3px;background:#22c55e;opacity:0.7"></div>
            </div>
            <div style="display:flex;gap:4px">
              ${['42px','36px','50px'].map(w=>`<div style="height:5px;width:${w};border-radius:3px;background:var(--outline-variant)"></div>`).join('')}
            </div>
          </div>
          <!-- Issues -->
          <div style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:5px 8px;margin-bottom:4px">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
              <div style="width:7px;height:7px;border-radius:50%;background:#f59e0b"></div>
              <div style="height:5px;width:60px;border-radius:3px;background:#f59e0b;opacity:0.7"></div>
            </div>
            <div style="display:flex;gap:4px">
              ${['55px','30px'].map(w=>`<div style="height:5px;width:${w};border-radius:3px;background:var(--outline-variant)"></div>`).join('')}
            </div>
          </div>
          <!-- OOS -->
          <div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:5px 8px">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
              <div style="width:7px;height:7px;border-radius:50%;background:#ef4444"></div>
              <div style="height:5px;width:70px;border-radius:3px;background:#ef4444;opacity:0.7"></div>
            </div>
            <div style="display:flex;gap:4px">
              ${['40px','48px'].map(w=>`<div style="height:5px;width:${w};border-radius:3px;background:var(--outline-variant)"></div>`).join('')}
            </div>
          </div>
        </div>`;

    default:
      return `<div class="preview-mockup" style="align-items:center;font-size:2.5rem">🔧</div>`;
  }
}

export function createToolCard(tool) {
  const card = document.createElement('div');
  card.className = 'tool-card';

  card.innerHTML = `
    <div class="tool-card-preview">
      ${buildPreview(tool)}
    </div>
    <div class="p-5 flex flex-col flex-1">
      <div class="flex flex-wrap gap-1 mb-2">
        ${tool.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <h3 class="font-headline text-base font-bold text-on-surface mb-1">${tool.name}</h3>
      <p class="text-on-surface-muted text-sm leading-relaxed mb-4 flex-1">${tool.description}</p>
      <div class="flex gap-2 mt-auto">
        <a href="#/tool/${tool.slug}" class="btn-primary text-sm" style="flex:1;text-align:center">
          Launch Tool
        </a>
        <a href="${tool.repo}" target="_blank" rel="noopener" class="btn-secondary text-sm">
          GitHub
        </a>
      </div>
    </div>
  `;

  return card;
}
