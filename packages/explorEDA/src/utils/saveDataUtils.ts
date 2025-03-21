import { SavedDataStructure } from "@/types/SavedDataStructure";

export async function saveToClipboard(data: SavedDataStructure): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    console.error("Error saving to clipboard:", error);
    throw new Error("Failed to save data to clipboard");
  }
}

export async function loadFromClipboard(): Promise<SavedDataStructure | null> {
  try {
    const text = await navigator.clipboard.readText();
    const data = JSON.parse(text);
    if (validateSavedData(data)) {
      return migrateDataVersion(data);
    }
    return null;
  } catch (error) {
    console.error("Error loading from clipboard:", error);
    return null;
  }
}

export function validateSavedData(data: unknown): data is SavedDataStructure {
  if (!data || typeof data !== "object") {
    return false;
  }

  const { charts, calculations, gridSettings, metadata, colorScales } =
    data as SavedDataStructure;

  // Validate required properties exist
  if (!charts || !calculations || !gridSettings || !metadata || !colorScales) {
    return false;
  }

  // Validate metadata
  if (
    typeof metadata.name !== "string" ||
    typeof metadata.version !== "number" ||
    typeof metadata.createdAt !== "string" ||
    typeof metadata.modifiedAt !== "string"
  ) {
    return false;
  }

  // Validate gridSettings
  if (
    typeof gridSettings.columnCount !== "number" ||
    typeof gridSettings.rowHeight !== "number" ||
    typeof gridSettings.containerPadding !== "number" ||
    typeof gridSettings.showBackgroundMarkers !== "boolean"
  ) {
    return false;
  }

  // Basic array checks
  if (
    !Array.isArray(charts) ||
    !Array.isArray(calculations) ||
    !Array.isArray(colorScales)
  ) {
    return false;
  }

  return true;
}

export function migrateDataVersion(
  data: SavedDataStructure
): SavedDataStructure {
  // Currently we only have version 1, so no migration needed
  // This function will be expanded when we add new versions
  return data;
}

export async function saveRawDataToClipboard(data: unknown): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    console.error("Error saving raw data to clipboard:", error);
    throw new Error("Failed to save raw data to clipboard");
  }
}
