import { CatalogCategory } from "@/lib/server/models/CatalogCategory";
import { buildFluxPrompt } from "@/lib/server/bfl/promptBuilder";

export async function resolveCatalogPromptCommand(
  styleId: string,
  categoryId?: string | null
): Promise<string | null> {
  if (categoryId) {
    const doc = await CatalogCategory.findOne({ categoryId }).lean();
    const item = doc?.items?.find((i) => i.id === styleId);
    if (item?.promptCommand) return item.promptCommand;
  }

  const hit = await CatalogCategory.findOne({ "items.id": styleId }).lean();
  const item = hit?.items?.find((i) => i.id === styleId);
  return item?.promptCommand ?? null;
}

export function buildTryOnBflPrompt(
  promptCommand: string | null | undefined,
  hasReferenceStyle: boolean
): string {
  const raw = promptCommand?.trim() ?? "";
  if (!raw) return buildFluxPrompt("", { hasReferenceStyle });
  if (raw.startsWith("COMMAND:")) return buildFluxPrompt(raw, { hasReferenceStyle });
  return raw;
}
