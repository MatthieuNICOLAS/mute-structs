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

import {findPredecessor, flatten} from "../helpers"
import {Identifier} from "../identifier"
import {IdentifierInterval} from "../identifierinterval"
import {createAtPosition} from "../idfactory"
import {INT32_TOP} from "../int32"
import {Ordering} from "../ordering"
import {RenamingMap} from "./renamingmap"

export class ExtendedRenamingMap {

    static fromRenamingMap (renamingMap: RenamingMap): ExtendedRenamingMap {
        const replicaNumber = renamingMap.replicaNumber
        const clock = renamingMap.clock
        const renamedIdIntervals = renamingMap.renamedIdIntervals
        return new ExtendedRenamingMap(replicaNumber, clock, renamedIdIntervals)
    }

    readonly replicaNumber: number
    readonly clock: number
    readonly renamedIds: Identifier[]
    readonly map: Map<number, Map<number, Map<number, number>>>
    readonly newOffsetToOldIdMap: Map<number, Identifier>
    readonly maxOffset: number

    constructor (replicaNumber: number, clock: number, renamedIdIntervals: IdentifierInterval[]) {
        this.replicaNumber = replicaNumber
        this.clock = clock
        this.renamedIds = []
        this.map = new Map()
        this.newOffsetToOldIdMap = new Map()

        let newOffset = 0
        renamedIdIntervals
            .map((idInterval: IdentifierInterval) => idInterval.toIds())
            .reduce(flatten)
            .forEach((id: Identifier) => {
                this.renamedIds.push(id)

                if (!this.map.has(id.replicaNumber)) {
                    this.map.set(id.replicaNumber, new Map())
                }
                const clockMap: Map<number, Map<number, number>> =
                    this.map.get(id.replicaNumber) as Map<number, Map<number, number>>

                if (!clockMap.has(id.clock)) {
                    clockMap.set(id.clock, new Map())
                }

                const offsetMap: Map<number, number> =
                    clockMap.get(id.clock) as Map<number, number>

                offsetMap.set(id.lastOffset, newOffset)
                this.newOffsetToOldIdMap.set(newOffset, id)
                newOffset++
            })

        this.maxOffset = newOffset - 1
    }

    get firstId (): Identifier {
        return this.renamedIds[0]
    }

    get lastId (): Identifier {
        return this.renamedIds[this.renamedIds.length - 1]
    }

    get newFirstId (): Identifier {
        return createAtPosition(this.replicaNumber, this.clock, this.newRandom, 0)
    }

    get newLastId (): Identifier {
        return createAtPosition(this.replicaNumber, this.clock, this.newRandom, this.maxOffset)
    }

    get newRandom (): number {
        return this.firstId.tuples[0].random
    }

    renameId (id: Identifier): Identifier {
        const replicaNumber = id.replicaNumber
        const clock = id.clock
        const offset = id.lastOffset

        const firstId = this.renamedIds[0]
        const lastId = this.renamedIds[this.renamedIds.length - 1]

        if (id.compareTo(firstId) === Ordering.Less || lastId.compareTo(id) === Ordering.Less) {
            return id
        }

        if (this.map.has(replicaNumber)) {
            const clockMap = this.map.get(replicaNumber) as Map<number, Map<number, number>>
            if (clockMap.has(clock)) {
                const offsetMap = clockMap.get(clock) as Map<number, number>
                if (offsetMap.has(offset)) {
                    const newOffset = offsetMap.get(offset) as number
                    return createAtPosition(this.replicaNumber, this.clock, this.newRandom, newOffset)
                }
            }
        }

        // The submitted id was not part of the renaming, need to compute a new one
        const compareIds = (a: Identifier, b: Identifier) => a.compareTo(b)
        const predecessorId: Identifier = findPredecessor(this.renamedIds, id, compareIds) as Identifier
        const newPredecessorId = this.renameId(predecessorId)

        return newPredecessorId.concat(id)
    }

    reverseRenameId (id: Identifier): Identifier {
        if (this.hasBeenRenamed(id)) {
            // id ∈ renamedIds
            return this.newOffsetToOldIdMap.get(id.lastOffset) as Identifier
        }

        if (id.compareTo(this.firstId) === Ordering.Less || this.lastId.compareTo(id) === Ordering.Less) {
            // id < firstId < newFirstId || newLastId < lastId < id
            return id
        }

        if (this.newLastId.compareTo(id) === Ordering.Less && id.compareTo(this.lastId) === Ordering.Less) {
            // newLastId < id < lastId < lastId + id
            return this.lastId.concat(id)
        }

        // newFirstId < id < newLastId
        const [head, tail] = id.truncate(1)
        const predecessorId = this.newOffsetToOldIdMap.get(head.lastOffset) as Identifier
        const successorId = this.newOffsetToOldIdMap.get(head.lastOffset + 1) as Identifier

        if (tail.compareTo(predecessorId) === Ordering.Less) {
            // tail < predecessorId < predecessorId + tail < successorId
            return predecessorId.concat(tail)
        }
        if (successorId.compareTo(tail) === Ordering.Less) {
            // predecessorId < closestPredecessorOfSuccessorId + tail < successorId < tail
            const closestPredecessorOfSuccessorId: Identifier =
                Identifier.fromBase(successorId, successorId.lastOffset - 1)
            return closestPredecessorOfSuccessorId.concat(tail)

        }
        // predecessorId < tail < successorId
        return tail

    }

    hasBeenRenamed (id: Identifier): boolean {
        return id.equalsBase(this.newFirstId)
            && 0 <= id.lastOffset && id.lastOffset <= this.maxOffset
    }
}
