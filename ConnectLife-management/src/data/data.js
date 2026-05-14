export const HISENSE = "#00AAA6";

export const markets = [
  {
    code: "SI",
    name: "Slovenia",
    localName: "Slovenija",
    segments: "B2C, B2B, Premium",
    status: "Active",
    updated: "17. 05. 2024 10:21",
    features: {
      "Voice Control": false,
      "Self-Diagnostics": true,
      "Shopping List": true,
      "Wash&Dry Sync": false,
      "Energy Monitoring": true,
      "Smart Recipes": true,
      "Device Sharing": false,
    },
    links: {
      Webshop: "example.si/shop",
      Support: "support.si",
      "Terms & Conditions": "terms.si",
      "Privacy Policy": "privacy.si",
    },
    content: { FAQ: 5, "Suggestions & Ideas": 2, "Tips & Guides": 3, Recipes: 6 },
  },
  {
    code: "DE",
    name: "Germany",
    localName: "Deutschland",
    segments: "B2C, B2B, Premium",
    status: "Active",
    updated: "16. 05. 2024 14:15",
    features: {
      "Voice Control": true,
      "Self-Diagnostics": true,
      "Shopping List": true,
      "Wash&Dry Sync": true,
      "Energy Monitoring": true,
      "Smart Recipes": true,
      "Device Sharing": true,
    },
    links: {
      Webshop: "example.de/shop",
      Support: "support.de",
      "Terms & Conditions": "terms.de",
      "Privacy Policy": "privacy.de",
    },
    content: { FAQ: 8, "Suggestions & Ideas": 4, "Tips & Guides": 6, Recipes: 10 },
  },
  {
    code: "HR",
    name: "Croatia",
    localName: "Hrvatska",
    segments: "B2C",
    status: "Active",
    updated: "15. 05. 2024 09:42",
    features: {
      "Voice Control": true,
      "Self-Diagnostics": true,
      "Shopping List": true,
      "Wash&Dry Sync": false,
      "Energy Monitoring": true,
      "Smart Recipes": false,
      "Device Sharing": true,
    },
    links: {
      Webshop: "example.hr/shop",
      Support: "support.hr",
      "Terms & Conditions": "terms.hr",
      "Privacy Policy": "privacy.hr",
    },
    content: { FAQ: 4, "Suggestions & Ideas": 2, "Tips & Guides": 2, Recipes: 3 },
  },
  {
    code: "AT",
    name: "Austria",
    localName: "Osterreich",
    segments: "B2C, Premium",
    status: "Draft",
    updated: "10. 05. 2024 11:30",
    features: {
      "Voice Control": true,
      "Self-Diagnostics": true,
      "Shopping List": true,
      "Wash&Dry Sync": true,
      "Energy Monitoring": false,
      "Smart Recipes": true,
      "Device Sharing": false,
    },
    links: {
      Webshop: "example.at/shop",
      Support: "support.at",
      "Terms & Conditions": "terms.at",
      "Privacy Policy": "privacy.at",
    },
    content: { FAQ: 3, "Suggestions & Ideas": 2, "Tips & Guides": 4, Recipes: 5 },
  },
];

export const featureNames = Object.keys(markets[0].features);

export const appliances = [
  {
    id: "oven",
    name: "Oven",
    category: "Cooking",
    features: {
      "Remote Start": { SI: true, DE: true, HR: false, AT: true },
      "Voice Control": { SI: false, DE: true, HR: true, AT: true },
      "Smart Recipes": { SI: true, DE: true, HR: false, AT: true },
      "Self-Diagnostics": { SI: true, DE: true, HR: true, AT: true },
      "Energy Monitoring": { SI: true, DE: true, HR: true, AT: false },
    },
  },
  {
    id: "fridge",
    name: "Fridge",
    category: "Cooling",
    features: {
      "Temperature Alerts": { SI: true, DE: true, HR: true, AT: true },
      "Voice Control": { SI: false, DE: true, HR: false, AT: true },
      "Food Inventory": { SI: true, DE: true, HR: false, AT: false },
      "Self-Diagnostics": { SI: true, DE: true, HR: true, AT: true },
      "Energy Monitoring": { SI: true, DE: true, HR: true, AT: true },
    },
  },
  {
    id: "washer",
    name: "Washing Machine",
    category: "Laundry",
    features: {
      "Remote Start": { SI: true, DE: true, HR: true, AT: true },
      "Voice Control": { SI: false, DE: true, HR: false, AT: false },
      "Wash&Dry Sync": { SI: false, DE: true, HR: false, AT: true },
      "Self-Diagnostics": { SI: true, DE: true, HR: true, AT: true },
      "Energy Monitoring": { SI: true, DE: true, HR: true, AT: false },
    },
  },
  {
    id: "dryer",
    name: "Dryer",
    category: "Laundry",
    features: {
      "Remote Start": { SI: true, DE: true, HR: true, AT: true },
      "Voice Control": { SI: false, DE: true, HR: false, AT: false },
      "Wash&Dry Sync": { SI: false, DE: true, HR: false, AT: true },
      "Self-Diagnostics": { SI: true, DE: true, HR: true, AT: true },
      "Energy Monitoring": { SI: false, DE: true, HR: false, AT: false },
    },
  },
  {
    id: "dishwasher",
    name: "Dishwasher",
    category: "Kitchen",
    features: {
      "Remote Start": { SI: true, DE: true, HR: true, AT: true },
      "Voice Control": { SI: false, DE: true, HR: true, AT: true },
      "Auto Program": { SI: true, DE: true, HR: false, AT: true },
      "Self-Diagnostics": { SI: true, DE: true, HR: true, AT: true },
      "Energy Monitoring": { SI: true, DE: true, HR: true, AT: false },
    },
  },
];

export const contentTypes = [
  ["FAQ", "Frequently Asked Questions"],
  ["Suggestions & Ideas", "User suggestions"],
  ["Tips & Guides", "Articles & Tips"],
  ["Recipes", "Smart recipes"],
];

export const activities = [
  ["Updated feature settings", "Voice Control", "Slovenia (SI)", "10:21"],
  ["Created content item", "FAQ", "Deutschland (DE)", "15:33"],
  ["Updated external link", "Webshop", "Hrvatska (HR)", "09:17"],
  ["Updated content item", "Tips & Guides", "Osterreich (AT)", "Yesterday"],
  ["Created market", "Osterreich", "Osterreich (AT)", "2 days ago"],
];

export const users = [
  ["admin@connectlife.com", "Administrator", "All markets", "Active"],
  ["editor@connectlife.com", "Editor", "SI, DE, HR", "Active"],
  ["viewer@connectlife.com", "Viewer", "Read only", "Draft"],
];

export const segments = [
  ["B2C", "Consumer app experience", "SI, DE, HR, AT"],
  ["B2B", "Partner and business features", "SI, DE"],
  ["Premium", "Premium appliance features", "SI, DE, AT"],
];
