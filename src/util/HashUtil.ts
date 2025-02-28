// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 } from '@aws-crypto/sha256-browser';

export class HashUtil {
	static async getHashCode(str: string): Promise<string> {
		const hash = new Sha256();
		hash.update(str);
		const result = await hash.digest();
		return this.uint8ArrayToHexString(result).substring(0, 8);
	}

	private static uint8ArrayToHexString(array: Uint8Array): string {
		return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
			''
		);
	}
}
