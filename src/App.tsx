import { useState } from "react";
import "./App.css";
import { CsvUpload } from "./components/CsvUpload";
import { DataDisplay } from "./components/DataDisplay";

function App() {
  const [parsedData, setParsedData] = useState<any[]>([]);

  return (
    <div className="flex flex-col items-center p-8 gap-8">
      <h1 className="text-2xl font-bold">CSV File Upload</h1>
      <div className="w-full max-w-xl">
        <CsvUpload onDataParsed={setParsedData} />
      </div>
      <DataDisplay data={parsedData} />
    </div>
  );
}

export default App;
