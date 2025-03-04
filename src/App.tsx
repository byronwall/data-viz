import { AppContent } from "./AppContent";
import { demoData, demoSettings } from "./hooks/demo_data_settings";
import { DataLayerProvider } from "./providers/DataLayerProvider";

function App() {
  return (
    <DataLayerProvider data={demoData} savedData={demoSettings}>
      <AppContent />
    </DataLayerProvider>
  );
}

export default App;
