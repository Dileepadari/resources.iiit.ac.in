/**
 * Resolves the `@/` alias, and extensionless imports, for Node's test runner.
 *
 * `jsconfig.json` maps `@/*` to `src/*`, and Next also lets an import omit the
 * file extension. Node does neither: ESM requires a full specifier. Rather than
 * add a bundler or a test framework to run a handful of pure functions, this
 * teaches `node --test` both rules in a few lines.
 *
 * @module tests/alias-loader
 */

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SRC = pathToFileURL(path.join(process.cwd(), "src") + path.sep).href;

/** The candidates Next would try for an extensionless import, in order. */
function withExtension(url) {
  if (path.extname(fileURLToPath(url))) return url;
  for (const candidate of [`${url}.js`, `${url}.mjs`, `${url}/index.js`]) {
    if (existsSync(fileURLToPath(candidate))) return candidate;
  }
  return url;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = withExtension(new URL(specifier.slice(2), SRC).href);
    return nextResolve(target, context);
  }
  return nextResolve(specifier, context);
}
