import type { DatumObject } from "@/providers/DataLayerProvider";

function flattenObject(obj: any, prefix = ""): DatumObject {
  return Object.keys(obj).reduce((acc: DatumObject, key: string) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      // Handle arrays - only process up to 3 items if they are objects
      value.slice(0, 3).forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          const arrayFlattened = flattenObject(item, `${newKey}[${index}]`);
          Object.assign(acc, arrayFlattened);
        } else {
          acc[`${newKey}[${index}]`] = item;
        }
      });
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects
      Object.assign(acc, flattenObject(value, newKey));
    } else {
      // Handle primitive values
      acc[newKey] = value;
    }

    return acc;
  }, {});
}

export async function parseJsonData(file: File): Promise<DatumObject[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        // Handle both array and single object inputs
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

        // Convert each object to flattened format
        const flattenedData = dataArray.map((item) => flattenObject(item));

        resolve(flattenedData);
      } catch (error) {
        reject(new Error("Failed to parse JSON file"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
