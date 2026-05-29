const UPDATE_REMOTE_FEATURE_URL =
  "https://us-central1-connectlife-admin-dev.cloudfunctions.net/updateRemoteFeatureHttp";

export async function updateRemoteFeature({
  parameterKey,
  configKey,
  featureKey,
  value,
  modelKey,
  conditionKey,
})
{
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