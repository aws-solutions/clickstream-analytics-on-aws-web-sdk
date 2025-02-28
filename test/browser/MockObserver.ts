// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export class MockObserver {
	private readonly callback: () => void;

	constructor(callback: () => void) {
		this.callback = callback;
	}

	observe(options: any) {
		console.log(options);
	}

	call() {
		this.callback();
	}
}
