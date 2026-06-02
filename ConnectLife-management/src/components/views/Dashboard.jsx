import { useEffect, useState, useRef } from "react";
import { appliances, activities, contentTypes } from "../../data/data.js";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions.js";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices.js";
import { iconSvg, Table } from "../../utils/helpers.jsx";
import { motion } from "framer-motion";
import { Chart, registerables } from "chart.js";
import ChatBot from "./ChatBot.jsx";
Chart.register(...registerables);

const markets = REMOTE_CONFIG_CONDITIONS.map((condition) => ({
  name: condition.label,
  code: condition.countries?.[0]?.slice(0, 2).toUpperCase() || "-",
  segments: condition.platform || "All",
  status: "Active",
  updated: "Today",
}));

function buildFeatureData() {
  const result = {};
  for (const device of REMOTE_CONFIG_DEVICES) {
    const appId = device.id;
    result[appId] = {};
    for (const key of (device.remoteKeys || []).filter((k) => k.type === "boolean")) {
      result[appId][key.label] = {};
      for (const market of markets) {
        const condition = key.conditions?.find((c) => c.label === market.name);
        result[appId][key.label][market.name] = condition ? condition.value : true;
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
    let start = 0;
    const duration = 900;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + (target - start) * eased));
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
      <td><span className="market-name">{market.name}</span></td>
      <td>{market.name}</td>
      <td>{market.segments}</td>
      <td>{market.updated}</td>
      <td className="more">...</td>
    </tr>
  ));
  return <Table headers={["Market", "Code", "Segments", "Last updated", ""]} rows={rows} />;
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

function ApplianceSummary() {
  const headers = ["Appliance", ...markets.map((m) => m.name)];
  const rows = appliances.map((appliance) => {
    const featureList = Object.keys(appliance.features);
    return (
      <tr key={appliance.id}>
        <td>
          <span className="content-type">
            <span className="mini-icon appliance-icon" />
            <span>
              <strong>{appliance.name}</strong>
              <small>{appliance.category}</small>
            </span>
          </span>
        </td>
        {markets.map((market) => {
          const activeCount = featureList.filter((f) => appliance.features[f][market.name]).length;
          return (
            <td key={market.name}>
              <span className="score-pill">{activeCount}/{featureList.length}</span>
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
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  // Live featureData – starts from static config, gets updated on chatbot changes
  const [featureData, setFeatureData] = useState(buildFeatureData);

  // ── Firebase write + local state sync ────────────────────────────────────
  async function handleExecuteAction({ applianceId, feature, market, value }) {
    // 1. Optimistic local update so UI reflects change immediately
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

    // 2. Persist to Firebase
    try {
      const { doc, setDoc, serverTimestamp, collection, addDoc } =
        await import("firebase/firestore");
      const { db } = await import("../../firebase");

      // Update the device feature document
      // Adjust the Firestore path to match your actual data model:
      //   remoteConfigDevices/{applianceId}/features/{feature}
      const featureRef = doc(
        db,
        "remoteConfigDevices",
        applianceId,
        "features",
        feature
      );
      await setDoc(
        featureRef,
        { markets: { [market]: value } },
        { merge: true }
      );

      // Write audit log entry
      await addDoc(collection(db, "auditLogs"), {
        action: `Feature ${value ? "enabled" : "disabled"}`,
        details: `${feature} → ${market}: ${value}`,
        userEmail: currentUserEmail || "unknown",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      // Roll back optimistic update on failure
      setFeatureData(buildFeatureData());
      throw err; // re-throw so ChatBot can show the error message
    }
  }

  return (
    <>
      <StatCards onNavigate={onNavigate} />

      <div className="two-col">
        <section className="panel">
          <div className="panel-header">
            <h2>Markets</h2>
            {currentUserRole === "admin" && (
              <button className="primary-button" type="button">+ Add Market</button>
            )}
          </div>
          <div className="table-scroll">
            <MarketsTable onNavigate={onNavigate} />
          </div>
          <button className="text-link" type="button" onClick={() => onNavigate("markets")}>
            View all markets →
          </button>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Feature summary</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("features")}>
              Manage features
            </button>
          </div>
          <div className="table-scroll">
            <ApplianceSummary />
          </div>
          <button className="text-link" type="button" onClick={() => onNavigate("features")}>
            View all features →
          </button>
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
          <button className="text-link" type="button" onClick={() => onNavigate("content")}>
            View all events →
          </button>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recent activity</h2>
          </div>
          <RecentAuditLog />
          <button className="text-link" type="button" onClick={() => onNavigate("audit")}>
            View full log →
          </button>
        </section>
      </div>

      {/* ── Chat FAB ─────────────────────────────────────────────────────── */}
      <button
        className="chat-fab"
        onClick={() => setChatOpen((o) => !o)}
        aria-label="Open AI assistant"
        title="ConnectLife Assistant"
      >
        🤖
      </button>

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      {chatOpen && (
        <ChatBot
          availableMarkets={allMarketNames}
          availableFeatures={allFeatureNames}
          featureData={featureData}
          onExecuteAction={handleExecuteAction}
          onClose={() => setChatOpen(false)}
        />
      )}

      <footer className="footer">
        <span>ConnectLife App Management Portal</span>
        <strong>Hisense</strong>
      </footer>
    </>
  );
}