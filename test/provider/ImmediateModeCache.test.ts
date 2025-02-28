// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClickstreamAnalytics } from '../../src';
import { NetRequest } from '../../src/network/NetRequest';
import { Event } from '../../src/provider';
import { StorageUtil } from '../../src/util/StorageUtil';
import { setUpBrowserPerformance } from '../browser/BrowserUtil';

describe('ImmediateModeCache test', () => {
	beforeEach(() => {
		setUpBrowserPerformance();
		const mockSendRequestFail = jest.fn().mockResolvedValue(false);
		jest
			.spyOn(NetRequest, 'sendRequest')
			.mockImplementation(mockSendRequestFail);
	});

	afterEach(() => {
		ClickstreamAnalytics['provider'] = undefined;
		jest.resetAllMocks();
	});

	test('test record event failed and stores the event then send the event', async () => {
		const sendRequestMock = jest.spyOn(NetRequest, 'sendRequest');
		ClickstreamAnalytics.init({
			appId: 'testApp',
			endpoint: 'https://localhost:8080/failed',
		});
		ClickstreamAnalytics.record({
			name: 'testEvent',
		});
		await sleep(100);
		expect(sendRequestMock).toBeCalled();
		const failedEvents = JSON.parse(
			StorageUtil.getFailedEvents() + Event.Constants.SUFFIX
		);
		expect(failedEvents.length).toBeGreaterThan(3);
		const mockSendRequestSuccess = jest.fn().mockResolvedValue(true);
		jest
			.spyOn(NetRequest, 'sendRequest')
			.mockImplementation(mockSendRequestSuccess);
		const provider = ClickstreamAnalytics['provider'];
		provider.configure({
			appId: 'testAppId',
			endpoint: 'https://example.com/collect',
		});
		await sleep(100);
		expect(StorageUtil.getFailedEvents().length).toBe(0);
	});

	function sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
});
