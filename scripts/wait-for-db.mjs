// Runs before `npm run dev` (package.json "predev"). Starts the local Docker
// Postgres if needed and waits until it accepts connections, so Next never
// boots against a database that is still starting — a dev server started that
// way answered 500 on every page until it was restarted.
//
// Only for a local database (localhost / 127.0.0.1 in DATABASE_URL). It never
// blocks for long: without Docker, or after 60 s, it warns and lets Next start.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const TIMEOUT_MS = 60_000;

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const match = readFileSync(".env", "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

function containerName() {
  try {
    return readFileSync("docker-compose.yml", "utf8").match(/container_name:\s*([\w.-]+)/)?.[1] ?? "cnx-postgres";
  } catch {
    return "cnx-postgres";
  }
}

function docker(args, timeout = 20_000) {
  return spawnSync("docker", args, { stdio: "pipe", timeout, encoding: "utf8" });
}

function warn(message) {
  console.warn(`\n[wait-for-db] ${message}\n`);
}

let url;
try {
  url = new URL(databaseUrl());
} catch {
  process.exit(0);
}
if (!["localhost", "127.0.0.1"].includes(url.hostname)) process.exit(0);

const user = decodeURIComponent(url.username) || "postgres";
const database = url.pathname.replace(/^\//, "") || user;
const container = containerName();

const up = docker(["compose", "up", "-d"]);
if (up.error || up.status !== 0) {
  warn("Docker is not running. Start Docker Desktop, then restart `npm run dev` — pages need the local database.");
  process.exit(0);
}

const started = Date.now();
process.stdout.write("[wait-for-db] Waiting for Postgres");
while (Date.now() - started < TIMEOUT_MS) {
  const ready = docker(["exec", container, "pg_isready", "-q", "-U", user, "-d", database], 5_000);
  if (ready.status === 0) {
    console.log(` ready (${Math.round((Date.now() - started) / 1000)}s).`);
    process.exit(0);
  }
  process.stdout.write(".");
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
warn("Postgres did not become ready within 60 s. Starting Next anyway; restart `npm run dev` once the database is up.");
