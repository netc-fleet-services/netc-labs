# Adding a Tool to NETC Labs

This guide explains how to add a new tool to the NETC Labs hub — from registering it, to building the card preview, to wiring up the live tool embed. Follow every step in order.

---

## How the hub works

Each tool lives in its **own GitHub repository** under the `netc-fleet-services` org. The hub (`netc-labs`) never copies tool code — it loads tools at runtime from the jsDelivr CDN. Three files are involved:

```
netc-labs/src/tools/registry.js     ← tells the hub the tool exists
netc-labs/src/components/ToolCard.js ← draws the card preview thumbnail
your-tool-repo/hub/Tool.js          ← the live tool, loaded via CDN
```

When a user opens the hub:
1. `registry.js` is read — one entry per tool.
2. A card is rendered for each entry using `ToolCard.js`. The preview thumbnail is a static HTML/SVG mockup — **no live data, no network calls**.
3. When the user clicks "Launch Tool", `ToolPage.js` dynamically imports `hub/Tool.js` from jsDelivr and mounts it.

---

## Step 1 — Register the tool in registry.js

Open [`src/tools/registry.js`](src/tools/registry.js) and add an entry to the array.

```js
{
  name: "My New Tool",
  slug: "my-tool-repo-name",          // must match the GitHub repo name exactly
  description: "One or two sentences. What does it do, what data does it need, what does it output.",
  repo: "https://github.com/netc-fleet-services/my-tool-repo-name",
  module: "https://cdn.jsdelivr.net/gh/netc-fleet-services/my-tool-repo-name@main/hub/Tool.js",
  tags: ["fleet", "finance"],         // 2–3 short lowercase tags
  previewType: "my-tool"              // unique key — you'll use this in ToolCard.js
}
```

### Field rules

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Title-cased display name shown on the card |
| `slug` | yes | Exact GitHub repo name. Used in the URL hash: `#/tool/<slug>` |
| `description` | yes | Keep it under ~200 characters — it wraps inside the card |
| `repo` | yes | Full GitHub URL — drives the "GitHub" button and the download ZIP link |
| `module` | yes | jsDelivr CDN URL pointing to `hub/Tool.js` on the `main` branch |
| `tags` | yes | Short lowercase strings shown as pills on the card. Use existing tags when possible |
| `previewType` | yes | Arbitrary string key that `ToolCard.js` uses to pick the right thumbnail |

**Do not change existing entries.** Each slug is part of the public URL — changing one breaks any link someone has bookmarked.

---

## Step 2 — Add the card preview thumbnail

Open [`src/components/ToolCard.js`](src/components/ToolCard.js) and find the `buildPreview(tool)` switch statement. Add a new `case` before `default`:

```js
case 'my-tool':
  return `
    <div class="preview-mockup">
      <!-- your thumbnail HTML here -->
    </div>`;
```

### What the preview must and must not do

**Must:**
- Be a static HTML/SVG snapshot — no JavaScript, no network calls, no imports
- Use only CSS variables for color so it adapts to light/dark theme (see reference below)
- Visually communicate what kind of output the tool produces (a chart, a table, a status board, etc.)
- Fit inside a `148px` tall container with `1.25rem` padding on all sides

**Must not:**
- Show any real vehicle IDs, driver names, VINs, dollar amounts, or any other data from actual operations
- Make any `fetch()` or `import()` calls
- Use hardcoded colors (use CSS variables instead — they flip automatically in light mode)
- Include `<script>` tags

### CSS variables for the preview

All colors come from CSS variables defined in `src/styles/theme.css`. They switch automatically between dark and light mode — never use hex codes directly.

| Variable | Use it for |
|---|---|
| `var(--surface)` | Page background |
| `var(--surface-container)` | Card / panel background |
| `var(--surface-high)` | Elevated surfaces, input backgrounds |
| `var(--on-surface)` | Primary text |
| `var(--on-surface-muted)` | Secondary text, labels |
| `var(--outline)` | Borders, dividers |
| `var(--outline-variant)` | Subtle borders, skeleton bars |
| `var(--primary)` | Accent color (amber/gold) |
| `var(--primary-container)` | Button fills, highlighted cells |
| `var(--on-primary-container)` | Text that sits on a primary-container background |

### Ready-made CSS classes for mockup elements

These classes are already defined in `src/styles/theme.css` — use them before writing custom styles.

| Class | Renders as |
|---|---|
| `preview-mockup` | Full-width flex column container. Always the outermost wrapper. |
| `mockup-row` | Horizontal flex row with a small gap |
| `mockup-field` | A skeleton bar — short opaque rectangle representing a text field or cell |
| `mockup-btn` | A small button-shaped rectangle in `--primary-container` |
| `mockup-chip` | Pill-shaped label (like a tag or status badge) |
| `mockup-table-header` | Row of cells using `--primary-container` to look like a table header |
| `mockup-table-row` | Row of cells using `--outline` to look like a data row |
| `mockup-result-box` | Monospace output box in `--primary` color — good for showing a recommendation or computed result |

### Preview pattern examples

**Chart (line graph):** Use an inline SVG. Draw lines with `stroke` set to hardcoded semantic colors (`#5B89D6` for a declining line, `#C2410C` for a rising cost line) or CSS variables. Keep the SVG simple — 2–3 paths maximum.

**Table:** Stack a `mockup-table-header` row followed by 3–4 `mockup-table-row` rows. Vary column widths using `flex` values. Optionally add colored dots at the end of rows to represent a status column.

**Status board:** Stack 2–3 colored bands (green/amber/red) as `<div>` blocks with `rgba(...)` backgrounds and matching borders. Each band gets a dot and a skeleton label bar. This is what the maintenance-tracker preview uses.

**Input form:** One or two `mockup-field` bars (representing inputs), a `mockup-btn`, and a `mockup-result-box` at the bottom showing a placeholder result string.

---

## Step 3 — Build hub/Tool.js in your tool's repo

This is the file that actually runs inside the hub when a user clicks "Launch Tool". It must live at `hub/Tool.js` in your tool repo's root.

### The contract

```js
// hub/Tool.js
export function Tool() {
  const el = document.createElement('div');
  // ... build your UI inside el ...
  return el;  // must return a DOM element
}
```

The hub calls `Tool()` and appends the returned element into the page. That's the entire interface.

### Rules

**1. Export a function named `Tool()` that returns a DOM element.**
No default export. No class. No async function. Synchronous construction only — use event listeners and dynamic rendering for anything that needs to wait.

**2. Prefix every element ID with a short unique namespace.**
The hub can have multiple tools on the same page in the future. If you use `id="result"` and another tool does too, they'll collide.
```js
// Bad
document.getElementById('result')

// Good — namespace with your tool slug
el.querySelector('#mt-result')   // maintenance-tracker
el.querySelector('#pit-table')   // driver-inspections
el.querySelector('#fsm-chart')   // fleet-swap-model
```

**3. Inject styles as a `<style>` element inside `el`, not as a separate stylesheet.**
The hub loads your file as a JS module — it has no way to load your `styles.css`. Put all scoped CSS into a `<style>` tag and append it to `el` first.
```js
const style = document.createElement('style');
style.textContent = `
  .mytool-input { ... }
  .mytool-btn   { ... }
`;
el.appendChild(style);
```

**4. Use CSS variables for all colors.**
Your tool is mounted inside the hub's `<body>`, so the hub's CSS variables are available. Never hardcode hex colors — the tool must look correct in both dark and light mode.

**5. Use only mock / synthetic data — never real operational data.**
See the full data safety rules in the section below.

**6. Relative imports from `../lib/` are allowed and encouraged.**
When loaded via jsDelivr, a relative import like `import { calculate } from '../lib/model.js'` resolves correctly against the CDN base URL. Keep all business logic in `lib/` and import it from both `hub/Tool.js` and your standalone `index.html`. This is the correct architecture — do not duplicate logic.

**7. External CDN scripts must be loaded dynamically, not as ES module imports.**
If you need a library (like SheetJS), inject it as a `<script>` tag at runtime rather than using `import`:
```js
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
    s.onload  = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error('Failed to load SheetJS'));
    document.head.appendChild(s);
  });
}
```
This avoids MIME-type and CORS issues that occur when dynamically importing `.mjs` bundles from CDNs.

### Reusing hub CSS classes in your tool

The hub's global stylesheet (`src/styles/theme.css`) is always loaded when your tool runs. You can use these classes directly in your tool's HTML without redefining them:

| Class | Use |
|---|---|
| `btn-primary` | Primary action button (amber fill) |
| `btn-secondary` | Secondary / outline button |
| `tool-input` | Standard text input |
| `tool-select` | Styled `<select>` dropdown |
| `tool-label` | All-caps small label above an input |
| `tool-section-title` | Section divider label |
| `tool-result-box` | Monospace output box |
| `tool-error` | Red-tinted error message box |
| `tag` | Pill-shaped tag badge |
| `font-headline` | Inter font at display weight |
| `text-on-surface` | Primary text color |
| `text-on-surface-muted` | Secondary text color |
| `text-primary` | Accent color text |
| `text-error` | Error-state text |

### Starter template

Copy `tool-template/hub/Tool.js` from this repo as your starting point. It includes the correct export signature, a style injection block, and working examples of the most common UI patterns.

---

## Step 4 — Data safety: mock data only

The hub is a **public website**. Any data that appears in a tool preview or in the hub embed is visible to anyone with the URL. Never put real operational data into `hub/Tool.js`.

### What counts as real data

- Real vehicle unit numbers, VINs, license plates
- Real driver names, employee IDs, or any PII
- Real dollar amounts, cost figures, or financial data
- Real locations, route stops, or customer addresses
- Any value copied directly from a Grist table, Towbook export, or internal spreadsheet

### What to use instead

**Synthetic records:** Invent plausible-sounding but entirely fictional data. Use generic unit numbers (`T-101`, `T-102`), common placeholder names (`J. Martinez`, `K. Williams`), round dollar figures, and generic locations.

**Aggregated / anonymized values:** If the tool shows a chart or summary metric, use values that look realistic but don't correspond to any real record. Round everything to the nearest $100 or 10%.

**Upload-based tools:** If the tool processes a user-uploaded file (like the Pre-Trip Compliance Audit), there is no embedded data at all — the user supplies their own file at runtime. This is the cleanest architecture: no mock data needed, no risk of exposure.

**Clearly fictional framing:** If mock records are visible, use model numbers or placeholder text that makes it obvious the data is an example (`Unit T-101 (example)`, `Sample driver`).

### Checklist before pushing hub/Tool.js

- [ ] No real VINs, unit numbers, or license plates
- [ ] No real names or employee identifiers
- [ ] No real dollar amounts from actual invoices or cost tracking
- [ ] No Supabase URLs, API keys, or auth tokens in the file
- [ ] No `import.meta.env` references or environment variable reads
- [ ] All colors use CSS variables, not hex codes
- [ ] All element IDs are namespaced with a short prefix
- [ ] File exports a function named `Tool()` that returns a DOM element

---

## Step 5 — Add the CDN cache purge workflow

When you push a change to `hub/Tool.js`, jsDelivr's cache can take up to 24 hours to expire on its own. Add the purge workflow so the hub always gets the latest version within seconds of a push.

Copy `tool-template/.github/workflows/sync-hub.yml` into your tool repo at the same path:

```
your-tool-repo/.github/workflows/sync-hub.yml
```

No configuration needed — the workflow reads the repo name automatically from the GitHub Actions context. It fires only when `hub/Tool.js` changes on `main`, so it won't run on every push.

---

## Step 6 — Push and verify

### In your tool repo

```bash
git add hub/Tool.js .github/workflows/sync-hub.yml
git commit -m "Add hub integration"
git push origin main
```

Verify the CDN is serving your file by opening this URL in a browser (replace with your repo name):
```
https://cdn.jsdelivr.net/gh/netc-fleet-services/your-tool-repo-name@main/hub/Tool.js
```

If you see a cached old version, manually trigger a purge:
```
https://purge.jsdelivr.net/gh/netc-fleet-services/your-tool-repo-name@main/hub/Tool.js
```

### In netc-labs

```bash
git add src/tools/registry.js src/components/ToolCard.js
git commit -m "Add your-tool-name to hub registry and card preview"
git push origin main
```

GitHub Pages redeploys automatically. Wait 1–2 minutes, then hard-refresh the hub (`Ctrl+Shift+R`). Your card should appear in the tool grid, and clicking "Launch Tool" should load the live embed.

### Confirming it works

1. The card appears in the grid with the correct name, tags, and thumbnail
2. Clicking "GitHub" opens the correct repo URL
3. Clicking "Launch Tool" navigates to `#/tool/your-slug` and loads the tool without errors
4. The tool renders correctly in both dark and light mode (use the toggle in the header)
5. The browser console shows no errors (warnings about the Tailwind CDN are expected and harmless)

---

## File map

```
netc-labs/
├── index.html                          Entry point. One <script type="module"> — no build step.
├── src/
│   ├── main.js                         Bootstraps the router on load and hashchange.
│   ├── router.js                       Routes #/ → Home, #/tool/<slug> → ToolPage.
│   ├── styles/
│   │   └── theme.css                   All CSS variables, utility classes, and component styles.
│   ├── components/
│   │   ├── Header.js                   Sticky nav bar with theme toggle.
│   │   ├── ThemeToggle.js              Light/dark toggle — persists to localStorage.
│   │   └── ToolCard.js                 Card component + buildPreview() switch statement.
│   ├── pages/
│   │   ├── Home.js                     Hero section + tool grid. Iterates registry.
│   │   └── ToolPage.js                 Full-page tool view. Dynamically imports hub/Tool.js.
│   └── tools/
│       └── registry.js                 Single source of truth. Add new tools here.
└── tool-template/
    ├── hub/
    │   └── Tool.js                     Starter template — copy into your tool repo.
    └── .github/workflows/
        └── sync-hub.yml                CDN purge workflow — copy into your tool repo.
```

---

## Quick-start checklist

When adding a new tool, complete these steps in order:

- [ ] Tool repo exists at `github.com/netc-fleet-services/<slug>` and is **public**
- [ ] `hub/Tool.js` exists in the tool repo and exports `function Tool() { return el; }`
- [ ] `hub/Tool.js` passes the data safety checklist above
- [ ] `.github/workflows/sync-hub.yml` is in the tool repo
- [ ] New entry added to `src/tools/registry.js` with all fields filled in
- [ ] New `case` added to `buildPreview()` in `src/components/ToolCard.js`
- [ ] CDN URL verified in browser before opening a PR
- [ ] Preview thumbnail tested in both dark and light mode
- [ ] Changes committed and pushed to `main` in netc-labs
- [ ] Live hub checked after Pages redeploys
