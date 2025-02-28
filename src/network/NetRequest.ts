// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { ClickstreamContext } from '../provider';
import { HashUtil } from '../util/HashUtil';

const logger = new Logger('NetRequest');

export class NetRequest {
	static readonly REQUEST_TIMEOUT = 10000;
	static readonly BATCH_REQUEST_TIMEOUT = 15000;
	static readonly REQUEST_RETRY_TIMES = 3;
	static readonly BATCH_REQUEST_RETRY_TIMES = 1;
	static readonly KEEP_ALIVE_SIZE_LIMIT = 64 * 1024;

	static async sendRequest(
		eventsJson: string,
		context: ClickstreamContext,
		bundleSequenceId: number,
		retryTimes = NetRequest.REQUEST_RETRY_TIMES,
		timeout = NetRequest.REQUEST_TIMEOUT
	): Promise<boolean> {
		const { configuration, browserInfo } = context;
		const eventsHash = await HashUtil.getHashCode(eventsJson);
		const queryParams = new URLSearchParams({
			platform: 'Web',
			appId: configuration.appId,
			event_bundle_sequence_id: bundleSequenceId.toString(),
			upload_timestamp: new Date().getTime().toString(),
			hashCode: eventsHash,
		});
		const url = `${configuration.endpoint}?${queryParams.toString()}`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
		}, timeout);
		const inputSizeInBytes = new Blob([eventsJson]).size;
		const isKeepAlive = inputSizeInBytes < NetRequest.KEEP_ALIVE_SIZE_LIMIT;
		const requestOptions: RequestInit = {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				cookie: configuration.authCookie?.toString() ?? '',
				'User-Agent': browserInfo.userAgent?.toString() ?? '',
			},
			credentials: 'include',
			body: eventsJson,
			keepalive: isKeepAlive,
		};
		requestOptions.signal = controller.signal;

		let retries = 0;
		while (retries < retryTimes) {
			try {
				const response = await fetch(url, requestOptions);
				if (response.ok && response.status === 200) {
					return true;
				} else {
					logger.error(`Request failed with status code ${response.status}`);
				}
			} catch (error) {
				logger.error(`Error during request: ${error}`);
			} finally {
				clearTimeout(timeoutId);
				retries++;
			}
		}
		logger.error(`Request failed after ${retryTimes} retries`);
		return false;
	}
}
