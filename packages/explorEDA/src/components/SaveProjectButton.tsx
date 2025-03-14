import { useDataLayer } from "@/providers/DataLayerProvider";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { SavedProject } from "@/providers/DataLayerProvider";

export function SaveProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const currentProject = useDataLayer((state) => state.currentProject);
  const setCurrentProject = useDataLayer((state) => state.setCurrentProject);

  if (!currentProject || currentProject.isSaved) {
    return null;
  }

  const handleSave = () => {
    if (!projectName.trim()) {
      return;
    }

    const savedProject: SavedProject = {
      ...currentProject,
      name: projectName.trim(),
      isSaved: true,
    };

    setCurrentProject(savedProject);
    setIsOpen(false);
    setProjectName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
