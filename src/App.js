import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import DocumentUpload from "./Functionalities/Data_Entry";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import LandingPage from "./Pages/LandingPage";
import DocumentAutomation from "./Functionalities/Document_Automation";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    const handleStorageChange = () => {
      const updatedAuthStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(updatedAuthStatus === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dataentry" element={<DocumentUpload />} />
        <Route path="/documents" element={<DocumentAutomation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;