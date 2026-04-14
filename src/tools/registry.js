// Single source of truth for all tools.
// Add a new entry here to register a new tool.
const registry = [
  {
    name: "Route Optimizer",
    slug: "route-optimizer",
    description: "Add your service stops and get the most efficient order using a nearest-neighbor algorithm — no API key required.",
    repo: "https://github.com/netc-labs/route-optimizer",
    tags: ["logistics", "routing"],
    previewType: "form"
  },
  {
    name: "CSV Formatter",
    slug: "csv-formatter",
    description: "Paste raw CSV data to instantly preview it as a clean table, then download the cleaned file.",
    repo: "https://github.com/netc-labs/csv-formatter",
    tags: ["data", "csv"],
    previewType: "table"
  },
  {
    name: "Unit Converter",
    slug: "unit-converter",
    description: "Convert between length, weight, temperature, volume, and speed units in real time.",
    repo: "https://github.com/netc-labs/unit-converter",
    tags: ["utilities", "math"],
    previewType: "converter"
  }
];

export default registry;
