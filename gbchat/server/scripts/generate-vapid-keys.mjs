#!/usr/bin/env node
// server/scripts/generate-vapid-keys.mjs
//
// Web Push needs a VAPID key pair. Generate one per environment and keep the
// private key secret — it identifies your server to FCM/Mozilla/Apple.
//
//   node scripts/generate-vapid-keys.mjs            # print as .env lines
//   node scripts/generate-vapid-keys.mjs --json     # machine readable
//
// Rotating the pair invalidates every existing subscription: browsers will
// silently stop receiving pushes until they re-subscribe (the client re-syncs
// on next load, so users recover without doing anything).
import webpush from "web-push";

const asJson = process.argv.includes("--json");
const keys = webpush.generateVAPIDKeys();

if (asJson) {
  console.log(JSON.stringify(keys, null, 2));
} else {
  console.log("# --- Web Push (VAPID) ---");
  console.log("# Public key is shipped to the browser; private key stays on the server.");
  console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
  console.log("# mailto: or https: URL that push services can use to contact you");
  console.log("VAPID_SUBJECT=mailto:notifications@gbchat.app");
}
