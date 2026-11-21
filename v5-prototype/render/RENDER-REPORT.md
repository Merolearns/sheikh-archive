# Chunked rendering report

## Contract

`renderChunked({ container, items, renderCard, cap = 1500, chunkSize = 100 })`
takes a mounted list element, an ordered array that stays stable for the life of
the mount, and a callback returning one trusted HTML card per item. The callback
must escape catalog values interpolated into its markup. The renderer replaces
the list contents at mount and inserts a sibling for the controls so they stay
outside the card grid. The returned cleanup function removes that sibling. Call
it before remounting into the same list.

The initial count is the minimum of the item count, chunk size, and cap. Each
activation appends up to one full chunk, so all matches remain reachable past
1,500 cards. The cap accepts nonnegative safe integers. The chunk size accepts
positive safe integers.

The same file runs as a classic script or a side-effect ES module. Both expose
`globalThis.renderChunked`. JavaScript requires a separate module entry point
for a named `export` because classic scripts cannot parse that syntax.

## Harness results

| Check | Observed |
| --- | --- |
| Synthetic entries | 3,977 |
| Initial cards and remaining | 100 shown, 3,877 remaining |
| Default chunk size | 100 |
| Show more activations | 39 |
| Final batch | 77 |
| Final status | All matches shown. 3,977 cards in catalog order, 0 remaining |
| Append-only behavior | Every existing card was compared by node identity before and after each activation. The render callback count also matched the number shown throughout. |
| Small and empty lists | Three cards render immediately. The empty list displays zero counts. Neither has a button. |
| Custom cap | With cap 2 and chunk size 3, the harness recorded 2 initial cards and 5 after one activation. |

`node --check render/chunked-render.js` passed. Node executed the HTML harness
logic in a DOM shim with parse5 parsing card markup. The harness passed with
classic-script and ES-module evaluation. It failed as expected with the
renderer missing and with the initial cap removed.

The DOM check covered button type and tab index, the `aria-controls` target,
polite live counts after every batch, button removal, and modeled focus transfer
to the final status. A native button supplies Enter and Space activation through
its click behavior. Local Chromium builds failed before loading the page due to
sandbox syscall restrictions or a browser policy requirement. Actual keyboard
events and assistive technology announcements remain unverified.

## v4 conventions

v4 starts with 24 cards, appends more as the reader approaches its scroll
sentinel, and pauses at each 1,500-card boundary. This renderer uses a 100-card
first batch by default and a button for every subsequent batch. It omits the
observer, idle scheduling, skeletons, and animation. It uses the existing
`.more-row` and `.btn` classes and accepts the same trusted HTML callback style.
The standalone controls use English text. Prototype integration needs to wire
the button and status strings into the app's locale handling.
