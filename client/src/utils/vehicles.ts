import { Document } from "@/types";

export const docsTypesFrechText: Record<Document["documentType"], string> = {
  ACF: "ACF",
  BLUE_CARD: "Carte bleue",
  INSURANCE: "Assurance",
  LICENSE: "Permis",
  TECHNICAL_VISIT: "Visite technique",
  GRAY_CARD: "Carte grise",
};

export const expenseCategoriesFrText = {
  FUEL: "Carburant",
  TOLL: "Frais de route",
  MAINTENANCE: "Entretien ou Reparation",
  MISC: "Divers",
  WEIGHBRIDGE: "Pont bascule",
};

export const expenseCategories = [
  "FUEL",
  "TOLL",
  "MAINTENANCE",
  "MISC",
  "WEIGHBRIDGE",
] as const;