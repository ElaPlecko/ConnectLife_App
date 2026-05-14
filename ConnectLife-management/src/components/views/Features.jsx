import { useState } from "react";
import { markets, appliances } from "../../data/data.js";
import { flagIcon, Table } from "../../utils/helpers.jsx";

function ApplianceSection({ appliance }) {
  const [features, setFeatures] = useState(appliance.features);

  const toggle = (feature, marketCode) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: { ...prev[feature], [marketCode]: !prev[feature][marketCode] },
    }));
  };

  const featureList = Object.keys(features);
  const headers = ["Feature", ...markets.map((m) => <>{flagIcon(m)} {m.code}</>)];
  const rows = featureList.map((feature) => (
    <tr key={feature}>
      <td><strong>{feature}</strong></td>
      {markets.map((market) => {
        const enabled = features[feature][market.code];
        return (
          <td key={market.code}>
            <button
              className={`switch-button${enabled ? " on" : ""}`}
              type="button"
              aria-pressed={enabled}
              onClick={() => toggle(feature, market.code)}
            >
              <span />
              <em>{enabled ? "ON" : "OFF"}</em>
            </button>
          </td>
        );
      })}
    </tr>
  ));

  return (
    <section className="appliance-section">
      <div className="appliance-heading">
        <span className="mini-icon appliance-icon" />
        <div>
          <h3>{appliance.name}</h3>
          <p>{appliance.category}</p>
        </div>
      </div>
      <Table headers={headers} rows={rows} minWidth={720} />
    </section>
  );
}

export default function Features() {
  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>Features</h2>
        <span className="hint">Feature availability per appliance and market.</span>
      </div>
      <div className="feature-toolbar">
        <div>
          <strong>Appliance feature control by market</strong>
          <span>Turn individual appliance features on or off for each country.</span>
        </div>
        <span className="market-chip">{appliances.length} appliances</span>
      </div>
      <div className="appliance-stack">
        {appliances.map((appliance) => (
          <ApplianceSection key={appliance.id} appliance={appliance} />
        ))}
      </div>
    </section>
  );
}
