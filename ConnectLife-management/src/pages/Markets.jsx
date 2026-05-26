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

export function Markets({ currentUserRole, isDark }) {
  const { conditions, loading, error } = useRemoteConfigConditions();

  const rows = conditions.map((condition) => (
    <tr key={condition.label}>
      <td><strong>{condition.label}</strong></td>
      <td>{condition.countries?.join(", ")}</td>
      <td>{condition.platform || "All"}</td>
      <td><span className="badge active">Active</span></td>
      <td className="more">...</td>
    </tr>
  ));

  return (
    <SimplePanel title="Markets">
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading && <div className="feature-loading">Loading markets…</div>}
          {error && <div className="feature-error">{error}</div>}
          {!loading && !error && (
            <Table
              headers={["Condition", "Countries", "Platform", "", ""]}
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