import { useEffect, useState, useRef } from "react";
import { appliances, activities, contentTypes } from "../../data/data.js";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions.js";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices.js";
import { iconSvg, Table } from "../../utils/helpers.jsx";
import { motion } from "framer-motion";
import { Chart, registerables } from "chart.js";
import ChatBot from "./ChatBot.jsx";
import { Icon } from "@iconify/react";
import { updateRemoteFeature } from "../../services/updateRemoteConfig";
import { logAction } from "../../utils/auditLog";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { remoteConfig as appRemoteConfig } from "../../firebase";
import { duplicatedBooleanFeatures } from "../../config/washerDryerParser";
Chart.register(...registerables);

const WASHER_DRYER_JSON_FEATURE_MAP = {
  CL_VS_WashingMachine_WashingAssist: {
    parameterKey: "CL_VS_Device_WashinMachine",
    configKey: "deviceWashingMachine",
    featureKey: "washingAssist",
  },
  CL_VS_Dryer_DryingAssist: {
    parameterKey: "CL_VS_Device_TumbleDryer",
    configKey: "deviceTumbleDryer",
    featureKey: "dryingAssist",
  },
  CL_VS_WashingMachineAndDryer_WashDrySync: {
    parameterKey: "CL_VS_Device_TumbleDryer",
    configKey: "deviceTumbleDryer",
    featureKey: "washDrySync",
  },
};

const markets = REMOTE_CONFIG_CONDITIONS.map((condition) => ({
  name: condition.label,
  code: condition.countries?.[0]?.slice(0, 2).toUpperCase() || "-",
  segments: condition.platform || "All",
  status: "Active",
}));

// ── Copied from Features.jsx so we can parse JSON remote config keys ─────────
function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function buildConfigData(parsedConfig, configKey) {
  const energyKeys = ["energyConsumption", "washingMachineEnergyConsumption"];

  if (energyKeys.includes(configKey)) {
    const models = parsedConfig[configKey] ?? {};
    return {
      features: [],
      restrictions: [],
      modelOverrides: Object.entries(models).map(([model, enabled]) => ({
        model,
        overrides: [{ key: configKey, name: formatFeatureName(configKey), enabled: Boolean(enabled) }],
      })),
    };
  }

  const defaultConfig = parsedConfig.defaultConfiguration ?? {};
  const deviceConfig = parsedConfig[configKey] ?? {};
  let mergedConfig = { ...defaultConfig, ...deviceConfig };

  if (Object.keys(mergedConfig).length === 0) {
    const firstModel = Object.values(parsedConfig).find(
      (v) => v && typeof v === "object" && !Array.isArray(v)
    );
    mergedConfig = { ...(firstModel ?? {}) };
  }

  const features = Object.entries(mergedConfig)
    .filter(([, value]) => typeof value === "boolean")
    .map(([key, enabled]) => ({ key, name: formatFeatureName(key), enabled }));

  const restrictions = Object.entries(mergedConfig)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, values]) => ({ key, name: formatFeatureName(key), values }));

  const reservedKeys = new Set(["defaultConfiguration", configKey]);
  const conditionLabels = new Set(REMOTE_CONFIG_CONDITIONS.map((c) => c.label));

  const modelOverrides = Object.entries(parsedConfig)
    .filter(([key, value]) =>
      !reservedKeys.has(key) &&
      !conditionLabels.has(key) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    )
    .map(([model, overrides]) => ({
      model,
      overrides: Object.entries(overrides)
        .filter(([, value]) => typeof value === "boolean")
        .map(([featureKey, enabled]) => ({
          key: featureKey,
          name: formatFeatureName(featureKey),
          enabled: Boolean(enabled),
        })),
    }));

  return { features, restrictions, modelOverrides };
}

// ── Builds featureData from Remote Config (both boolean and json keys) ────────
function buildFeatureData() {
  const result = {};

  for (const device of REMOTE_CONFIG_DEVICES) {
    result[device.id] = {};

    const filteredRemoteKeys =
      device.specialParser === "washerDryer"
        ? device.remoteKeys.filter((k) => !duplicatedBooleanFeatures.includes(k.key))
        : device.remoteKeys;

    for (const remoteKey of filteredRemoteKeys) {
      if (remoteKey.type === "boolean") {
        // Če label že obstaja (duplikat iz JSON), dodaj suffix
        const label = result[device.id][remoteKey.label] !== undefined
          ? `${remoteKey.label} (standalone)`
          : remoteKey.label;

        result[device.id][label] = {};
        for (const market of markets) {
          const condition = remoteKey.conditions?.find((c) => c.label === market.name);
          if (condition) {
            result[device.id][label][market.name] = condition.value;
          } else {
            try {
              result[device.id][label][market.name] = getValue(appRemoteConfig, remoteKey.key).asBoolean();
            } catch {
              result[device.id][label][market.name] = false;
            }
          }
        }
      }

      if (remoteKey.type === "json") {
        try {
          const rawValue = getValue(appRemoteConfig, remoteKey.key).asString();
          if (!rawValue) continue;

          const parsedConfig = JSON.parse(rawValue);
          const { features } = buildConfigData(parsedConfig, remoteKey.configKey);

          for (const feature of features) {
            result[device.id][feature.name] = {};
            for (const market of markets) {
              result[device.id][feature.name][market.name] = feature.enabled;
            }
          }
        } catch {
          // preskoči če JSON ni veljaven
        }
      }
    }
  }

  return result;
}

const allFeatureNames = [
  ...new Set(
    REMOTE_CONFIG_DEVICES.flatMap((d) =>
      (d.remoteKeys || [])
        .filter((k) => k.type === "boolean")
        .map((k) => k.label)
    )
  ),
];

const allMarketNames = markets.map((m) => m.name);

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const target = Number(value);
    const duration = 900;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [value]);

  return current;
}

function StatCards({ onNavigate }) {
  const stats = [
    ["globe", markets.length.toString(), "Markets", "markets"],
    ["sliders", REMOTE_CONFIG_DEVICES.length.toString(), "Appliance groups", "features"],
    ["file", contentTypes.length.toString(), "Events", "content"],
  ];
  return (
    <motion.div
      className="stat-grid"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {stats.map(([icon, number, label, view]) => (
        <motion.button
          key={view}
          className="stat"
          type="button"
          onClick={() => onNavigate(view)}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {iconSvg(icon)}
          <div>
            <strong><AnimatedNumber value={number} /></strong>
            <span>{label}</span>
            <em>View all -&gt;</em>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function MarketsTable({ onNavigate }) {
  const limit = appliances.length;
  const rows = markets.slice(0, limit).map((market) => (
    <tr key={market.name}>
      <td style={{ width: "40%" }}><span className="market-name">{market.name}</span></td>
      <td style={{ width: "40%" }}>{market.name}</td>
      <td style={{ width: "20%" }}>{market.segments}</td>
    </tr>
  ));
  return (
    <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Market", "Code", "Segments"].map((h) => (
            <th
              key={h}
              style={{
                textAlign: "left",
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 600,
                borderBottom: "1px solid var(--border, #e5e7eb)",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function EventsChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const top5 = [
    { event_name: "user_engagement", event_count: 24022514 },
    { event_name: "screen_view", event_count: 17004079 },
    { event_name: "ApplianceDashboard_ShortcutBtn", event_count: 11082348 },
    { event_name: "session_start", event_count: 10311584 },
    { event_name: "ApplianceDashboard_Start_Click", event_count: 946414 },
  ];

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: top5.map((r) => r.event_name.replace(/_/g, " ").substring(0, 22)),
        datasets: [{
          data: top5.map((r) => r.event_count),
          backgroundColor: "#185FA5",
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: {
              callback: (v) => v >= 1e6 ? (v / 1e6).toFixed(0) + "M" : (v / 1e3).toFixed(0) + "K",
              font: { size: 10 },
            },
            grid: { color: "rgba(128,128,128,0.08)" },
          },
          y: { ticks: { font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ position: "relative", height: 180 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ApplianceSummary({ featureData }) {
  const headers = ["Appliance", ...markets.map((m) => m.name)];

  const rows = appliances.map((appliance) => {
    const device = REMOTE_CONFIG_DEVICES.find(
      (d) =>
        d.name.toLowerCase() === appliance.name.toLowerCase() ||
        (appliance.name === "Fridge" && d.id === "refrigerator") ||
        (appliance.name === "Washing Machine" && d.id === "washerDryer") ||
        (appliance.name === "Dryer" && d.id === "washerDryer")
    );

    const applianceFeatureData = device ? (featureData[device.id] ?? {}) : {};
    const featureList = Object.keys(applianceFeatureData);

    return (
      <tr key={appliance.id}>
        <td>
          <span className="content-type">
            {device ? (
              <Icon icon={device.icon} className="dashboard-device-icon" />
            ) : (
              <span className="mini-icon appliance-icon" />
            )}
            <span>
              <strong>{appliance.name}</strong>
              <small>{appliance.category}</small>
            </span>
          </span>
        </td>

        {markets.map((market) => {
          const activeCount = featureList.filter(
            (f) => applianceFeatureData[f]?.[market.name] === true
          ).length;

          return (
            <td key={market.name}>
              <span className="score-pill">
                {activeCount}/{featureList.length}
              </span>
            </td>
          );
        })}
      </tr>
    );
  });

  return <Table headers={headers} rows={rows} minWidth={620} />;
}

function RecentAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { collection, getDocs, orderBy, query, limit } = await import("firebase/firestore");
        const { db } = await import("../../firebase");
        const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(5));
        const snap = await getDocs(q);
        const hiddenBefore = Number(localStorage.getItem("auditLogsHiddenBefore") || 0);

        const loadedLogs = snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter((log) => {
            if (!hiddenBefore) return true;

            const logTime = log.timestamp?.toDate
              ? log.timestamp.toDate().getTime()
              : 0;

            return logTime > hiddenBefore;
          });

        setLogs(loadedLogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ fontSize: 13, color: "#888", padding: "1rem 0" }}>Loading...</div>;
  if (!logs.length) return <div style={{ fontSize: 13, color: "#888", padding: "1rem 0" }}>No activity yet.</div>;

  return (
    <div className="activity-list">
      {logs.map((log) => (
        <article key={log.id} className="activity-item">
          <span className="mini-icon" />
          <div>
            <strong>{log.action}</strong>
            <small>{log.details}</small>
          </div>
          <span className="market-chip">{log.userEmail?.split("@")[0]}</span>
          <time>{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "—"}</time>
        </article>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard({ onNavigate, currentUserRole, currentUserEmail }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [featureData, setFeatureData] = useState({});

  useEffect(() => {
    async function initFeatureData() {
      try {
        await fetchAndActivate(appRemoteConfig);
        setFeatureData(buildFeatureData());
      } catch (err) {
        console.error("Failed to init feature data:", err);
      }
    }
    initFeatureData();
  }, []);

  async function handleExecuteAction({ applianceId, feature, market, value, fromChatBot = false }) {
    const device = REMOTE_CONFIG_DEVICES.find((d) => d.id === applianceId);
    if (!device) throw new Error(`Appliance "${applianceId}" was not found.`);

    const remoteKey = device.remoteKeys.find(
      (key) => key.label === feature || key.key === feature
    );
    if (!remoteKey) throw new Error(`Feature "${feature}" was not found in ${device.name}.`);

    let updatePayload = {
      parameterKey: remoteKey.key,
      configKey: remoteKey.configKey,
      featureKey: remoteKey.featureKey ?? remoteKey.key,
      value,
      conditionKey: market !== "Default value" ? market : undefined,
    };

    if (device.specialParser === "washerDryer" && WASHER_DRYER_JSON_FEATURE_MAP[remoteKey.key]) {
      const mapping = WASHER_DRYER_JSON_FEATURE_MAP[remoteKey.key];
      updatePayload = {
        parameterKey: mapping.parameterKey,
        configKey: mapping.configKey,
        featureKey: mapping.featureKey,
        value,
        conditionKey: undefined,
      };
    }

    try {
      await updateRemoteFeature(updatePayload);
    } catch (err) {
      console.error("Firebase update error:", err);
      throw err;
    }

    const action = value ? "enabled" : "disabled";
    const source = fromChatBot ? " (ChatBot)" : "";
    const userEmailForLog = currentUserEmail || "unknown@system";

    await logAction({
      userEmail: userEmailForLog,
      action: `Feature updated${source}`,
      details: `${action} ${feature} for ${device.name} in ${market}`,
    });

    try {
      await fetchAndActivate(appRemoteConfig);
    } catch (err) {
      console.error("Failed to refresh app remote config after update:", err);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("connectlifeRemoteConfigUpdated"));
    }

    setFeatureData((prev) => ({
      ...prev,
      [applianceId]: {
        ...prev[applianceId],
        [feature]: {
          ...prev[applianceId]?.[feature],
          [market]: value,
        },
      },
    }));
  }

  return (
    <>
      <StatCards onNavigate={onNavigate} />

      <div className="two-col">
        <section className="panel">
          <div className="panel-header">
            <h2>Markets</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("markets")}>
              View all markets
            </button>
          </div>
          <div className="table-scroll">
            <MarketsTable onNavigate={onNavigate} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Feature summary</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("features")}>
              View all features
            </button>
          </div>
          <div className="table-scroll">
            <ApplianceSummary featureData={featureData} />
          </div>
        </section>
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-header">
            <h2>Events summary</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("content")}>
              View all events
            </button>
          </div>
          <EventsChart />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recent activity</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("audit")}>
              View full log
            </button>
          </div>
          <RecentAuditLog />
        </section>
      </div>

      <button
        className="chat-fab"
        onClick={() => setChatOpen((o) => !o)}
        aria-label="Open AI assistant"
        title="ConnectLife Assistant"
      >
        🤖
      </button>

      {chatOpen && (
        <ChatBot
          availableMarkets={allMarketNames}
          availableFeatures={allFeatureNames}
          featureData={featureData}
          onExecuteAction={handleExecuteAction}
          onClose={() => setChatOpen(false)}
          userEmail={currentUserEmail}
        />
      )}

      <footer className="footer">
        <span>ConnectLife App Management Portal</span>
        <strong>Hisense</strong>
      </footer>
    </>
  );
}