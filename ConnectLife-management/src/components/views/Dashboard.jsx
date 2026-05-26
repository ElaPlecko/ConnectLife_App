import { useEffect, useState } from "react";
import { appliances, activities, contentTypes } from "../../data/data.js";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions.js";
import { REMOTE_CONFIG_DEVICES } from "../../config/remoteConfigDevices.js";
import { iconSvg, Table } from "../../utils/helpers.jsx";
import { motion } from "framer-motion";

const markets = REMOTE_CONFIG_CONDITIONS.map((condition) => ({
  name: condition.label,
  code:
    condition.countries?.[0]
      ?.slice(0, 2)
      .toUpperCase() || "-",
  segments: condition.platform || "All",
  status: "Active",
  updated: "Today",
}));

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

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [value]);

  return current;
}

function StatCards({ onNavigate }) {
  const stats = [
  ["globe", markets.length.toString(), "Markets", "markets"],
  ["sliders", REMOTE_CONFIG_DEVICES.length.toString(), "Appliance groups", "features"],
  ["file", contentTypes.length.toString(), "Content types", "content"],
  ["link", linkKeys.length.toString(), "External links", "links"],
  ];
  return (
    <motion.div
      className="stat-grid"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
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
            <strong>
              <AnimatedNumber value={number} />
            </strong>
            <span>{label}</span>
            <em>View all -&gt;</em>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function MarketsTable({ limit, onNavigate }) {
  const rows = markets.slice(0, limit || markets.length).map((market) => (
    <tr key={market.name}>
      <td><span className="market-name">{market.name}</span></td>
      <td>{market.name}</td>
      <td>{market.segments}</td>
      <td><span className={`badge ${market.status.toLowerCase()}`}>{market.status}</span></td>
      <td>{market.updated}</td>
      <td className="more">...</td>
    </tr>
  ));
  return <Table headers={["Market", "Code", "Segments", "Status", "Last updated", ""]} rows={rows} />;
}

function ContentTable() {

  const rows = contentTypes.map(([type, description]) => (
    <tr key={type}>
      <td>
        <span className="content-type">
          <span className="mini-icon" />

          <span>
            <strong>{type}</strong>
            <small>{description}</small>
          </span>
        </span>
      </td>

      {markets.map((market) => (
        <td key={market.name}>-</td>
      ))}
    </tr>
  ));

  return (
    <Table
      headers={[
        "Content type",
        ...markets.map((m) => <>{m.name}</>),
      ]}
      rows={rows}
      minWidth={620}
    />
  );
}

const linkKeys = ["Support", "Warranty", "Shop"];
function LinksTable() {
  const rows = linkKeys.map((type) => (
    <tr key={type}>
      <td>
        <strong>{type}</strong>
      </td>

      {markets.map((market) => (
        <td key={market.name}>-</td>
      ))}
    </tr>
  ));

  return (
    <Table
      headers={[
        "Link type",
        ...markets.map((m) => <>{m.name}</>),
      ]}
      rows={rows}
      minWidth={760}
    />
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
            <span><strong>{appliance.name}</strong><small>{appliance.category}</small></span>
          </span>
        </td>
        {markets.map((market) => {
          const activeCount = featureList.filter((f) => appliance.features[f][market.name]).length;
          return <td key={market.name}><span className="score-pill">{activeCount}/{featureList.length}</span></td>;
        })}
      </tr>
    );
  });
  return <Table headers={headers} rows={rows} minWidth={620} />;
}

function ActivityList() {
  return (
    <div className="activity-list">
      {activities.map(([action, entity, market, time], i) => (
        <article key={i} className="activity-item">
          <span className="mini-icon" />
          <div><strong>{action}</strong><small>{entity}</small></div>
          <span className="market-chip">{market}</span>
          <time>{time}</time>
        </article>
      ))}
    </div>
  );
}

export default function Dashboard({ onNavigate, currentUserRole }) {
  return (
    <>
      <StatCards onNavigate={onNavigate} />
      <div className="two-col">
        <section className="panel">
          <div className="panel-header">
            <h2>Markets</h2>
            {currentUserRole === "admin" && (
            <button
              className="primary-button"
              type="button"
            >
              + Add Market
            </button>
          )}
          </div>
          <MarketsTable onNavigate={onNavigate} />
          <button className="text-link" type="button" onClick={() => onNavigate("markets")}>View all markets -&gt;</button>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>Feature summary</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("features")}>Manage features</button>
          </div>
          <ApplianceSummary />
          <button className="text-link" type="button" onClick={() => onNavigate("features")}>View all features -&gt;</button>
        </section>
      </div>
      <div className="three-col">
        <section className="panel">
          <div className="panel-header">
            <h2>Content summary</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("content")}>Manage content</button>
          </div>
          <ContentTable />
          <button className="text-link" type="button" onClick={() => onNavigate("content")}>View all content -&gt;</button>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>External links summary</h2>
            <button className="text-link" type="button" onClick={() => onNavigate("links")}>Manage links</button>
          </div>
          <LinksTable />
          <button className="text-link" type="button" onClick={() => onNavigate("links")}>View all links -&gt;</button>
        </section>
        <section className="panel">
          <h2>Recent activity</h2>
          <ActivityList />
          <button className="text-link" type="button" onClick={() => onNavigate("audit")}>View full log -&gt;</button>
        </section>
      </div>
      <footer className="footer">
        <span>ConnectLife App Management Portal (POC)</span><strong>Hisense</strong>
      </footer>
    </>
  );
}
