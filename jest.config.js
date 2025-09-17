module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/server/tests/setup.ts'],
    testMatch: ['**/server/tests/**/*.test.ts'],
};
