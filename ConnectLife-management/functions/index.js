const admin = require("firebase-admin");
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
    cors: true,
  },
  async (request) => {
    try {
      console.log("CHATBOT CALLED");
      console.log("DATA:", request.data);

      const { GoogleGenAI } = require("@google/genai");

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const { message, markets = [], features = [] } = request.data;

      const prompt = `
You are the ConnectLife Management Assistant.

Your job is to help product managers manage feature flags and market-specific functionality in the ConnectLife platform.

AVAILABLE MARKETS:
${markets.join(", ")}

AVAILABLE FEATURES:
${features.join(", ")}

You understand:
- feature flags
- market rollouts
- remote configuration
- product management
- usage based recommendations

You may:
- explain features
- suggest enabling features
- suggest disabling features
- suggest gradual rollouts
- identify unused functionality
- help manage market-specific configurations

IMPORTANT RULES:

When the user is only asking a question, return:

{
  "action": "none",
  "message": "your answer"
}

When the user wants to change a feature, return:

{
  "action": "toggle_feature",
  "feature": "<feature_name>",
  "market": "<market_name>",
  "enabled": true,
  "reason": "<reason>"
}

Examples:

User:
"No one in Slovenia has used AI Recipes for 7 days."

Response:
{
  "action": "toggle_feature",
  "feature": "AI Recipes",
  "market": "Slovenia",
  "enabled": false,
  "reason": "Feature has not been used recently."
}

User:
"Enable chatbot for Croatia."

Response:
{
  "action": "toggle_feature",
  "feature": "chatbot",
  "market": "Croatia",
  "enabled": true,
  "reason": "Requested by user."
}

User:
"What does the recipe assistant do?"

Response:
{
  "action": "none",
  "message": "The recipe assistant helps users generate meal ideas based on available ingredients."
}

Return ONLY valid JSON.

Do not return markdown.
Do not return explanations outside JSON.
Do not use code blocks.

USER MESSAGE:
${message}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return {
        result: response.text,
      };
    } catch (error) {
      console.error("CHATBOT ERROR:", error);

      return {
        result: JSON.stringify({
          action: "error",
          message: error.message,
        }),
      };
    }
  }
);