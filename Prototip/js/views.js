import {
  activities,
  appliances,
  contentTypes,
  HISENSE,
  markets,
} from "../../ConnectLife-management/src/data/data.js";
import { flagIcon, iconSvg, optionLabel, table } from "../../ConnectLife-management/src/utils/helpers.js";

function marketRows(limit) {
  return markets
    .slice(0, limit || markets.length)
    .map(
      (market) => `
        <tr>
          <td><span class="market-name">${flagIcon(market)}${market.name}</span></td>
          <td>${market.code}</td>
          <td>${market.segments}</td>
          <td><span class="badge ${market.status.toLowerCase()}">${market.status}</span></td>
          <td>${market.updated}</td>
          <td class="more">...</td>
        </tr>
      `,
    )
    .join("");
}

export function marketsTable(limit) {
  return table(
    ["Market", "Code", "Segments", "Status", "Last updated", ""],
    [marketRows(limit)],
  );
}

function applianceFeatureTable(appliance) {
  const featureList = Object.keys(appliance.features);
  const headers = ["Feature", ...markets.map((market) => `${flagIcon(market)} ${market.code}`)];
  const rows = featureList
    .map(
      (feature) => `
        <tr>
          <td><strong>${feature}</strong></td>
          ${markets
            .map((market) => {
              const enabled = appliance.features[feature][market.code];
              return `
                <td>
                  <button
                    class="switch-button ${enabled ? "on" : ""}"
                    type="button"
                    aria-pressed="${enabled}"
                    data-appliance="${appliance.id}"
                    data-feature="${feature}"
                    data-market="${market.code}"
                  >
                    <span></span>
                    <em>${enabled ? "ON" : "OFF"}</em>
                  </button>
                </td>
              `;
            })
            .join("")}
        </tr>
      `,
    )
    .join("");

  return `
    <section class="appliance-section">
      <div class="appliance-heading">
        <span class="mini-icon appliance-icon"></span>
        <div>
          <h3>${appliance.name}</h3>
          <p>${appliance.category}</p>
        </div>
      </div>
      ${table(headers, [rows], 720)}
    </section>
  `;
}

export function featuresView() {
  return `
    <section class="panel page-panel">
      <div class="panel-header">
        <h2>Features</h2>
        <span class="hint">Feature availability per appliance and market.</span>
      </div>
      <div class="feature-toolbar">
        <div>
          <strong>Appliance feature control by market</strong>
          <span>Turn individual appliance features on or off for each country.</span>
        </div>
        <span class="market-chip">${appliances.length} appliances</span>
      </div>
      <div class="appliance-stack">
        ${appliances.map((appliance) => applianceFeatureTable(appliance)).join("")}
      </div>
    </section>
  `;
}

export function contentTable() {
  const rows = contentTypes
    .map(
      ([type, description]) => `
        <tr>
          <td><span class="content-type"><span class="mini-icon"></span><span><strong>${type}</strong><small>${description}</small></span></span></td>
          ${markets.map((market) => `<td>${market.content[type]}</td>`).join("")}
        </tr>
      `,
    )
    .join("");
  return table(["Content type", ...markets.map((market) => `${flagIcon(market)} ${market.code}`)], [rows], 620);
}

export function linksTable() {
  const rows = Object.keys(markets[0].links)
    .map(
      (type) => `
        <tr>
          <td><strong>${type}</strong></td>
          ${markets.map((market) => `<td>${market.links[type]}</td>`).join("")}
        </tr>
      `,
    )
    .join("");
  return table(["Link type", ...markets.map((market) => `${flagIcon(market)} ${market.code}`)], [rows], 760);
}

function activityList() {
  return `
    <div class="activity-list">
      ${activities
        .map(
          ([action, entity, market, time]) => `
            <article class="activity-item">
              <span class="mini-icon"></span>
              <div><strong>${action}</strong><small>${entity}</small></div>
              <span class="market-chip">${market}</span>
              <time>${time}</time>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function statCards() {
  return `
    <div class="stat-grid">
      ${[
        ["globe", "4", "Markets", "markets"],
        ["sliders", "5", "Appliance groups", "features"],
        ["file", "4", "Content types", "content"],
        ["link", "4", "External links", "links"],
      ]
        .map(
          ([icon, number, label, view]) => `
            <button class="stat" type="button" data-jump="${view}">
              ${iconSvg(icon)}
              <div><strong>${number}</strong><span>${label}</span><em>View all -></em></div>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function applianceDashboardSummary() {
  const headers = ["Appliance", ...markets.map((market) => `${flagIcon(market)} ${market.code}`)];
  const rows = appliances
    .map((appliance) => {
      const featureList = Object.keys(appliance.features);
      return `
        <tr>
          <td><span class="content-type"><span class="mini-icon appliance-icon"></span><span><strong>${appliance.name}</strong><small>${appliance.category}</small></span></span></td>
          ${markets
            .map((market) => {
              const activeCount = featureList.filter((feature) => appliance.features[feature][market.code]).length;
              return `<td><span class="score-pill">${activeCount}/${featureList.length}</span></td>`;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");

  return table(headers, [rows], 620);
}

export function dashboardView() {
  return `
    ${statCards()}
    <div class="two-col">
      <section class="panel">
        <div class="panel-header">
          <h2>Markets</h2>
          <button class="primary-button" type="button">+ Add Market</button>
        </div>
        ${marketsTable()}
        <button class="text-link" type="button" data-jump="markets">View all markets -></button>
      </section>
      <section class="panel">
        <div class="panel-header">
          <h2>Feature summary</h2>
          <button class="text-link" type="button" data-jump="features">Manage features</button>
        </div>
        ${applianceDashboardSummary()}
        <button class="text-link" type="button" data-jump="features">View all features -></button>
      </section>
    </div>
    <div class="three-col">
      <section class="panel">
        <div class="panel-header">
          <h2>Content summary</h2>
          <button class="text-link" type="button" data-jump="content">Manage content</button>
        </div>
        ${contentTable()}
        <button class="text-link" type="button" data-jump="content">View all content -></button>
      </section>
      <section class="panel">
        <div class="panel-header">
          <h2>External links summary</h2>
          <button class="text-link" type="button" data-jump="links">Manage links</button>
        </div>
        ${linksTable()}
        <button class="text-link" type="button" data-jump="links">View all links -></button>
      </section>
      <section class="panel">
        <h2>Recent activity</h2>
        ${activityList()}
        <button class="text-link" type="button" data-jump="audit">View full log -></button>
      </section>
    </div>
    <footer class="footer"><span>ConnectLife App Management Portal (POC)</span><strong>Hisense</strong></footer>
  `;
}

export function simpleTableView(title, action, body) {
  return `
    <section class="panel page-panel">
      <div class="panel-header">
        <h2>${title}</h2>
        ${action ? `<button class="primary-button" type="button">${action}</button>` : ""}
      </div>
      ${body}
    </section>
  `;
}

export function comparisonView() {
  return `
    <section class="panel page-panel comparison-page">
      <div class="panel-header">
        <h2>Market Comparison</h2>
        <span class="hint">Compare appliance features, links and content between markets.</span>
      </div>
      <div class="compare-selectors">
        <label><span>Market A</span><select id="market-a"></select></label>
        <span class="vs">vs</span>
        <label><span>Market B</span><select id="market-b"></select></label>
      </div>
      <div class="compare-box" id="comparison"></div>
    </section>
  `;
}

export function apiView() {
  return `
    <section class="panel page-panel">
      <div class="panel-header">
        <h2>API Explorer</h2>
        <div class="api-actions">
          <label>Market <select id="api-market"></select></label>
          <button class="outline-button" type="button">Copy JSON</button>
        </div>
      </div>
      <pre id="api-preview"></pre>
    </section>
  `;
}

export function renderComparison() {
  const a = markets.find((market) => market.code === document.querySelector("#market-a").value);
  const b = markets.find((market) => market.code === document.querySelector("#market-b").value);
  const applianceComparisons = appliances
    .map((appliance) => {
      const featureList = Object.keys(appliance.features);
      const aCount = featureList.filter((feature) => appliance.features[feature][a.code]).length;
      const bCount = featureList.filter((feature) => appliance.features[feature][b.code]).length;

      return `
        <section class="comparison-appliance">
          <div class="appliance-heading">
            <span class="mini-icon appliance-icon"></span>
            <div>
              <h3>${appliance.name}</h3>
              <p>${appliance.category}</p>
            </div>
          </div>
          <div class="compare-box">
            <div class="compare-section">
              <span>Feature</span>
              <span>${flagIcon(a)} ${a.code} <em>${aCount}/${featureList.length}</em></span>
              <span>${flagIcon(b)} ${b.code} <em>${bCount}/${featureList.length}</em></span>
            </div>
            ${featureList
              .map((feature) => {
                const aEnabled = appliance.features[feature][a.code];
                const bEnabled = appliance.features[feature][b.code];
                return `
                  <div class="compare-row">
                    <span>${feature}</span>
                    <span class="${aEnabled ? "on-text" : "off-text"}">${aEnabled ? "ON" : "OFF"}</span>
                    <span class="${bEnabled ? "on-text" : "off-text"}">${bEnabled ? "ON" : "OFF"}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
  const links = ["Webshop", "Support", "Terms & Conditions"]
    .map(
      (link) => `
        <div class="compare-row">
          <span>${link}</span>
          <span>${a.links[link]}</span>
          <span>${b.links[link]}</span>
        </div>
      `,
    )
    .join("");
  const content = ["FAQ", "Tips & Guides", "Suggestions & Ideas"]
    .map(
      (type) => `
        <div class="compare-row">
          <span>${type}</span>
          <span>${a.content[type]}</span>
          <span>${b.content[type]}</span>
        </div>
      `,
    )
    .join("");

  document.querySelector("#comparison").innerHTML = `
    <div class="comparison-stack">
      ${applianceComparisons}
      <section class="comparison-appliance">
        <div class="appliance-heading">
          <span class="mini-icon"></span>
          <div>
            <h3>Market links</h3>
            <p>External destinations per selected market</p>
          </div>
        </div>
        <div class="compare-box">
          <div class="compare-section"><span>Link type</span><span>${flagIcon(a)} ${a.code}</span><span>${flagIcon(b)} ${b.code}</span></div>
          ${links}
        </div>
      </section>
      <section class="comparison-appliance">
        <div class="appliance-heading">
          <span class="mini-icon"></span>
          <div>
            <h3>Top content</h3>
            <p>Content item counts per selected market</p>
          </div>
        </div>
        <div class="compare-box">
          <div class="compare-section"><span>Content type</span><span>${flagIcon(a)} ${a.code}</span><span>${flagIcon(b)} ${b.code}</span></div>
          ${content}
        </div>
      </section>
    </div>
  `;
}

export function fillSelects() {
  ["#market-a", "#market-b", "#api-market"].forEach((selector) => {
    const select = document.querySelector(selector);
    if (!select) return;
    select.innerHTML = markets.map((market) => `<option value="${market.code}">${optionLabel(market)}</option>`).join("");
  });
  const a = document.querySelector("#market-a");
  const b = document.querySelector("#market-b");
  const api = document.querySelector("#api-market");
  if (a) a.value = "SI";
  if (b) b.value = "DE";
  if (api) api.value = "SI";
}

export function renderApiPreview() {
  const select = document.querySelector("#api-market");
  const preview = document.querySelector("#api-preview");
  if (!select || !preview) return;
  const market = markets.find((item) => item.code === select.value);
  const payload = {
    market: market.code,
    name: market.localName,
    segment: market.segments.split(",")[0],
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
  preview.textContent = JSON.stringify(payload, null, 2);
}
