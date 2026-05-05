export const categories = [
  { key: "road", label: "Route", icon: "trail-sign-outline", color: "#2563eb" },
  { key: "water", label: "Eau", icon: "water-outline", color: "#0ea5e9" },
  { key: "electricity", label: "Électricité", icon: "flash-outline", color: "#eab308" },
  { key: "waste", label: "Salubrité", icon: "trash-outline", color: "#16a34a" },
  { key: "security", label: "Insécurité", icon: "shield-outline", color: "#ef4444" },
  { key: "fraud", label: "Escroquerie", icon: "warning-outline", color: "#9333ea" },
  { key: "kidnapping", label: "Enlèvement", icon: "alert-circle-outline", color: "#be123c" },
  { key: "other", label: "Autre", icon: "ellipsis-horizontal-circle-outline", color: "#64748b" }
];

export function categoryByKey(key) {
  return categories.find((category) => category.key === key) || categories[categories.length - 1];
}

export function categoryLabel(key) {
  return categoryByKey(key).label;
}
