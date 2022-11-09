import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  transform: {
    "\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.esm.json",
      },
    ],
  },
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};

export default config;
