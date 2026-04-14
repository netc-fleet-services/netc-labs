function buildPreview(tool) {
  switch (tool.previewType) {
    case 'form':
      return `
        <div class="preview-mockup">
          <div class="mockup-field" style="width:100%"></div>
          <div class="mockup-field" style="width:70%"></div>
          <div class="mockup-field" style="width:85%"></div>
          <div class="mockup-row" style="margin-top:0.25rem">
            <div class="mockup-chip">Stop 1</div>
            <div class="mockup-chip">Stop 2</div>
            <div class="mockup-chip">Stop 3</div>
          </div>
          <div class="mockup-btn" style="margin-top:0.5rem">Optimize Route →</div>
        </div>`;

    case 'table':
      return `
        <div class="preview-mockup">
          <div class="mockup-table-header mockup-row" style="margin-bottom:0.3rem">
            <div class="mockup-cell" style="flex:1"></div>
            <div class="mockup-cell" style="flex:1"></div>
            <div class="mockup-cell" style="flex:1"></div>
          </div>
          ${[0, 1, 2].map(() => `
            <div class="mockup-table-row mockup-row" style="margin-bottom:0.25rem">
              <div class="mockup-cell" style="flex:1"></div>
              <div class="mockup-cell" style="flex:1"></div>
              <div class="mockup-cell" style="flex:1"></div>
            </div>`).join('')}
          <div class="mockup-btn" style="margin-top:0.5rem">Export CSV</div>
        </div>`;

    case 'converter':
      return `
        <div class="preview-mockup">
          <div class="mockup-row" style="margin-bottom:0.35rem">
            <div class="mockup-field" style="flex:1"></div>
            <span style="color:var(--primary);font-size:0.75rem;font-weight:700;padding:0 0.25rem">→</span>
            <div class="mockup-field" style="flex:1;opacity:0.3"></div>
          </div>
          <div class="mockup-row" style="margin-bottom:0.5rem">
            <div class="mockup-chip">km</div>
            <div class="mockup-chip">mi</div>
            <div class="mockup-chip">m</div>
            <div class="mockup-chip">ft</div>
          </div>
          <div class="mockup-result-box">= 62.14 mi</div>
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
