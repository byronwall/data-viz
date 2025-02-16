import "./App.css";
import { CsvUpload } from "./components/CsvUpload";
import { DataDisplay } from "./components/DataDisplay";
import { DataLayerProvider } from "./providers/DataLayerProvider";

function App() {
  return (
    <DataLayerProvider data={[]}>
      <div className="flex flex-col items-center p-8 gap-8">
        <h1 className="text-2xl font-bold">CSV File Upload</h1>
        <div className="w-full max-w-xl">
          <CsvUpload />
        </div>
        <DataDisplay />
      </div>
    </DataLayerProvider>
  );
}

export default App;
