# Tool Hub Website — Architecture & Style Specification (No iFrame Version)

## 1. Overview

This project is a **static GitHub-hosted website** that serves as a central hub for multiple tools.

Each tool:
- Lives in its own GitHub repository (or optionally a monorepo)
- Runs on its **own dedicated page inside the main app**
- Can be **used live within the site (no iframes)**
- Can be **downloaded/cloned for local customization**

No backend dependencies. Everything runs via:
- GitHub Pages
- Client-side JavaScript
- ES module imports

---

## 2. High-Level Architecture

```
/tool-hub
  /public
    index.html
  /src
    main.js
    router.js
    /pages
      Home.js
      ToolPage.js
    /components
      Header.js
      ToolCard.js
      ThemeToggle.js
    /tools
      registry.json
      /route-optimizer
        Tool.js
        logic.js
    /styles
      theme.css
  package.json
  README.md
```

---

## 3. Core Concept: Tools as Modules

Each tool is treated as a **loadable JavaScript module**, not a standalone app or iframe.

### Required Tool Interface

Every tool must export a function:

```js
export function Tool() {
  const container = document.createElement("div");

  container.innerHTML = `
    <div class="p-6">
      <h1 class="text-3xl font-headline">Tool Name</h1>
      <button id="run">Run</button>
    </div>
  `;

  container.querySelector("#run").onclick = () => {
    console.log("Tool running");
  };

  return container;
}
```

---

## 4. Tool Registry (Single Source of Truth)

`/src/tools/registry.json`

```json
[
  {
    "name": "Route Optimizer",
    "slug": "route-optimizer",
    "description": "Optimize daily service routes",
    "repo": "https://github.com/org/route-optimizer",
    "module": "/src/tools/route-optimizer/Tool.js"
  }
]
```

---

## 5. Routing System

### Routes

```
/                → Home page (tool grid)
/tool/:slug      → Individual tool page
```

### Router Example

```js
import { loadTool } from "./pages/ToolPage.js";
import { renderHome } from "./pages/Home.js";

export function router() {
  const path = window.location.pathname;

  if (path.startsWith("/tool/")) {
    const slug = path.split("/tool/")[1];
    loadTool(slug);
  } else {
    renderHome();
  }
}
```

---

## 6. Tool Loader (Dynamic Import)

```js
import registry from "../tools/registry.json";

export async function loadTool(slug) {
  const tool = registry.find(t => t.slug === slug);

  if (!tool) {
    document.getElementById("app").innerHTML = "Tool not found";
    return;
  }

  const module = await import(tool.module);
  const ToolComponent = module.Tool;

  const root = document.getElementById("app");
  root.innerHTML = "";
  root.appendChild(ToolComponent());
}
```

---

## 7. Page Structure

### Home Page

- Header
- Hero section
- Tool grid (from registry)

### Tool Page

- Tool rendered directly (no iframe)
- Action buttons:
  - View Repo
  - Download

---

## 8. UI Components

### Tool Card

- Name
- Description
- Launch button → `/tool/{slug}`
- GitHub button

### Header

- Logo
- Theme toggle

---

## 9. Styling System (Tailwind + CSS Variables)

Use your provided theme system exactly as-is in `theme.css`.

### Key Principles

- Themes controlled via `<html class="theme-*">`
- Surface tokens define elevation
- Accent colors remain fixed

### Theme Switcher

```js
export function setTheme(theme) {
  document.documentElement.className = theme;
}
```

---

## 10. Layout Guidelines

### Grid

```
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-4
```

### Spacing

- Sections: `py-16 px-6`
- Cards: `p-6`

### Card Style

- `bg-surface-container`
- `border border-outline-variant`
- Hover:
  - `bg-surface-high`
  - `scale-[1.02]`

---

## 11. Typography

- Headlines: `font-headline`
- Body: `font-body`

### Sizes

- Hero: `text-huge`
- Section titles: `text-3xl`
- Body: `text-base`

---

## 12. Buttons

### Primary

```
bg-primary-container text-on-primary-container
```

### Secondary

```
border border-outline text-on-surface
```

---

## 13. GitHub Integration

### View Repo

```
https://github.com/org/tool-name
```

### Download ZIP

```
https://github.com/org/tool-name/archive/refs/heads/main.zip
```

---

## 14. Multi-Repo vs Monorepo Strategy

### Option A — Monorepo (Recommended)

- All tools live inside `/src/tools`
- Simplest setup
- Direct imports
- Single deployment

### Option B — Multi-Repo (Advanced)

Each tool repo must:
- Export a build as an ES module
- Be hosted via CDN (e.g. jsDelivr)

Example:

```js
const module = await import("https://cdn.jsdelivr.net/gh/org/tool/dist/tool.js");
```

More flexible, but adds complexity.

---

## 15. Performance Considerations

- Load tools only when route is accessed
- Use dynamic imports
- Keep initial bundle minimal

---

## 16. Deployment (GitHub Pages)

### Setup

- Branch: `main`
- Folder: `/docs` or root

### Optional Build (Vite)

```
npm run build
```

---

## 17. Future Enhancements

- Search + filtering
- Tool categories
- Favorites (localStorage)
- Usage analytics

---

## 18. Design Principles

- Modular
- Fast
- Minimal
- Consistent theming
- Developer-first

---

## 19. Required Files to Implement

1. `theme.css` (provided)
2. `index.html`
3. `main.js`
4. `router.js`
5. `registry.json`
6. `Home.js`
7. `ToolPage.js`
8. `ToolCard.js`

---

This version removes iframe usage entirely and standardizes tools as dynamically loaded modules within a single static application.

