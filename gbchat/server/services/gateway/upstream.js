// server/services/gateway/upstream.js
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

/**
 * Minimal HTTP proxy client.
 *
 * Why not `http-proxy-middleware`? Two reasons: (1) the gateway must not add a
 * dependency to the deployment image for something this small, and (2) the
 * blocking requirement is that **this code never affects local development** —
 * hand-written forwarding is easier to make strictly inert than a middleware
 * stack with its own defaults.
 *
 * One keep-alive agent per protocol, so a burst of API calls reuses sockets.
 */
const agents = {
  "http:": new http.Agent({ keepAlive: true, maxSockets: 128 }),
  "https:": new https.Agent({ keepAlive: true, maxSockets: 128 }),
};

/** Headers that must not be copied between hops (RFC 7230 §6.1). */
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const filterHeaders = (headers) => {
  const out = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out[key] = value;
  }
  return out;
};

/**
 * Forward one HTTP request to a service.
 *
 * @param {object} options
 * @param {string} options.path       path + query, already prefixed with the service basePath
 * @param {string} options.method
 * @param {object} options.headers
 * @param {string} options.target     absolute base URL of the service
 * @param {number} [options.timeoutMs]
 * @param {(chunk: Buffer) => void} [options.onUpstreamChunk] used by the retry buffer
 */
export const forwardRequest = async ({
  path,
  method,
  headers,
  target,
  timeoutMs = 30000,
  onUpstreamChunk,
}) => {
  const base = new URL(target);
  const url = new URL(base.toString());
  url.pathname = `${base.pathname.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const client = url.protocol === "https:" ? https : http;

  const response = await new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method,
        headers: filterHeaders(headers),
        agent: agents[url.protocol],
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk);
          onUpstreamChunk?.(chunk);
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        );
        res.on("error", reject);
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Upstream timeout after ${timeoutMs}ms`));
    });
    request.on("error", reject);
    request.end();
  });

  return { ...response, headers: filterHeaders(response.headers) };
};

export const shutdownAgents = () => {
  agents["http:"].destroy();
  agents["https:"].destroy();
};

export default forwardRequest;
