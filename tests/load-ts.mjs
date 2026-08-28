import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
export function loadTs(relativePath, globals = {}) {
  const filename = new URL(relativePath, import.meta.url);
  const exports = {};
  const source = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => name === "./train-profiles" ? loadTs("../lib/train-profiles.ts", globals) : require(name), console, setTimeout, clearTimeout, setInterval, clearInterval, ...globals }, { filename: filename.pathname });
  return exports;
}
