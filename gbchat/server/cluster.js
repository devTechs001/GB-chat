// server/cluster.js
/**
 * Multi-core entry point.
 *
 *   npm run start:cluster          # one worker per CPU core
 *   WEB_CONCURRENCY=4 npm start    # via index.js (single process) — see docs
 *
 * Each worker is a full GBChat node: HTTP + Socket.IO + gRPC. Because the
 * workers share the same machine they must not all bind the same gRPC port —
 * every worker therefore gets `GRPC_PORT + workerIndex` and the primary only
 * exposes the HTTP port (the OS load-balances connections between workers).
 *
 * For *multi-server* deployments (several containers/hosts) use the Docker
 * Compose / Kubernetes setup instead: replicas + Redis adapter + nginx LB.
 */
import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

const workers = Number(process.env.WEB_CONCURRENCY) || os.cpus().length || 1;

if (cluster.isPrimary) {
  console.log(`🧩 GBChat primary ${process.pid} — forking ${workers} workers`);

  const baseGrpcPort = Number(process.env.GRPC_PORT || 50051);

  for (let index = 0; index < workers; index += 1) {
    cluster.fork({
      NODE_ID: `${os.hostname()}-${index + 1}`,
      GRPC_PORT: String(baseGrpcPort + index),
      WORKER_INDEX: String(index),
    });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️  worker ${worker.process.pid} exited (${signal || code}) — respawning`);
    // Simple resilience: replace crashed workers, but never spin faster than 1/s
    setTimeout(() => cluster.fork(), 1000);
  });

  const shutdownPrimary = () => {
    Object.values(cluster.workers || {}).forEach((worker) => worker?.process.kill('SIGTERM'));
    setTimeout(() => process.exit(0), 5000);
  };
  process.on('SIGTERM', shutdownPrimary);
  process.on('SIGINT', shutdownPrimary);
} else {
  await import('./index.js');
}
