#!/usr/bin/env node
import { spawn } from 'child_process';

const next = spawn('npx', ['next', 'dev', '-p', '5000'], {
  stdio: 'inherit',
  shell: true
});

next.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

next.on('exit', (code) => {
  process.exit(code);
});
