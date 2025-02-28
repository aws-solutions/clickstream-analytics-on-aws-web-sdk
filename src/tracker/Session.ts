// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClickstreamContext } from '../provider';
import { StorageUtil } from '../util/StorageUtil';

export class Session {
	sessionId: string;
	startTime: number;
	sessionIndex: number;
	pauseTime: number;
	isRecorded = false;

	static createSession(uniqueId: string, sessionIndex: number): Session {
		return new Session(
			this.getSessionId(uniqueId),
			sessionIndex,
			new Date().getTime()
		);
	}

	constructor(
		sessionId: string,
		sessionIndex: number,
		startTime: number,
		pauseTime: number = undefined
	) {
		this.sessionId = sessionId;
		this.sessionIndex = sessionIndex;
		this.startTime = startTime;
		this.pauseTime = pauseTime;
	}

	isNewSession(): boolean {
		return this.pauseTime === undefined && !this.isRecorded;
	}

	getDuration(): number {
		return new Date().getTime() - this.startTime;
	}

	pause() {
		this.pauseTime = new Date().getTime();
	}

	static getCurrentSession(
		context: ClickstreamContext,
		previousSession: Session = null
	): Session {
		let session = previousSession;
		if (previousSession === null) {
			session = StorageUtil.getSession();
		}
		if (session !== null) {
			if (
				session.pauseTime === undefined ||
				new Date().getTime() - session.pauseTime <
					context.configuration.sessionTimeoutDuration
			) {
				return session;
			} else {
				return Session.createSession(
					context.userUniqueId,
					session.sessionIndex + 1
				);
			}
		} else {
			return Session.createSession(context.userUniqueId, 1);
		}
	}

	private static getSessionId(uniqueId: string): string {
		const uniqueIdKey = uniqueId.slice(-Constants.maxUniqueIdLength);
		return `${uniqueIdKey}-${this.getFormatTime()}`;
	}

	private static getFormatTime() {
		const now = new Date();
		const year = now.getUTCFullYear().toString().padStart(4, '0');
		const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
		const day = now.getUTCDate().toString().padStart(2, '0');
		const hours = now.getUTCHours().toString().padStart(2, '0');
		const minutes = now.getUTCMinutes().toString().padStart(2, '0');
		const seconds = now.getUTCSeconds().toString().padStart(2, '0');
		const milliseconds = now.getUTCMilliseconds().toString().padStart(3, '0');
		return `${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
	}
}

enum Constants {
	maxUniqueIdLength = 8,
}
