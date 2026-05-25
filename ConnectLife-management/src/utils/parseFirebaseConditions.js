const COUNTRY_CODE_MAP = {
  US: "United States",
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  HR: "Croatia",
  CY: "Cyprus",
  CZ: "Czechia",
  DK: "Denmark",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  LV: "Latvia",
  LT: "Lithuania",
  LU: "Luxembourg",
  MT: "Malta",
  NL: "Netherlands",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  RS: "Serbia",
  SK: "Slovakia",
  SI: "Slovenia",
  ES: "Spain",
  SE: "Sweden",
  GB: "United Kingdom",
  AU: "Australia",
  JP: "Japan",
  MY: "Malaysia",
  ID: "Indonesia",
  SG: "Singapore",
  TH: "Thailand",
  VN: "Vietnam",
  HK: "Hong Kong",
};

export function parseConditionExpression(expression) {
  // Extract country codes: device.country in ['US', 'AT', ...]
  const countryMatch = expression.match(/device\.country\s+in\s+\[([^\]]+)\]/);
  const countries = countryMatch
    ? countryMatch[1]
        .split(",")
        .map((s) => s.trim().replace(/['"]/g, ""))
        .map((code) => COUNTRY_CODE_MAP[code] ?? code) // fallback to raw code if unknown
    : [];

  // Extract platform: device.os == 'android' | 'ios'
  const platformMatch = expression.match(/device\.os\s*==\s*['"](\w+)['"]/);
  const platform = platformMatch
    ? platformMatch[1].charAt(0).toUpperCase() + platformMatch[1].slice(1) // android → Android
    : undefined;

  return { countries, platform };
}

export function parseFirebaseConditions(firebaseConditions) {
  return firebaseConditions.map((condition) => {
    const { countries, platform } = parseConditionExpression(condition.expression);
    return {
      label: condition.name,
      countries,
      ...(platform ? { platform } : {}),
    };
  });
}