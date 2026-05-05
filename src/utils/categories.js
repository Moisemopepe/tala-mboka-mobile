export const categories = [
  { key: "residential", label: "Residential", icon: "home-outline", color: "#2563eb" },
  { key: "commercial", label: "Commercial", icon: "storefront-outline", color: "#9333ea" },
  { key: "government", label: "Government", icon: "business-outline", color: "#0f766e" },
  { key: "utility", label: "Utilities", icon: "flash-outline", color: "#eab308" },
  { key: "transport", label: "Transport", icon: "bus-outline", color: "#f97316" },
  { key: "communication", label: "Communication", icon: "radio-outline", color: "#7c3aed" },
  { key: "health", label: "Health", icon: "medical-outline", color: "#dc2626" },
  { key: "education", label: "Education", icon: "school-outline", color: "#0891b2" },
  { key: "public_space", label: "Public space", icon: "people-outline", color: "#0ea5e9" },
  { key: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline", color: "#64748b" }
];

export const crisisTypes = [
  { key: "flood", label: "Flood" },
  { key: "earthquake", label: "Earthquake" },
  { key: "conflict", label: "Conflict" },
  { key: "fire", label: "Fire" },
  { key: "explosion", label: "Explosion" },
  { key: "chemical_incident", label: "Chemical incident" },
  { key: "other", label: "Other" }
];

export const damageLevels = [
  { key: "minimal", label: "Minimal / no damage" },
  { key: "partial", label: "Partially damaged" },
  { key: "complete", label: "Completely damaged" }
];

export function categoryByKey(key) {
  return categories.find((category) => category.key === key) || categories[categories.length - 1];
}

export function categoryLabel(key) {
  return categoryByKey(key).label;
}
