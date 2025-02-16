import "./App.css";
import { ExampleComponent } from "./components/ExampleComponent";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <h1>Hello World</h1>
      <Button>Click me</Button>
      <ExampleComponent />
    </div>
  );
}

export default App;
