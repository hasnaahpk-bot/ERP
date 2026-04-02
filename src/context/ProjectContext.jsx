import { createContext, useContext } from "react";
import { AppContext } from "./AppContext";

export const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const { projects, employees, fetchAll } = useContext(AppContext);

  return (
    <ProjectContext.Provider
      value={{ projects, employees, fetchData: fetchAll }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;