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

function buildConfigData(parsedConfig, configKey) {
  const defaultConfig = parsedConfig.defaultConfiguration ?? {};
  const deviceConfig = parsedConfig[configKey] ?? {};

  const mergedConfig = {
    ...defaultConfig,
    ...deviceConfig,
  };

  const features = Object.entries(mergedConfig)
    .filter(([, value]) => typeof value === "boolean")
    .map(([key, enabled]) => ({
      key,
      name: formatFeatureName(key),
      enabled,
    }));

  const restrictions = Object.entries(mergedConfig)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, values]) => ({
      key,
      name: formatFeatureName(key),
      values,
    }));

  return { features, restrictions };
}

function ConfigBlock({ config }) {
  const headers = ["Feature", "Enabled"];

  const rows = config.features.map((feature) => (
    <tr key={feature.key}>
      <td>
        <strong>{feature.name}</strong>
      </td>

      <td>
        <button
          className={`switch-button${feature.enabled ? " on" : ""}`}
          type="button"
          aria-pressed={feature.enabled}
        >
          <span />
          <em>{feature.enabled ? "ON" : "OFF"}</em>
        </button>
      </td>
    </tr>
  ));

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>{config.label}</h4>
      <Table headers={headers} rows={rows} minWidth={720} />

      {config.restrictions.length > 0 && (
        <div className="restriction-box" style={{ marginTop: "1rem" }}>
          <strong>Restrictions</strong>

          {config.restrictions.map((restriction) => (
            <div key={restriction.key} style={{ marginTop: "0.75rem" }}>
              <span className="hint">{restriction.name}</span>

              <div className="chip-list" style={{ marginTop: "0.5rem" }}>
                {restriction.values.map((value) => (
                  <span className="market-chip" key={value}>
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplianceSection({ appliance }) {
  const [open, setOpen] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRemoteConfig() {
      try {
        setLoading(true);
        setError("");

        await fetchAndActivate(remoteConfig);

        const loadedConfigs = [];

        for (const remoteConfigItem of appliance.remoteKeys) {
          const rawValue = getValue(remoteConfig, remoteConfigItem.key).asString();

          if (!rawValue) continue;

          const parsedConfig = JSON.parse(rawValue);
          const data = buildConfigData(parsedConfig, remoteConfigItem.configKey);

          loadedConfigs.push({
            key: remoteConfigItem.key,
            label: remoteConfigItem.label,
            ...data,
          });
        }

        setConfigs(loadedConfigs);
      } catch (err) {
        console.error(err);
        setError("Could not load Remote Config.");
      } finally {
        setLoading(false);
      }
    }

    loadRemoteConfig();
  }, [appliance]);

  const totalFeatures = configs.reduce(
    (sum, config) => sum + config.features.length,
    0
  );

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
          {loading ? "Loading..." : `${totalFeatures} features`}
        </span>

        <strong style={{ marginLeft: "auto" }}>{open ? "▲" : "▼"}</strong>
      </button>

      {open && (
        <div style={{ marginTop: "1rem" }}>
          {error && (
            <div className="hint" style={{ color: "#ff7676" }}>
              {error}
            </div>
          )}

          {!error &&
            configs.map((config) => (
              <ConfigBlock key={config.key} config={config} />
            ))}
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
        <span className="hint">
          Feature availability from Firebase Remote Config.
        </span>
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