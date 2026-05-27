import { useState, useEffect, useRef, useCallback } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// ─── Mock API ────────────────────────────────────────────────────────────────
// Zamenjaj to funkcijo s pravim fetch() klicem na tvoj backend/Firebase endpoint
const API_URL = "https://mock-api.firebase-analytics.demo/v1/events";

async function fetchEvents() {
  // TODO: zamenjaj z:
  // const res = await fetch(API_URL);
  // return res.json();
  await new Promise((r) => setTimeout(r, 700));
  return MOCK_DATA;
}

function EventsSkeleton() {
  return (
    <div>
      <div style={styles.metrics}>
        {[1, 2, 3, 4].map((item) => (
          <div style={styles.metricCard} key={item}>
            <div style={{ ...styles.skeletonLine, width: "55%", height: 12 }} >
              <div style={styles.skeletonShimmer} />
            </div>
            <div style={{ ...styles.skeletonLine, width: "38%", height: 26, marginTop: 12 }} >
              <div style={styles.skeletonShimmer} />
            </div>
            <div style={{ ...styles.skeletonLine, width: "70%", height: 10, marginTop: 10 }} >
              <div style={styles.skeletonShimmer} />
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={{ ...styles.skeletonLine, width: "35%", height: 12 }} >
            <div style={styles.skeletonShimmer} />
          </div>
          <div style={{ ...styles.skeletonBlock, height: 300, marginTop: 18 }} >
            <div style={styles.skeletonShimmer} />
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={{ ...styles.skeletonLine, width: "45%", height: 12 }} >
            <div style={styles.skeletonShimmer} />
          </div>
          <div style={{ ...styles.skeletonCircle, margin: "28px auto 0" }} >
            <div style={styles.skeletonShimmer} />
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div style={{ ...styles.skeletonLine, height: 34, marginBottom: 10 }} key={item} >
            <div style={styles.skeletonShimmer} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function categorize(name) {
  if (/^(user_engagement|session_start|first_open|screen_view|app_update|app_remove|app_clear_data|app_exception|os_update|screen_view_third_party|notification|fiam)/.test(name)) return "System";
  if (/^(SignIn|SignUp|VerifyOTP|PrivacyPolicy|TermsCondition|DeviceOnBoard)/.test(name)) return "Auth";
  if (/^AddDevice/.test(name)) return "Add device";
  if (/^(ApplianceDashboard|Appliance_|DWAppliance|custom_appliance|custom_remote)/.test(name)) return "Appliance";
  if (/^(DishDesigner|MealPlanner|wine_lable|Instacart)/.test(name)) return "Food & recipes";
  if (/^(Automation|ManualRoutines|AddRoutine|SmartDelay|AirCare|ElectricityPrice|FixedPrice|PeakPrice|DynamicTariff|Energy_Usage|DemandResponse)/.test(name)) return "Automation";
  if (/^(agent_|AiTroubleShooting|SupportScan)/.test(name)) return "AI agent";
  if (/^(Laundry|settings_)/.test(name)) return "Appliance settings";
  if (/^(custom_|BtnClick|campaign|Event_For)/.test(name)) return "Custom / misc";
  return "Other";
}

const CAT_COLORS = {
  "System": "#185FA5", "Auth": "#639922", "Add device": "#BA7517",
  "Appliance": "#993556", "Food & recipes": "#533AB7", "Automation": "#0F6E56",
  "AI agent": "#993C1D", "Appliance settings": "#5F5E5A", "Custom / misc": "#888780", "Other": "#A32D2D",
};

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toLocaleString();
}

function AnimatedNumber({ value, format = (n) => n.toLocaleString(), duration = 900 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCurrent(target * eased);

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [value, duration]);

  return format(current);
}

function VolumeTag({ count }) {
  if (count > 1e6) return <span style={styles.tagHigh}>High</span>;
  if (count > 10000) return <span style={styles.tagMed}>Med</span>;
  return <span style={styles.tagLow}>Low</span>;
}

// ─── Chart components using Chart.js directly ────────────────────────────────
function TopBarChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    if (chartRef.current) chartRef.current.destroy();

    const top10 = data.slice(0, 10);
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: top10.map((r) => r.event_name.replace(/_/g, " ").substring(0, 24)),
        datasets: [{
          label: "Event count",
          data: top10.map((r) => r.event_count),
          backgroundColor: "#185FA5",
          borderRadius: 3,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { callback: (v) => fmt(v), font: { size: 11 } }, grid: { color: "rgba(128,128,128,0.1)" } },
          y: { ticks: { font: { size: 11 } }, grid: { display: false } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div style={{ position: "relative", height: 300 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function CategoryDoughnut({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    if (chartRef.current) chartRef.current.destroy();

    const cats = {};
    data.forEach((r) => { cats[r.category] = (cats[r.category] || 0) + r.event_count; });
    const labels = Object.keys(cats);
    const values = labels.map((l) => cats[l]);
    const colors = labels.map((l) => CAT_COLORS[l] || "#888");

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 8 } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${fmt(ctx.raw)}` } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div style={{ position: "relative", height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, format }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.metricValue}>
        <AnimatedNumber value={value} format={format} />
      </div>
      {sub && <div style={styles.metricSub}>{sub}</div>}
    </div>
  );
}

function ApiBar({ status, onRefetch }) {
  const dotColor = status === "ok" ? "#639922" : status === "loading" ? "#BA7517" : "#A32D2D";
  const label = status === "ok" ? "200 OK" : status === "loading" ? "Fetching..." : "Error";
  return (
    <div style={styles.apiBar}>
      <span style={{ ...styles.statusDot, background: dotColor }} />
      <span style={{ ...styles.statusLabel, color: dotColor }}>{label}</span>
      <span style={styles.apiUrl}>{API_URL}</span>
      <button style={styles.refetchBtn} onClick={onRefetch}>↺ Refetch</button>
    </div>
  );
}

function EventsTable({ data }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState("event_count");
  const [sortDir, setSortDir] = useState(-1);
  const PAGE_SIZE = 15;

  const filtered = data
    .filter((r) => r.event_name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      return typeof av === "string" ? av.localeCompare(bv) * sortDir : (av - bv) * sortDir;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const rows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const maxUsers = Math.max(...filtered.map((r) => r.total_users), 1);

  function handleSort(col) {
    if (col === sortCol) setSortDir((d) => d * -1);
    else { setSortCol(col); setSortDir(-1); }
    setPage(0);
  }

  const arrow = (col) => sortCol === col ? (sortDir > 0 ? " ↑" : " ↓") : "";

  return (
    <div style={styles.tableCard}>
      <div style={styles.tableHeader}>
        <span style={styles.chartTitle}>All events</span>
        <input
          style={styles.searchInput}
          placeholder="Search event..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[["event_name","Event name"],["event_count","Count"],["total_users","Users"],["count_per_user","Per user"],["category","Volume"]].map(([col, label]) => (
                <th key={col} style={styles.th} onClick={() => handleSort(col)}>
                  {label}{arrow(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.event_name}>
                <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12 }}>{r.event_name}</td>
                <td style={{ ...styles.td, textAlign: "right" }}>{r.event_count.toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={styles.barBg}>
                      <div style={{ ...styles.barFill, width: `${Math.round(r.total_users / maxUsers * 100)}%` }} />
                    </div>
                    <span style={{ fontSize: 12, minWidth: 60, textAlign: "right" }}>{r.total_users.toLocaleString()}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, textAlign: "right" }}>{r.count_per_user.toFixed(2)}</td>
                <td style={styles.td}><VolumeTag count={r.event_count} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.pageRow}>
        <button style={styles.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page === 0}>← Back</button>
        <span style={{ fontSize: 12, color: cv.textSecondary }}>Page {page + 1} / {totalPages} ({filtered.length} events)</span>
        <button style={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>Next →</button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventsDashboard() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await fetchEvents();
      setData(result);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalCount = data.reduce((s, r) => s + r.event_count, 0);
  const maxUsers = data.length ? Math.max(...data.map((r) => r.total_users)) : 0;
  const avgPer = data.length ? data.reduce((s, r) => s + r.count_per_user, 0) / data.length : 0;

  return (
    <>
    <style>
      {`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}
    </style>
    <div style={styles.dash}>  
      <ApiBar status={status} onRefetch={load} />

      {status === "loading" && <EventsSkeleton />}
      {status === "error" && <div style={styles.loading}>Error loading data. Please try again.</div>}

      {status === "ok" && data.length > 0 && (
        <>
          <div style={styles.metrics}>
            <MetricCard label="Total event types" value={data.length} sub="distinct events" />
            <MetricCard label="Total event count" value={totalCount} format={fmt} sub="all triggers combined" />
            <MetricCard label="Max unique users" value={maxUsers} format={fmt} sub="per event" />
            <MetricCard label="Avg per active user" value={avgPer} format={(n) => n.toFixed(1)} sub="average engagement" />
          </div>

          <div style={styles.chartsRow}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>Top 10 events by event count</div>
              <TopBarChart data={data} />
            </div>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>Event categories</div>
              <CategoryDoughnut data={data} />
            </div>
          </div>

          <EventsTable data={data} />
        </>
      )}
    </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const cv = {
  textPrimary:   "var(--color-text-primary,   #111)",
  textSecondary: "var(--color-text-secondary, #666)",
  textTertiary:  "var(--color-text-tertiary,  #999)",
  bgPrimary:     "var(--color-background-primary,   #fff)",
  bgSecondary:   "var(--color-background-secondary, #f5f5f3)",
  borderTert:    "var(--color-border-tertiary,  rgba(0,0,0,0.1))",
  borderSec:     "var(--color-border-secondary, rgba(0,0,0,0.2))",
};

const styles = {
  dash: { padding: "1rem 0", fontFamily: "sans-serif", color: cv.textPrimary },
  apiBar: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: cv.bgSecondary, border: `0.5px solid ${cv.borderTert}`, borderRadius: 8, marginBottom: "1.5rem", fontSize: 13 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  statusLabel: { fontWeight: 500, flexShrink: 0 },
  apiUrl: { color: cv.textSecondary, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  refetchBtn: { fontSize: 12, padding: "4px 12px", border: `0.5px solid ${cv.borderSec}`, borderRadius: 8, cursor: "pointer", background: cv.bgPrimary, color: cv.textPrimary },
  metrics: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.5rem" },
  metricCard: { background: cv.bgSecondary, borderRadius: 8, padding: "14px 16px" },
  metricLabel: { fontSize: 12, color: cv.textSecondary, marginBottom: 6 },
  metricValue: { fontSize: 22, fontWeight: 500, color: cv.textPrimary },
  metricSub: { fontSize: 11, color: cv.textTertiary, marginTop: 2 },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginBottom: "1.5rem" },
  chartCard: { background: cv.bgPrimary, border: `0.5px solid ${cv.borderTert}`, borderRadius: 12, padding: "1rem 1.25rem" },
  chartTitle: { fontSize: 11, fontWeight: 500, color: cv.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", display: "block" },
  tableCard: { background: cv.bgPrimary, border: `0.5px solid ${cv.borderTert}`, borderRadius: 12, padding: "1rem 1.25rem" },
  tableHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  searchInput: { fontSize: 13, padding: "6px 10px", border: `0.5px solid ${cv.borderSec}`, borderRadius: 8, width: 200, background: cv.bgSecondary, color: cv.textPrimary },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 500, color: cv.textSecondary, padding: "6px 8px", borderBottom: `0.5px solid ${cv.borderTert}`, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer", userSelect: "none" },
  td: { padding: "8px 8px", borderBottom: `0.5px solid ${cv.borderTert}`, color: cv.textPrimary },
  barBg: { flex: 1, height: 6, background: cv.bgSecondary, borderRadius: 3, overflow: "hidden", minWidth: 60 },
  barFill: { height: "100%", borderRadius: 3, background: "#185FA5",transition: "width 0.45s ease" },
  pageRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 12 },
  pageBtn: { padding: "4px 10px", border: `0.5px solid ${cv.borderSec}`, borderRadius: 8, cursor: "pointer", background: cv.bgPrimary, color: cv.textPrimary, fontSize: 12 },
  tagHigh: { fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500, background: "rgba(24, 95, 165, 0.15)", color: "#5da0e8" },
  tagMed:  { fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500, background: "rgba(99, 153, 34,  0.15)", color: "#7dc043" },
  tagLow:  { fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500, background: cv.bgSecondary, color: cv.textSecondary },
  loading: { textAlign: "center", padding: "3rem", color: cv.textSecondary, fontSize: 14 },
  skeletonLine: { position: "relative", overflow: "hidden", borderRadius: 999, background: cv.bgSecondary},
  skeletonBlock: { position: "relative", overflow: "hidden", borderRadius: 12, background: cv.bgSecondary},
  skeletonCircle: { position: "relative", overflow: "hidden", width: 190, height: 190, borderRadius: "50%", background: cv.bgSecondary},
  skeletonShimmer: { position: "absolute", inset: 0, transform: "translateX(-100%)", background: "linear-gradient(90deg, transparent, rgba(0,154,157,0.14), transparent)", animation: "shimmer 1.25s infinite"},
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DATA = [
  { event_name: "user_engagement", event_count: 24022514, total_users: 1012397, count_per_user: 23.73, category: "System" },
  { event_name: "screen_view", event_count: 17004079, total_users: 972373, count_per_user: 17.98, category: "System" },
  { event_name: "ApplianceDashboard_ShortcutBtn_OnClick", event_count: 11082348, total_users: 519159, count_per_user: 21.47, category: "Appliance" },
  { event_name: "session_start", event_count: 10311584, total_users: 1073414, count_per_user: 10.13, category: "System" },
  { event_name: "ApplianceDashboard_Start_Click", event_count: 946414, total_users: 151408, count_per_user: 6.26, category: "Appliance" },
  { event_name: "AddDevice_QRCode_Scan", event_count: 705326, total_users: 110302, count_per_user: 6.40, category: "Add device" },
  { event_name: "AddDevice_CategorySelect_OnClick", event_count: 451042, total_users: 184558, count_per_user: 2.44, category: "Add device" },
  { event_name: "os_update", event_count: 424013, total_users: 360252, count_per_user: 1.50, category: "System" },
  { event_name: "SignIn_SignIn_OnClick", event_count: 421209, total_users: 190159, count_per_user: 2.23, category: "Auth" },
  { event_name: "SignInUp_SocialAuth_OnClick", event_count: 298847, total_users: 205664, count_per_user: 1.46, category: "Auth" },
  { event_name: "AddDevice_WiFi_Detected", event_count: 266131, total_users: 130357, count_per_user: 2.04, category: "Add device" },
  { event_name: "first_open", event_count: 223069, total_users: 218189, count_per_user: 1.02, category: "System" },
  { event_name: "ApplianceDashboard_FavoriteStart_Click", event_count: 192761, total_users: 26500, count_per_user: 7.33, category: "Appliance" },
  { event_name: "AddDevice_ApplianceTypeSelect_OnClick", event_count: 174298, total_users: 78419, count_per_user: 2.22, category: "Add device" },
  { event_name: "SignInUp_SocialAuth_Success", event_count: 167361, total_users: 150310, count_per_user: 1.12, category: "Auth" },
  { event_name: "SignUp_Next_OnClick", event_count: 138557, total_users: 136014, count_per_user: 1.02, category: "Auth" },
  { event_name: "app_update", event_count: 137552, total_users: 135395, count_per_user: 1.12, category: "System" },
  { event_name: "SignIn_CreateAccount_OnClick", event_count: 91620, total_users: 82036, count_per_user: 1.12, category: "Auth" },
  { event_name: "SignUp_CreateAccount_OnClick", event_count: 90952, total_users: 72025, count_per_user: 1.26, category: "Auth" },
  { event_name: "Appliance_Assist_Start", event_count: 86201, total_users: 22379, count_per_user: 3.86, category: "Appliance" },
  { event_name: "Appliance_FavoriteStart_Click", event_count: 72497, total_users: 10211, count_per_user: 7.14, category: "Appliance" },
  { event_name: "VerifyOTP_CreateAccount_OnClick", event_count: 65819, total_users: 59199, count_per_user: 1.11, category: "Auth" },
  { event_name: "Automation_Start_OnClick", event_count: 42530, total_users: 6822, count_per_user: 6.26, category: "Automation" },
  { event_name: "ManualRoutinesStartBtns_OnClick", event_count: 38084, total_users: 6566, count_per_user: 5.82, category: "Automation" },
  { event_name: "app_remove", event_count: 36426, total_users: 33657, count_per_user: 2.37, category: "System" },
  { event_name: "SmartDelay_Btn_Click", event_count: 32556, total_users: 8647, count_per_user: 3.78, category: "Automation" },
  { event_name: "Automation_Add_OnClick", event_count: 31972, total_users: 11355, count_per_user: 2.82, category: "Automation" },
  { event_name: "AirCare_Optimize_Click", event_count: 30012, total_users: 9452, count_per_user: 3.18, category: "Automation" },
  { event_name: "AiTroubleShooting_ActionBtns_OnClick", event_count: 25593, total_users: 12207, count_per_user: 2.10, category: "AI agent" },
  { event_name: "ElectricityPrice_Enable_Switch", event_count: 23042, total_users: 15511, count_per_user: 1.49, category: "Automation" },
  { event_name: "SupportScanBtn_OnClick", event_count: 21034, total_users: 16995, count_per_user: 1.24, category: "AI agent" },
  { event_name: "AddRoutineEnable_OnClick", event_count: 19432, total_users: 9658, count_per_user: 2.02, category: "Automation" },
  { event_name: "DishDesigner_Recipe_Swipe", event_count: 18649, total_users: 1786, count_per_user: 10.52, category: "Food & recipes" },
  { event_name: "DishDesigner_Spin_OnClick", event_count: 17100, total_users: 3144, count_per_user: 5.47, category: "Food & recipes" },
  { event_name: "AddDevice_Popup_View", event_count: 15453, total_users: 9597, count_per_user: 1.61, category: "Add device" },
  { event_name: "AddDevice_Pairing_Failed", event_count: 15391, total_users: 10187, count_per_user: 1.51, category: "Add device" },
  { event_name: "Automation_Toggle_OnClick", event_count: 15099, total_users: 3271, count_per_user: 4.66, category: "Automation" },
  { event_name: "agent_entry_tap", event_count: 14430, total_users: 8277, count_per_user: 1.76, category: "AI agent" },
  { event_name: "ApplianceDashboard_Favorite_Click", event_count: 14200, total_users: 9166, count_per_user: 1.55, category: "Appliance" },
  { event_name: "DishDesigner_ManualIngreAdd_OnClick", event_count: 13848, total_users: 1282, count_per_user: 10.88, category: "Food & recipes" },
  { event_name: "LaundryRecommendguide_FinishButton_Click", event_count: 12308, total_users: 10326, count_per_user: 1.19, category: "Appliance settings" },
  { event_name: "SelectDeviceType_Btn_OnClick", event_count: 10962, total_users: 6768, count_per_user: 1.62, category: "Add device" },
  { event_name: "DishDesigner_EntryBtn_OnClick", event_count: 9106, total_users: 8976, count_per_user: 1.02, category: "Food & recipes" },
  { event_name: "FixedPrice_DoneBtn_OnClick", event_count: 8112, total_users: 6309, count_per_user: 1.29, category: "Automation" },
  { event_name: "MealPlanner_Entry_OnClick", event_count: 8098, total_users: 6036, count_per_user: 1.34, category: "Food & recipes" },
  { event_name: "agent_close_tap", event_count: 7250, total_users: 4921, count_per_user: 1.48, category: "AI agent" },
  { event_name: "custom_dash_board", event_count: 6837, total_users: 3521, count_per_user: 2.08, category: "Custom / misc" },
  { event_name: "agent_screen_view", event_count: 6641, total_users: 6553, count_per_user: 1.02, category: "AI agent" },
  { event_name: "LaundryDetergentAssist_AddButton_Click", event_count: 5894, total_users: 2539, count_per_user: 2.32, category: "Appliance settings" },
  { event_name: "NotificationSettings_Toggle_OnClick", event_count: 5615, total_users: 2653, count_per_user: 2.12, category: "Custom / misc" },
  { event_name: "custom_appliance_control_page", event_count: 4081, total_users: 402, count_per_user: 10.15, category: "Appliance" },
  { event_name: "MealPlanner_PickSource_OnClick", event_count: 3909, total_users: 1302, count_per_user: 3.00, category: "Food & recipes" },
  { event_name: "DishDesigner_GenerateRecipe_OnClick", event_count: 3847, total_users: 2098, count_per_user: 1.84, category: "Food & recipes" },
  { event_name: "BtnClick", event_count: 3330, total_users: 1207, count_per_user: 2.77, category: "Custom / misc" },
  { event_name: "campaign_deeplink_opened", event_count: 2691, total_users: 2227, count_per_user: 1.21, category: "Custom / misc" },
  { event_name: "wine_lable_recongnized_Success", event_count: 2571, total_users: 305, count_per_user: 8.46, category: "Food & recipes" },
  { event_name: "app_exception", event_count: 2519, total_users: 2326, count_per_user: 1.32, category: "System" },
  { event_name: "DishDesigner_UseIngreBtn_OnClick", event_count: 2357, total_users: 1787, count_per_user: 1.33, category: "Food & recipes" },
  { event_name: "DishDesigner_SelectRecipeBtn_OnClick", event_count: 2081, total_users: 1076, count_per_user: 1.94, category: "Food & recipes" },
  { event_name: "custom_automation", event_count: 1751, total_users: 281, count_per_user: 6.46, category: "Custom / misc" },
  { event_name: "screen_view_third_party", event_count: 1749, total_users: 529, count_per_user: 3.32, category: "System" },
  { event_name: "AiTroubleShooting_NoInfoFound", event_count: 1550, total_users: 1329, count_per_user: 1.17, category: "AI agent" },
  { event_name: "PrivacyPolicy_Agree_OnClick", event_count: 1299, total_users: 1052, count_per_user: 1.23, category: "Auth" },
  { event_name: "TermsCondition_Agree_OnClick", event_count: 1198, total_users: 1056, count_per_user: 1.13, category: "Auth" },
  { event_name: "app_clear_data", event_count: 1131, total_users: 900, count_per_user: 1.30, category: "System" },
  { event_name: "DishDesigner_FavoriteBtn_OnClick", event_count: 1012, total_users: 430, count_per_user: 2.37, category: "Food & recipes" },
  { event_name: "DeviceOnBoard_GoogleDiscover_Success", event_count: 764, total_users: 593, count_per_user: 1.29, category: "Auth" },
  { event_name: "custom_remote_control", event_count: 747, total_users: 57, count_per_user: 13.11, category: "Appliance" },
  { event_name: "DWApplianceDashboard_delay_time_OnClick", event_count: 677, total_users: 200, count_per_user: 3.40, category: "Appliance" },
  { event_name: "PeakPrice_DoneBtn_OnClick", event_count: 570, total_users: 245, count_per_user: 2.33, category: "Automation" },
  { event_name: "DishDesigner_CreateProfile_OnClick", event_count: 484, total_users: 444, count_per_user: 1.09, category: "Food & recipes" },
  { event_name: "agent_troubleshooting_entry", event_count: 406, total_users: 378, count_per_user: 1.08, category: "AI agent" },
  { event_name: "agent_history_tap", event_count: 355, total_users: 257, count_per_user: 1.38, category: "AI agent" },
  { event_name: "wine_lable_recongnized_Failure", event_count: 340, total_users: 125, count_per_user: 2.74, category: "Food & recipes" },
  { event_name: "agent_camera_tap", event_count: 298, total_users: 138, count_per_user: 2.16, category: "AI agent" },
  { event_name: "agent_new_chat_tap", event_count: 244, total_users: 185, count_per_user: 1.33, category: "AI agent" },
  { event_name: "agent_program_card_tap", event_count: 191, total_users: 61, count_per_user: 3.13, category: "AI agent" },
  { event_name: "custom_appliance_add_started", event_count: 166, total_users: 65, count_per_user: 2.55, category: "Appliance" },
  { event_name: "custom_appliances", event_count: 156, total_users: 106, count_per_user: 1.63, category: "Appliance" },
  { event_name: "AddDevice_Pairing_Confirm", event_count: 122, total_users: 15, count_per_user: 8.13, category: "Add device" },
  { event_name: "settings_detergentTAB_switch_OnOnClick", event_count: 110, total_users: 92, count_per_user: 1.20, category: "Appliance settings" },
  { event_name: "settings_rinseAidValue_OnClick", event_count: 109, total_users: 71, count_per_user: 1.54, category: "Appliance settings" },
  { event_name: "Instacart_Start_OnClick", event_count: 96, total_users: 15, count_per_user: 6.40, category: "Food & recipes" },
  { event_name: "DynamicTariff_SaveBtn_OnClick", event_count: 82, total_users: 13, count_per_user: 6.31, category: "Automation" },
  { event_name: "Instacart_Handoff_Response", event_count: 69, total_users: 15, count_per_user: 4.60, category: "Food & recipes" },
  { event_name: "AddDevice_SelectCategory_OnClick", event_count: 48, total_users: 18, count_per_user: 2.67, category: "Add device" },
  { event_name: "DishDesigner_StartPreheatBtn_OnClick", event_count: 46, total_users: 23, count_per_user: 2.00, category: "Food & recipes" },
  { event_name: "custom_appliance_settings", event_count: 42, total_users: 19, count_per_user: 2.21, category: "Appliance" },
  { event_name: "AddDevice_Start_OnClick", event_count: 41, total_users: 20, count_per_user: 2.05, category: "Add device" },
  { event_name: "custom_rooms", event_count: 41, total_users: 15, count_per_user: 2.73, category: "Custom / misc" },
  { event_name: "custom_submit_profile", event_count: 30, total_users: 19, count_per_user: 1.58, category: "Custom / misc" },
  { event_name: "AddDevice_HomeNetwork_Connect", event_count: 27, total_users: 15, count_per_user: 1.80, category: "Add device" },
  { event_name: "agent_alternative_answer_tap", event_count: 27, total_users: 20, count_per_user: 1.35, category: "AI agent" },
  { event_name: "Energy_Usage_Notification_Toggle_OnClick", event_count: 22, total_users: 9, count_per_user: 2.44, category: "Automation" },
  { event_name: "custom_manuals", event_count: 22, total_users: 14, count_per_user: 1.57, category: "Custom / misc" },
  { event_name: "custom_activities", event_count: 21, total_users: 10, count_per_user: 2.10, category: "Custom / misc" },
  { event_name: "custom_profile_login", event_count: 20, total_users: 20, count_per_user: 1.00, category: "Custom / misc" },
  { event_name: "agent_dish_designer_entry", event_count: 19, total_users: 13, count_per_user: 1.46, category: "AI agent" },
  { event_name: "custom_appliance_information", event_count: 19, total_users: 11, count_per_user: 1.73, category: "Appliance" },
  { event_name: "AddDevice_Pair_Success", event_count: 18, total_users: 13, count_per_user: 1.38, category: "Add device" },
  { event_name: "DemandResponse_PopupTrigger", event_count: 16, total_users: 2, count_per_user: 8.00, category: "Automation" },
  { event_name: "agent_confirm_selection_tap", event_count: 16, total_users: 13, count_per_user: 1.23, category: "AI agent" },
  { event_name: "campaign_chain_action", event_count: 14, total_users: 3, count_per_user: 4.67, category: "Custom / misc" },
  { event_name: "custom_notifications", event_count: 14, total_users: 7, count_per_user: 2.00, category: "Custom / misc" },
  { event_name: "Instacart_Complete_OnClose", event_count: 13, total_users: 4, count_per_user: 3.25, category: "Food & recipes" },
  { event_name: "custom_preferences", event_count: 13, total_users: 9, count_per_user: 1.44, category: "Custom / misc" },
  { event_name: "custom_add_scene", event_count: 12, total_users: 1, count_per_user: 12.00, category: "Custom / misc" },
  { event_name: "custom_automation_created", event_count: 12, total_users: 1, count_per_user: 12.00, category: "Custom / misc" },
  { event_name: "custom_manual_open", event_count: 12, total_users: 7, count_per_user: 1.71, category: "Custom / misc" },
  { event_name: "custom_see_manual", event_count: 12, total_users: 7, count_per_user: 1.71, category: "Custom / misc" },
  { event_name: "fiam_impression", event_count: 7, total_users: 2, count_per_user: 3.50, category: "System" },
  { event_name: "Event_For_Remember_This_Network", event_count: 6, total_users: 6, count_per_user: 1.00, category: "Custom / misc" },
  { event_name: "fiam_action", event_count: 5, total_users: 2, count_per_user: 2.50, category: "System" },
  { event_name: "custom_unpair_appliance", event_count: 4, total_users: 4, count_per_user: 1.00, category: "Custom / misc" },
  { event_name: "AddDevice_TryAgain_OnClick", event_count: 3, total_users: 3, count_per_user: 1.00, category: "Add device" },
  { event_name: "custom_service", event_count: 3, total_users: 1, count_per_user: 3.00, category: "Custom / misc" },
  { event_name: "LiveActivity_Permission_OnChange", event_count: 2, total_users: 1, count_per_user: 2.00, category: "Custom / misc" },
  { event_name: "custom_room_add_started", event_count: 2, total_users: 2, count_per_user: 1.00, category: "Custom / misc" },
  { event_name: "fiam_dismiss", event_count: 2, total_users: 1, count_per_user: 2.00, category: "System" },
  { event_name: "settings_tabletCounter_switch_OnClick", event_count: 2, total_users: 1, count_per_user: 2.00, category: "Appliance settings" },
  { event_name: "DeviceOnBoard_Matter_Success", event_count: 1, total_users: 1, count_per_user: 1.00, category: "Auth" },
  { event_name: "LiveActivity_Dismiss_OnAction", event_count: 1, total_users: 1, count_per_user: 1.00, category: "Custom / misc" },
  { event_name: "custom_appliance_statistics", event_count: 1, total_users: 1, count_per_user: 1.00, category: "Appliance" },
  { event_name: "custom_profile_password_reset", event_count: 1, total_users: 1, count_per_user: 1.00, category: "Custom / misc" },
  { event_name: "notification_foreground", event_count: 1, total_users: 1, count_per_user: 1.00, category: "System" },
  { event_name: "notification_receive", event_count: 1, total_users: 1, count_per_user: 1.00, category: "System" },
];