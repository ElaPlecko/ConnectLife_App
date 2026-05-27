import { useState } from "react";
import { Table } from "../utils/helpers.jsx";
import { useRemoteConfigConditions } from "../hooks/useRemoteConfigConditions";
import GlobeView from "../components/views/GlobeView";

function SimplePanel({ title, action, children }) {
  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MarketsSkeleton() {
  return (
    <div className="markets-skeleton">
      {[1, 2, 3, 4].map((item) => (
        <div className="markets-skeleton-row" key={item}>
          <div className="skeleton-line skeleton-market-name" />
          <div className="skeleton-line skeleton-market-countries" />
          <div className="skeleton-line skeleton-market-platform" />
          <div className="skeleton-line skeleton-market-badge" />
        </div>
      ))}
    </div>
  );
}

// ↓ SPREMEMBA: dobi onNavigate prop
export function Markets({ currentUserRole, isDark, onNavigate }) {
  const { conditions, loading, error } = useRemoteConfigConditions();

  const rows = conditions.map((condition) => (
    <tr key={condition.label}>
      <td><strong>{condition.label}</strong></td>
      <td>{condition.countries?.join(", ")}</td>
      <td>{condition.platform || "All"}</td>
      <td>
        <button
          className="text-link"
          type="button"
          onClick={() => onNavigate("features", condition.label)}
        >
          View features →
        </button>
      </td>
    </tr>
  ));

  return (
    <SimplePanel title="Markets">
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && <MarketsSkeleton />}
          {error && <div className="feature-error">{error}</div>}
          {!loading && !error && (
            <Table
              // ↓ SPREMEMBA: dodan header za novi stolpec
              headers={["Condition", "Countries", "Platform", ""]}
              rows={rows}
            />
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <GlobeView isDark={isDark} width={320} height={320} />
        </div>
      </div>
    </SimplePanel>
  );
}