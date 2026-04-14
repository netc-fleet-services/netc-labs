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
  }
];

export default registry;
