import { useDataLayer } from "@/providers/DataLayerProvider";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { FolderOpen, Trash2 } from "lucide-react";
import { loadProjects, deleteProject } from "@/utils/localStorage";
import { useEffect, useState } from "react";
import type { SavedProject } from "@/providers/DataLayerProvider";

export function ProjectManager() {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const setCurrentProject = useDataLayer((state) => state.setCurrentProject);
  const currentProject = useDataLayer((state) => state.currentProject);

  useEffect(() => {
    setSavedProjects(loadProjects());
  }, []);

  const handleLoadProject = (project: SavedProject) => {
    setCurrentProject(project);
  };

  const handleDeleteProject = (sourceDataPath: string) => {
    deleteProject(sourceDataPath);
    setSavedProjects(loadProjects());
  };

  if (savedProjects.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Load Project
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {savedProjects.map((project) => (
          <DropdownMenuItem
            key={project.sourceDataPath}
            className="flex items-center justify-between gap-4"
          >
            <span
              className="cursor-pointer"
              onClick={() => handleLoadProject(project)}
            >
              {project.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.sourceDataPath);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
