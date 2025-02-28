// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { LOG_TYPE } from '@aws-amplify/core/lib/Logger';
import { ClickstreamContext } from './ClickstreamContext';
import { Event } from './Event';
import { NetRequest } from '../network/NetRequest';
import { AnalyticsEvent, SendMode } from '../types';
import { StorageUtil } from '../util/StorageUtil';

const logger = new Logger('EventRecorder');

export class EventRecorder {
	context: ClickstreamContext;
	bundleSequenceId: number;
	isFlushingEvents: boolean;
	isSendingFailedEvents: boolean;
	haveFailedEvents: boolean;

	constructor(context: ClickstreamContext) {
		this.context = context;
		this.bundleSequenceId = StorageUtil.getBundleSequenceId();
	}

	record(event: AnalyticsEvent, isImmediate = false) {
		if (this.context.configuration.isLogEvents) {
			logger.level = LOG_TYPE.DEBUG;
			logger.debug(`Logged event ${event.event_type}\n`, event);
		}
		const currentMode = this.context.configuration.sendMode;
		if (currentMode === SendMode.Immediate || isImmediate) {
			this.sendEventImmediate(event);
		} else {
			if (!StorageUtil.saveEvent(event)) {
				this.sendEventImmediate(event);
			}
		}
	}

	sendEventImmediate(event: AnalyticsEvent) {
		const eventsJson = JSON.stringify([event]);
		NetRequest.sendRequest(
			eventsJson,
			this.context,
			this.bundleSequenceId
		).then(result => {
			if (result) {
				logger.debug('Event send success');
				if (this.haveFailedEvents) {
					this.sendFailedEvents();
				}
			} else {
				StorageUtil.saveFailedEvent(event);
				this.haveFailedEvents = true;
			}
		});
		this.plusSequenceId();
	}

	sendFailedEvents() {
		if (this.isSendingFailedEvents) return;
		this.isSendingFailedEvents = true;
		const failedEvents = StorageUtil.getFailedEvents();
		if (failedEvents.length > 0) {
			const eventsJson = failedEvents + Event.Constants.SUFFIX;
			NetRequest.sendRequest(
				eventsJson,
				this.context,
				this.bundleSequenceId
			).then(result => {
				if (result) {
					logger.debug('Failed events send success');
					StorageUtil.clearFailedEvents();
					this.haveFailedEvents = false;
				}
				this.isSendingFailedEvents = false;
			});
			this.plusSequenceId();
		}
	}

	flushEvents() {
		if (this.isFlushingEvents) {
			return;
		}
		const [eventsJson, needsFlushTwice] = this.getBatchEvents();
		if (eventsJson === '') {
			return;
		}
		this.isFlushingEvents = true;
		NetRequest.sendRequest(
			eventsJson,
			this.context,
			this.bundleSequenceId,
			NetRequest.BATCH_REQUEST_RETRY_TIMES,
			NetRequest.BATCH_REQUEST_TIMEOUT
		).then(result => {
			if (result) {
				StorageUtil.clearEvents(eventsJson);
			}
			this.isFlushingEvents = false;
			if (result && needsFlushTwice) {
				this.flushEvents();
			}
		});
		this.plusSequenceId();
	}

	getBatchEvents(): [string, boolean] {
		let allEventsStr = StorageUtil.getAllEvents();
		if (allEventsStr === '') {
			return [allEventsStr, false];
		} else if (allEventsStr.length <= StorageUtil.MAX_REQUEST_EVENTS_SIZE) {
			return [allEventsStr + Event.Constants.SUFFIX, false];
		} else {
			const isOnlyOneEvent =
				allEventsStr.lastIndexOf(Event.Constants.LAST_EVENT_IDENTIFIER) < 0;
			const firstEventSize = allEventsStr.indexOf(
				Event.Constants.LAST_EVENT_IDENTIFIER
			);
			if (isOnlyOneEvent) {
				return [allEventsStr + Event.Constants.SUFFIX, false];
			} else if (firstEventSize > StorageUtil.MAX_REQUEST_EVENTS_SIZE) {
				allEventsStr = allEventsStr.substring(0, firstEventSize + 1);
				return [allEventsStr + Event.Constants.SUFFIX, true];
			} else {
				allEventsStr = allEventsStr.substring(
					0,
					StorageUtil.MAX_REQUEST_EVENTS_SIZE
				);
				const endIndex = allEventsStr.lastIndexOf(
					Event.Constants.LAST_EVENT_IDENTIFIER
				);
				return [
					allEventsStr.substring(0, endIndex + 1) + Event.Constants.SUFFIX,
					true,
				];
			}
		}
	}

	plusSequenceId() {
		this.bundleSequenceId += 1;
		StorageUtil.saveBundleSequenceId(this.bundleSequenceId);
	}

	sendEventsInBackground(isWindowClosing: boolean) {
		if (
			this.haveFailedEvents &&
			this.getFailedEventsLength() < NetRequest.KEEP_ALIVE_SIZE_LIMIT
		) {
			this.sendFailedEvents();
			if (isWindowClosing) {
				StorageUtil.clearFailedEvents();
			}
		}
		if (this.context.configuration.sendMode === SendMode.Batch) {
			const eventLength = this.getEventsLength();
			if (eventLength > 0 && eventLength < NetRequest.KEEP_ALIVE_SIZE_LIMIT) {
				this.flushEvents();
				if (isWindowClosing) {
					StorageUtil.clearAllEvents();
				}
			}
		}
	}

	getFailedEventsLength(): number {
		const failedEvents = StorageUtil.getFailedEvents();
		return new Blob([failedEvents]).size;
	}

	getEventsLength(): number {
		const events = StorageUtil.getAllEvents();
		return new Blob([events]).size;
	}
}
