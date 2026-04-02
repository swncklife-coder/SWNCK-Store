export type PdpTemplate = {
  layout: "split" | "stacked";
  imagePosition: "left" | "right";
  showSustainability: boolean;
  showCare: boolean;
  showFitNotes: boolean;
  variantPickerStyle: "select" | "buttons";
};

export const DEFAULT_PDP_TEMPLATE: PdpTemplate = {
  layout: "split",
  imagePosition: "left",
  showSustainability: true,
  showCare: true,
  showFitNotes: true,
  variantPickerStyle: "select",
};

export function parsePdpTemplate(raw: string | null | undefined): PdpTemplate {
  if (!raw) return { ...DEFAULT_PDP_TEMPLATE };
  try {
    const parsed = JSON.parse(raw) as Partial<PdpTemplate>;
    return { ...DEFAULT_PDP_TEMPLATE, ...parsed };
  } catch {
    return { ...DEFAULT_PDP_TEMPLATE };
  }
}
