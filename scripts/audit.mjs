#!/usr/bin/env node
/**
 * Fails on a high or critical advisory in anything that ships, except for a
 * named list of advisories with a written reason.
 *
 * `npm audit --omit=dev` is the usual gate and it is wrong here in a specific
 * way: `prisma` is an *optional peer dependency* of `@prisma/client`, so the
 * CLI stays in the production tree even though it is a build-time tool listed
 * under devDependencies. Everything it drags with it is reported as shipping.
 *
 * Lowering the gate to `--audit-level=critical` would hide real findings. So
 * the exceptions are named one at a time, with the reason each one cannot reach
 * this application, and anything not on the list fails the build.
 *
 * The list is also checked for staleness: if an exception stops being reported,
 * it fails too, so entries cannot outlive the problem they excuse.
 *
 *   node scripts/audit.mjs
 *
 * @module scripts/audit
 */

import { execFileSync } from "node:child_process";

/**
 * Advisories allowed to be present, and why.
 *
 * Every entry must say why the vulnerable code cannot run in this application,
 * not merely that it is inconvenient to fix.
 */
const ACCEPTED = {
  prisma:
    "The Prisma CLI. A build-time tool in devDependencies, in the production " +
    "tree only because @prisma/client declares it as an optional peer " +
    "dependency. It is not imported by the app and does not run in the " +
    "deployed server.",
  "@prisma/config":
    "Prisma CLI configuration loader, reached only through the CLI above.",
  "deepmerge-ts":
    "Reached only through @prisma/config, so only while the CLI runs.",
  mysql2:
    "Prisma's MySQL driver, bundled with the CLI for every database it " +
    "supports. This application's datasource is postgresql and nothing here " +
    "imports mysql2, so the vulnerable code is never loaded.",
};

function audit() {
  try {
    // npm exits non-zero when it finds anything, so the output comes back on
    // the error rather than from a clean run.
    return JSON.parse(execFileSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8" }));
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout);
    throw error;
  }
}

const report = audit();
const found = report.vulnerabilities ?? {};
const serious = Object.entries(found).filter(([, v]) => ["high", "critical"].includes(v.severity));

const unexplained = serious.filter(([name]) => !(name in ACCEPTED));
const missing = Object.keys(ACCEPTED).filter((name) => !(name in found));

const counts = report.metadata?.vulnerabilities ?? {};
console.log(`runtime advisories: ${JSON.stringify(counts)}`);
for (const [name, v] of serious) {
  console.log(`  accepted  ${name} (${v.severity}): ${ACCEPTED[name] ? "documented" : "NOT DOCUMENTED"}`);
}

let failed = false;

if (unexplained.length) {
  console.error("\nHigh or critical advisories with no written exception:");
  for (const [name, v] of unexplained) {
    console.error(`  ${name} (${v.severity}) ${v.range ?? ""}`);
  }
  console.error("Fix them, or add an entry to ACCEPTED saying why they cannot run here.");
  failed = true;
}

if (missing.length) {
  console.error("\nThese exceptions are no longer reported and should be deleted:");
  for (const name of missing) console.error(`  ${name}`);
  console.error("An exception that outlives its advisory quietly widens the gate.");
  failed = true;
}

if (!failed) console.log("\nno unexplained high or critical advisories in shipped code");
process.exit(failed ? 1 : 0);
