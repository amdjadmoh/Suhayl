import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    env: {
      JWT_SECRET: "vitest-only-0f3a9c27d4e81b6a5f02c9e7d13b84a6",
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
