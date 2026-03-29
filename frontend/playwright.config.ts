import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const webServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
  "npm run dev -- --hostname 127.0.0.1 --port 3000";
const useExternalServer =
  Boolean(process.env.PLAYWRIGHT_BASE_URL) &&
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND === undefined;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: useExternalServer
    ? undefined
    : webServerCommand
    ? {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
