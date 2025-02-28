// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BrowserInfo } from '../browser';
import { ClickstreamConfiguration } from '../types';
import { StorageUtil } from '../util/StorageUtil';

export class ClickstreamContext {
	browserInfo: BrowserInfo;
	configuration: ClickstreamConfiguration;
	userUniqueId: string;

	constructor(
		browserInfo: BrowserInfo,
		configuration: ClickstreamConfiguration
	) {
		this.browserInfo = browserInfo;
		this.configuration = configuration;
		this.userUniqueId = StorageUtil.getCurrentUserUniqueId();
	}
}
