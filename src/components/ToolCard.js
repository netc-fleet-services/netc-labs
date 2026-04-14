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
