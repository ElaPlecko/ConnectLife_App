import { useEffect, useState } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";

import { remoteConfig } from "../../firebase";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices";
import { duplicatedBooleanFeatures } from "../../config/washerDryerParser";

function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function buildConfigData(parsedConfig, configKey) {
  const energyKeys = ["energyConsumption", "washingMachineEnergyConsumption"];
  if (energyKeys.includes(configKey)) {
    const models = parsedConfig[configKey] ?? {};
    return {
      features: [],
      restrictions: [],
      modelOverrides: Object.entries(models).map(([model, enabled]) => ({
        model,
        overrides: [
          {
            key: configKey,
            name: formatFeatureName(configKey),
            enabled: Boolean(enabled),
          },
        ],
      })),
    };
  }

  const defaultConfig = parsedConfig.defaultConfiguration ?? {};
  const deviceConfig = parsedConfig[configKey] ?? {};

  let mergedConfig = {
    ...defaultConfig,
    ...deviceConfig,
  };

  if (Object.keys(mergedConfig).length === 0) {
    const firstModel = Object.values(parsedConfig).find(
      (v) => v && typeof v === "object" && !Array.isArray(v)
    );
    mergedConfig = { ...(firstModel ?? {}) };
  }

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

  const reservedKeys = new Set(["defaultConfiguration", configKey]);

  const modelOverrides = Object.entries(parsedConfig)
    .filter(([key, value]) => {
      return (
        !reservedKeys.has(key) &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      );
    })
    .map(([model, overrides]) => ({
      model,
      overrides: Object.entries(overrides)
        .filter(([, value]) => typeof value === "boolean")
        .map(([featureKey, enabled]) => ({
          key: featureKey,
          name: formatFeatureName(featureKey),
          enabled: Boolean(enabled),
        })),
    }));

  return {
    features,
    restrictions,
    modelOverrides,
  };
}

function ToggleButton({ enabled }) {
  return (
    <button
      className={`switch-button${enabled ? " on" : ""}`}
      type="button"
      aria-pressed={enabled}
    >
      <span />
      <em>{enabled ? "ON" : "OFF"}</em>
    </button>
  );
}

function FeatureRow({ feature, overrides, expanded, onToggle }) {
  const hasOverrides = overrides.length > 0;

  return (
    <>
      <div className="feature-row">
        <button
          className="feature-row-main"
          type="button"
          onClick={hasOverrides ? onToggle : undefined}
          disabled={!hasOverrides}
        >
          <strong className="feature-row-title">{feature.name}</strong>
        </button>

        <div className="feature-row-toggle">
          <ToggleButton enabled={feature.enabled} />
        </div>

        <button
          className={`chevron-button feature-row-chevron${
            hasOverrides ? "" : " is-hidden"
          }${expanded ? " is-open" : ""}`}
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Collapse model overrides" : "Expand model overrides"}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      {hasOverrides && expanded && (
        <div className="model-panel">
          <strong className="model-panel-title">Model overrides</strong>

          <div className="model-list">
            {overrides.map((item) => (
              <div className="model-override" key={`${item.model}-${feature.key}`}>
                <span className="model-name">{item.model}</span>
                <ToggleButton enabled={item.enabled} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ConfigBlock({ config, primary = false }) {
  const showFeatureList = !(
    !primary &&
    config.features.length === 1 &&
    config.features[0].key === config.key
  );

  const featureOverrideMap = config.features.reduce((map, feature) => {
    map[feature.key] = config.modelOverrides
      ?.map((item) => {
        const override = item.overrides.find(
          (candidate) => candidate.key === feature.key
        );

        return override
          ? {
              model: item.model,
              enabled: override.enabled,
            }
          : null;
      })
      .filter(Boolean);

    return map;
  }, {});

  const firstFeatureWithOverrides =
    config.features.find((feature) => featureOverrideMap[feature.key]?.length > 0)
      ?.key ?? "";

  const [expandedFeature, setExpandedFeature] = useState(firstFeatureWithOverrides);

  return (
    <div className={`config-block${primary ? " is-primary" : ""}`}>
      <div className={`config-heading${showFeatureList ? "" : " is-standalone"}`}>
        <div>
          <h4>{config.label}</h4>
        </div>

        <ToggleButton enabled={
          config.features.some((f) => f.enabled) ||
          config.modelOverrides?.some((m) => m.overrides.some((o) => o.enabled))
        } />
      </div>

      {showFeatureList && (
        <div className="feature-list">
          {config.features.map((feature) => {
            const overrides = featureOverrideMap[feature.key] ?? [];
            const expanded = expandedFeature === feature.key;

            return (
              <FeatureRow
                key={feature.key}
                feature={feature}
                overrides={overrides}
                expanded={expanded}
                onToggle={() =>
                  setExpandedFeature((current) =>
                    current === feature.key ? "" : feature.key
                  )
                }
              />
            );
          })}
        </div>
      )}

      {config.restrictions?.length > 0 && (
        <div className="restriction-box">
          <strong>Restrictions</strong>

          {config.restrictions.map((restriction) => (
            <div className="restriction-group" key={restriction.key}>
              <span className="hint">{restriction.name}</span>

              <div className="chip-list">
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
  const [open, setOpen] = useState(appliance.id === "dishwasher");
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

        const filteredRemoteKeys =
          appliance.specialParser === "washerDryer"
            ? appliance.remoteKeys.filter(
                (remoteConfigItem) =>
                  !duplicatedBooleanFeatures.includes(remoteConfigItem.key)
              )
            : appliance.remoteKeys;

        for (const remoteConfigItem of filteredRemoteKeys) {
          if (remoteConfigItem.type === "boolean") {
            loadedConfigs.push({
              key: remoteConfigItem.key,
              label: `${remoteConfigItem.label} (Feature)`,
              features: [
                {
                  key: remoteConfigItem.key,
                  name: remoteConfigItem.label,
                  enabled: getValue(remoteConfig, remoteConfigItem.key).asBoolean(),
                },
              ],
              restrictions: [],
              modelOverrides: [],
            });

            continue;
          }

          if (remoteConfigItem.type === "json") {
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
  const primaryKey = appliance.remoteKeys[0]?.key ?? appliance.category;

  return (
    <section className="appliance-section">
      <button
        className="appliance-heading"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div>
          <h3>{appliance.name}</h3>
          <p>{appliance.category}</p>
        </div>

        <span className="market-chip appliance-status">
          {loading ? "Loading..." : `${totalFeatures} features`}
        </span>

        <span
          className={`chevron-button${open ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="appliance-body">
          {error && <div className="feature-error">{error}</div>}

          {!error &&
            configs.map((config, index) => (
              <ConfigBlock
                key={config.key}
                config={config}
                primary={index === 0 && config.key === primaryKey}
              />
            ))}
        </div>
      )}
    </section>
  );
}

export default function Features() {
  return (
    <section className="panel page-panel feature-page">
      <div className="feature-shell">
        <div className="appliance-stack">
          {REMOTE_CONFIG_DEVICES.map((appliance) => (
            <ApplianceSection key={appliance.id} appliance={appliance} />
          ))}
        </div>
      </div>
    </section>
  );
}
