import { renderHome } from './pages/Home.js';
import { renderToolPage } from './pages/ToolPage.js';

export function router() {
  const hash = window.location.hash || '#/';

  if (hash.startsWith('#/tool/')) {
    const slug = hash.replace('#/tool/', '').split('?')[0];
    renderToolPage(slug);
  } else {
    renderHome();
  }
}
