import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: { "\\.ts$": "ts-jest" },
  transformIgnorePatterns: [],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.esm.json",
    },
  },
};

export default config;
