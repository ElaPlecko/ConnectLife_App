import { useState } from "react";
import { Table } from "../utils/helpers.jsx";
import { REMOTE_CONFIG_CONDITIONS } from "../config/remoteConfigConditions.js";

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

  const [conditions, setConditions] = useState(
    REMOTE_CONFIG_CONDITIONS
  );

  const handleAddMarket = () => {

    if (currentUserRole !== "admin") {
      return;
    }

    const marketName = prompt("Enter market name");

    if (!marketName) {
      return;
    }

    const newCondition = {
      label: marketName,
      countries: [marketName],
    };

    setConditions((prev) => [
      ...prev,
      newCondition,
    ]);
  };

  const rows = conditions.map((condition) => (
    <tr key={condition.label}>

      <td>
        <strong>{condition.label}</strong>
      </td>

      <td>
        {condition.countries?.join(", ")}
      </td>

      <td>
        {condition.platform || "All"}
      </td>

      <td>
        <span className="badge active">
          Active
        </span>
      </td>

      <td className="more">...</td>

    </tr>
  ));

  return (
    <SimplePanel
      title="Markets"

      action={
        currentUserRole === "admin" && (
          <button
            className="primary-button"
            type="button"
            onClick={handleAddMarket}
          >
            + Add Market
          </button>
        )
      }
    >
      <Table
        headers={[
          "Condition",
          "Countries",
          "Platform",
          "Status",
          "",
        ]}
        rows={rows}
      />
    </SimplePanel>
  );
}