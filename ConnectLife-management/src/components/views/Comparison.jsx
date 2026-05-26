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

const DEFAULT_MARKET = "Default";

export default function Comparison() {
  // ↓ SPREMEMBA: privzeto "Default value" za oba dropdowna
  const [condA, setCondA] = useState(DEFAULT_MARKET);
  const [condB, setCondB] = useState(REMOTE_CONFIG_CONDITIONS[0]?.label ?? "");
  const { defaults, loading } = useResolvedBooleans();

  // ↓ SPREMEMBA: ko je condLabel "Default value", vrni kar Firebase default
  const resolve = (remoteKey, condLabel) => {
    if (condLabel === DEFAULT_MARKET) return defaults[remoteKey.key] ?? false;
    const match = (remoteKey.conditions ?? []).find((c) => c.label === condLabel);
    return match !== undefined ? match.value : (defaults[remoteKey.key] ?? false);
  };

  const allOptions = [DEFAULT_MARKET, ...REMOTE_CONFIG_CONDITIONS.map((c) => c.label)];

  return (
    <section className="panel page-panel comparison-page">
      <div className="panel-header">
        <h2>Market Comparison</h2>
        <span className="hint">Compare feature flags between two conditions.</span>
      </div>

      <div className="compare-selectors">
        <label>
          <span>Condition 1</span>
          {/* ↓ SPREMEMBA: "Default value" kot opcija */}
          <select value={condA} onChange={(e) => setCondA(e.target.value)}>
            {allOptions
              .filter((label) => label !== condB)
              .map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
          </select>
        </label>

        <span className="vs">vs</span>

        <label>
          <span>Condition 2</span>
          {/* ↓ SPREMEMBA: "Default value" kot opcija */}
          <select value={condB} onChange={(e) => setCondB(e.target.value)}>
            {allOptions
              .filter((label) => label !== condA)
              .map((label) => (
                <option key={label} value={label}>{label}</option>
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