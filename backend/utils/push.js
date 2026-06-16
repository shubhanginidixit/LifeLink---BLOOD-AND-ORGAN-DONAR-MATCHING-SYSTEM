let admin;
let initialized = false;

function initFirebase() {
  try {
    const serviceAccount = require("../serviceAccountKey.json");
    admin = require("firebase-admin");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log("Firebase Admin SDK initialized");
  } catch (err) {
    console.warn(
      "Firebase Admin SDK not initialized. FCM push disabled. Add serviceAccountKey.json to backend/ to enable."
    );
  }
}

async function sendPushNotification(fcmToken, title, body, data = {}) {
  if (!initialized || !fcmToken) return false;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
      webpush: {
        fcm_options: { link: data.redirect || "/dashboard" },
      },
    });
    return true;
  } catch (err) {
    console.error("FCM send failed:", err.message);
    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token"
    ) {
      return "invalid";
    }
    return false;
  }
}

module.exports = { initFirebase, sendPushNotification };
