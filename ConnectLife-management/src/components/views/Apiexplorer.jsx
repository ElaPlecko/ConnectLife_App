import { useState } from "react";
import { markets, HISENSE } from "../../data/data.js";

export default function ApiExplorer() {
  const [selectedCode, setSelectedCode] = useState("SI");
  const market = markets.find((m) => m.code === selectedCode);

  const payload = {
    market: market.code,
    name: market.localName,
    segment: market.segments.split(",")[0].trim(),
    brandColor: HISENSE,
    features: {
      voiceControl: market.features["Voice Control"],
      selfDiagnostics: market.features["Self-Diagnostics"],
      shoppingList: market.features["Shopping List"],
      washDrySync: market.features["Wash&Dry Sync"],
      energyMonitoring: market.features["Energy Monitoring"],
    },
    content: {
      faq: ["How do I connect an appliance?", "How do I set WiFi?"],
      tips: ["Clean the appliance filter regularly."],
      suggestions: ["Try Eco mode."],
    },
    links: {
      webshop: `https://${market.links.Webshop}`,
      support: `https://${market.links.Support}`,
      terms: `https://${market.links["Terms & Conditions"]}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>API Explorer</h2>
        <div className="api-actions">
          <label>
            Market{" "}
            <select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
              {markets.map((m) => (
                <option key={m.code} value={m.code}>{m.code} — {m.localName}</option>
              ))}
            </select>
          </label>
          <button className="outline-button" type="button" onClick={handleCopy}>Copy JSON</button>
        </div>
      </div>
      <pre id="api-preview">{JSON.stringify(payload, null, 2)}</pre>
    </section>
  );
}