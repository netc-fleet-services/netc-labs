import { router } from './router.js';

// Initial render
router();

// Re-render on hash navigation
window.addEventListener('hashchange', router);
