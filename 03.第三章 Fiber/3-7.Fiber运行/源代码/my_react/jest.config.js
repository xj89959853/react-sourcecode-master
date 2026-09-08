module.exports = {
    preset:'ts-jest',
    testEnvironment:'jsdom',
    roots:['<rootDir>'],
    testMatch:['**/?(*.)test.ts'],
    transform:{
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    setupFilesAfterEnv:['@testing-library/jest-dom'],
    collectCoverage:true,
    coverageDirectory:'coverage',
}