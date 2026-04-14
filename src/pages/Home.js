import { renderHeader } from '../components/Header.js';
import { createToolCard } from '../components/ToolCard.js';
import registry from '../tools/registry.js';

export function renderHome() {
  const app = document.getElementById('app');

  const root = document.createElement('div');
  root.innerHTML = `
    <div id="header-mount"></div>

    <main>
      <!-- Hero -->
      <section class="py-24 px-6 text-center">
        <p class="text-primary text-xs font-bold tracking-widest uppercase mb-5" style="letter-spacing:0.15em">
          NETC Labs
        </p>
        <h1 class="font-headline text-huge text-on-surface mb-6">
          Tool Hub
        </h1>
        <p class="text-on-surface-muted text-lg max-w-xl mx-auto leading-relaxed">
          Purpose-built tools for towing &amp; fleet maintenace operations.
          Try them live — or download and customize for your workflow.
        </p>
        <div class="flex justify-center gap-3 mt-8">
          <a href="#tools" class="btn-primary" onclick="document.getElementById('tools').scrollIntoView({behavior:'smooth'});return false;">
            Browse Tools
          </a>
          <a href="https://github.com/netc-fleet-services" target="_blank" rel="noopener" class="btn-secondary">
            View on GitHub
          </a>
        </div>
      </section>

      <!-- Tool Grid -->
      <section id="tools" class="py-16 px-6 max-w-7xl mx-auto">
        <h2 class="font-headline text-3xl text-on-surface mb-2">Available Tools</h2>
        <p class="text-on-surface-muted text-sm mb-10">
          ${registry.length} tool${registry.length !== 1 ? 's' : ''} available &mdash; more coming soon.
        </p>
        <div id="tool-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-outline-variant mt-16 py-10 px-6">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-muted">
          <span>© ${new Date().getFullYear()} NETC Labs. All tools are open source.</span>
          <a href="https://github.com/netc-fleet-services" target="_blank" rel="noopener"
             class="text-on-surface-muted hover:text-on-surface transition-colors" style="text-decoration:none">
            github.com/netc-fleet-services
          </a>
        </div>
      </footer>
    </main>
  `;

  app.innerHTML = '';
  app.appendChild(root);

  renderHeader(document.getElementById('header-mount'));

  const grid = document.getElementById('tool-grid');
  registry.forEach(tool => grid.appendChild(createToolCard(tool)));
}
