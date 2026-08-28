import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryName = (process.env.GITHUB_REPOSITORY ?? "seansommer/henrythetrain").split("/").at(-1);
if (!/^[a-zA-Z0-9._-]+$/.test(repositoryName)) throw new Error("Invalid repository name");
const result = spawnSync(process.execPath, [fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)), "build", "--webpack"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES_BUILD: "1", NEXT_PUBLIC_BASE_PATH: `/${repositoryName}`, NEXT_TELEMETRY_DISABLED: "1" },
  timeout: 240_000,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
