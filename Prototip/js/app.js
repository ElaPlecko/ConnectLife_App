import { activities, appliances, HISENSE, segments, users } from "../../ConnectLife-management/src/data/data.js";
import { table } from "../../ConnectLife-management/src/utils/helpers.js";
import {
  apiView,
  comparisonView,
  contentTable,
  dashboardView,
  featuresView,
  fillSelects,
  linksTable,
  marketsTable,
  renderApiPreview,
  renderComparison,
  simpleTableView,
} from "./views.js";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function renderView(view) {
  const root = document.querySelector("#app-view");
  const views = {
    dashboard: dashboardView,
    markets: () => simpleTableView("Markets", "+ Add Market", marketsTable()),
    segments: () =>
      simpleTableView(
        "Segments",
        "+ Add Segment",
        table(
          ["Segment", "Description", "Markets"],
          segments.map(([name, description, marketList]) => `<tr><td><strong>${name}</strong></td><td>${description}</td><td>${marketList}</td></tr>`),
          640,
        ),
      ),
    features: featuresView,
    content: () => simpleTableView("Content", "Manage Content", contentTable()),
    links: () => simpleTableView("External Links", "Manage Links", linksTable()),
    comparison: comparisonView,
    api: apiView,
    users: () =>
      simpleTableView(
        "Users",
        "Invite User",
        table(
          ["User", "Role", "Scope", "Status"],
          users.map(([email, role, scope, status]) => `<tr><td>${email}</td><td>${role}</td><td>${scope}</td><td><span class="badge ${status.toLowerCase()}">${status}</span></td></tr>`),
          680,
        ),
      ),
    audit: () =>
      simpleTableView(
        "Audit Log",
        "",
        table(
          ["Action", "Entity", "Market", "Time"],
          activities.map(([action, entity, market, time]) => `<tr><td>${action}</td><td>${entity}</td><td>${market}</td><td>${time}</td></tr>`),
          680,
        ),
      ),
    settings: () =>
      simpleTableView(
        "Settings",
        "Save Settings",
        `<div class="settings-grid">
          <label><span>Portal name</span><input value="ConnectLife App Management Portal" /></label>
          <label><span>Brand color</span><input value="${HISENSE}" /></label>
          <label><span>Environment</span><input value="POC" /></label>
        </div>`,
      ),
  };

  root.innerHTML = views[view]();
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  window.scrollTo({ top: 0, behavior: "auto" });
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));

  fillSelects();
  if (view === "comparison") {
    renderComparison();
    document.querySelector("#market-a").addEventListener("change", renderComparison);
    document.querySelector("#market-b").addEventListener("change", renderComparison);
  }
  if (view === "api") {
    renderApiPreview();
    document.querySelector("#api-market").addEventListener("change", renderApiPreview);
  }
  if (view === "features") {
    bindFeatureSwitches();
  }
  bindJumpButtons();
}

function bindJumpButtons() {
  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => renderView(button.dataset.jump));
  });
}

function bindFeatureSwitches() {
  document.querySelectorAll(".switch-button").forEach((button) => {
    button.addEventListener("click", () => {
      const appliance = appliances.find((item) => item.id === button.dataset.appliance);
      const feature = button.dataset.feature;
      const market = button.dataset.market;
      appliance.features[feature][market] = !appliance.features[feature][market];
      button.classList.toggle("on", appliance.features[feature][market]);
      button.setAttribute("aria-pressed", appliance.features[feature][market]);
      button.querySelector("em").textContent = appliance.features[feature][market] ? "ON" : "OFF";
    });
  });
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => renderView(button.dataset.view));
});

renderView("dashboard");

window.addEventListener("load", () => window.scrollTo({ top: 0, behavior: "auto" }));
