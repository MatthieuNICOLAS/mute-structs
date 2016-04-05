# MUTE-structs

MUTE-structs is a Node.js module that provides an implementation of the
LogootSplit CRDT algorithm [[André et al., 2013]](#ref-1). It is an optimistic replication
algorithm that ensures eventual consistency on replicated text sequences.
It is used in a *real-time collaborative text editor* based on CRDT named MUTE.,


#### References

[André et al., 2013]<a id="ref-1"> Luc André, Stéphane Martin, Gérald Oster et Claudia-Lavinia Ignat. **Supporting Adaptable Granularity of Changes for Massive-scale Collaborative Editing**. In *Proceedings of the international conference on collaborative computing: networking, applications and worksharing - CollaborateCom 2013*. IEEE Computer Society, Austin, Texas, USA, october 2013, pages 50–59. doi: [10.4108/icst.collaboratecom.2013.254123](https://dx.doi.org/10.4108/icst.collaboratecom.2013.254123). url: https://hal.inria.fr/hal-00903813/.


## Installation

```
npm install mute-structs
```

## See also

* [**mute-demo**](https://github.com/coast-team/mute-demo)
* [**mute-client**](https://github.com/coast-team/mute-client)
* [**mute-server**](https://github.com/coast-team/mute-server)

## License

**mute-structs** is licensed under the GNU General Public License 3.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <http://www.gnu.org/licenses/>.

The documentation, tutorial and source code are intended as a community
resource and you can basically use, copy and improve them however you want.
Included works are subject to their respective licenses.
