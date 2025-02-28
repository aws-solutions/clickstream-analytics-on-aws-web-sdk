// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Logger } from '@aws-amplify/core';
import { BaseTracker } from './BaseTracker';
import { PageViewTracker } from './PageViewTracker';
import { Event } from '../provider';

const logger = new Logger('ClickTracker');

export class ClickTracker extends BaseTracker {
	processedElements = new WeakSet();

	init() {
		this.trackClick = this.trackClick.bind(this);
		this.trackDocumentClick = this.trackDocumentClick.bind(this);
		document.addEventListener('click', this.trackDocumentClick);
		const currentDomain = window.location.host;
		const domainList = this.context.configuration.domainList;
		if (!domainList.includes(currentDomain)) {
			domainList.push(currentDomain);
		}
		this.addClickListenerForATag();
	}

	trackDocumentClick(event: MouseEvent) {
		PageViewTracker.updateIdleDuration();
		if (!this.context.configuration.isTrackClickEvents) return;
		const targetElement = event.target as Element;
		const element = this.findATag(targetElement);
		if (!element || this.processedElements.has(element)) return;
		this.trackClick(event, element);
	}

	trackClick(
		event: MouseEvent,
		documentElement: Element | undefined = undefined
	) {
		if (!this.context.configuration.isTrackClickEvents) return;
		let element = documentElement;
		if (!element) {
			const targetElement = event.target as Element;
			element = this.findATag(targetElement);
		}
		if (element !== null) {
			const linkUrl = element.getAttribute('href');
			if (linkUrl === null || linkUrl.length === 0) return;
			let linkDomain = '';
			try {
				const url = new URL(linkUrl);
				linkDomain = url.host;
			} catch (error) {
				logger.debug('parse link domain failed: ' + error);
			}
			if (linkDomain === '') return;
			const linkClasses = element.getAttribute('class');
			const linkId = element.getAttribute('id');
			const outbound =
				!this.context.configuration.domainList.includes(linkDomain);
			this.provider.record({
				name: Event.PresetEvent.CLICK,
				attributes: {
					[Event.ReservedAttribute.LINK_URL]: linkUrl,
					[Event.ReservedAttribute.LINK_DOMAIN]: linkDomain,
					[Event.ReservedAttribute.LINK_CLASSES]: linkClasses,
					[Event.ReservedAttribute.LINK_ID]: linkId,
					[Event.ReservedAttribute.OUTBOUND]: outbound,
				},
			});
		}
	}

	addClickListenerForATag() {
		const observer = new MutationObserver(mutationsList => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					const target = mutation.target;
					if (target instanceof Element) {
						const aTags = target.querySelectorAll('a');
						aTags.forEach(aTag => {
							if (!this.processedElements.has(aTags)) {
								aTag.addEventListener('click', this.trackClick);
								this.processedElements.add(aTag);
							}
						});
					}
				}
			}
		});
		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
	}

	findATag(element: Element, depth = 0): Element {
		if (element && depth < 3) {
			if (element.tagName === 'A') {
				return element;
			} else {
				depth += 1;
				return this.findATag(element.parentElement, depth);
			}
		}
		return null;
	}
}
