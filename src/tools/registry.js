// Single source of truth for all tools.
// Add a new entry here to register a new tool.
const registry = [
  {
    name: "Fleet Swap Model",
    slug: "fleet-swap-model",
    description: "Analyze whether to keep or replace a fleet vehicle. Input age, mileage, and cost data to get a data-driven swap recommendation.",
    repo: "https://github.com/netc-fleet-services/fleet-swap-model",
    // Points to hub/Tool.js inside the tool's own repo, served via jsDelivr CDN.
    // Update this URL when the tool moves to a new branch or version tag.
    module: "https://cdn.jsdelivr.net/gh/netc-fleet-services/fleet-swap-model@main/hub/Tool.js",
    tags: ["fleet", "finance"],
    previewType: "fleet-swap"
  },
  {
    name: "Pre-Trip Compliance Audit",
    slug: "driver-inspections-tracker",
    description: "Upload Towbook Driver Activity and PreTrip Inspections exports to calculate required vs. completed inspections per driver, with search, sort, and Excel export.",
    repo: "https://github.com/netc-fleet-services/driver-inspections-tracker",
    // Points to hub/Tool.js inside the tool's own repo, served via jsDelivr CDN.
    module: "https://cdn.jsdelivr.net/gh/netc-fleet-services/driver-inspections-tracker@main/hub/Tool.js",
    tags: ["compliance", "inspections", "drivers"],
    previewType: "driver-inspections"
  },
  {
    name: "Fleet Maintenance Tracker",
    slug: "maintenance-tracker",
    description: "Track fleet vehicle status across Ready, Known Issues, and Out of Service states. Log driver notes, mechanic notes, PM due dates, and waiting-on status in one dashboard.",
    repo: "https://github.com/netc-fleet-services/maintenance-tracker",
    // Points to hub/Tool.js inside the tool's own repo, served via jsDelivr CDN.
    module: "https://cdn.jsdelivr.net/gh/netc-fleet-services/maintenance-tracker@main/hub/Tool.js",
    tags: ["fleet", "maintenance", "status"],
    previewType: "maintenance-tracker"
  },
  {
    name: "Driver Scheduler",
    slug: "irh-driver-scheduler",
    description: "Weekly driver scheduling grid. Click any day to set a shift or mark off-time, track coverage per day, and copy schedules week-to-week. Demo runs in your browser; the full multi-dispatcher version with realtime sync lives in the linked repo.",
    repo: "https://github.com/netc-fleet-services/irh-driver-scheduler",
    // Points to hub/Tool.js inside the tool's own repo, served via jsDelivr CDN.
    module: "https://cdn.jsdelivr.net/gh/netc-fleet-services/irh-driver-scheduler@main/hub/Tool.js",
    tags: ["scheduling", "drivers", "realtime"],
    previewType: "irh-driver-scheduler"
  },

  // ── Internal platform apps ────────────────────────────────────────────────
  // These are full authenticated Next.js apps that live in the netcfs-platform
  // monorepo. They load a local mock preview via src/tools/<slug>/Tool.js.

  {
    name: "Dispatch Board",
    slug: "dispatch-board",
    description: "Live job scheduling and driver assignment for the towing fleet. Drag-and-drop job cards, route optimization, stacking suggestions, and shift coverage tracking.",
    repo: "https://github.com/netc-fleet-services/netcfs-platform/tree/main/apps/transport",
    appType: "internal",
    tags: ["dispatch", "jobs", "drivers"],
    previewType: "dispatch-board"
  },
  {
    name: "Impound Tracker",
    slug: "impound-tracker",
    description: "Inventory management for impounded vehicles. Tracks aging, estimated value, disposition status (scrap vs. sell), and integrates with TowBook for photo uploads.",
    repo: "https://github.com/netc-fleet-services/netcfs-platform/tree/main/apps/impounds",
    appType: "internal",
    tags: ["impounds", "inventory", "finance"],
    previewType: "impound-tracker"
  },
  {
    name: "Statement Reconciler",
    slug: "statement-reconciler",
    description: "Upload vendor PDF statements and QuickBooks exports to automatically match charges, surface discrepancies, and generate a variance report — across 30+ vendors.",
    repo: "https://github.com/netc-fleet-services/netcfs-platform/tree/main/apps/statement-reconciler",
    appType: "internal",
    tags: ["finance", "reconciliation", "vendors"],
    previewType: "statement-reconciler"
  },
  {
    name: "Quote Calculator",
    slug: "quote-calculator",
    description: "Generate towing quotes with live GraphHopper routing, fuel surcharge calculation, and PDF export. Covers road service, light duty, heavy duty, and transport services.",
    repo: "https://github.com/netc-fleet-services/netcfs-platform/tree/main/apps/quote-calculator",
    appType: "internal",
    tags: ["quotes", "routing", "finance"],
    previewType: "quote-calculator"
  },
  {
    name: "Fullbay WIP",
    slug: "fullbay-wip",
    description: "Weekly Work-In-Progress snapshot of open Fullbay service orders, broken down by shop with cost totals. Exports summary and detail spreadsheets on demand.",
    repo: "https://github.com/netc-fleet-services/netcfs-platform/tree/main/apps/fullbay-wip",
    appType: "internal",
    tags: ["fullbay", "shop", "reports"],
    previewType: "fullbay-wip"
  }
];

export default registry;
