import { contentTypes, users, activities } from "../../data/data.js";
import { flagIcon, Table } from "../../utils/helpers.jsx";
import { useState } from "react";
import { REMOTE_CONFIG_CONDITIONS } from "../../config/remoteConfigConditions";

function getMarketsFromRemoteConfig() {
  const countries = REMOTE_CONFIG_CONDITIONS.flatMap(
    (condition) => condition.countries ?? []
  );

  return [...new Set(countries)].sort().map((country) => ({
      code: country,
      name: country,
  }));
}

const markets = getMarketsFromRemoteConfig();

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

export function Content() {
  /*const rows = contentTypes.map(([type, description]) => (
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
        <td key={market.code}>
          <span className="badge">Remote Config</span>
        </td>
      ))}
    </tr>
  ));

  return (
    <SimplePanel title="Content" action="Manage Content">
      <Table
        headers={["Content type", ...markets.map((m) => m.code)]}
        rows={rows}
        minWidth={900}
      />
    </SimplePanel>
  );*/
  return (
    <SimplePanel title="Content" action="Manage Content">
      <p className="hint">Content configuration will be connected later.</p>
    </SimplePanel>
  );
}

export function Links() {
  /*const linkTypes = ["FAQ", "Support", "Manuals", "Suggestions & Ideas"];

  const rows = linkTypes.map((type) => (
    <tr key={type}>
      <td>
        <strong>{type}</strong>
      </td>

      {markets.map((market) => (
        <td key={market.code}>
          <span className="badge">Configured</span>
        </td>
      ))}
    </tr>
  ));

  return (
    <SimplePanel title="External Links" action="Manage Links">
      <Table
        headers={["Link type", ...markets.map((m) => m.code)]}
        rows={rows}
        minWidth={900}
      />
    </SimplePanel>
  );*/
  return (
    <SimplePanel title="External Links" action="Manage Links">
      <p className="hint">External links configuration will be connected later.</p>
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

export function Settings({ brandColor, setBrandColor }) {
  const handleSave = () => {
    document.documentElement.style.setProperty("--hisense", brandColor);
    document.documentElement.style.setProperty("--hisense-dark", brandColor);
  };

  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>Settings</h2>
        <button className="primary-button" type="button" onClick={handleSave}>
          Save Settings
        </button>
      </div>
      <div className="settings-grid">
        <label><span>Portal name</span><input defaultValue="ConnectLife App Management Portal" /></label>
        <label>
          <span>Brand color</span>
          <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
        </label>
        <label><span>Environment</span><input defaultValue="POC" /></label>
      </div>
    </section>
  );
}
  export { Markets } from "../../pages/Markets";