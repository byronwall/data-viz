import "./App.css";
import { AppContent } from "./AppContent";
import { DataLayerProvider } from "./providers/DataLayerProvider";

function App() {
  return (
    <DataLayerProvider data={[]}>
      <AppContent />
    </DataLayerProvider>
  );
}

export default App;
