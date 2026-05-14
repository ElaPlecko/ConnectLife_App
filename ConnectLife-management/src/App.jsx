import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/views/Dashboard";
import Features from "./components/views/Features";
import Comparison from "./components/views/Comparison";
import ApiExplorer from "./components/views/ApiExplorer";
import { Markets, Segments, Content, Links, Users, AuditLog, Settings } from "./components/views/SimpleViews";

function Portal() {
  const [currentView, setCurrentView] = useState("dashboard");
  const navigate = useNavigate();

  const handleNavigate = (view) => {
    if (view === "login") {
      navigate("/");
      return;
    }
    setCurrentView(view);
  };

  const views = {
    dashboard: <Dashboard onNavigate={handleNavigate} />,
    markets: <Markets />,
    segments: <Segments />,
    features: <Features />,
    content: <Content />,
    links: <Links />,
    comparison: <Comparison />,
    api: <ApiExplorer />,
    users: <Users />,
    audit: <AuditLog />,
    settings: <Settings />,
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <main className="app-shell">
        <Topbar onNavigate={handleNavigate} />
        <section className="dashboard" id="app-view" aria-live="polite">
          {views[currentView]}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Portal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
