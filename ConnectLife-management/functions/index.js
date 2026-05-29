const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: true,
});

admin.initializeApp();

exports.updateRemoteFeatureHttp = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

      const { parameterKey, configKey, featureKey, value } = req.body;

      const remoteConfig = admin.remoteConfig();
      const template = await remoteConfig.getTemplate();
console.log("TEMPLATE VERSION:", template.version);
console.log("PARAM COUNT:", Object.keys(template.parameters || {}).length);
console.log("CONDITION COUNT:", (template.conditions || []).length);
console.log("TEMPLATE RAW:", JSON.stringify(template).slice(0, 1000));

      let parameter = template.parameters[parameterKey];

        if (!parameter && template.parameterGroups) {
        for (const group of Object.values(template.parameterGroups)) {
            if (group.parameters?.[parameterKey]) {
            parameter = group.parameters[parameterKey];
            break;
            }
        }
        }

      if (!parameter) {
        return res.status(404).json({ error: `Parameter "${parameterKey}" not found` });
        }

        if (!parameter.defaultValue?.value) {
        return res.status(404).json({
            error: `Parameter "${parameterKey}" has no default JSON value`,
            parameter,
        });
        }

      const json = JSON.parse(parameter.defaultValue.value);

      if (!json[configKey]) {
        return res.status(404).json({ error: "Config key not found" });
      }

      json[configKey][featureKey] = value;
      parameter.defaultValue.value = JSON.stringify(json);
      //template.parameters[parameterKey] = parameter;

      await remoteConfig.publishTemplate(template);

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });
});