export const categories = [
  { key: "road", label: "Route", icon: "🛣️", color: "#2563eb" },
  { key: "water", label: "Eau", icon: "💧", color: "#0ea5e9" },
  { key: "electricity", label: "Électricité", icon: "⚡", color: "#eab308" },
  { key: "waste", label: "Salubrité", icon: "♻️", color: "#16a34a" },
  { key: "security", label: "Insécurité", icon: "🛡️", color: "#ef4444" },
  { key: "fraud", label: "Escroquerie", icon: "⚠️", color: "#9333ea" },
  { key: "kidnapping", label: "Autre", icon: "?", color: "#64748b" }
];

export function categoryLabel(key) {
  return categories.find((category) => category.key === key)?.label || key;
}
