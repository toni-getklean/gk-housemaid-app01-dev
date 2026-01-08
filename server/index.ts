#!/usr/bin/env tsx
import { spawn } from 'child_process';

console.log('Starting Next.js development server on port 5000...');

const next = spawn('npx', ['next', 'dev', '-p', '5000'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

next.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

next.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Next.js exited with code ${code}`);
  }
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  next.kill('SIGTERM');
});

process.on('SIGINT', () => {
  next.kill('SIGINT');
});
