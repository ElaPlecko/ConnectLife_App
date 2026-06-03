import { useState, useEffect } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { remoteConfig } from "../../firebase";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { getRemoteConfigTemplate } from "../../services/updateRemoteConfig";

function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function getParamValue(parameter, condLabel) {
  if (condLabel === DEFAULT_MARKET) {
    return parameter.defaultValue?.value;
  }

  return (
    parameter.conditionalValues?.[condLabel]?.value ??
    parameter.defaultValue?.value
  );
}

function extractBooleanFeaturesFromJson(rawJson, configKey, parameterKey) {
  if (!rawJson) return [];

  const parsed = JSON.parse(rawJson);

  const defaultConfig = parsed.defaultConfiguration ?? {};
  const deviceConfig = parsed[configKey] ?? {};

  const merged = {
    ...defaultConfig,
    ...deviceConfig,
  };

  return Object.entries(merged)
    .filter(([, value]) => typeof value === "boolean")
    .map(([key]) => ({
      key: `${parameterKey}.${configKey}.${key}`,
      label: formatFeatureName(key),
      parameterKey,
      configKey,
      featureKey: key,
      type: "json",
    }));
}

function useResolvedFeatures(condA, condB) {
  const [featureGroups, setFeatureGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const template = await getRemoteConfigTemplate({ forceRefresh: true });
        const parameters = template.parameters ?? [];

        const groups = REMOTE_CONFIG_DEVICES.map((device) => {
          const features = [];

          for (const remoteKey of device.remoteKeys) {
            const parameter = parameters[remoteKey.key];
            if (!parameter) continue;

            if (remoteKey.type === "boolean") {
              features.push({
                key: remoteKey.key,
                label: remoteKey.label,
                type: "boolean",
                aValue: getParamValue(parameter, condA) === "true",
                bValue: getParamValue(parameter, condB) === "true",
              });
            }

            if (remoteKey.type === "json") {
              const rawA = getParamValue(parameter, condA);
              const rawB = getParamValue(parameter, condB);

              const jsonFeatures = extractBooleanFeaturesFromJson(
                rawA ?? rawB,
                remoteKey.configKey,
                remoteKey.key
              );

              for (const feature of jsonFeatures) {
                const parsedA = rawA ? JSON.parse(rawA) : {};
                const parsedB = rawB ? JSON.parse(rawB) : {};

                const aValue =
                  parsedA?.[remoteKey.configKey]?.[feature.featureKey] ??
                  parsedA?.defaultConfiguration?.[feature.featureKey] ??
                  false;

                const bValue =
                  parsedB?.[remoteKey.configKey]?.[feature.featureKey] ??
                  parsedB?.defaultConfiguration?.[feature.featureKey] ??
                  false;

                features.push({
                  ...feature,
                  aValue: Boolean(aValue),
                  bValue: Boolean(bValue),
                });
              }
            }
          }

          return {
            ...device,
            features,
          };
        });

        setFeatureGroups(groups);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [condA, condB]);

  return { featureGroups, loading };
}

const DEFAULT_MARKET = "Default";

function ComparisonSkeleton() {
  return (
    <div className="comparison-stack">
      {[1, 2, 3].map((item) => (
        <section className="comparison-appliance" key={item}>
          <div className="skeleton-heading">
            <div className="skeleton-circle" />
            <div>
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-small" />
            </div>
          </div>

          <div className="compare-box">
            <div className="skeleton-compare-header" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Comparison() {
  // ↓ SPREMEMBA: privzeto "Default value" za oba dropdowna
  const [condA, setCondA] = useState(DEFAULT_MARKET);
  const [condB, setCondB] = useState(REMOTE_CONFIG_CONDITIONS[0]?.label ?? "");
  const [compareFilter, setCompareFilter] = useState("all");
  const { featureGroups, loading } = useResolvedFeatures(condA, condB);

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

      <div className="compare-filter-buttons">
        <button
          className={compareFilter === "all" ? "primary-button" : "outline-button"}
          onClick={() => setCompareFilter("all")}
        >
          All
        </button>

        <button
          className={compareFilter === "different" ? "primary-button" : "outline-button"}
          onClick={() => setCompareFilter("different")}
        >
          Different
        </button>

        <button
          className={compareFilter === "same" ? "primary-button" : "outline-button"}
          onClick={() => setCompareFilter("same")}
        >
          Same
        </button>
      </div>

      {loading ? (
        <ComparisonSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${condA}-${condB}`}
            className="comparison-stack"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.985 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {featureGroups.map((device) => {
              const visibleKeys = device.features.filter((feature) => {
                const differs = feature.aValue !== feature.bValue;

                if (compareFilter === "different") return differs;
                if (compareFilter === "same") return !differs;
                return true;
              });

              if (visibleKeys.length === 0) return null;

              return (
                <section key={device.id} className="comparison-appliance">
                  <div className="appliance-heading">
                    <div className="appliance-title">
                      <Icon className="appliance-inline-icon" icon={device.icon} />

                      <div>
                        <h3>{device.name}</h3>
                        <p>{device.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="compare-box">
                    <div className="compare-section">
                      <span>Feature</span>
                      <span>{condA}</span>
                      <span>{condB}</span>
                    </div>

                    {visibleKeys.map((remoteKey) => {
                      const aOn = remoteKey.aValue;
                      const bOn = remoteKey.bValue;
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
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}