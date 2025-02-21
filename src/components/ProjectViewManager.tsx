import { useDataLayer } from "@/providers/DataLayerProvider";
import { SavedView } from "@/providers/DataLayerProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function ProjectViewManager() {
  const [viewName, setViewName] = useState("");
  const currentProject = useDataLayer((state) => state.currentProject);
  const saveCurrentView = useDataLayer((state) => state.saveCurrentView);
  const loadView = useDataLayer((state) => state.loadView);

  if (!currentProject) {
    return null;
  }

  const handleSaveView = () => {
    if (!viewName) {
      return;
    }
    saveCurrentView(viewName);
    setViewName("");
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save View
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="View name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <Button onClick={handleSaveView}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Load View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {currentProject.views.map((view: SavedView) => (
            <DropdownMenuItem key={view.name} onClick={() => loadView(view)}>
              {view.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
