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

import {
    INT32_BOTTOM,
    INT32_TOP,
    isInt32,
    randomInt32
} from './int32'
import {Identifier} from './identifier'
import {IdentifierTuple} from './identifiertuple'
import {Ordering} from './ordering'

const MIN_TUPLE: IdentifierTuple = new IdentifierTuple(INT32_BOTTOM, 0, 0, 0)
const MAX_TUPLE: IdentifierTuple = new IdentifierTuple(INT32_TOP, 0, 0, 0)

export function createBetweenPosition (id1: Identifier | null,
    id2: Identifier | null, replicaNumber: number, clock: number): Identifier {

    console.assert(id1 === null || id2 === null ||
        id1.compareTo(id2) === Ordering.Less, "id1 < id2")
    console.assert(isInt32(replicaNumber), "replicaNumber is an int32")
    console.assert(isInt32(clock), "clock is an int32")

    const seq1 = infiniteSequence(tuplesOf(id1), MIN_TUPLE)
    const seq2 = infiniteSequence(tuplesOf(id2), MAX_TUPLE)
    const tuples: IdentifierTuple[] = []

    let tuple1 = seq1.next().value
    let tuple2 = seq2.next().value
    while ((tuple2.random - tuple1.random) < 2) {
        // Cannot insert a new tuple between tuple1 and tuple2
        tuples.push(tuple1)
        tuple1 = seq1.next().value
        tuple2 = seq2.next().value
    }
    const random = randomInt32(tuple1.random + 1, tuple2.random)
        // random ∈ ]tuple1.random, tuple2.random[
        // tuple1.random exclusion ensures a dense set
        // tuple2.random exclusion ensures that newTuple < tuple2
        // and thus that newId < id2
    tuples.push(new IdentifierTuple(random, replicaNumber, clock, 0))

    return new Identifier(tuples)
}

/**
 * Generate an infinite sequence of tuples
 *
 * @param values
 * @param defaultValue
 */
function *infiniteSequence <T>
    (values: T[], defaultValue: T): IterableIterator<T> {

    for (const v of values) {
        yield v
    }
    while (true) {
        yield defaultValue
    }
}

/**
 * @param id
 * @return Tuples of `a' or an empty array if none.
 */
function tuplesOf (id: Identifier | null): IdentifierTuple[] {
    return (id !== null) ? id.tuples : []
}
