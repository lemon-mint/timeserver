import './style.css';
import { sync } from './sync';

/**
  @preserve
  http://meyerweb.com/eric/tools/css/reset/ 
  v2.0 | 20110126
  License: none (public domain)
*/

const p_time = document.getElementById('time') as HTMLParagraphElement;
const p_date = document.getElementById('date') as HTMLParagraphElement;
const div_logs = document.getElementById('logs') as HTMLDivElement;

function SetTime(d: Date) {
  p_time.innerText = d.toLocaleTimeString();
  p_date.innerText = d.toLocaleDateString();
}

function log(...args: any[]) {
  // Clear logs
  div_logs.innerHTML = '';

  // Add new logs
  for (const arg of args) {
    const p = document.createElement('p');
    p.innerText = arg;
    div_logs.appendChild(p);
  }
}

interface SyncState {
  sync: boolean;
  offset?: number;
  error?: number;
}

let state: SyncState = {
  sync: false,
}

async function SyncOffset() {
  const [lower, upper, ok] = await sync(["/tt"], 10);
  if (!ok) {
    log("Sync Failed");
    return;
  }

  const offset = (lower + upper) / 2;
  const error = (upper - lower) / 2;

  log(
    `Offset: ${offset.toFixed(3)}ms`,
    `Sync Error: ±${error.toFixed(3)}ms`,
  );

  state = {
    sync: true,
    offset,
    error,
  };
}

let wall_mono_offset = new Date().getTime() - performance.now();

function render() {
  const walloff = new Date().getTime() - performance.now();
  if (Math.abs(walloff - wall_mono_offset) > 200) {
    // Something is wrong with the wall clock
    // We need to resync
    state.sync = false;
    SyncOffset();
  } else {
    wall_mono_offset = walloff;
  }

  if (state.sync) {
    const d = new Date(new Date().getTime() + state.offset!);
    SetTime(d);
  } else {
    p_time.innerText = 'Syncing...';
    p_date.innerText = '';
  }

  requestAnimationFrame(render);
}

async function main() {
  requestAnimationFrame(render);
  await fetch('/tt'); // Preload the first request
  SyncOffset();
}

main();

