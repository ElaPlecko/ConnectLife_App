import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/views/Dashboard";
import Features from "./components/views/Features";
import Comparison from "./components/views/Comparison";

import {
  Markets,
  Content,
  Links,
  Users,
  AuditLog,
} from "./components/views/SimpleViews";

import { auth } from "./firebase";

function Portal() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  const [brandColor, setBrandColor] = useState("#009A9D");

  const [currentView, setCurrentView] =
    useState("dashboard");

  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  const currentUserRole =
    currentUser?.providerData?.[0]?.providerId ===
    "google.com"
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
        currentUserRole={currentUserRole} isDark={theme === "dark"} 
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
        currentUserRole={currentUserRole}
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

      {/* SWEET TOAST ALERTS ✨ */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.2)",
          },

          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Portal />}
        />

        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}