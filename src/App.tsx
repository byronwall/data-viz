import { AppContent } from "./AppContent";
import { demoData, demoSettings } from "./hooks/useDemoCrossfilter";
import { DataLayerProvider } from "./providers/DataLayerProvider";

function App() {
  return (
    <DataLayerProvider data={demoData} charts={demoSettings}>
      <AppContent />
    </DataLayerProvider>
  );
}

export default App;
