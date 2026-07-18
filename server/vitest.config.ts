import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    env: {
      JWT_SECRET: "test-secret-for-vitest-only",
      NODE_ENV: "test",
      CORS_ORIGINS: "http://localhost:5173",
    },
    globals: false,
    testTimeout: 60000,
    hookTimeout: 60000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
