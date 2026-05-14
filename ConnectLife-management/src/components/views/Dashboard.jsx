import { markets, appliances, activities, contentTypes } from "../../data/data.js";
import { flagIcon, iconSvg, Table } from "../../utils/helpers.jsx";

function StatCards({ onNavigate }) {
  const stats = [
    ["globe", "4", "Markets", "markets"],
    ["sliders", "5", "Appliance groups", "features"],
    ["file", "4", "Content types", "content"],
    ["link", "4", "External links", "links"],
  ];
  return (
    <div className="stat-grid">
      {stats.map(([icon, number, label, view]) => (
        <button key={view} className="stat" type="button" onClick={() => onNavigate(view)}>
          {iconSvg(icon)}
          <div><strong>{number}</strong><span>{label}</span><em>View all -&gt;</em></div>
        </button>
      ))}
    </div>
  );
}

function MarketsTable({ limit, onNavigate }) {
  const rows = markets.slice(0, limit || markets.length).map((market) => (
    <tr key={market.code}>
      <td><span className="market-name">{flagIcon(market)}{market.name}</span></td>
      <td>{market.code}</td>
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
          <span><strong>{type}</strong><small>{description}</small></span>
        </span>
      </td>
      {markets.map((market) => <td key={market.code}>{market.content[type]}</td>)}
    </tr>
  ));
  return <Table headers={["Content type", ...markets.map((m) => <>{flagIcon(m)} {m.code}</>)]} rows={rows} minWidth={620} />;
}

function LinksTable() {
  const linkKeys = Object.keys(markets[0].links);
  const rows = linkKeys.map((type) => (
    <tr key={type}>
      <td><strong>{type}</strong></td>
      {markets.map((market) => <td key={market.code}>{market.links[type]}</td>)}
    </tr>
  ));
  return <Table headers={["Link type", ...markets.map((m) => <>{flagIcon(m)} {m.code}</>)]} rows={rows} minWidth={760} />;
}

function ApplianceSummary() {
  const headers = ["Appliance", ...markets.map((m) => <>{flagIcon(m)} {m.code}</>)];
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
          const activeCount = featureList.filter((f) => appliance.features[f][market.code]).length;
          return <td key={market.code}><span className="score-pill">{activeCount}/{featureList.length}</span></td>;
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

export default function Dashboard({ onNavigate }) {
  return (
    <>
      <StatCards onNavigate={onNavigate} />
      <div className="two-col">
        <section className="panel">
          <div className="panel-header">
            <h2>Markets</h2>
            <button className="primary-button" type="button">+ Add Market</button>
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
