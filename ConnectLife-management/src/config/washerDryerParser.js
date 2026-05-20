export const RESERVED_KEYS = [
  "deviceTumbleDryer",
  "deviceWashingMachine",
  "defaultConfiguration",
  "energyConsumption",
];

export const duplicatedBooleanFeatures = [
  "CL_VS_Dryer_DryingAssist",
  "CL_VS_WashingMachine_WashingAssist",
  "CL_VS_WashingMachineAndDryer_WashDrySync",
];

export const isModelOverride = (key) => {
  return !RESERVED_KEYS.includes(key);
};

export const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
};