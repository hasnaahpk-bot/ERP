import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppProvider from './context/AppContext.jsx';
import ProjectProvider from './context/ProjectContext.jsx';
import UserProvider from './context/UserContext.jsx';
import { PaginationProvider } from './context/PaginationContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PaginationProvider>
    <AppProvider>
    <UserProvider>
    <ProjectProvider>
    <App />
        <ToastContainer position="top-center" />
        </ProjectProvider>
        </UserProvider>
        </AppProvider>
        </PaginationProvider>
  </StrictMode>,
)
