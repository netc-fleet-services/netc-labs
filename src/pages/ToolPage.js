import { renderHeader } from '../components/Header.js';
import registry from '../tools/registry.js';

export async function renderToolPage(slug) {
  const app = document.getElementById('app');
  const tool = registry.find(t => t.slug === slug);

  if (!tool) {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center px-6">
        <div class="text-center">
          <p class="text-on-surface-muted text-5xl mb-6">404</p>
          <h1 class="font-headline text-2xl text-on-surface mb-4">Tool not found</h1>
          <a href="#/" class="text-primary hover:underline text-sm">← Back to all tools</a>
        </div>
      </div>`;
    return;
  }

  const root = document.createElement('div');
  root.innerHTML = `
    <div id="header-mount"></div>

    <main class="max-w-4xl mx-auto py-10 px-6">
      <!-- Breadcrumb -->
      <a href="#/" class="inline-flex items-center gap-1 text-on-surface-muted hover:text-on-surface
         transition-colors text-sm mb-8" style="text-decoration:none">
        ← All tools
      </a>

      <!-- Tool header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-10">
        <div>
          <div class="flex flex-wrap gap-1 mb-3">
            ${tool.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <h1 class="font-headline text-3xl text-on-surface mb-2">${tool.name}</h1>
          <p class="text-on-surface-muted text-sm max-w-lg leading-relaxed">${tool.description}</p>
        </div>
        <div class="flex gap-2 flex-shrink-0 flex-wrap">
          <a href="${tool.repo}" target="_blank" rel="noopener" class="btn-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
                0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695
                -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99
                .105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225
                -.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405
                c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225
                0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3
                0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View Repo
          </a>
          <a href="${tool.repo}/archive/refs/heads/main.zip" class="btn-primary">
            ↓ Download ZIP
          </a>
        </div>
      </div>

      <!-- Live tool -->
      <div class="bg-surface-container border border-outline-variant rounded-xl p-6 md:p-8">
        <div id="tool-mount">
          <div class="flex items-center justify-center py-16 text-on-surface-muted text-sm">
            <svg class="animate-spin mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Loading tool…
          </div>
        </div>
      </div>

      <p class="text-xs text-on-surface-muted mt-4 text-center">
        Want to use this offline or customize it?
        <a href="${tool.repo}/archive/refs/heads/main.zip" class="text-primary hover:underline">
          Download the source
        </a>
        from GitHub.
      </p>
    </main>
  `;

  app.innerHTML = '';
  app.appendChild(root);

  renderHeader(document.getElementById('header-mount'));

  // Dynamically import the tool module
  try {
    const module = await import(`../tools/${slug}/Tool.js`);
    const mount = document.getElementById('tool-mount');
    mount.innerHTML = '';
    mount.appendChild(module.Tool());
  } catch (err) {
    document.getElementById('tool-mount').innerHTML = `
      <div class="text-center py-12">
        <p class="text-on-surface text-lg font-semibold mb-2">Tool coming soon</p>
        <p class="text-on-surface-muted text-sm mb-4">
          This tool isn't wired up yet. Download the repo to run it locally.
        </p>
        <a href="${tool.repo}" target="_blank" rel="noopener" class="btn-secondary text-sm">View on GitHub</a>
      </div>`;
    console.error(`[ToolPage] Failed to load tool "${slug}":`, err);
  }
}
