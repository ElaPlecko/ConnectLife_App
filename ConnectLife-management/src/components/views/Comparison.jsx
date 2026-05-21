import { useState, useEffect } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { remoteConfig } from "../../firebase";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices";

function useResolvedBooleans() {
  const [defaults, setDefaults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await fetchAndActivate(remoteConfig);
      const result = {};
      for (const device of REMOTE_CONFIG_DEVICES) {
        for (const remoteKey of device.remoteKeys) {
          if (remoteKey.type === "boolean") {
            result[remoteKey.key] = getValue(remoteConfig, remoteKey.key).asBoolean();
          }
        }
      }
      setDefaults(result);
      setLoading(false);
    }
    load();
  }, []);

  return { defaults, loading };
}

export default function Comparison() {
  const [condA, setCondA] = useState(REMOTE_CONFIG_CONDITIONS[0]?.label ?? "");
  const [condB, setCondB] = useState(REMOTE_CONFIG_CONDITIONS[1]?.label ?? "");
  const { defaults, loading } = useResolvedBooleans();

  const resolve = (remoteKey, condLabel) => {
    const match = (remoteKey.conditions ?? []).find((c) => c.label === condLabel);
    return match !== undefined ? match.value : (defaults[remoteKey.key] ?? false);
  };

  return (
    <section className="panel page-panel comparison-page">
      <div className="panel-header">
        <h2>Market Comparison</h2>
        <span className="hint">Compare feature flags between two conditions.</span>
      </div>

      <div className="compare-selectors">
      <label>
        <span>Condition A</span>
        <select value={condA} onChange={(e) => setCondA(e.target.value)}>
          {REMOTE_CONFIG_CONDITIONS.filter((c) => c.label !== condB).map((c) => (
            <option key={c.label} value={c.label}>{c.label}</option>
          ))}
        </select>
      </label>
      <span className="vs">vs</span>
      <label>
        <span>Condition B</span>
        <select value={condB} onChange={(e) => setCondB(e.target.value)}>
          {REMOTE_CONFIG_CONDITIONS.filter((c) => c.label !== condA).map((c) => (
            <option key={c.label} value={c.label}>{c.label}</option>
          ))}
        </select>
      </label>
    </div>

      {loading ? (
        <div className="feature-error">Loading...</div>
      ) : (
        <div className="comparison-stack">
          {REMOTE_CONFIG_DEVICES.map((device) => {
            const booleanKeys = device.remoteKeys.filter((k) => k.type === "boolean");
            if (booleanKeys.length === 0) return null;

            return (
              <section key={device.id} className="comparison-appliance">
                <div className="appliance-heading">
                  <span className="mini-icon appliance-icon" />
                  <div>
                    <h3>{device.name}</h3>
                    <p>{device.category}</p>
                  </div>
                </div>

                <div className="compare-box">
                  <div className="compare-section">
                    <span>Feature</span>
                    <span>{condA}</span>
                    <span>{condB}</span>
                  </div>

                  {booleanKeys.map((remoteKey) => {
                    const aOn = resolve(remoteKey, condA);
                    const bOn = resolve(remoteKey, condB);
                    const differs = aOn !== bOn;

                    return (
                      <div
                        key={remoteKey.key}
                        className={`compare-row${differs ? " compare-row--diff" : ""}`}
                      >
                        <span>{remoteKey.label}</span>
                        <span className={aOn ? "on-text" : "off-text"}>{aOn ? "ON" : "OFF"}</span>
                        <span className={bOn ? "on-text" : "off-text"}>{bOn ? "ON" : "OFF"}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}