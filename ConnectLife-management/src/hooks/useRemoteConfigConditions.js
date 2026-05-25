import { useEffect, useState } from "react";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { remoteConfig } from "../firebase";
import { parseFirebaseConditions } from "../utils/parseFirebaseConditions";
import { REMOTE_CONFIG_CONDITIONS } from "../config/remoteConfigConditions";

export function useRemoteConfigConditions() {
  const [conditions, setConditions] = useState(REMOTE_CONFIG_CONDITIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        await fetchAndActivate(remoteConfig);

        const raw = getValue(remoteConfig, "CL_VS_Conditions").asString();

        if (!raw) {
          // Parameter not yet in Firebase → silently use hardcoded fallback
          console.warn(
            "[useRemoteConfigConditions] CL_VS_Conditions not found in Remote Config, using hardcoded fallback."
          );
          return;
        }

        const firebaseConditions = JSON.parse(raw);
        const parsed = parseFirebaseConditions(firebaseConditions);
        setConditions(parsed);
      } catch (err) {
        console.error("[useRemoteConfigConditions]", err);
        setError("Could not load conditions from Remote Config.");
        // Keep hardcoded fallback in state — app stays functional
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { conditions, loading, error };
}