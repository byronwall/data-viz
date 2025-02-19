import "./App.css";
import { AppContent } from "./AppContent";
import { demoData, useDemoCrossfilter } from "./hooks/useDemoCrossfilter";
import { DataLayerProvider } from "./providers/DataLayerProvider";

function App() {
  useDemoCrossfilter();

  return (
    <DataLayerProvider data={demoData}>
      <AppContent />
    </DataLayerProvider>
  );
}

export default App;
