import { useState } from "react";
import { markets, appliances } from "../../data/data.js";
import { flagIcon } from "../../utils/helpers.jsx";

export default function Comparison() {
  const [marketA, setMarketA] = useState("SI");
  const [marketB, setMarketB] = useState("DE");

  const a = markets.find((m) => m.code === marketA);
  const b = markets.find((m) => m.code === marketB);

  return (
    <section className="panel page-panel comparison-page">
      <div className="panel-header">
        <h2>Market Comparison</h2>
        <span className="hint">Compare appliance features, links and content between markets.</span>
      </div>
      <div className="compare-selectors">
        <label>
          <span>Market A</span>
          <select value={marketA} onChange={(e) => setMarketA(e.target.value)}>
            {markets.map((m) => <option key={m.code} value={m.code}>{m.code} — {m.localName}</option>)}
          </select>
        </label>
        <span className="vs">vs</span>
        <label>
          <span>Market B</span>
          <select value={marketB} onChange={(e) => setMarketB(e.target.value)}>
            {markets.map((m) => <option key={m.code} value={m.code}>{m.code} — {m.localName}</option>)}
          </select>
        </label>
      </div>

      <div className="comparison-stack">
        {appliances.map((appliance) => {
          const featureList = Object.keys(appliance.features);
          const aCount = featureList.filter((f) => appliance.features[f][a.code]).length;
          const bCount = featureList.filter((f) => appliance.features[f][b.code]).length;
          return (
            <section key={appliance.id} className="comparison-appliance">
              <div className="appliance-heading">
                <span className="mini-icon appliance-icon" />
                <div><h3>{appliance.name}</h3><p>{appliance.category}</p></div>
              </div>
              <div className="compare-box">
                <div className="compare-section">
                  <span>Feature</span>
                  <span>{flagIcon(a)} {a.code} <em>{aCount}/{featureList.length}</em></span>
                  <span>{flagIcon(b)} {b.code} <em>{bCount}/{featureList.length}</em></span>
                </div>
                {featureList.map((feature) => {
                  const aOn = appliance.features[feature][a.code];
                  const bOn = appliance.features[feature][b.code];
                  return (
                    <div key={feature} className="compare-row">
                      <span>{feature}</span>
                      <span className={aOn ? "on-text" : "off-text"}>{aOn ? "ON" : "OFF"}</span>
                      <span className={bOn ? "on-text" : "off-text"}>{bOn ? "ON" : "OFF"}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="comparison-appliance">
          <div className="appliance-heading">
            <span className="mini-icon" />
            <div><h3>Market links</h3><p>External destinations per selected market</p></div>
          </div>
          <div className="compare-box">
            <div className="compare-section">
              <span>Link type</span>
              <span>{flagIcon(a)} {a.code}</span>
              <span>{flagIcon(b)} {b.code}</span>
            </div>
            {["Webshop", "Support", "Terms & Conditions"].map((link) => (
              <div key={link} className="compare-row">
                <span>{link}</span>
                <span>{a.links[link]}</span>
                <span>{b.links[link]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="comparison-appliance">
          <div className="appliance-heading">
            <span className="mini-icon" />
            <div><h3>Top content</h3><p>Content item counts per selected market</p></div>
          </div>
          <div className="compare-box">
            <div className="compare-section">
              <span>Content type</span>
              <span>{flagIcon(a)} {a.code}</span>
              <span>{flagIcon(b)} {b.code}</span>
            </div>
            {["FAQ", "Tips & Guides", "Suggestions & Ideas"].map((type) => (
              <div key={type} className="compare-row">
                <span>{type}</span>
                <span>{a.content[type]}</span>
                <span>{b.content[type]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}