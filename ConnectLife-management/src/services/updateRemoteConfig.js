import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const updateRemoteFeatureFunction = httpsCallable(
  functions,
  "updateRemoteFeature"
);

export async function updateRemoteFeature({
  parameterKey,
  configKey,
  featureKey,
  value,
}) {
  const result = await updateRemoteFeatureFunction({
    parameterKey,
    configKey,
    featureKey,
    value,
  });

  return result.data;
}