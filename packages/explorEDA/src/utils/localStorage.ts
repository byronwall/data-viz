import { SavedProject } from "@/providers/DataLayerProvider";

const PROJECTS_KEY = "data-viz-projects";

export function saveProjects(projects: SavedProject[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadProjects(): SavedProject[] {
  const projectsJson = localStorage.getItem(PROJECTS_KEY);
  if (!projectsJson) {
    return [];
  }
  return JSON.parse(projectsJson);
}

export function saveProject(project: SavedProject): void {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(
    (p) => p.sourceDataPath === project.sourceDataPath
  );

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }

  saveProjects(projects);
}

export function deleteProject(sourceDataPath: string): void {
  const projects = loadProjects();
  const filteredProjects = projects.filter(
    (p) => p.sourceDataPath !== sourceDataPath
  );
  saveProjects(filteredProjects);
}
