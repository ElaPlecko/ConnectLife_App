const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.updateRemoteFeature = onCall(async (request) => {
  const { parameterKey, configKey, featureKey, value } = request.data;

  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be logged in"
    );
  }

  const remoteConfig = admin.remoteConfig();

  const template = await remoteConfig.getTemplate();

  const parameter = template.parameters[parameterKey];

  if (!parameter) {
    throw new HttpsError(
      "not-found",
      "Remote config parameter not found"
    );
  }


  const json = JSON.parse(
    parameter.defaultValue.value
  );


  json[configKey][featureKey] = value;


  parameter.defaultValue.value =
    JSON.stringify(json);


  await remoteConfig.publishTemplate(template);


  return {
    success: true,
    changed: {
      parameterKey,
      configKey,
      featureKey,
      value,
    },
  };
});