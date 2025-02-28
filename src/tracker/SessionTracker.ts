// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
import { BaseTracker } from './BaseTracker';
import { PageViewTracker } from './PageViewTracker';
import { Session } from './Session';
import { BrowserInfo } from '../browser';
import { Event } from '../provider';
import { StorageUtil } from '../util/StorageUtil';

const logger = new Logger('SessionTracker');

export class SessionTracker extends BaseTracker {
	hiddenStr: string;
	visibilityChange: string;
	session: Session;
	isWindowClosing = false;

	init() {
		this.onVisibilityChange = this.onVisibilityChange.bind(this);
		this.onBeforeUnload = this.onBeforeUnload.bind(this);

		this.handleInit();
		if (!this.checkEnv()) {
			logger.warn('not supported env');
		} else {
			document.addEventListener(
				this.visibilityChange,
				this.onVisibilityChange,
				false
			);
			window.addEventListener('beforeunload', this.onBeforeUnload, false);
		}
	}

	onVisibilityChange() {
		if (document.visibilityState === this.hiddenStr) {
			this.onPageHide();
		} else {
			this.onPageAppear();
		}
	}

	handleInit() {
		this.session = Session.getCurrentSession(this.context);
		if (StorageUtil.getIsFirstOpen()) {
			this.provider.record({
				name: Event.PresetEvent.FIRST_OPEN,
			});
			StorageUtil.saveIsFirstOpenToFalse();
		}
		this.onPageAppear(true);
	}

	onPageAppear(isFirstTime = false) {
		logger.debug('page appear');
		const pageViewTracker = this.provider.pageViewTracker;
		pageViewTracker.updateLastScreenStartTimestamp();
		if (!isFirstTime) {
			this.session = Session.getCurrentSession(this.context, this.session);
		}
		if (this.session.isNewSession()) {
			pageViewTracker.setIsEntrances();
			StorageUtil.clearPageInfo();
			this.provider.record({ name: Event.PresetEvent.SESSION_START });
			this.session.isRecorded = true;
			if (!isFirstTime) {
				pageViewTracker.onPageChange();
			}
		}
		if (!this.provider.configuration.isTrackAppStartEvents) return;
		if (isFirstTime && this.isFromCurrentHost()) return;
		if (isFirstTime && BrowserInfo.isFromReload()) return;
		this.provider.record({
			name: Event.PresetEvent.APP_START,
			attributes: {
				[Event.ReservedAttribute.IS_FIRST_TIME]: isFirstTime,
			},
		});
	}

	isFromCurrentHost() {
		return window.location.host === this.context.browserInfo.latestReferrerHost;
	}

	onPageHide() {
		logger.debug('page hide');
		this.storeSession();
		StorageUtil.checkClickstreamId();
		const isImmediate = !(this.isWindowClosing && BrowserInfo.isFirefox());
		this.recordUserEngagement(isImmediate);
		this.recordAppEnd(isImmediate);
		this.provider.sendEventsInBackground(this.isWindowClosing);
	}

	recordUserEngagement(isImmediate: boolean) {
		PageViewTracker.updateIdleDuration();
		this.provider.pageViewTracker.recordUserEngagement(isImmediate);
	}

	recordAppEnd(isImmediate: boolean) {
		if (!this.provider.configuration.isTrackAppEndEvents) return;
		this.provider.record({
			name: Event.PresetEvent.APP_END,
			isImmediate: isImmediate,
		});
	}

	onBeforeUnload() {
		logger.debug('onBeforeUnload');
		this.isWindowClosing = true;
	}

	storeSession() {
		this.session.pause();
		StorageUtil.saveSession(this.session);
	}

	checkEnv(): boolean {
		if (!document || !document.addEventListener) {
			logger.debug('not in the supported web environment');
			return false;
		}
		if (typeof document.hidden !== 'undefined') {
			this.hiddenStr = 'hidden';
			this.visibilityChange = 'visibilitychange';
		} else if (typeof (document as any).msHidden !== 'undefined') {
			this.hiddenStr = 'msHidden';
			this.visibilityChange = 'msvisibilitychange';
		} else if (typeof (document as any).webkitHidden !== 'undefined') {
			this.hiddenStr = 'webkitHidden';
			this.visibilityChange = 'webkitvisibilitychange';
		} else {
			logger.debug('not in the supported web environment');
			return false;
		}
		return true;
	}
}
