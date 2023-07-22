/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */
import { BrowserInfo } from '../../src/browser';

describe('BrowserInfo test', () => {
	test('test create BrowserInfo', () => {
		const browserInfo = new BrowserInfo();
		expect(browserInfo.userAgent.length > 0).toBeTruthy();
		expect(browserInfo.hostName.length > 0).toBeTruthy();
		expect(browserInfo.locale.length > 0).toBeTruthy();
		expect(browserInfo.system_language.length > 0).toBeTruthy();
		expect(browserInfo.zoneOffset).not.toBeUndefined();
		expect(browserInfo.make.length > 0).toBeTruthy();
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
});
