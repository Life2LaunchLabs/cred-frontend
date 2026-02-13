import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./spec/api/cred-spec.yaml",
    output: {
      mode: "single",
      target: "./app/api/generated.ts",
      client: "fetch",
      mock: {
        type: "msw",
      },
    },
  },
});
