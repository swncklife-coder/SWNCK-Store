import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
});
