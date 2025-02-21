import { Button } from "@/components/ui/button";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { DatumObject } from "@/providers/DataLayerProvider";
import { Plus, Upload } from "lucide-react";
import Papa from "papaparse";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface CsvUploadProps {
  compact?: boolean;
}

export function CsvUpload({ compact = false }: CsvUploadProps) {
  const setData = useDataLayer((state) => state.setData);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      Papa.parse(file, {
        complete: (results) => {
          setData(results.data as DatumObject[], file.name);
        },
        header: true,
        skipEmptyLines: true,
      });
    },
    [setData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleClear = () => {
    setData([], undefined);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
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
