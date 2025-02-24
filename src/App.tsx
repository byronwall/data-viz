import { AppContent } from "./AppContent";
import { demoData } from "./hooks/useDemoCrossfilter";
import { DataLayerProvider } from "./providers/DataLayerProvider";

function App() {
  return (
    <DataLayerProvider data={demoData}>
      <AppContent />
    </DataLayerProvider>
  );
}

export default App;
