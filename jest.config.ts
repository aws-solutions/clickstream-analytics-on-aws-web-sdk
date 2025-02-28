// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

module.exports = {
	preset: 'ts-jest',
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js'],
	testEnvironment: 'jsdom',
	coveragePathIgnorePatterns: ['test'],
	transform: {
		"^.+\\.(js|ts|tsx)$": [
		"ts-jest",
		{}
		]
	},
	transformIgnorePatterns: [
		"/node_modules/(?!(\@fetch-mock/jest|fetch-mock)/)"
	],
	verbose: true,
	collectCoverage: true,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	}
};

