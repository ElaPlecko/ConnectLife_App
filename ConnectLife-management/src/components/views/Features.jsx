import { useEffect, useState } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { exportFeaturesToExcel } from "../../utils/exportFeaturesToExcel";
import { remoteConfig } from "../../firebase";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices";
import { duplicatedBooleanFeatures } from "../../config/washerDryerParser";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { updateRemoteFeature } from "../../services/updateRemoteConfig";

function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function buildConfigData(parsedConfig, configKey) {
  const energyKeys = [
    "energyConsumption",
    "washingMachineEnergyConsumption",
  ];

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

  const conditionLabels = new Set(
    REMOTE_CONFIG_CONDITIONS.map((condition) => condition.label)
  );

  const modelOverrides = Object.entries(parsedConfig)
    .filter(([key, value]) => {
      return (
        !reservedKeys.has(key) &&
        !conditionLabels.has(key) &&
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

  return { features, restrictions, modelOverrides };
}

function ToggleButton({ enabled, onClick }) {
  return (
    <button
      className={`switch-button${enabled ? " on" : ""}`}
      type="button"
      aria-pressed={enabled}
      onClick={onClick}
    >
      <span />
      <em>{enabled ? "ON" : "OFF"}</em>
    </button>
  );
}

function FeatureRow({ feature, overrides, expanded, onToggle, onFeatureToggle }) {
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
          <ToggleButton enabled={feature.enabled} onClick={() => onFeatureToggle(feature)}/>
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
                <ToggleButton enabled={item.enabled}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ConfigBlock({ config, primary, onUpdateFeature }) {
  const showFeatureList = !(
    !primary &&
    config.features.length === 1 &&
    config.features[0].key === config.key &&
    (config.modelOverrides ?? []).length === 0
  );

  const featureOverrideMap = config.features.reduce((map, feature) => {
    map[feature.key] = config.modelOverrides
      ?.map((item) => {
        const override = item.overrides.find(
          (candidate) => candidate.key === feature.key
        );
        return override ? { model: item.model, enabled: override.enabled } : null;
      })
      .filter(Boolean);
    return map;
  }, {});

  async function handleToggleFeature(feature) {
    const newValue = !feature.enabled;

    try {
      await updateRemoteFeature({
        parameterKey: config.key,
        configKey: config.configKey,
        featureKey: feature.key,
        value: newValue,
      });

      onUpdateFeature(
        config.key,
        feature.key,
        newValue
      );

    } catch (error) {
      console.error(error);
    }
  }

  const [expandedFeature, setExpandedFeature] = useState("");

  return (
    <div className={`config-block${primary ? " is-primary" : ""}`}>
      <div className={`config-heading${showFeatureList ? "" : " is-standalone"}`}>
        <div>
          <h4>{config.label}</h4>
        </div>

        <ToggleButton
          enabled={
            config.features.some((f) => f.enabled) ||
            config.modelOverrides?.some((m) => m.overrides.some((o) => o.enabled))
          }
        />
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
                onFeatureToggle={handleToggleFeature}
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
                  <span className="market-chip" key={value}>{value}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getConditionValue(remoteConfigItem, selectedMarket, defaultValue) {
  if (selectedMarket === "Default value") return defaultValue;

  const itemConditions = remoteConfigItem.conditions ?? [];

  const matchedCondition = REMOTE_CONFIG_CONDITIONS.find(
    (condition) => condition.label === selectedMarket
  );

  if (!matchedCondition) return defaultValue;

  const override = itemConditions.find(
    (itemCondition) => itemCondition.label === matchedCondition.label
  );

  return override ? override.value : defaultValue;
}

function getAvailableMarkets() {
  return REMOTE_CONFIG_CONDITIONS.map((condition) => condition.label).sort();
}

function ApplianceSection({ appliance, selectedMarket }) {
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

        const filteredRemoteKeys =
          appliance.specialParser === "washerDryer"
            ? appliance.remoteKeys.filter(
                (remoteConfigItem) =>
                  !duplicatedBooleanFeatures.includes(remoteConfigItem.key)
              )
            : appliance.remoteKeys;

        for (const remoteConfigItem of filteredRemoteKeys) {
          if (remoteConfigItem.type === "boolean") {
            const defaultValue = getValue(
              remoteConfig,
              remoteConfigItem.key
            ).asBoolean();

            const enabled = getConditionValue(
              remoteConfigItem,
              selectedMarket,
              defaultValue
            );

            loadedConfigs.push({
              key: remoteConfigItem.key,
              label: remoteConfigItem.label,
              features: [
                {
                  key: remoteConfigItem.key,
                  name: remoteConfigItem.label,
                  enabled,
                },
              ],
              restrictions: [],
              modelOverrides: [],
            });

            continue;
          }

          if (remoteConfigItem.type === "json") {
            const rawValue = getValue(
              remoteConfig,
              remoteConfigItem.key
            ).asString();

            if (!rawValue) continue;

            const parsedConfig = JSON.parse(rawValue);
            const data = buildConfigData(parsedConfig, remoteConfigItem.configKey);

            loadedConfigs.push({
              key: remoteConfigItem.key,
              label: remoteConfigItem.label,
              configKey: remoteConfigItem.configKey,
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
  }, [appliance, selectedMarket]);

  const totalFeatures = configs.reduce(
    (sum, config) => sum + config.features.length,
    0
  );

  const primaryKey = appliance.remoteKeys[0]?.key ?? appliance.category;

  function updateFeatureState(configKey, featureKey, value) {
    setConfigs((previous) =>
      previous.map((config) =>
        config.key === configKey
          ? {
              ...config,
              features: config.features.map((feature) =>
                feature.key === featureKey
                  ? {
                      ...feature,
                      enabled: value,
                    }
                  : feature
              ),
            }
          : config
      )
    );
  }

  return (
    <section className="appliance-section">
      <button
        className="appliance-heading"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="appliance-title">
          <Icon className="appliance-inline-icon" icon={appliance.icon} />

          <div>
            <h3>{appliance.name}</h3>
            <p>{appliance.category}</p>
          </div>
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
                onUpdateFeature={updateFeatureState}
              />
            ))}
        </div>
      )}
    </section>
  );
}

// ↓ SPREMEMBA: sprejme initialMarket prop
export default function Features({ initialMarket = "Default value" }) {
  const [selectedDeviceId, setSelectedDeviceId] = useState("all");
  const markets = getAvailableMarkets();

  // ↓ SPREMEMBA: initialMarket nastavi privzeti market
  const [selectedMarket, setSelectedMarket] = useState(initialMarket);

  // ↓ SPREMEMBA: ko prideš iz Markets page, posodobi market in resetiraj na all appliances
  useEffect(() => {
    setSelectedMarket(initialMarket);
    setSelectedDeviceId("all");
  }, [initialMarket]);

  const selectedDevice = REMOTE_CONFIG_DEVICES.find(
    (device) => device.id === selectedDeviceId
  );

  const handleExport = async () => {
    await exportFeaturesToExcel({ market: selectedMarket });
  };

  return (
    <section className="panel page-panel feature-page">
      <div className="feature-toolbar">
        <label>
          Appliance
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            <option value="all">All appliances</option>

            {REMOTE_CONFIG_DEVICES.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Market
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            <option value="Default value">Default value</option>

            {markets.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
            ))}
          </select>
        </label>

        <button
          className="primary-button export-button"
          type="button"
          onClick={handleExport}
        >
          Export Excel
        </button>
      </div>

      <div className="feature-shell">
        <div className="appliance-stack">
          {selectedDeviceId === "all"
            ? REMOTE_CONFIG_DEVICES.map((device) => (
                <ApplianceSection
                  key={device.id}
                  appliance={device}
                  selectedMarket={selectedMarket}
                />
              ))
            : selectedDevice && (
                <ApplianceSection
                  appliance={selectedDevice}
                  selectedMarket={selectedMarket}
                />
              )}
        </div>
      </div>
    </section>
  );
}