// hub/Tool.js — NETC Labs Tool Hub integration file
//
// This file is loaded by the hub at runtime via jsDelivr CDN.
// It must export a single named function: Tool()
//
// Rules for this file:
//   1. Export a function named Tool() that returns a DOM element.
//   2. No relative imports — this file runs in the hub's context, not your repo's.
//      If you need styles, inject a <style> element inside the returned DOM node.
//   3. Use CSS variables for colors so the tool adapts to light/dark theme:
//        var(--surface)              page background
//        var(--surface-container)    card / panel background
//        var(--surface-high)         elevated surface / input background
//        var(--on-surface)           primary text
//        var(--on-surface-muted)     secondary / label text
//        var(--outline)              border color
//        var(--outline-variant)      subtle border
//        var(--primary)              accent color
//        var(--primary-container)    button / highlight background
//        var(--on-primary-container) text on primary-container
//   4. Prefix all element IDs with a short unique namespace (e.g. "mytool-")
//      so they don't collide with other tools loaded on the same page.
//   5. This file is the ONLY thing the hub loads from your repo.
//      Your standalone index.html / script.js / styles.css are unchanged.
//
// Replace the example below with your real tool logic.

export function Tool() {
  const el = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    .mytool-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: var(--surface-high);
      border: 1px solid var(--outline);
      border-radius: 0.5rem;
      color: var(--on-surface);
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
    }
    .mytool-input:focus {
      border-color: var(--primary);
    }
  `;
  el.appendChild(style);

  el.innerHTML += `
    <div style="display:flex;flex-direction:column;gap:1.25rem">
      <div>
        <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">
          My Tool Name
        </h2>
        <p class="text-on-surface-muted" style="font-size:0.875rem">
          One-line description of what this tool does.
        </p>
      </div>
      <input id="mytool-input" class="mytool-input" placeholder="Enter something…" />
      <button id="mytool-run" class="btn-primary">Run</button>
      <div id="mytool-result" class="tool-result-box" style="display:none"></div>
    </div>
  `;

  el.querySelector('#mytool-run').addEventListener('click', () => {
    const val = el.querySelector('#mytool-input').value;
    const result = el.querySelector('#mytool-result');
    result.style.display = 'block';
    result.textContent = `You entered: ${val}`;
  });

  return el;
}
