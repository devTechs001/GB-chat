// server/services/gateway/circuitBreaker.js
/**
 * Circuit breaker for one upstream service.
 *
 * States: closed (forward normally) → open (fail fast for `cooldownMs`) →
 * half-open (allow a couple of probes through; a success closes the circuit).
 *
 * Without this, when a service is down every request pays the full timeout and
 * the gateway's sockets/event loop fill up with doomed work — the failure
 * spreads to services that are healthy. Failing fast keeps the blast radius to
 * the broken service.
 */

const DEFAULTS = {
  failureThreshold: 5, // consecutive failures before opening
  cooldownMs: 10000, // how long to stay open before probing
  halfOpenProbes: 2, // successes required to close again
  timeoutMs: 30000,
};

export const createBreaker = (name, overrides = {}) => {
  const config = { ...DEFAULTS, ...overrides };

  const state = {
    name,
    status: "closed",
    failures: 0,
    successes: 0,
    openedAt: 0,
    lastError: null,
    lastFailureAt: null,
    lastSuccessAt: null,
    totalRequests: 0,
    totalFailures: 0,
    rejected: 0,
  };

  const canAttempt = () => {
    if (state.status === "closed") return true;
    if (state.status === "open" && Date.now() - state.openedAt >= config.cooldownMs) {
      state.status = "half-open";
      state.successes = 0;
      return true;
    }
    if (state.status === "half-open") return true;
    state.rejected += 1;
    return false;
  };

  const onSuccess = () => {
    state.lastSuccessAt = Date.now();
    state.totalRequests += 1;
    if (state.status === "half-open") {
      state.successes += 1;
      if (state.successes >= config.halfOpenProbes) {
        state.status = "closed";
        state.failures = 0;
        state.successes = 0;
      }
      return;
    }
    state.failures = 0;
  };

  const onFailure = (error) => {
    state.lastError = error?.message || String(error);
    state.lastFailureAt = Date.now();
    state.totalRequests += 1;
    state.totalFailures += 1;

    if (state.status === "half-open") {
      // The probe failed: back to open, with a fresh cooldown.
      state.status = "open";
      state.openedAt = Date.now();
      return;
    }

    state.failures += 1;
    if (state.failures >= config.failureThreshold) {
      state.status = "open";
      state.openedAt = Date.now();
    }
  };

  return {
    name,
    config,
    canAttempt,
    onSuccess,
    onFailure,
    snapshot: () => ({
      ...state,
      retryAt: state.status === "open" ? state.openedAt + config.cooldownMs : null,
    }),
    reset: () => {
      state.status = "closed";
      state.failures = 0;
      state.successes = 0;
      state.openedAt = 0;
    },
  };
};

export default createBreaker;
