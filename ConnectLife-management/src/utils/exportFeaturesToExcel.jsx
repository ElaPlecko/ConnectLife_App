import * as XLSX from "xlsx";
import { fetchAndActivate, getValue } from "firebase/remote-config";

import { remoteConfig } from "../firebase";
import { REMOTE_CONFIG_DEVICES } from "../config/remoteConfigDevices";
import { REMOTE_CONFIG_CONDITIONS } from "../config/remoteConfigConditions";
import { duplicatedBooleanFeatures } from "../config/washerDryerParser";

const DEFAULT_MARKET = "Default";

function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}
function getConditionValue(remoteConfigItem, selectedMarket, defaultValue) {
  if (selectedMarket === DEFAULT_MARKET) return defaultValue;

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

function extractJsonRows({ appliance, remoteConfigItem, parsedConfig, market }) {
  const defaultConfig = parsedConfig.defaultConfiguration ?? {};
  const deviceConfig = parsedConfig[remoteConfigItem.configKey] ?? {};

  const mergedConfig = {
    ...defaultConfig,
    ...deviceConfig,
  };

  const rows = [];

  Object.entries(mergedConfig).forEach(([featureKey, value]) => {
    if (typeof value === "boolean") {
      rows.push({
        Appliance: appliance.name,
        Category: appliance.category,
        Market: market,
        Config: remoteConfigItem.label,
        Feature: formatFeatureName(featureKey),
        Key: featureKey,
        Value: value ? "ON" : "OFF",
        Type: "Feature",
        Model: "",
      });
    }

    if (Array.isArray(value)) {
      value.forEach((model) => {
        rows.push({
          Appliance: appliance.name,
          Category: appliance.category,
          Market: market,
          Config: remoteConfigItem.label,
          Feature: formatFeatureName(featureKey),
          Key: featureKey,
          Value: "RESTRICTED",
          Type: "Restriction",
          Model: model,
        });
      });
    }
  });

  const reservedKeys = new Set([
    "defaultConfiguration",
    remoteConfigItem.configKey,
  ]);

  const conditionLabels = new Set(
    REMOTE_CONFIG_CONDITIONS.map((condition) => condition.label)
  );

  Object.entries(parsedConfig).forEach(([model, overrides]) => {
    const isModelOverride =
      !reservedKeys.has(model) &&
      !conditionLabels.has(model) &&
      overrides &&
      typeof overrides === "object" &&
      !Array.isArray(overrides);

    if (!isModelOverride) return;

    Object.entries(overrides).forEach(([featureKey, enabled]) => {
      if (typeof enabled !== "boolean") return;

      rows.push({
        Appliance: appliance.name,
        Category: appliance.category,
        Market: market,
        Config: remoteConfigItem.label,
        Feature: formatFeatureName(featureKey),
        Key: featureKey,
        Value: enabled ? "ON" : "OFF",
        Type: "Model override",
        Model: model,
      });
    });
  });
  return rows;
}
export async function exportFeaturesToExcel({ market }) {
  await fetchAndActivate(remoteConfig);

  const rows = [];

  for (const appliance of REMOTE_CONFIG_DEVICES) {
    const remoteKeys =
      appliance.specialParser === "washerDryer"
        ? appliance.remoteKeys.filter(
            (item) => !duplicatedBooleanFeatures.includes(item.key)
          )
        : appliance.remoteKeys;

    for (const remoteConfigItem of remoteKeys) {
      if (remoteConfigItem.type === "boolean") {
        const defaultValue = getValue(remoteConfig, remoteConfigItem.key).asBoolean();

        const enabled = getConditionValue(
          remoteConfigItem,
          market,
          defaultValue
        );

        rows.push({
          Appliance: appliance.name,
          Category: appliance.category,
          Market: market,
          Config: remoteConfigItem.label,
          Feature: remoteConfigItem.label,
          Key: remoteConfigItem.key,
          Value: enabled ? "ON" : "OFF",
          Type: "Feature",
          Model: "",
        });

        continue;
      }

      if (remoteConfigItem.type === "json") {
        const rawValue = getValue(remoteConfig, remoteConfigItem.key).asString();
        if (!rawValue) continue;

        const parsedConfig = JSON.parse(rawValue);

        rows.push(
          ...extractJsonRows({
            appliance,
            remoteConfigItem,
            parsedConfig,
            market,
          })
        );
      }
    }
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Features");

  // ↓ SPREMEMBA: ime datoteke iz market labela
  const safeMarket = market.replaceAll(" ", "_");
  const fileName = `features_${safeMarket}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}