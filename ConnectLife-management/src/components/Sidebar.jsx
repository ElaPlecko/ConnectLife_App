export default function Sidebar({ currentView, onNavigate, theme, setTheme, currentUserRole }) {
  const navItem = (view, label, pathD) => (
    <button
      className={`nav-item${currentView === view ? " active" : ""}`}
      type="button"
      onClick={() => onNavigate(view)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={pathD} /></svg>
      {label}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/connectlife_logo.png" alt="ConnectLife" style={{ height: "3rem" }} />
          <div>
            <strong>ConnectLife</strong>
            <small>Management</small>
          </div>
      </div>

      <button
        className="theme-toggle"
        onClick={() =>
          setTheme((prev) => (prev === "light" ? "dark" : "light"))
        }
      >
        {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
      </button>
    

      <nav className="nav" aria-label="Main navigation">
        <button
          className={`nav-item${currentView === "dashboard" ? " active" : ""}`}
          type="button"
          onClick={() => onNavigate("dashboard")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11.4 12 4l9 7.4v8.1a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5z" />
          </svg>
          Dashboard
        </button>

        <p>Configuration</p>
       {navItem("markets", "Markets", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z")}
    {navItem("features", "Features", "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4")}
    {navItem("content", "Events", "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h8M8 9h2")}

    <p>Tools</p>
    {navItem("comparison", "Market Comparison", "M12 3v18M7 6h10M6 6l-3 7h6zM18 6l-3 7h6zM5 21h14")}

      {currentUserRole === "admin" && (
        <>
          <p>Admin</p>
          {navItem("users", "Users", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8")}
          {navItem("audit", "Audit Log", "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01")}
        </>
      )}
          </nav>
    </aside>
  );
}
