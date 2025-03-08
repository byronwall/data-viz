import Papa from "papaparse";
import type { DatumObject } from "@/providers/DataLayerProvider";

export async function parseCsvData(
  input: string | File
): Promise<DatumObject[]> {
  return new Promise((resolve, reject) => {
    const baseConfig = {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<DatumObject>) => {
        resolve(results.data);
      },
    };

    try {
      if (input instanceof File) {
        Papa.parse<DatumObject>(input, baseConfig);
      } else {
        Papa.parse<DatumObject>(input, {
          ...baseConfig,
          download: false,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}
