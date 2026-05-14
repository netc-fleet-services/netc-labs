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

    case 'dispatch-board':
      return `
        <div class="preview-mockup" style="padding:8px 10px;gap:4px;overflow:hidden">
          <!-- tab bar -->
          <div style="display:flex;gap:5px;margin-bottom:6px">
            <div style="height:6px;width:52px;border-radius:3px;background:var(--primary);opacity:0.85"></div>
            <div style="height:6px;width:40px;border-radius:3px;background:var(--outline-variant)"></div>
            <div style="height:6px;width:44px;border-radius:3px;background:var(--outline-variant)"></div>
          </div>
          <!-- job cards row 1 -->
          <div style="display:flex;gap:5px;margin-bottom:4px">
            ${[['#60a5fa','62px'],['#f59e0b','50px'],['#22c55e','56px']].map(([c,w])=>`
              <div style="flex:1;background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:5px;padding:4px 5px">
                <div style="width:${w};height:5px;border-radius:3px;background:${c};opacity:0.75;margin-bottom:3px"></div>
                <div style="width:85%;height:4px;border-radius:3px;background:var(--outline-variant)"></div>
              </div>`).join('')}
          </div>
          <!-- job cards row 2 -->
          <div style="display:flex;gap:5px">
            ${[['#a78bfa','48px'],['#60a5fa','58px'],['#ef4444','44px']].map(([c,w])=>`
              <div style="flex:1;background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:5px;padding:4px 5px">
                <div style="width:${w};height:5px;border-radius:3px;background:${c};opacity:0.75;margin-bottom:3px"></div>
                <div style="width:70%;height:4px;border-radius:3px;background:var(--outline-variant)"></div>
              </div>`).join('')}
          </div>
          <!-- bottom status bar -->
          <div style="display:flex;gap:4px;margin-top:5px;align-items:center">
            <div style="width:8px;height:8px;border-radius:50%;background:#22c55e"></div>
            <div style="height:4px;width:35px;border-radius:3px;background:var(--outline-variant)"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-left:6px"></div>
            <div style="height:4px;width:28px;border-radius:3px;background:var(--outline-variant)"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:#ef4444;margin-left:6px"></div>
            <div style="height:4px;width:24px;border-radius:3px;background:var(--outline-variant)"></div>
          </div>
        </div>`;

    case 'impound-tracker':
      return `
        <div class="preview-mockup" style="padding:8px 10px;gap:4px;overflow:hidden">
          <!-- metric chips -->
          <div style="display:flex;gap:5px;margin-bottom:6px">
            ${[['24 Vehicles','var(--primary-container)','var(--on-primary-container)'],
               ['$142k Value','rgba(34,197,94,0.15)','#22c55e'],
               ['6 Pending','rgba(245,158,11,0.15)','#f59e0b']].map(([label,bg,color])=>`
              <div style="flex:1;background:${bg};border-radius:5px;padding:3px 5px;text-align:center">
                <div style="font-size:5.5px;font-weight:700;color:${color};font-family:Inter,sans-serif;white-space:nowrap">${label}</div>
              </div>`).join('')}
          </div>
          <!-- vehicle grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
            ${[
              ['#22c55e','0–30d'],['#22c55e','0–30d'],['#f59e0b','1–3mo'],
              ['#f59e0b','1–3mo'],['#fb923c','3–6mo'],['#ef4444','6–12mo']
            ].map(([c,age])=>`
              <div style="background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:4px;padding:4px">
                <div style="height:18px;background:var(--outline-variant);border-radius:3px;margin-bottom:3px"></div>
                <div style="display:flex;align-items:center;gap:2px">
                  <div style="width:5px;height:5px;border-radius:50%;background:${c};flex-shrink:0"></div>
                  <div style="font-size:4.5px;color:var(--on-surface-muted);font-family:Inter,sans-serif">${age}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>`;

    case 'statement-reconciler':
      return `
        <div class="preview-mockup" style="padding:8px 10px;overflow:hidden">
          <!-- vendor selector -->
          <div style="display:flex;gap:5px;margin-bottom:6px;align-items:center">
            <div style="flex:1;height:18px;background:var(--surface-high);border:1px solid var(--outline);border-radius:4px;display:flex;align-items:center;padding:0 6px">
              <div style="height:5px;width:70px;border-radius:3px;background:var(--outline-variant)"></div>
            </div>
            <div style="height:18px;width:40px;background:var(--primary-container);border-radius:4px;display:flex;align-items:center;justify-content:center">
              <div style="font-size:5px;font-weight:700;color:var(--on-primary-container);font-family:Inter,sans-serif">RUN</div>
            </div>
          </div>
          <!-- file upload zones -->
          <div style="display:flex;gap:4px;margin-bottom:6px">
            ${['Statement PDF','QB Export'].map(label=>`
              <div style="flex:1;border:1px dashed var(--outline);border-radius:4px;padding:5px;text-align:center">
                <div style="font-size:4.5px;color:var(--on-surface-muted);font-family:Inter,sans-serif;margin-bottom:2px">${label}</div>
                <div style="height:4px;width:60%;margin:0 auto;border-radius:3px;background:var(--outline-variant)"></div>
              </div>`).join('')}
          </div>
          <!-- match results -->
          <div style="display:flex;gap:4px">
            <div style="flex:1;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:4px;padding:4px 5px">
              <div style="font-size:5px;color:#22c55e;font-weight:700;font-family:Inter,sans-serif;margin-bottom:2px">MATCHED</div>
              <div style="font-size:8px;font-weight:800;color:#22c55e;font-family:Inter,sans-serif">47</div>
            </div>
            <div style="flex:1;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:4px 5px">
              <div style="font-size:5px;color:#ef4444;font-weight:700;font-family:Inter,sans-serif;margin-bottom:2px">VARIANCE</div>
              <div style="font-size:8px;font-weight:800;color:#ef4444;font-family:Inter,sans-serif">3</div>
            </div>
            <div style="flex:1;background:var(--surface-high);border:1px solid var(--outline-variant);border-radius:4px;padding:4px 5px">
              <div style="font-size:5px;color:var(--on-surface-muted);font-weight:700;font-family:Inter,sans-serif;margin-bottom:2px">DELTA</div>
              <div style="font-size:8px;font-weight:800;color:var(--primary);font-family:Inter,sans-serif">$412</div>
            </div>
          </div>
        </div>`;

    case 'quote-calculator':
      return `
        <div class="preview-mockup" style="padding:8px 10px;overflow:hidden">
          <!-- service type chips -->
          <div style="display:flex;gap:3px;margin-bottom:6px">
            ${['Light Duty','Heavy Duty','Transport','Road Svc'].map((label,i)=>`
              <div style="padding:2px 5px;border-radius:99px;font-size:4.5px;font-weight:700;
                font-family:Inter,sans-serif;white-space:nowrap;
                background:${i===0?'var(--primary-container)':'var(--surface-high)'};
                color:${i===0?'var(--on-primary-container)':'var(--on-surface-muted)'};
                border:1px solid ${i===0?'transparent':'var(--outline-variant)'}">
                ${label}
              </div>`).join('')}
          </div>
          <!-- address inputs -->
          <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
            ${['Pickup address…','Drop-off address…'].map(ph=>`
              <div style="background:var(--surface-high);border:1px solid var(--outline);border-radius:4px;padding:4px 6px;display:flex;align-items:center;gap:5px">
                <div style="width:5px;height:5px;border-radius:50%;background:var(--primary);opacity:0.7;flex-shrink:0"></div>
                <div style="height:4px;flex:1;border-radius:3px;background:var(--outline-variant)"></div>
              </div>`).join('')}
          </div>
          <!-- result box -->
          <div style="background:var(--surface);border:1px solid var(--outline-variant);border-radius:4px;padding:5px 6px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="height:4px;width:38px;border-radius:3px;background:var(--outline-variant);margin-bottom:2px"></div>
              <div style="height:4px;width:28px;border-radius:3px;background:var(--outline-variant)"></div>
            </div>
            <div style="font-size:11px;font-weight:800;color:var(--primary);font-family:Inter,sans-serif">$284</div>
          </div>
        </div>`;

    case 'fullbay-wip':
      return `
        <div class="preview-mockup" style="padding:8px 10px;overflow:hidden">
          <!-- run button + status -->
          <div style="display:flex;gap:5px;align-items:center;margin-bottom:7px">
            <div style="height:18px;padding:0 10px;background:var(--primary-container);border-radius:4px;display:flex;align-items:center">
              <div style="font-size:5px;font-weight:700;color:var(--on-primary-container);font-family:Inter,sans-serif">Run WIP Snapshot</div>
            </div>
            <div style="display:flex;align-items:center;gap:3px">
              <div style="width:5px;height:5px;border-radius:50%;background:#22c55e"></div>
              <div style="height:4px;width:25px;border-radius:3px;background:var(--outline-variant)"></div>
            </div>
          </div>
          <!-- shop breakdown table -->
          ${[
            ['Dallas Shop','$24,180','8'],
            ['Houston Shop','$18,450','6'],
            ['San Antonio','$9,320','4'],
          ].map(([shop,total,jobs],i)=>`
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:${i<2?'3px':'0'};padding:3px 4px;background:${i%2===0?'var(--surface-high)':'transparent'};border-radius:3px">
              <div style="flex:2;height:4px;border-radius:3px;background:var(--outline-variant)"></div>
              <div style="font-size:6px;font-weight:700;color:var(--primary);font-family:Inter,sans-serif;flex-shrink:0">${total}</div>
              <div style="font-size:5px;color:var(--on-surface-muted);font-family:Inter,sans-serif;flex-shrink:0">${jobs} jobs</div>
            </div>`).join('')}
          <!-- grand total -->
          <div style="margin-top:5px;border-top:1px solid var(--outline-variant);padding-top:4px;display:flex;justify-content:space-between;align-items:center">
            <div style="height:4px;width:40px;border-radius:3px;background:var(--outline-variant)"></div>
            <div style="font-size:9px;font-weight:800;color:var(--on-surface);font-family:Inter,sans-serif">$51,950</div>
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
