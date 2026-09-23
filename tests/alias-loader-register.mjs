/**
 * Registers the `@/` resolver for the test run.
 *
 * Passed to node with `--import`, which runs this before any test module is
 * loaded so the hook is in place when the first `@/lib/...` import is resolved.
 *
 * @module tests/alias-loader-register
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-loader.mjs", pathToFileURL("./tests/"));
