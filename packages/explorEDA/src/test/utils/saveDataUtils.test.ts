import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveToClipboard,
  loadFromClipboard,
  validateSavedData,
  migrateDataVersion,
} from "@/utils/saveDataUtils";
import { SavedDataStructure } from "@/types/SavedDataStructure";

describe("saveDataUtils", () => {
  const mockValidData: SavedDataStructure = {
    charts: [],
    calculations: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 30,
      containerPadding: 10,
      showBackgroundMarkers: true,
    },
    metadata: {
      name: "Test View",
      version: 1,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    colorScales: [],
  };

  describe("validateSavedData", () => {
    it("should return true for valid data", () => {
      expect(validateSavedData(mockValidData)).toBe(true);
    });

    it("should return false for null or undefined", () => {
      expect(validateSavedData(null)).toBe(false);
      expect(validateSavedData(undefined)).toBe(false);
    });

    it("should return false for non-object data", () => {
      expect(validateSavedData("string")).toBe(false);
      expect(validateSavedData(123)).toBe(false);
      expect(validateSavedData([])).toBe(false);
    });

    it("should return false for missing required properties", () => {
      const invalidData = { ...mockValidData };
      delete (invalidData as any).charts;
      expect(validateSavedData(invalidData)).toBe(false);
    });

    it("should return false for invalid metadata types", () => {
      const invalidData = {
        ...mockValidData,
        metadata: {
          ...mockValidData.metadata,
          version: "1" as any,
        },
      };
      expect(validateSavedData(invalidData)).toBe(false);
    });

    it("should return false for invalid gridSettings types", () => {
      const invalidData = {
        ...mockValidData,
        gridSettings: {
          ...mockValidData.gridSettings,
          columnCount: "12" as any,
        },
      };
      expect(validateSavedData(invalidData)).toBe(false);
    });
  });

  describe("saveToClipboard", () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(),
        },
      });
    });

    it("should write JSON string to clipboard", async () => {
      await saveToClipboard(mockValidData);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(mockValidData)
      );
    });

    it("should throw error when clipboard write fails", async () => {
      (navigator.clipboard.writeText as any).mockRejectedValue(
        new Error("Clipboard error")
      );
      await expect(saveToClipboard(mockValidData)).rejects.toThrow(
        "Failed to save data to clipboard"
      );
    });
  });

  describe("loadFromClipboard", () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          readText: vi.fn(),
        },
      });
    });

    it("should return parsed data when clipboard contains valid JSON", async () => {
      (navigator.clipboard.readText as any).mockResolvedValue(
        JSON.stringify(mockValidData)
      );
      const result = await loadFromClipboard();
      expect(result).toEqual(mockValidData);
    });

    it("should return null when clipboard contains invalid JSON", async () => {
      (navigator.clipboard.readText as any).mockResolvedValue("invalid json");
      const result = await loadFromClipboard();
      expect(result).toBeNull();
    });

    it("should return null when clipboard contains invalid data structure", async () => {
      (navigator.clipboard.readText as any).mockResolvedValue(
        JSON.stringify({ invalid: "data" })
      );
      const result = await loadFromClipboard();
      expect(result).toBeNull();
    });
  });

  describe("migrateDataVersion", () => {
    it("should return data unchanged for current version", () => {
      const result = migrateDataVersion(mockValidData);
      expect(result).toEqual(mockValidData);
    });
  });
});
