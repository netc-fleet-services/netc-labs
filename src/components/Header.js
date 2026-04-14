import { createThemeToggle } from './ThemeToggle.js';

export function renderHeader(mountEl) {
  const header = document.createElement('header');
  header.className = 'bg-surface border-b border-outline-variant sticky top-0 z-50';
  header.style.backdropFilter = 'blur(8px)';

  header.innerHTML = `
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#/" class="font-headline text-lg font-bold text-on-surface hover:opacity-80 transition-opacity no-underline" style="text-decoration:none">
        NETC<span class="text-primary">Labs</span>
      </a>
      <div class="flex items-center gap-5">
        <nav class="hidden sm:flex gap-6 text-sm text-on-surface-muted">
          <a href="#/" style="text-decoration:none" class="hover:text-on-surface transition-colors text-on-surface-muted">Tools</a>
          <a href="https://github.com/netc-labs" target="_blank" rel="noopener"
             style="text-decoration:none" class="hover:text-on-surface transition-colors text-on-surface-muted">GitHub</a>
        </nav>
        <div id="theme-toggle-slot"></div>
      </div>
    </div>
  `;

  mountEl.appendChild(header);
  createThemeToggle(header.querySelector('#theme-toggle-slot'));
}
