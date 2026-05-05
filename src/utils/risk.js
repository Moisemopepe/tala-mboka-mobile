export const riskLevels = [
  { key: "danger", label: "Urgent", shortLabel: "Urgent", color: "#dc2626", bg: "#fee2e2", icon: "alert-circle" },
  { key: "critique", label: "Important", shortLabel: "Important", color: "#f97316", bg: "#ffedd5", icon: "warning" },
  { key: "suivi", label: "À surveiller", shortLabel: "Suivi", color: "#ca8a04", bg: "#fef9c3", icon: "time" },
  { key: "resolved", label: "Résolu", shortLabel: "Résolu", color: "#16a34a", bg: "#dcfce7", icon: "checkmark-circle" }
];

export function normalizeRisk(value) {
  if (value === "approved" || value === "pending") return "suivi";
  if (value === "in_progress") return "critique";
  if (value === "resolved") return "resolved";
  return riskLevels.some((risk) => risk.key === value) ? value : "suivi";
}

export function riskMeta(value) {
  const normalized = normalizeRisk(value);
  return riskLevels.find((risk) => risk.key === normalized) || riskLevels[2];
}
