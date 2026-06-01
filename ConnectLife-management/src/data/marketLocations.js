import { REMOTE_CONFIG_CONDITIONS } from "../config/remoteConfigConditions";

const COUNTRY_COORDS = {
  "United States":  { lat: 37.09,  lng: -95.71 },
  "Australia":      { lat: -25.27, lng: 133.77 },
  "France":         { lat: 46.23,  lng: 2.21   },
  "Hong Kong":      { lat: 22.32,  lng: 114.17 },
  "Slovenia":       { lat: 46.15,  lng: 14.99  },
  "Croatia":        { lat: 45.10,  lng: 15.20  },
  "Japan":          { lat: 36.20,  lng: 138.25 },
  "Malaysia":       { lat: 4.21,   lng: 101.97 },
  "Indonesia":      { lat: -0.79,  lng: 113.92 },
  "Singapore":      { lat: 1.35,   lng: 103.82 },
  "Thailand":       { lat: 15.87,  lng: 100.99 },
  "Vietnam":        { lat: 14.06,  lng: 108.28 },
  "Austria":        { lat: 47.52,  lng: 14.55  },
  "Belgium":        { lat: 50.50,  lng: 4.47   },
  "Bulgaria":       { lat: 42.73,  lng: 25.49  },
  "Germany":        { lat: 51.17,  lng: 10.45  },
  "Italy":          { lat: 41.87,  lng: 12.57  },
  "Netherlands":    { lat: 52.13,  lng: 5.29   },
  "Poland":         { lat: 51.92,  lng: 19.15  },
  "Spain":          { lat: 40.46,  lng: -3.75  },
  "Sweden":         { lat: 60.13,  lng: 18.64  },
  "United Kingdom": { lat: 55.38,  lng: -3.44  },
  "Portugal":       { lat: 39.40,  lng: -8.22  },
  "Romania":        { lat: 45.94,  lng: 24.97  },
  "Serbia":         { lat: 44.02,  lng: 21.01  },
  "Czech Republic": { lat: 49.82,  lng: 15.47  },
  "Denmark":        { lat: 56.26,  lng: 9.50   },
  "Finland":        { lat: 61.92,  lng: 25.75  },
  "Hungary":        { lat: 47.16,  lng: 19.50  },
  "Ireland":        { lat: 53.41,  lng: -8.24  },
  "Slovakia":       { lat: 48.67,  lng: 19.70  },
  "Estonia":        { lat: 58.60,  lng: 25.01  },
  "Latvia":         { lat: 56.88,  lng: 24.60  },
  "Lithuania":      { lat: 55.17,  lng: 23.88  },
  "Luxembourg":     { lat: 49.82,  lng: 6.13   },
  "Malta":          { lat: 35.94,  lng: 14.38  },
  "Cyprus":         { lat: 35.13,  lng: 33.43  },
};

function getMarketLocations() {
  const countryToConditions = new Map();

  REMOTE_CONFIG_CONDITIONS.forEach(condition => {
    condition.countries?.forEach(country => {
      if (!countryToConditions.has(country)) {
        countryToConditions.set(country, new Set());
      }
      countryToConditions.get(country).add(condition.label);
    });
  });

  return Array.from(countryToConditions.entries())
    .filter(([country]) => COUNTRY_COORDS[country])
    .map(([country, conditionSet]) => ({
      ...COUNTRY_COORDS[country],
      label: country,
      conditions: Array.from(conditionSet),
    }));
}

export const marketLocations = getMarketLocations();