// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export class MethodEmbed {
	public context;
	public methodName;
	private readonly originalMethod;

	static add(context: any, methodName: string, methodOverride: any) {
		new MethodEmbed(context, methodName).set(methodOverride);
	}

	constructor(context: any, methodName: string) {
		this.context = context;
		this.methodName = methodName;

		this.originalMethod = context[methodName].bind(context);
	}

	public set(methodOverride: any) {
		this.context[this.methodName] = (...args: any) => {
			return methodOverride(this.originalMethod(...args));
		};
	}
}
