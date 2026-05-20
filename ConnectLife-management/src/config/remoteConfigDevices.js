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
        label: "Hob / HiH v2",
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
    ],
    },
    {
  id: "washerDryer",
  name: "Washer-Dryer",
  category: "Washing and Drying",
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
  ],
}
];