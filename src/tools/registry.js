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
  }
];

export default registry;
