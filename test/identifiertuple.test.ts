/*
    This file is part of MUTE-structs.

    Copyright (C) 2017  Matthieu Nicolas, Victorien Elvinger

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import test from "ava"
import {ExecutionContext} from "ava"
import {IdentifierTuple} from "../src/identifiertuple"
import {Ordering} from "../src/ordering"

/**
 * Macro to check if compareTo() returns the expected result
 */
function compareTuplesMacro (
    t: ExecutionContext,
    tuple: IdentifierTuple, other: IdentifierTuple,
    expected: Ordering): void {

    const actual: Ordering = tuple.compareTo(other)
    t.is(actual, expected)
}

/**
 * Macro to check if equalsBase() returns the expected result
 */
function equalsBaseMacro (
    t: ExecutionContext,
    tuple: IdentifierTuple, other: IdentifierTuple,
    expected: boolean): void {

    const actual: boolean = tuple.equalsBase(other)
    t.is(actual, expected)
}

test("fromPlain", (t: ExecutionContext) => {
    const plain = {
        random: 42,
        replicaNumber: 1,
        clock: 10,
        offset: -5,
    }

    const tuple: IdentifierTuple | null = IdentifierTuple.fromPlain(plain)

    if (tuple === null) {
        t.fail("The identifier tuple should have been correctly instantiated")
    } else {
        t.is(tuple.random, plain.random)
        t.is(tuple.replicaNumber, plain.replicaNumber)
        t.is(tuple.clock, plain.clock)
        t.is(tuple.offset, plain.offset)
    }
})

test("fromPlain-missing-property", (t: ExecutionContext) => {
    const plain = {
        replicaNumber: 1,
        clock: 10,
        offset: -5,
    }

    const tuple: IdentifierTuple | null = IdentifierTuple.fromPlain(plain)

    t.is(tuple, null)
})

test("fromPlain-wrong-type", (t: ExecutionContext) => {
    const plain = {
        random: 42.7,
        replicaNumber: 1,
        clock: 10,
        offset: -5,
    }

    const tuple: IdentifierTuple | null = IdentifierTuple.fromPlain(plain)

    t.is(tuple, null)
})

test("generateWithSameBase", (t: ExecutionContext) => {
    const expected = 5
    const tuple1: IdentifierTuple = new IdentifierTuple(42, 7, 8, 26)
    const tuple2: IdentifierTuple = IdentifierTuple.fromBase(tuple1, expected)

    t.true(tuple1.equalsBase(tuple2))
    t.is(tuple2.offset, expected)
})

const tuple0000: IdentifierTuple = new IdentifierTuple(0, 0, 0, 0)
const tuple0001: IdentifierTuple = new IdentifierTuple(0, 0, 0, 1)
const tuple0010: IdentifierTuple = new IdentifierTuple(0, 0, 1, 0)
const tuple0100: IdentifierTuple = new IdentifierTuple(0, 1, 0, 0)
const tuple1000: IdentifierTuple = new IdentifierTuple(1, 0, 0, 0)

test("compareTo-tuple-less-other-1", compareTuplesMacro, tuple0000, tuple1000, Ordering.Less)
test("compareTo-tuple-less-other-2", compareTuplesMacro, tuple0000, tuple0100, Ordering.Less)
test("compareTo-tuple-less-other-3", compareTuplesMacro, tuple0000, tuple0010, Ordering.Less)
test("compareTo-tuple-less-other-4", compareTuplesMacro, tuple0000, tuple0001, Ordering.Less)

test("compareTo-tuple-equal-other", compareTuplesMacro, tuple0000, new IdentifierTuple(0, 0, 0, 0), Ordering.Equal)

test("compareTo-tuple-greater-other-1", compareTuplesMacro, tuple1000, tuple0000, Ordering.Greater)
test("compareTo-tuple-greater-other-2", compareTuplesMacro, tuple0100, tuple0000, Ordering.Greater)
test("compareTo-tuple-greater-other-3", compareTuplesMacro, tuple0010, tuple0000, Ordering.Greater)
test("compareTo-tuple-greater-other-4", compareTuplesMacro, tuple0001, tuple0000, Ordering.Greater)

test("equalsBase-tuple-equal-other-1", equalsBaseMacro, tuple0000, new IdentifierTuple(0, 0, 0, 0), true)
test("equalsBase-tuple-equal-other-2", equalsBaseMacro, tuple0000, tuple0001, true)

test("equalsBase-tuple-different-other-1", equalsBaseMacro, tuple0000, tuple1000, false)
test("equalsBase-tuple-different-other-2", equalsBaseMacro, tuple0000, tuple0100, false)
test("equalsBase-tuple-different-other-3", equalsBaseMacro, tuple0000, tuple0010, false)

test("asArray-properties-order", (t: ExecutionContext) => {
    const random = 42
    const replicaNumber = 1
    const clock = 10
    const offset = -5

    const tuple: IdentifierTuple = new IdentifierTuple(random, replicaNumber, clock, offset)

    const expected: number[] = [random, replicaNumber, clock, offset]
    const actual = tuple["asArray"]() // Hack to test this private function

    t.deepEqual(actual, expected)
})
