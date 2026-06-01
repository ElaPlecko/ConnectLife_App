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

export function Markets({ currentUserRole, isDark, onNavigate }) {
  const { conditions, loading, error } = useRemoteConfigConditions();
  const [hoveredCondition, setHoveredCondition] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleExpanded = (label) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const rows = conditions.map((condition) => {
    const isExpanded = expandedRows.has(condition.label);
    const countries = condition.countries ?? [];
    const needsToggle = countries.length > 4;
    const countryText = countries.join(", ");

    return (
      <tr
        key={condition.label}
        onMouseEnter={() => setHoveredCondition(condition.label)}
        onMouseLeave={() => setHoveredCondition(null)}
        style={{
          background: hoveredCondition === condition.label
            ? "var(--color-background-secondary)"
            : undefined,
          cursor: "default",
          transition: "background 0.15s",
        }}
      >
        <td><strong>{condition.label}</strong></td>
        <td>
          <div
            style={
              needsToggle && !isExpanded
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                  }
                : { fontSize: 12, color: "var(--color-text-secondary)" }
            }
          >
            {countryText}
          </div>
          {needsToggle && (
            <button
              type="button"
              className="text-link"
              style={{ fontSize: 11, marginTop: 2 }}
              onClick={() => toggleExpanded(condition.label)}
            >
              {isExpanded ? "↑ show less" : `+ ${countries.length - 4} more`}
            </button>
          )}
        </td>
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
    );
  });

  return (
    <SimplePanel title="Markets">
      <GlobeView isDark={isDark} hoveredCondition={hoveredCondition}>
        {loading && <MarketsSkeleton />}
        {error && <div className="feature-error">{error}</div>}
        {!loading && !error && (
          <Table
            headers={["Condition", "Countries", "Platform", ""]}
            rows={rows}
          />
        )}
      </GlobeView>
    </SimplePanel>
  );
}