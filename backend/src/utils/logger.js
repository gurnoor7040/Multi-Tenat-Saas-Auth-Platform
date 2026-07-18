// Minimal logger — swap for pino/winston later if you need log
// shipping/structured JSON logs in production without touching call sites.
export const logger = {
  info: (...args) => console.log("[INFO]", new Date().toISOString(), ...args),
  warn: (...args) => console.warn("[WARN]", new Date().toISOString(), ...args),
  error: (...args) => console.error("[ERROR]", new Date().toISOString(), ...args),
};