export default function Sidebar({ currentView, onNavigate }) {
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
            <small>Manager</small>
          </div>
      </div>

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
        {navItem("markets", "Markets", "M3 11.4 12 4l9 7.4")}
        {navItem("segments", "Segments", "M16 20v-2a4 4 0 0 0-8 0v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2.5a4 4 0 0 0-3-3.8M16 4.3a4 4 0 0 1 0 7.4")}
        {navItem("features", "Features", "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4")}
        {navItem("content", "Content", "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h8M8 9h2")}
        {navItem("links", "External Links", "M10 13a5 5 0 0 0 7.1 0l2.1-2.1a5 5 0 0 0-7.1-7.1L11 4.9M14 11a5 5 0 0 0-7.1 0l-2.1 2.1a5 5 0 0 0 7.1 7.1L13 19.1")}

        <p>Demo &amp; Tools</p>
        {navItem("comparison", "Market Comparison", "M12 3v18M7 6h10M6 6l-3 7h6zM18 6l-3 7h6zM5 21h14")}
        {navItem("api", "API Explorer", "m16 18 6-6-6-6M8 6l-6 6 6 6M14 4l-4 16")}

        <p>Admin</p>
        {navItem("users", "Users", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8")}
        {navItem("audit", "Audit Log", "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01")}
        {navItem("settings", "Settings", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z")}
      </nav>

      <div className="environment">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01M11 12h1v5h1" />
        </svg>
        <strong>POC environment</strong>
        <span>This is a proof of concept and not a production system.</span>
      </div>
    </aside>
  );
}
