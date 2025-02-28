// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BaseTracker } from './BaseTracker';
import { PageViewTracker } from './PageViewTracker';
import { Event } from '../provider';
import { StorageUtil } from '../util/StorageUtil';

export class ScrollTracker extends BaseTracker {
	isFirstTime: boolean;

	init() {
		this.trackScroll = this.trackScroll.bind(this);
		const throttledTrackScroll = this.throttle(this.trackScroll, 100);
		document.addEventListener('scroll', throttledTrackScroll, {
			passive: true,
		});
		const throttledMouseMove = this.throttle(this.onMouseMove, 100);
		document.addEventListener('mousemove', throttledMouseMove, {
			passive: true,
		});
		this.isFirstTime = true;
	}

	enterNewPage() {
		this.isFirstTime = true;
	}

	trackScroll() {
		PageViewTracker.updateIdleDuration();
		if (!this.context.configuration.isTrackScrollEvents) return;
		const scrollY = window.scrollY || document.documentElement.scrollTop;
		const ninetyPercentHeight = document.body.scrollHeight * 0.9;
		const viewedHeight = scrollY + window.innerHeight;
		if (scrollY > 0 && viewedHeight > ninetyPercentHeight && this.isFirstTime) {
			const engagementTime =
				new Date().getTime() - StorageUtil.getPreviousPageStartTime();
			this.provider.record({
				name: Event.PresetEvent.SCROLL,
				attributes: {
					[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP]: engagementTime,
				},
			});
			this.isFirstTime = false;
		}
	}

	onMouseMove() {
		PageViewTracker.updateIdleDuration();
	}

	throttle(func: (...args: any[]) => void, delay: number) {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		return function (this: any, ...args: any[]) {
			if (!timeout) {
				timeout = setTimeout(() => {
					func.apply(this, args);
					timeout = null;
				}, delay);
			}
		};
	}
}
