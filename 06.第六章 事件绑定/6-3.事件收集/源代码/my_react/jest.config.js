module.exports = {
    preset:'ts-jest',
    testEnvironment:'jsdom',
    roots:['<rootDir>'],
    testMatch:['**/?(*.)test.{ts,tsx}'],
    transform:{
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    setupFilesAfterEnv:['@testing-library/jest-dom'],
    collectCoverage:true,
    coverageDirectory:'coverage',
    moduleNameMapper:{
        '^packages/react/(.*)$': '<rootDir>/packages/react/$1'
    },
}