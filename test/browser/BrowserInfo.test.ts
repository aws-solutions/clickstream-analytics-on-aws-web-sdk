// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setPerformanceEntries } from './BrowserUtil';
import { MockObserver } from './MockObserver';
import { BrowserInfo } from '../../src/browser';
import { StorageUtil } from '../../src/util/StorageUtil';

describe('BrowserInfo test', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		jest.restoreAllMocks();
	});
	test('test create BrowserInfo', () => {
		StorageUtil.clearAllEvents();
		const referrer = 'https://example.com/collect';
		Object.defineProperty(window.document, 'referrer', {
			writable: true,
			value: referrer,
		});
		const browserInfo = new BrowserInfo();
		expect(browserInfo.userAgent.length > 0).toBeTruthy();
		expect(browserInfo.hostName.length > 0).toBeTruthy();
		expect(browserInfo.locale.length > 0).toBeTruthy();
		expect(browserInfo.system_language.length > 0).toBeTruthy();
		expect(browserInfo.zoneOffset).not.toBeUndefined();
		expect(browserInfo.make.length > 0).toBeTruthy();
		expect(browserInfo.latestReferrer).toBe(referrer);
		expect(browserInfo.latestReferrerHost).toBe('example.com');
	});

	test('test invalid latest referrer host', () => {
		const referrer = '/collect';
		Object.defineProperty(window.document, 'referrer', {
			writable: true,
			value: referrer,
		});
		const browserInfo = new BrowserInfo();
		expect(browserInfo.latestReferrer).toBe(referrer);
		expect(browserInfo.latestReferrerHost).toBeUndefined();
	});

	test('test init locale', () => {
		const browserInfo = new BrowserInfo();
		browserInfo.initLocalInfo('');
		expect(browserInfo.system_language).toBe('');
		expect(browserInfo.country_code).toBe('');

		browserInfo.initLocalInfo('en');
		expect(browserInfo.system_language).toBe('en');
		expect(browserInfo.country_code).toBe('');

		browserInfo.initLocalInfo('fr-fr');
		expect(browserInfo.system_language).toBe('fr');
		expect(browserInfo.country_code).toBe('FR');
	});

	test('test get current page url', () => {
		jest.spyOn(BrowserInfo, 'isBrowser').mockReturnValue(false);
		const url = BrowserInfo.getCurrentPageUrl();
		expect(url).toBe('');
		const title = BrowserInfo.getCurrentPageTitle();
		expect(title).toBe('');
	});

	test('test get current page title', () => {
		const originTitle = window.document.title;
		Object.defineProperty(window.document, 'title', {
			writable: true,
			value: undefined,
		});
		const title = BrowserInfo.getCurrentPageTitle();
		expect(title).toBe('');
		Object.defineProperty(window.document, 'title', {
			writable: true,
			value: originTitle,
		});
	});

	test('test get make and return vendor', () => {
		const vendor = window.navigator.vendor;
		jest.spyOn(window.navigator, 'product', 'get').mockReturnValue(undefined);
		const browserInfo = new BrowserInfo();
		expect(browserInfo.make).toBe(vendor);
	});

	test('test browser type', () => {
		const isFirefox = BrowserInfo.isFirefox();
		expect(isFirefox).toBeFalsy();
	});

	test('test unsupported web environment for performance', () => {
		expect(BrowserInfo.isFromReload()).toBeFalsy();
	});

	test('test web page from reload', () => {
		(global as any).PerformanceObserver = MockObserver;
		setPerformanceEntries();
		expect(BrowserInfo.isFromReload()).toBeFalsy();
	});

	test('test web page not from reload', () => {
		(global as any).PerformanceObserver = MockObserver;
		setPerformanceEntries(true, true);
		StorageUtil.savePreviousPageUrl('http://localhost:8080');
		expect(BrowserInfo.isFromReload()).toBeTruthy();
	});
});
