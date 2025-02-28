// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
import { StorageUtil } from '../util/StorageUtil';

const logger = new Logger('BrowserInfo');

export class BrowserInfo {
	locale: string;
	system_language: string;
	country_code: string;
	make: string;
	userAgent: string;
	zoneOffset: number;
	hostName: string;
	latestReferrer: string;
	latestReferrerHost: string;

	constructor() {
		if (!BrowserInfo.isBrowser()) return;
		const { product, vendor, userAgent, language } = window.navigator;
		this.locale = language;
		this.initLocalInfo(language);
		this.make = product || vendor;
		this.userAgent = userAgent;
		this.zoneOffset = -new Date().getTimezoneOffset() * 60000;
		this.hostName = window.location.hostname;
		this.latestReferrer = window.document.referrer;
		if (this.latestReferrer && this.latestReferrer !== '') {
			try {
				const url = new URL(this.latestReferrer);
				this.latestReferrerHost = url.host;
			} catch (error) {
				logger.warn('parse latest referrer domain failed: ' + error);
			}
		}
	}

	initLocalInfo(locale: string) {
		if (locale.indexOf('-') > 0) {
			this.system_language = locale.split('-')[0];
			this.country_code = locale.split('-')[1].toUpperCase();
		} else {
			this.system_language = locale;
			this.country_code = '';
		}
	}

	static isBrowser(): boolean {
		return (
			typeof window !== 'undefined' && typeof window.document !== 'undefined'
		);
	}

	static isFirefox(): boolean {
		return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	}

	static isNetworkOnLine(): boolean {
		return navigator.onLine;
	}

	static getCurrentPageUrl(): string {
		if (!BrowserInfo.isBrowser()) return '';
		else return window.location.href;
	}

	static getCurrentPageTitle(): string {
		if (!BrowserInfo.isBrowser()) return '';
		return window.document.title ?? '';
	}

	static isFromReload() {
		if (performance && performance.getEntriesByType) {
			const performanceEntries = performance.getEntriesByType('navigation');
			if (performanceEntries && performanceEntries.length > 0) {
				const type = (performanceEntries[0] as any)['type'];
				return type === 'reload' && StorageUtil.getPreviousPageUrl() !== '';
			}
		} else {
			logger.warn('unsupported web environment for performance');
		}
		return false;
	}
}
