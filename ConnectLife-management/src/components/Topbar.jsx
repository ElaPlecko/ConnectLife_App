/*export default function Topbar({ onNavigate }) {
  return (
    <header className="topbar">
      <h1>ConnectLife App Management Portal (POC)</h1>
      <div className="user-tools">
        <button className="icon-button" type="button" aria-label="Help">?</button>
        <button className="login-button" type="button" onClick={() => onNavigate("login")}>
          Logout
        </button>
      </div>
    </header>
  );
}*/
import { useState, useRef, useEffect } from "react";

const SEARCH_INDEX = [
  { label: "Dashboard", view: "dashboard", keywords: ["dashboard", "home", "overview"] },
  { label: "Markets", view: "markets", keywords: ["markets", "market", "countries", "regions"] },
  { label: "Features", view: "features", keywords: ["features", "feature", "oven", "appliance", "washing", "fridge", "dishwasher", "hood", "refrigerator", "hob", "hih", "air conditioner"] },
  { label: "Events", view: "content", keywords: ["events", "content", "analytics", "firebase"] },
  { label: "External Links", view: "links", keywords: ["links", "external", "url"] },
  { label: "Market Comparison", view: "comparison", keywords: ["comparison", "compare", "market"] },
  { label: "Users", view: "users", keywords: ["users", "user", "invite", "admin"] },
  { label: "Audit Log", view: "audit", keywords: ["audit", "log", "history", "actions"] },
];

export default function Topbar({ onNavigate, theme }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setHighlighted(0);
    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const q = val.toLowerCase();
    const matched = SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
    setResults(matched);
    setOpen(true);
  }

  function handleSelect(view) {
    onNavigate(view);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlighted]) {
      handleSelect(results[highlighted].view);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <header className="topbar">
      <h1>ConnectLife App Management Portal (POC)</h1>

      <div ref={wrapRef} style={{ position: "relative", flex: 1, maxWidth: 320, margin: "0 1rem" }}>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: "6px 12px",
            borderRadius: 20,
            fontSize: 13,
            background: theme === "dark" ? "#2c2c2a" : "#f5f5f3",
            color: theme === "dark" ? "#fff" : "#111",
            border: theme === "dark" ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(0,0,0,0.2)",
            boxSizing: "border-box",
          }}
        />
        {open && results.length > 0 && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: theme === "dark" ? "#2c2c2a" : "#f5f5f3",
            border: theme === "dark" ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(0,0,0,0.15)",
            borderRadius: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 1000,
            overflow: "hidden",
          }}>
            {results.map((r, i) => (
              <div
                key={r.view}
                onMouseDown={() => handleSelect(r.view)}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: i === highlighted
                    ? theme === "dark" ? "#3a3a3a" : "#e0e0e0"
                    : "transparent",
                  color: "var(--color-text-primary, #111)",
                  borderBottom: i < results.length - 1 ? "0.5px solid rgba(0,0,0,0.07)" : "none",
                }}
              >
                {r.label}
              </div>
            ))}
          </div>
        )}
        {open && results.length === 0 && query.trim() && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: theme === "dark" ? "#2c2c2a" : "#f5f5f3",
            border: theme === "dark" ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(0,0,0,0.15)",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 13,
            color: theme === "dark" ? "#fff" : "#666",
            zIndex: 1000,
          }}>
            No results for "{query}"
          </div>
        )}
      </div>

      <div className="user-tools">
        <button className="icon-button" type="button" aria-label="Help">?</button>
        <button className="login-button" type="button" onClick={() => onNavigate("login")}>
          Logout
        </button>
      </div>
    </header>
  );
}
