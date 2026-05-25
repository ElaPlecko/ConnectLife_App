import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/views/Dashboard";
import Features from "./components/views/Features";
import Comparison from "./components/views/Comparison";
import { Markets, Content, Links, Users, AuditLog } from "./components/views/SimpleViews";
import { auth } from "./firebase";

/*function Portal() {
  const [brandColor, setBrandColor] = useState("#009A9D");
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
    markets: <Markets currentUserRole={currentUser.role} />,
    features: <Features />,
    content: <Content />,
    links: <Links />,
    comparison: <Comparison />,
    api: <ApiExplorer />,
    users: <Users />,
    audit: <AuditLog />,
    settings: <Settings brandColor={brandColor} setBrandColor={setBrandColor} />,
  };

  return (
    <div>
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <main className="app-shell">
        <Topbar onNavigate={handleNavigate} />
        <section className="dashboard" id="app-view" aria-live="polite">
          {views[currentView]}
        </section>
      </main>
    </div>
  );
}*/
function Portal() {

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [brandColor, setBrandColor] = useState("#009A9D");
  const [currentView, setCurrentView] = useState("dashboard");

  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  const currentUserRole =
    currentUser?.providerData?.[0]?.providerId === "google.com"
      ? "admin"
      : "viewer";

  const handleNavigate = (view) => {

    if (view === "login") {
      navigate("/");
      return;
    }

    setCurrentView(view);
  };

  const views = {
    dashboard: (
      <Dashboard
        onNavigate={handleNavigate}
      />
    ),

    markets: (
      <Markets
        currentUserRole={currentUserRole}
      />
    ),

    features: <Features />,

    content: <Content />,

    links: <Links />,

    comparison: <Comparison />,

    users: (
      <Users
        currentUserRole={currentUserRole}
      />
    ),

    audit: <AuditLog />,

  };

  return (
    <div>
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
         theme={theme}
         setTheme={setTheme}
      />

      <main className="app-shell">

        <Topbar onNavigate={handleNavigate} />

        <section
          className="dashboard"
          id="app-view"
          aria-live="polite"
        >
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
