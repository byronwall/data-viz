import Papa from "papaparse";
import { DatumObject } from "./LandingPage";

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
      dynamicTyping: true,
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
