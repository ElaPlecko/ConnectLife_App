import { useEffect, useState } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";

import { remoteConfig } from "../../firebase";
import { Table } from "../../utils/helpers.jsx";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices";

function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function buildFeatures(config, configKey) {
  const defaultConfig = config.defaultConfiguration ?? {};
  const deviceConfig = config[configKey] ?? {};

  const merged = {
    ...defaultConfig,
    ...deviceConfig,
  };

  return Object.entries(merged).map(([key, enabled]) => ({
    key,
    name: formatFeatureName(key),
    enabled: Boolean(enabled),
  }));
}

function ApplianceSection({ appliance }) {
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRemoteConfig() {
      try {
        setLoading(true);
        setError("");

        await fetchAndActivate(remoteConfig);

        const rawValue = getValue(remoteConfig, appliance.remoteKeys[0]).asString();

        if (!rawValue) {
          setError(`Remote Config parameter "${appliance.remoteKeys[0]}" is empty.`);
          return;
        }

        const parsed = JSON.parse(rawValue);
        setFeatures(buildFeatures(parsed, appliance.configKey));
      } catch (err) {
        console.error(err);
        setError("Could not load Remote Config.");
      } finally {
        setLoading(false);
      }
    }

    loadRemoteConfig();
  }, [appliance.remoteKey, appliance.configKey]);

  const toggle = (featureKey) => {
    setFeatures((prev) =>
      prev.map((feature) =>
        feature.key === featureKey
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const rows = features.map((feature) => (
    <tr key={feature.key}>
      <td>
        <strong>{feature.name}</strong>
      </td>

      <td>
        <button
          className={`switch-button${feature.enabled ? " on" : ""}`}
          type="button"
          aria-pressed={feature.enabled}
          onClick={() => toggle(feature.key)}
        >
          <span />
          <em>{feature.enabled ? "ON" : "OFF"}</em>
        </button>
      </td>
    </tr>
  ));

  return (
    <section className="appliance-section">
      <button
        className="appliance-heading"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="mini-icon appliance-icon" />

        <div>
          <h3>{appliance.name}</h3>
          <p>{appliance.category}</p>
        </div>

        <span className="market-chip">
          {loading ? "Loading..." : `${features.length} features`}
        </span>

        <strong style={{ marginLeft: "auto" }}>{open ? "▲" : "▼"}</strong>
      </button>

      {open && (
        <div style={{ marginTop: "1rem" }}>
          {error && (
            <div className="hint" style={{ color: "#ff7676", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          {!error && (
            <Table headers={["Feature", "Enabled"]} rows={rows} minWidth={720} />
          )}
        </div>
      )}
    </section>
  );
}

export default function Features() {
  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>Features</h2>
        <span className="hint">Feature availability from Firebase Remote Config.</span>
      </div>

      <div className="feature-toolbar">
        <div>
          <strong>Appliance feature control</strong>
          <span>Click an appliance to view available features.</span>
        </div>

        <span className="market-chip">
          {REMOTE_CONFIG_DEVICES.length} appliances
        </span>
      </div>

      <div className="appliance-stack">
        {REMOTE_CONFIG_DEVICES.map((appliance) => (
          <ApplianceSection key={appliance.id} appliance={appliance} />
        ))}
      </div>
    </section>
  );
}