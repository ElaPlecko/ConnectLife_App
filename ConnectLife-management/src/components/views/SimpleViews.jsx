import { markets, segments, contentTypes, users, activities } from "../../data/data.js";
import { flagIcon, Table } from "../../utils/helpers.jsx";

function SimplePanel({ title, action, children }) {
  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {action && <button className="primary-button" type="button">{action}</button>}
      </div>
      {children}
    </section>
  );
}

export function Markets() {
  const rows = markets.map((market) => (
    <tr key={market.code}>
      <td><span className="market-name">{flagIcon(market)}{market.name}</span></td>
      <td>{market.code}</td>
      <td>{market.segments}</td>
      <td><span className={`badge ${market.status.toLowerCase()}`}>{market.status}</span></td>
      <td>{market.updated}</td>
      <td className="more">...</td>
    </tr>
  ));
  return (
    <SimplePanel title="Markets" action="+ Add Market">
      <Table headers={["Market", "Code", "Segments", "Status", "Last updated", ""]} rows={rows} />
    </SimplePanel>
  );
}

export function Segments() {
  const rows = segments.map(([name, description, marketList]) => (
    <tr key={name}>
      <td><strong>{name}</strong></td>
      <td>{description}</td>
      <td>{marketList}</td>
    </tr>
  ));
  return (
    <SimplePanel title="Segments" action="+ Add Segment">
      <Table headers={["Segment", "Description", "Markets"]} rows={rows} minWidth={640} />
    </SimplePanel>
  );
}

export function Content() {
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
  return (
    <SimplePanel title="Content" action="Manage Content">
      <Table headers={["Content type", ...markets.map((m) => <>{flagIcon(m)} {m.code}</>)]} rows={rows} minWidth={620} />
    </SimplePanel>
  );
}

export function Links() {
  const linkKeys = Object.keys(markets[0].links);
  const rows = linkKeys.map((type) => (
    <tr key={type}>
      <td><strong>{type}</strong></td>
      {markets.map((market) => <td key={market.code}>{market.links[type]}</td>)}
    </tr>
  ));
  return (
    <SimplePanel title="External Links" action="Manage Links">
      <Table headers={["Link type", ...markets.map((m) => <>{flagIcon(m)} {m.code}</>)]} rows={rows} minWidth={760} />
    </SimplePanel>
  );
}

export function Users() {
  const rows = users.map(([email, role, scope, status]) => (
    <tr key={email}>
      <td>{email}</td>
      <td>{role}</td>
      <td>{scope}</td>
      <td><span className={`badge ${status.toLowerCase()}`}>{status}</span></td>
    </tr>
  ));
  return (
    <SimplePanel title="Users" action="Invite User">
      <Table headers={["User", "Role", "Scope", "Status"]} rows={rows} minWidth={680} />
    </SimplePanel>
  );
}

export function AuditLog() {
  const rows = activities.map(([action, entity, market, time], i) => (
    <tr key={i}>
      <td>{action}</td>
      <td>{entity}</td>
      <td>{market}</td>
      <td>{time}</td>
    </tr>
  ));
  return (
    <SimplePanel title="Audit Log">
      <Table headers={["Action", "Entity", "Market", "Time"]} rows={rows} minWidth={680} />
    </SimplePanel>
  );
}

export function Settings() {
  return (
    <SimplePanel title="Settings" action="Save Settings">
      <div className="settings-grid">
        <label><span>Portal name</span><input defaultValue="ConnectLife App Management Portal" /></label>
        <label><span>Brand color</span><input defaultValue="#00AAA6" /></label>
        <label><span>Environment</span><input defaultValue="POC" /></label>
      </div>
    </SimplePanel>
  );
}