import type { HealthStatus } from './health.types';

export function checkHealth(): HealthStatus {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.0.0',
  };
}
