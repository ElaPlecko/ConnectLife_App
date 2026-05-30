const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions");
const nodemailer = require("nodemailer");

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "connectlife95@gmail.com",
    pass: "zuvmobjyxirzpaff",
  },
});

const MOCK_DATA = [
  { event_name: "user_engagement", event_count: 24022514, total_users: 1012397, category: "System" },
  { event_name: "screen_view", event_count: 17004079, total_users: 972373, category: "System" },
  { event_name: "ApplianceDashboard_ShortcutBtn_OnClick", event_count: 11082348, total_users: 519159, category: "Appliance" },
  { event_name: "session_start", event_count: 10311584, total_users: 1073414, category: "System" },
  { event_name: "ApplianceDashboard_Start_Click", event_count: 946414, total_users: 151408, category: "Appliance" },
];

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toLocaleString();
}

function buildReportHTML(date) {
  const totalCount = MOCK_DATA.reduce((s, r) => s + r.event_count, 0);
  const maxUsers = Math.max(...MOCK_DATA.map((r) => r.total_users));

  const rows = MOCK_DATA.map((e, i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#666;font-size:13px;">${i + 1}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px;color:#111;">${e.event_name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:13px;color:#555;">${e.category}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:13px;font-weight:500;color:#185FA5;text-align:right;">${e.event_count.toLocaleString()}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;font-size:13px;color:#666;text-align:right;">${e.total_users.toLocaleString()}</td>
    </tr>
  `).join("");

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
    <div style="background:#185FA5;padding:28px 32px;border-radius:12px 12px 0 0;">
      <div style="font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">ConnectLife Analytics</div>
      <div style="font-size:22px;font-weight:500;color:#fff;">Dnevno poročilo</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">${date}</div>
    </div>
    <div style="background:#f5f5f3;padding:20px 32px;">
      <div style="display:flex;gap:12px;">
        <div style="flex:1;background:#fff;border-radius:8px;padding:14px 16px;">
          <div style="font-size:11px;color:#888;margin-bottom:4px;">Tipov dogodkov</div>
          <div style="font-size:20px;font-weight:500;">${MOCK_DATA.length}</div>
        </div>
        <div style="flex:1;background:#fff;border-radius:8px;padding:14px 16px;">
          <div style="font-size:11px;color:#888;margin-bottom:4px;">Skupaj klikov</div>
          <div style="font-size:20px;font-weight:500;">${fmt(totalCount)}</div>
        </div>
        <div style="flex:1;background:#fff;border-radius:8px;padding:14px 16px;">
          <div style="font-size:11px;color:#888;margin-bottom:4px;">Maks. uporabniki</div>
          <div style="font-size:20px;font-weight:500;">${fmt(maxUsers)}</div>
        </div>
      </div>
    </div>
    <div style="background:#fff;padding:24px 32px;">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:16px;">Top 5 dogodkov po klikih</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f5f5f3;">
            <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:500;">#</th>
            <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:500;">Dogodek</th>
            <th style="padding:8px 14px;text-align:left;font-size:11px;color:#888;font-weight:500;">Kategorija</th>
            <th style="padding:8px 14px;text-align:right;font-size:11px;color:#888;font-weight:500;">Kliki</th>
            <th style="padding:8px 14px;text-align:right;font-size:11px;color:#888;font-weight:500;">Uporabniki</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="background:#f5f5f3;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center;">
      <div style="font-size:11px;color:#aaa;">Samodejno generirano • ConnectLife Admin • ${date}</div>
    </div>
  </div>`;
}

exports.dailyReport = onSchedule(
  {
    schedule: "0 19 * * *",
    timeZone: "Europe/Ljubljana",
  },
  async () => {
    const db = getFirestore();
    const snapshot = await db.collection("users").get();

    const admins = snapshot.docs
      .map((d) => d.data())
      .filter((u) => u.provider === "google" && u.status === "Active")
      .map((u) => u.email);

    const date = new Date().toLocaleDateString("sl-SI", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = buildReportHTML(date);

    for (const email of admins) {
      try {
        await transporter.sendMail({
          from: '"ConnectLife Analytics" <connectlife95@gmail.com>',
          to: email,
          subject: `ConnectLife — dnevno poročilo, ${date}`,
          html,
        });
        console.log(`Poslano: ${email}`);
      } catch (e) {
        console.error(`Napaka za ${email}:`, e.message);
      }
    }
  }
);