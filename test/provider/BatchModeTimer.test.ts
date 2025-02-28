// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SendMode } from '../../src';
import { NetRequest } from '../../src/network/NetRequest';
import { ClickstreamProvider } from '../../src/provider';
import { StorageUtil } from '../../src/util/StorageUtil';
import { setUpBrowserPerformance } from '../browser/BrowserUtil';

describe('ClickstreamProvider timer test', () => {
	let provider: ClickstreamProvider;
	beforeEach(() => {
		StorageUtil.clearAll();
		setUpBrowserPerformance();
		provider = new ClickstreamProvider();
		const mockSendRequest = jest.fn().mockResolvedValue(true);
		jest.spyOn(NetRequest, 'sendRequest').mockImplementation(mockSendRequest);
	});

	afterEach(() => {
		provider = undefined;
		jest.restoreAllMocks();
	});
	test('test config batch mode with timer', async () => {
		const startTimerMock = jest.spyOn(provider, 'startTimer');
		const flushEventsMock = jest.spyOn(provider, 'flushEvents');
		provider.configure({
			appId: 'testAppId',
			endpoint: 'https://example.com/collect',
			sendMode: SendMode.Batch,
			sendEventsInterval: 10,
		});
		await sleep(100);
		expect(startTimerMock).toBeCalled();
		expect(flushEventsMock).toBeCalled();
	});
});

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
