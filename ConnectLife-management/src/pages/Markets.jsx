import { useState } from "react";
import { Table } from "../utils/helpers.jsx";
import { useRemoteConfigConditions } from "../hooks/useRemoteConfigConditions";

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

export function Markets({ currentUserRole }) {
  const { conditions, loading, error } = useRemoteConfigConditions();

  const rows = conditions.map((condition) => (
    <tr key={condition.label}>
      <td>
        <strong>{condition.label}</strong>
      </td>
      <td>{condition.countries?.join(", ")}</td>
      <td>{condition.platform || "All"}</td>
      <td>
        <span className="badge active">Active</span>
      </td>
      <td className="more">...</td>
    </tr>
  ));

  return (
    <SimplePanel title="Markets">
      {loading && <div className="feature-loading">Loading markets…</div>}
      {error && <div className="feature-error">{error}</div>}
      {!loading && !error && (
        <Table
          headers={["Condition", "Countries", "Platform", "Status", ""]}
          rows={rows}
        />
      )}
    </SimplePanel>
  );
}