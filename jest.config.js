import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customConfig = {
  moduleFileExtensions: [
    'tsx',
    'ts',
    'js',
    'jsx',
    'json',
    'mjs',
    'cjs',
    'node',
  ],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: './test_report/test-report.html',
      }
    ]
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverage: false,
  collectCoverageFrom: [
    './src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/.next/**',
    '!**/.swc/**',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageProvider: 'v8',
};

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customConfig)();

  return {
    ...nextJestConfig,
    moduleNameMapper: {
      "\\.svg$": "<rootDir>/__mocks__/svg.js",
      ...nextJestConfig.moduleNameMapper,
    },
  };
}

export default jestConfig;
