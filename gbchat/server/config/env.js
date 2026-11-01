// server/config/env.js
//
// Environment bootstrap. Imported *first* from index.js on purpose: ES module
// imports are evaluated before the importing module's body, so a `dotenv.config()`
// call written inside index.js runs too late for every module that reads
// process.env at import time (gRPC target, push config, rate limits…).
//
// `dotenv` never overwrites variables that are already set, so a real
// environment (Docker, Render, systemd) always wins over the .env file.
import dotenv from "dotenv";

dotenv.config();

export const isProduction = process.env.NODE_ENV === "production";
export const env = (key, fallback = undefined) => process.env[key] ?? fallback;
export const envInt = (key, fallback) => {
  const value = Number.parseInt(process.env[key], 10);
  return Number.isFinite(value) ? value : fallback;
};
export const envBool = (key, fallback = false) => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

export default { isProduction, env, envInt, envBool };
