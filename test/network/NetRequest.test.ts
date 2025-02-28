// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fetchMock from '@fetch-mock/jest';
import { ClickstreamAnalytics } from '../../src';
import { BrowserInfo } from '../../src/browser';
import { NetRequest } from '../../src/network/NetRequest';
import { AnalyticsEventBuilder, ClickstreamContext } from '../../src/provider';
import { Session } from '../../src/tracker';
import { HashUtil } from '../../src/util/HashUtil';

function mockFetch(
	ok: boolean = true,
	status: number = 200,
	delay?: number
) {
	return jest.spyOn(global, 'fetch').mockImplementation(() => {
		const responsePromise = Promise.resolve({
			ok,
			status,
			json: () => Promise.resolve([]),
			text: () => Promise.resolve(''),
		} as Response);

		if (delay !== undefined && delay > 0) {
			return new Promise(resolve => {
				setTimeout(() => resolve(responsePromise), delay);
			});
		} else {
			return responsePromise;
		}
	});
  }
  

describe('ClickstreamAnalytics test', () => {
	let context: ClickstreamContext;
	let eventJson: string;
	let fetchSpy: jest.SpyInstance;

	beforeEach(async () => {
		fetchSpy = mockFetch();
		context = new ClickstreamContext(new BrowserInfo(), {
			appId: 'testApp',
			endpoint: 'https://localhost:8080/collect',
		});
		const event = AnalyticsEventBuilder.createEvent(
			context,
			{ name: 'testEvent' },
			{},
			Session.getCurrentSession(context)
		);
		eventJson = JSON.stringify([event]);
	});

	afterEach(() => {
		fetchMock.mockReset();
		fetchSpy.mockRestore();
		ClickstreamAnalytics['provider'] = undefined;
	});

	test('test request success', async () => {
		jest.spyOn(global, 'fetch').mockImplementation(() =>
			Promise.resolve({
			  ok: true,
			  status: 200,
			  json: () => Promise.resolve([]),
			} as Response)
		  );
		fetchMock.post('begin:https://localhost:8080/collect', {
			status: 200,
			body: [],
		});
		const result = await NetRequest.sendRequest(eventJson, context, 1);
		expect(result).toBeTruthy();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	test('test request fail', async () => {
		fetchSpy.mockRestore();
		fetchSpy = mockFetch(false, 400);
		context = new ClickstreamContext(new BrowserInfo(), {
			appId: 'testApp',
			endpoint: 'https://localhost:8080/failed',
		});
		const result = await NetRequest.sendRequest(eventJson, context, 1);
		expect(result).toBeFalsy();
		expect(fetchSpy).toHaveBeenCalledTimes(3);
	});

	test('test request fail with code 404', async () => {
		fetchSpy.mockRestore();
		fetchSpy = mockFetch(false, 404);
		fetchMock.post('begin:https://localhost:8080/collectFail', 404);
		context = new ClickstreamContext(new BrowserInfo(), {
			appId: 'testApp',
			endpoint: 'https://localhost:8080/collectFail',
		});
		const result = await NetRequest.sendRequest(eventJson, context, 1);
		expect(result).toBeFalsy();
		expect(fetchSpy).toHaveBeenCalledTimes(3);
	});

	test('test request timeout', async () => {
		fetchSpy.mockRestore();
		fetchSpy = mockFetch(false, 504, 1000);
		fetchMock.post(
			'begin:https://localhost:8080/collect',
			{
				status: 504,
				body: [],
			},
			{
				delay: 1000,
			}
		);
		context = new ClickstreamContext(new BrowserInfo(), {
			appId: 'testApp',
			endpoint: 'https://localhost:8080/collect',
		});
		const startTime = Date.now();
		const result = await NetRequest.sendRequest(eventJson, context, 1, 1, 200);
		const endTime = Date.now();

		expect(result).toBeFalsy();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(endTime - startTime).toBeGreaterThanOrEqual(1000);

		const response = await fetchSpy.mock.results[0].value;
		expect(response.ok).toBe(false);
		expect(response.status).toBe(504);
	});

	test('test request success with hash code', async () => {
		fetchMock.post('begin:https://localhost:8080/collect', {
			status: 200,
			body: [],
		});
		const eventJsonHashCode = await HashUtil.getHashCode(eventJson);
		const result = await NetRequest.sendRequest(eventJson, context, 1);
		expect(result).toBeTruthy();

		const [requestUrl] = fetchSpy.mock.calls[0];
		const requestHashCode = new URL(requestUrl.toString()).searchParams.get(
			'hashCode'
		);
		expect(eventJsonHashCode).toBe(requestHashCode);
	});

	test('test request success with upload timestamp', async () => {
		fetchMock.post('begin:https://localhost:8080/collect', {
			status: 200,
			body: [],
		});
		const result = await NetRequest.sendRequest(eventJson, context, 1);
		expect(result).toBeTruthy();

		const [requestUrl] = fetchSpy.mock.calls[0];
		const uploadTimestamp = new URL(requestUrl.toString()).searchParams.get(
			'upload_timestamp'
		);
		expect(uploadTimestamp).not.toBeNull();
	});

	test('test error handling', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		fetchSpy.mockRestore();
		fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => {
		  throw new Error('Network error');
		});
	
		const result = await NetRequest.sendRequest(eventJson, context, 1, 1);
		expect(result).toBeFalsy();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error during request: Error: Network error'));
		consoleErrorSpy.mockRestore();
	  })

	  test('should use authCookie value when present', async () => {
		const testCookie = 'session=abc123';
		context = new ClickstreamContext(new BrowserInfo(), {
			appId: 'testApp',
			endpoint: 'https://localhost:8080/collect',
		});
		context.configuration.authCookie = testCookie;
		const result = await NetRequest.sendRequest(
			'{}',
			context,
			1
		);
		
		expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						cookie: testCookie
					})
				})
			);
		});

		test('should use empty string when authCookie is undefined', async () => {
			context = new ClickstreamContext(new BrowserInfo(), {
				appId: 'testApp',
				endpoint: 'https://localhost:8080/collect',
			});
            context.configuration.authCookie = undefined;
            const result = await NetRequest.sendRequest(
                '{}',
                context,
                1
            );
            
            // Verify fetch was called with empty cookie header
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        cookie: ''
                    })
                })
            );
        });

		test('should use userAgent value when present', async () => {
            const testUserAgent = 'Mozilla/5.0 Test Browser';
			context = new ClickstreamContext(new BrowserInfo(), {
				appId: 'testApp',
				endpoint: 'https://localhost:8080/collect',
			});
            context.browserInfo.userAgent = testUserAgent;
            const result = await NetRequest.sendRequest(
                '{}',
                context,
                1
            );
            
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'User-Agent': testUserAgent
                    })
                })
            );
        });

		test('should use empty string when userAgent is null', async () => {
			context = new ClickstreamContext(new BrowserInfo(), {
				appId: 'testApp',
				endpoint: 'https://localhost:8080/collect',
			});
            context.browserInfo.userAgent = null;
            const result = await NetRequest.sendRequest(
                '{}',
                context,
                1
            );
            
            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'User-Agent': ''
                    })
                })
            );
        });
});
