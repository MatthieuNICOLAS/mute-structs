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

import {SafeAny} from "safe-any"

import {IdentifierInterval} from "./identifierinterval"
import {isInt32} from "./int32"

export class LogootSBlock {

    static fromPlain (o: SafeAny<LogootSBlock>): LogootSBlock | null {
        if (typeof o === "object" && o !== null) {
            const plainId: SafeAny<IdentifierInterval> = o.idInterval
            const nbElt: SafeAny<number> = o.nbElement
            if (plainId instanceof Object && typeof nbElt === "number" &&
                isInt32(nbElt) && nbElt >= 0) {

                const id = IdentifierInterval.fromPlain(plainId)
                if (id !== null) {
                    return new LogootSBlock(id, nbElt)
                        // FIXME: Always not mine?
                }
            }
        }
        return null
    }

// Access
    idInterval: IdentifierInterval
    nbElement: number

// Creation
    constructor (idInterval: IdentifierInterval, nbElt: number) {
        console.assert(isInt32(nbElt) && nbElt >= 0,
            "nbElt must be a non-negative integer")

        this.idInterval = idInterval
        this.nbElement = nbElt
    }

    isMine (replicaNumber: number): boolean {
        return this.idInterval.idBegin.generator === replicaNumber
    }

    addBlock (pos: number, length: number): void {
        console.assert(isInt32(length) && length > 0, "length must be a positive int32")

        this.nbElement += length
        this.idInterval = this.idInterval.union(pos, pos + length - 1)
    }

    delBlock (nbElt: number): void {
        console.assert(isInt32(nbElt) && nbElt > 0, "nbElt must be a positive int32")

        this.nbElement -= nbElt
    }

    toString (): string {
        return "{" + this.nbElement + "," + this.idInterval.toString() + "}"
    }

}
