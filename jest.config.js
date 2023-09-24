module.exports = {
    "roots": [
      "<rootDir>/tests"
    ],
    "testMatch": [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "openHandlesTimeout": 10000,
    "globalSetup": "<rootDir>/tests/setEnv.ts",
    "setupFilesAfterEnv": ["<rootDir>/tests/setTimeout.ts"],
  }