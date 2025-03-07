import { Button } from "@/components/ui/button";
import { ExampleData, examples } from "@/demos/examples";
import type { DatumObject } from "@/providers/DataLayerProvider";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { parseCsvData } from "@/utils/csvParser";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CsvUpload } from "./CsvUpload";
import { ExampleSelector } from "./ExampleSelector";
import { PlotManager } from "./PlotManager";

export function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<DatumObject[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [exampleData, setExampleData] = useState<DatumObject[]>([]);

  const exampleId = searchParams.get("example");

  const [example, setExample] = useState<ExampleData | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);

  const hasData = example !== null || isCsvMode;

  const fetchExampleData = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const text = await response.text();
      return await parseCsvData(text);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const handleClearData = () => {
    setSearchParams({});
    setExample(null);
    setIsCsvMode(false);
    setCsvData([]);
    setCsvFileName("");
  };

  const handleExampleSelect = useCallback(
    async (exampleId: string) => {
      setIsLoading(true);
      try {
        setSearchParams({ example: exampleId });
        const example = examples.find((ex) => ex.id === exampleId);
        if (example) {
          const data = await fetchExampleData(example.data);
          setExampleData(data);
          setExample(example);
          setIsCsvMode(false);
          setCsvData([]);
          setCsvFileName("");
        } else {
          toast.error("Example not found");
        }
      } catch (error) {
        toast.error("Failed to load example data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (exampleId) {
      handleExampleSelect(exampleId);
    }
  }, [exampleId, handleExampleSelect]);

  const handleCsvImport = (data: DatumObject[], fileName: string) => {
    setIsCsvMode(true);
    setSearchParams({});
    setExample(null);
    setCsvData(data);
    setCsvFileName(fileName);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center p-8 gap-8">
        {hasData && (
          <Button
            variant="ghost"
            className="absolute top-4 left-[50%] self-start"
            style={{ transform: "translateX(-50%)" }}
            onClick={handleClearData}
          >
            <X className="h-4 w-4" />
            Return to Examples
          </Button>
        )}
        <AnimatePresence mode="wait">
          {!hasData ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl"
            >
              <h1 className="text-3xl font-bold mb-8 text-center">
                Data Visualization Examples
              </h1>
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Import CSV Data
                  </h2>
                  <CsvUpload onImport={handleCsvImport} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Try Example Data
                  </h2>
                  <ExampleSelector onSelect={handleExampleSelect} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="plot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <DataLayerProvider
                data={isCsvMode ? csvData : exampleData}
                savedData={isCsvMode ? undefined : example?.savedData}
              >
                <PlotManager />
              </DataLayerProvider>
            </motion.div>
          )}
        </AnimatePresence>
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
