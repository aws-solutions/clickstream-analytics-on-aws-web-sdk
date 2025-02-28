// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
import { BrowserInfo } from '../browser';
import { ClickstreamContext, ClickstreamProvider } from '../provider';

const logger = new Logger('BaseTracker');

export abstract class BaseTracker {
	provider: ClickstreamProvider;
	context: ClickstreamContext;

	constructor(provider: ClickstreamProvider, context: ClickstreamContext) {
		this.provider = provider;
		this.context = context;
	}

	setUp() {
		if (
			!BrowserInfo.isBrowser() ||
			!document.addEventListener ||
			!window.addEventListener ||
			!history.pushState
		) {
			logger.warn('not in the supported web environment');
		} else {
			this.init();
		}
	}

	abstract init(): void;
}
