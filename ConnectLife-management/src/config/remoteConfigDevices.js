export const REMOTE_CONFIG_DEVICES = [
  {
    id: "oven",
    name: "Oven",
    category: "Cooking and Baking",
    remoteKeys: [
      {
        key: "CL_VS_Device_Oven",
        label: "Oven",
        type: "json",
        configKey: "deviceOven",
      },
      {
        key: "CL_VS_Oven_BrowseRecipes",
        label: "Browse Recipes",
        type: "boolean"
      }
    ],
  },
  {
    id: "hood",
    name: "Hood",
    category: "Cooking and Baking",
    remoteKeys: [
      {
        key: "CL_VS_Device_Hood",
        label: "Hood",
        type: "json",
        configKey: "deviceHood",
      },
      {
        key: "CL_VS_Hood_RefreshSpace",
        label: "Refresher Space",
        type: "boolean"
      }
    ],
  },
  {
    id: "dishwasher",
    name: "Dishwasher",
    category: "Dishwashing",
    remoteKeys: [
      {
        key: "CL_VS_Device_Dishwasher",
        label: "Dishwasher",
        type: "json",
        configKey: "deviceDishwasher",
      },
      {
        key: "CL_VS_Dishwasher_DishwashingAssist",
        label: "Dishwashing Assist",
        type: "boolean"
      }
    ],
  },
  {
    id: "refrigerator",
    name: "Refrigerator",
    category: "Cooling and Freezing",
    remoteKeys: [
      {
        key: "CL_VS_Device_Refrigerator",
        label: "Refrigerator",
        type: "json",
        configKey: "deviceRefrigerator",
      },
      {
        key: "CL_VS_Fridge_DlnaSupport",
        label: "Dlna Support",
        type: "boolean",
      },
      {
        key: "CL_VS_Fridge_ShoppingList",
        label: "Shoping List",
        type: "boolean",
      },
      {
        key: "CL_VS_Fridge_StorageAssistance",
        label: "Storage Assistance",
        type: "boolean",
      }
    ],
  },
  {
    id: "hob-hih",
    name: "Hob/hih",
    category: "Cooking and Baking",
    remoteKeys: [
      {
        key: "CL_VS_Device_Hob_HiH",
        label: "Hob / HiH",
        type: "json",
        configKey: "deviceHob",
      },
      {
        key: "CL_VS_Device_Hob_HiH_v2",
        label: "Hob / HiH variabilities",
        type: "json",
        configKey: "deviceHob",
      },
    ],
  },
  {
    id: "air-conditioner",
    name: "Air Conditioner",
    category: "Home heating and cooling",
    remoteKeys: [
        {
          key: "CL_VS_Device_AirConditioner",
          label: "Device Air Conditioner",
          type: "json",
          configKey: "defaultConfiguration",
        },
        {
          key: "CL_VS_AirConditioner_InAppReview",
          label: "In App Review",
          type: "boolean"
        }
    ],
    },
    {
  id: "washerDryer",
  name: "Washer-Dryer",
  category: "Washing and Drying",
  specialParser: "washerDryer",
  remoteKeys: [
    {
      key: "CL_VS_Device_WashingMachine",
      label: "Washing Machine",
      type: "json",
      configKey: "deviceWashingMachine",
    },
    {
      key: "CL_VS_Device_TumbleDryer",
      label: "Tumble Dryer",
      type: "json",
      configKey: "deviceTumbleDryer",
    },
    {
      key: "CL_VS_Device_WM26",
      label: "WM26",
      type: "json",
      configKey: "deviceWM26",
    },
    {
      key: "CL_VS_Dryer_DryingAssist",
      label: "Drying Assist",
      type: "boolean"
    },
    {
      key: "CL_VS_Dryer_EnergyConsumption",
      label: "Energy Consumption",
      type: "json",
      configKey: "energyConsumption",
    },
    {
      key: "CL_VS_WashingMachine_EnergyConsumption",
      label: "Washing Machine Energy Consumption",
      type: "json",
      configKey: "washingMachineEnergyConsumption",
    },
    {
      key: "CL_VS_WashingMachine_ProgramManagament",
      label: "Washing Machine Program Management",
      type: "boolean"
    },
    {
      key: "CL_VS_WashingMachine_ProgramManagamentSetting",
      label: "Washing Machine Program Management Setting",
      type: "boolean"
    },
    {
      key: "CL_VS_WashingMachine_WashingAssist",
      label: "Washing Assist",
      type: "boolean"
    },
    {
      key: "CL_VS_WashingMachineAndDryer_WashDrySync",
      label: "Wash Dry Sync",
      type: "boolean"
    }
  ],
}
];