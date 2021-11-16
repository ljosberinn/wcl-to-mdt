// @ts-check
const baseConfig = require("./jest.config.base");

const ignored = [
  "<rootDir>/src/pages",
  "<rootDir>/src/api",
  "<rootDir>/src/db",
  "<rootDir>/src/web",
  "<rootDir>/src/wcl/jest",
  "<rootDir>/src/wcl/queries/introspection.ts",
  "<rootDir>/src/wcl/queries/wcl-static-data.ts",
  "<rootDir>/src/wcl/queries/index.ts",
  "<rootDir>/src/wcl/types.ts",
];

/**
 * @type import('@jest/types').Config.InitialOptions
 */
const config = {
  ...baseConfig,
  displayName: "wcl",
  coverageThreshold: {
    global: {
      statements: 92,
      branches: 87,
      functions: 87,
      lines: 92,
    },
  },
  testPathIgnorePatterns: ignored,
  coveragePathIgnorePatterns: ignored,
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};

module.exports = config;
