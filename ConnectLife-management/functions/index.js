const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const { onRequest, onCall } = require("firebase-functions/v2/https");
const cors = require("cors")({
  origin: true,
});

admin.initializeApp();

exports.updateRemoteFeatureHttp = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

      const requestBody = req.body;
      const {parameterKey, configKey, featureKey, value, modelKey, conditionKey} = requestBody;

      const remoteConfig = admin.remoteConfig();
      const template = await remoteConfig.getTemplate();
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

        if (conditionKey) {
            if (!parameter.conditionalValues) {
                parameter.conditionalValues = {};
            }

            parameter.conditionalValues[conditionKey] = {
                value: String(value),
            };

            await remoteConfig.publishTemplate(template);

            return res.json({ success: true });
        }

      if (configKey && featureKey && requestBody.modelKey) {
        const json = JSON.parse(parameter.defaultValue.value);

        json[requestBody.modelKey][featureKey] = value;

        parameter.defaultValue.value = JSON.stringify(json);
        } else if (configKey && featureKey) {
        const json = JSON.parse(parameter.defaultValue.value);

        json[configKey][featureKey] = value;

        parameter.defaultValue.value = JSON.stringify(json);
        } else {
        parameter.defaultValue.value = String(value);
        }

      await remoteConfig.publishTemplate(template);

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });
});

exports.chatAssistant = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
  },
  async (request) => {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { message, markets, features } = request.data;

    const prompt = `
    You are a ConnectLife dashboard assistant.

    Markets:
    ${markets.join(", ")}

    Features:
    ${features.join(", ")}

    Return ONLY JSON.

    User message:
    ${message}
    `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return {
          result: response.text,
        };
  }
);