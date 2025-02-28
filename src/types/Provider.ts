// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface AnalyticsProvider {
	// you need to implement those methods

	// configure your provider
	configure(config: object): object;

	// record events
	record(params: object): void;

	// return 'Analytics'
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;
}
