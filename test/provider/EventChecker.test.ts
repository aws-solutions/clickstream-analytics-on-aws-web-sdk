// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventChecker, Event } from '../../src/provider';

describe('Event test', () => {
	test('test checkEventName with no error', () => {
		const error = EventChecker.checkEventName('testEvent');
		expect(error.error_code).toEqual(Event.ErrorCode.NO_ERROR);
	});
	test('test checkEventName with invalid name', () => {
		const error = EventChecker.checkEventName('1abc');
		expect(error.error_code).toEqual(Event.ErrorCode.EVENT_NAME_INVALID);
	});

	test('test checkEventName with name length exceed', () => {
		let longName = '';
		for (let i = 0; i < 10; i++) {
			longName += 'abcdeabcdef';
		}
		const error = EventChecker.checkEventName(longName);
		expect(error.error_code).toEqual(Event.ErrorCode.EVENT_NAME_LENGTH_EXCEED);
	});

	test('test isValidName method', () => {
		expect(EventChecker.isValidName('testName')).toBeTruthy();
		expect(EventChecker.isValidName('_app_start')).toBeTruthy();
		expect(EventChecker.isValidName('AAA')).toBeTruthy();
		expect(EventChecker.isValidName('a_ab')).toBeTruthy();
		expect(EventChecker.isValidName('a_ab_1A')).toBeTruthy();
		expect(EventChecker.isValidName('add_to_cart')).toBeTruthy();
		expect(EventChecker.isValidName('Screen_view')).toBeTruthy();
		expect(EventChecker.isValidName('')).toBeFalsy();
		expect(EventChecker.isValidName('*&')).toBeFalsy();
		expect(EventChecker.isValidName('0abc')).toBeFalsy();
		expect(EventChecker.isValidName('123')).toBeFalsy();
	});
});
