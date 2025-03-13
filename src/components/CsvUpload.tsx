import { Button } from "@/components/ui/button";
import type { DatumObject } from "@/providers/DataLayerProvider";
import { parseCsvData } from "@/utils/csvParser";
import { parseJsonData } from "@/utils/jsonParser";
import { Plus, Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface CsvUploadProps {
  compact?: boolean;
  onImport?: (data: DatumObject[], fileName: string) => void;
}

export function CsvUpload({ compact = false, onImport }: CsvUploadProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      try {
        let data: DatumObject[];
        if (file.name.toLowerCase().endsWith(".csv")) {
          data = await parseCsvData(file);
        } else if (file.name.toLowerCase().endsWith(".json")) {
          data = await parseJsonData(file);
        } else {
          throw new Error("Unsupported file type");
        }
        onImport?.(data, file.name);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error(
          `Failed to parse ${file.name.toLowerCase().endsWith(".csv") ? "CSV" : "JSON"} file`
        );
      }
    },
    [onImport]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
    multiple: false,
  });

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onImport?.([], "")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Import
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p>Drop the CSV file here...</p>
      ) : (
        <p>Drag and drop a CSV file here, or click to select one</p>
      )}
    </div>
  );
}
