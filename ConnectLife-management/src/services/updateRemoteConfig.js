const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const UPDATE_REMOTE_FEATURE_URL = FIREBASE_PROJECT_ID
  ? `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/updateRemoteFeatureHttp`
  : "https://us-central1-connectlife-admin-dev.cloudfunctions.net/updateRemoteFeatureHttp";

export async function updateRemoteFeature({
  parameterKey,
  configKey,
  featureKey,
  value,
  modelKey,
  conditionKey,
}) {
  const response = await fetch(UPDATE_REMOTE_FEATURE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parameterKey,
      configKey,
      featureKey,
      value,
      modelKey,
      conditionKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || "Remote Config update failed");
  }

  return response.json();
}

const GET_REMOTE_TEMPLATE_URL = FIREBASE_PROJECT_ID
  ? `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/getRemoteConfigTemplateHttp`
  : "https://us-central1-connectlife-admin-dev.cloudfunctions.net/getRemoteConfigTemplateHttp";

let cachedTemplate = null;

export async function getRemoteConfigTemplate({ forceRefresh = false } = {}) {
  if (cachedTemplate && !forceRefresh) {
    return cachedTemplate;
  }

  const response = await fetch(GET_REMOTE_TEMPLATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || "Remote Config template read failed");
  }

  cachedTemplate = await response.json();
  return cachedTemplate;
}

export function clearRemoteConfigTemplateCache() {
  cachedTemplate = null;
}