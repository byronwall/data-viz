import { ExampleData, examples } from "@/demos/examples";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ExampleSelector } from "./ExampleSelector";
import { PlotManager } from "./PlotManager";

export function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);

  // Handle example selection from URL
  const exampleId = searchParams.get("example");
  const selectedExample = exampleId
    ? examples.find((ex) => ex.id === exampleId)
    : null;

  const [example, setExample] = useState<ExampleData | null>(null);

  const hasData = selectedExample !== null;

  const handleExampleSelect = async (exampleId: string) => {
    setIsLoading(true);
    setSearchParams({ example: exampleId });
    const example = examples.find((ex) => ex.id === exampleId);
    if (example) {
      setExample(example);
    } else {
      toast.error("Example not found");
    }
    setIsLoading(false);
  };

  // Handle invalid example IDs in URL
  useEffect(() => {
    if (exampleId && !selectedExample) {
      toast.error("Invalid example ID");
      setSearchParams({});
    }
  }, [exampleId, selectedExample, setSearchParams]);

  return (
    <div className="flex flex-col items-center p-8 gap-8">
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
            <ExampleSelector onSelect={handleExampleSelect} />
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
              data={example?.data}
              savedData={example?.savedData}
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
  );
}
