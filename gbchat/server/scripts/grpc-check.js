#!/usr/bin/env node
// server/scripts/grpc-check.js
// Smoke-test the internal gRPC API:  npm run grpc:check
import { grpcStatus, grpcGetPresence, grpcNotify } from '../grpc/client.js';

const run = async () => {
  const status = await grpcStatus();
  console.log('gRPC target :', status.target);
  console.log('healthy     :', status.healthy);
  if (status.node) console.log('node        :', JSON.stringify(status.node, null, 2));

  if (!status.healthy) {
    console.error('gRPC ping failed:', status.error || 'unknown error');
    process.exitCode = 1;
    return;
  }

  const presence = await grpcGetPresence('000000000000000000000000');
  console.log('presence    :', JSON.stringify(presence));

  const ack = await grpcNotify({
    userIds: [],
    title: 'gRPC smoke test',
    body: 'Internal fan-out is working',
    type: 'system',
  });
  console.log('notify ack  :', JSON.stringify(ack));
};

run();
