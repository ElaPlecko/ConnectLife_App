import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { exportFeaturesToExcel } from "../../utils/exportFeaturesToExcel";
import { remoteConfig } from "../../firebase";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices";
import { duplicatedBooleanFeatures } from "../../config/washerDryerParser";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions";
import { Icon } from "@iconify/react";

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

function ToggleButton({ enabled, onClick, label }) {
  return (
    <button
      className={`switch-button${enabled ? " on" : ""}`}
      type="button"
      aria-pressed={enabled}
      aria-label={label ?? (enabled ? "Disable feature" : "Enable feature")}
      onClick={onClick}
    >
      <span />
      <em>{enabled ? "ON" : "OFF"}</em>
    </button>
  );
}

function isConfigEnabled(config) {
  return (
    config.features.some((feature) => feature.enabled) ||
    config.modelOverrides?.some((model) =>
      model.overrides.some((override) => override.enabled)
    )
  );
}

function FeatureRow({ feature, overrides, expanded, onExpand, onToggleFeature }) {
  const hasOverrides = overrides.length > 0;

  return (
    <>
      <div className="feature-row">
        <button
          className="feature-row-main"
          type="button"
          onClick={hasOverrides ? onExpand : undefined}
          disabled={!hasOverrides}
        >
          <strong className="feature-row-title">{feature.name}</strong>
        </button>

        <div className="feature-row-toggle">
          <ToggleButton
            enabled={feature.enabled}
            label={`${feature.enabled ? "Disable" : "Enable"} ${feature.name}`}
            onClick={onToggleFeature}
          />
        </div>

        <button
          className={`chevron-button feature-row-chevron${
            hasOverrides ? "" : " is-hidden"
          }${expanded ? " is-open" : ""}`}
          type="button"
          onClick={onExpand}
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

function ConfigBlock({ config, primary = false, onFeatureToggle, onConfigToggle }) {
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

  const [expandedFeature, setExpandedFeature] = useState("");
  const configEnabled = isConfigEnabled(config);

  return (
    <div className={`config-block${primary ? " is-primary" : ""}`}>
      <div className={`config-heading${showFeatureList ? "" : " is-standalone"}`}>
        <div>
          <h4>{config.label}</h4>
        </div>

        <ToggleButton
          enabled={configEnabled}
          label={`${configEnabled ? "Disable" : "Enable"} ${config.label}`}
          onClick={onConfigToggle}
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
                onExpand={() =>
                  setExpandedFeature((current) =>
                    current === feature.key ? "" : feature.key
                  )
                }
                onToggleFeature={() => onFeatureToggle(feature.key)}
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

function getConfigPreviewFeatures(configs) {
  return configs.flatMap((config) => {
    if (config.features.length > 0) {
      return config.features.map((feature) => ({
        key: `${config.key}-${feature.key}`,
        name: feature.name,
        enabled: feature.enabled,
      }));
    }

    return (config.modelOverrides ?? []).flatMap((model) =>
      model.overrides.map((override) => ({
        key: `${config.key}-${model.model}-${override.key}`,
        name: override.name,
        enabled: override.enabled,
      }))
    );
  });
}

function PhonePreview({
  selectedDeviceId,
  selectedDevice,
  selectedMarket,
  configsByDevice,
  loadingDeviceIds,
}) {
  const isAllDevices = selectedDeviceId === "all";
  const selectedConfigs = selectedDevice
    ? configsByDevice[selectedDevice.id] ?? []
    : [];
  const previewFeatures = getConfigPreviewFeatures(selectedConfigs);
  const activeFeatures = previewFeatures.filter((feature) => feature.enabled);
  const visibleFeatures = activeFeatures;
  const visibleDevices = REMOTE_CONFIG_DEVICES.map((device) => {
    const configs = configsByDevice[device.id] ?? [];
    const isLoading = loadingDeviceIds.includes(device.id);
    const enabled = configs.some(isConfigEnabled);

    return {
      ...device,
      enabled,
      isLoading,
    };
  }).filter((device) => device.enabled || device.isLoading);

  return (
    <aside className="phone-preview-wrap" aria-label="ConnectLife app preview">
      <div className="phone-frame">
        <div className="phone-speaker" aria-hidden="true" />

        <div className="phone-screen">
          <div className="phone-statusbar">
            <span>9:41</span>
            <span className="phone-signal">100%</span>
          </div>

          <div className="phone-home-header">
            <strong>
              <span className="phone-brand-mark">C</span>
              ConnectLife
            </strong>
            <Icon icon="lucide:bell" />
          </div>

          <div className="phone-filter-row">
            <button type="button">All Floors</button>
            <span className="phone-market">{selectedMarket}</span>
          </div>

          <div className="phone-tabs">
            <span className="is-active">All</span>
            <span>Living room</span>
            <span>Bedroom</span>
          </div>

          {!isAllDevices && (
            <div className="phone-selected-summary">
              {selectedDevice && <Icon icon={selectedDevice.icon} />}
              <div>
                <strong>{selectedDevice?.name}</strong>
                <span>{activeFeatures.length} active features</span>
              </div>
            </div>
          )}

          <div className="phone-card-scroll">
            {isAllDevices ? (
              <div className="phone-card-grid">
                {visibleDevices.map((device) => (
                  <div
                    className={`phone-app-card${device.enabled ? " is-on" : ""}`}
                    key={device.id}
                  >
                    <div className="phone-card-top">
                      <Icon className="phone-device-icon" icon={device.icon} />
                      <span className="phone-power">
                        <Icon icon="lucide:power" />
                      </span>
                    </div>
                    <strong>{device.name}</strong>
                    <span>{device.isLoading ? "Syncing" : "On"}</span>
                  </div>
                ))}

                {visibleDevices.length === 0 && (
                  <div className="phone-empty-state">
                    No active devices for this market.
                  </div>
                )}
              </div>
            ) : (
              <div className="phone-card-grid">
                {visibleFeatures.map((feature) => (
                  <div
                    className={`phone-app-card${feature.enabled ? " is-on" : ""}`}
                    key={feature.key}
                  >
                    <div className="phone-card-top">
                      {selectedDevice && (
                        <Icon className="phone-device-icon" icon={selectedDevice.icon} />
                      )}
                      <span className="phone-power">
                        <Icon icon="lucide:power" />
                      </span>
                    </div>
                    <strong>{feature.name}</strong>
                    <span>{feature.enabled ? "On" : "Off"}</span>
                  </div>
                ))}

                {visibleFeatures.length === 0 && (
                  <div className="phone-empty-state">
                    No active features for this appliance.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="phone-bottom-nav">
            <span>
              <Icon icon="lucide:layout-dashboard" />
              Dashboard
            </span>
            <span className="is-active">
              <Icon icon="lucide:blocks" />
              Devices
            </span>
            <span>
              <Icon icon="lucide:workflow" />
              Automation
            </span>
            <span>
              <Icon icon="lucide:menu" />
              Menu
            </span>
            <button type="button">
              <Icon icon="lucide:plus" />
            </button>
          </div>
        </div>
      </div>
    </aside>
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

function ApplianceSection({
  appliance,
  selectedMarket,
  cachedConfigs = [],
  onConfigsChange,
  onLoadingChange,
}) {
  const [open, setOpen] = useState(false);
  const [configs, setConfigs] = useState(cachedConfigs);
  const cachedConfigsRef = useRef(cachedConfigs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cachedConfigsRef.current = cachedConfigs;
  }, [cachedConfigs]);

  useEffect(() => {
    async function loadRemoteConfig() {
      try {
        setLoading(true);
        setError("");
        onLoadingChange?.(appliance.id, true);

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
              ...data,
            });
          }
        }

        setConfigs(loadedConfigs);
        onConfigsChange?.(appliance.id, loadedConfigs);
      } catch (err) {
        console.error(err);

        const cachedFallback = cachedConfigsRef.current;

        if (cachedFallback.length === 0) {
          setError("Could not load Remote Config.");
          onConfigsChange?.(appliance.id, []);
        } else {
          setError("");
          setConfigs(cachedFallback);
          onConfigsChange?.(appliance.id, cachedFallback);
        }
      } finally {
        setLoading(false);
        onLoadingChange?.(appliance.id, false);
      }
    }

    loadRemoteConfig();
  }, [appliance, selectedMarket, onConfigsChange, onLoadingChange]);

  const toggleFeature = (configKey, featureKey) => {
    setConfigs((currentConfigs) => {
      const nextConfigs = currentConfigs.map((config) => {
        if (config.key !== configKey) return config;

        return {
          ...config,
          features: config.features.map((feature) =>
            feature.key === featureKey
              ? { ...feature, enabled: !feature.enabled }
              : feature
          ),
        };
      });

      onConfigsChange?.(appliance.id, nextConfigs);
      return nextConfigs;
    });
  };

  const toggleConfig = (configKey) => {
    setConfigs((currentConfigs) => {
      const target = currentConfigs.find((config) => config.key === configKey);
      const nextEnabled = target ? !isConfigEnabled(target) : true;

      const nextConfigs = currentConfigs.map((config) => {
        if (config.key !== configKey) return config;

        return {
          ...config,
          features: config.features.map((feature) => ({
            ...feature,
            enabled: nextEnabled,
          })),
          modelOverrides: config.modelOverrides?.map((model) => ({
            ...model,
            overrides: model.overrides.map((override) => ({
              ...override,
              enabled: nextEnabled,
            })),
          })),
        };
      });

      onConfigsChange?.(appliance.id, nextConfigs);
      return nextConfigs;
    });
  };

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
                onFeatureToggle={(featureKey) => toggleFeature(config.key, featureKey)}
                onConfigToggle={() => toggleConfig(config.key)}
              />
            ))}
        </div>
      )}
    </section>
  );
}

// ↓ SPREMEMBA: sprejme initialMarket prop
export default function Features({ initialMarket = "Default value" }) {
  const [filters, setFilters] = useState({
    selectedDeviceId: "all",
    selectedMarket: initialMarket,
    initialMarket,
  });
  const [configsByDevice, setConfigsByDevice] = useState({});
  const [loadingDeviceIds, setLoadingDeviceIds] = useState([]);
  const markets = getAvailableMarkets();

  if (filters.initialMarket !== initialMarket) {
    setFilters({
      selectedDeviceId: "all",
      selectedMarket: initialMarket,
      initialMarket,
    });
  }

  const { selectedDeviceId, selectedMarket } = filters;

  const selectedDevice = REMOTE_CONFIG_DEVICES.find(
    (device) => device.id === selectedDeviceId
  );

  const handleConfigsChange = useCallback((deviceId, configs) => {
    setConfigsByDevice((current) => ({
      ...current,
      [deviceId]: configs,
    }));
  }, []);

  const handleLoadingChange = useCallback((deviceId, isLoading) => {
    setLoadingDeviceIds((current) => {
      if (isLoading) {
        return current.includes(deviceId) ? current : [...current, deviceId];
      }

      return current.filter((id) => id !== deviceId);
    });
  }, []);

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
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                selectedDeviceId: e.target.value,
              }))
            }
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
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                selectedMarket: e.target.value,
              }))
            }
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
                  cachedConfigs={configsByDevice[device.id] ?? []}
                  onConfigsChange={handleConfigsChange}
                  onLoadingChange={handleLoadingChange}
                />
              ))
            : selectedDevice && (
                <ApplianceSection
                  appliance={selectedDevice}
                  selectedMarket={selectedMarket}
                  cachedConfigs={configsByDevice[selectedDevice.id] ?? []}
                  onConfigsChange={handleConfigsChange}
                  onLoadingChange={handleLoadingChange}
                />
              )}
        </div>

        <PhonePreview
          selectedDeviceId={selectedDeviceId}
          selectedDevice={selectedDevice}
          selectedMarket={selectedMarket}
          configsByDevice={configsByDevice}
          loadingDeviceIds={loadingDeviceIds}
        />
      </div>
    </section>
  );
}
