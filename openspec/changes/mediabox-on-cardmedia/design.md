## Context

`CardMedia` (new, in `card.tsx`) is a ratio-locked `object-cover` frame that owns a
retry-on-error image and a fallback. `MediaBox` (`media-box.tsx`) predates it: it computes
an explicit `width × height` box from the media's natural dimensions and drops an
`object-contain` image into it over a `bg-black` frame — so whenever the box ratio differs
from the media, black letterbox bars show (visible in the docs demos). MediaBox also
carries a retry state machine that is byte-for-byte identical to CardMedia's.

The insight driving this change: **when a frame's aspect ratio equals the media's natural
ratio, `object-cover` and `object-contain` render identically** — the media fills the
frame with no crop and no letterbox. So MediaBox does not need a different sizing
philosophy from CardMedia; it needs to compute the natural ratio and hand it to CardMedia
as `ratio`.

Constraint: `media-box.test.tsx` is WIP in the working tree; its `computeMediaBox` cases
must be updated in lockstep with the math, not around it.

## Goals / Non-Goals

**Goals:**
- One media-image primitive: CardMedia owns the `<img>`, its `object-cover` fill, and the
  retry/fallback. MediaBox stops duplicating any of it.
- MediaBox shows no letterbox: the frame ratio equals the media's natural ratio.
- MediaBox keeps its value-add: measure natural dims, resize the frame when the inner
  media changes, and bound width by `minWidth` / `maxWidth` / `maxHeight`.
- Video keeps working through MediaBox.

**Non-Goals:**
- CardMedia does not learn about video, `maxHeight`, or natural-size math — it stays a
  ratio + cover + retry frame. All measurement/sizing stays in MediaBox.
- No change to `CardMediaOverlay` or the caption anatomy.
- No new external dependency (CardMedia already pulls `lucide-react` for the fallback).

## Decisions

**1. MediaBox composes CardMedia; it does not reuse CardMedia's *sizing*.**
CardMedia is `object-cover` at a fixed `ratio`; MediaBox's whole job is to compute the
right `ratio` (= natural aspect) and `width`, then render `<CardMedia ratio style={{width}}>`.
Alternative considered — extracting only a shared `useImageRetry` hook and leaving two
frames — was rejected: it DRYs the retry but leaves MediaBox's letterbox untouched, which
is the actual complaint. Composing CardMedia fixes both at once.

**2. The natural ratio comes back through a new `CardMedia` callback `onNaturalSize`.**
Chicken-and-egg: MediaBox needs natural dims to set the ratio, but CardMedia owns the
`<img>` that reveals them. CardMedia fires `onNaturalSize(naturalWidth, naturalHeight)`
from its image `onLoad`. MediaBox seeds a provisional ratio from `naturalWidth/naturalHeight`
or `mediaSize` props when supplied; otherwise it renders at a neutral placeholder ratio
until the first `onNaturalSize`, then locks in. Alternative — MediaBox rendering its own
measuring `<img>` — was rejected: it re-duplicates image ownership, the exact thing we're
removing.

**3. Video is passed as `children` to CardMedia; MediaBox measures it.**
CardMedia's retry image is image-only. For `kind="video"`, MediaBox renders
`<CardMedia ratio style={{width}}><video …/></CardMedia>` (no `src`), so CardMedia is pure
frame + rounding. MediaBox reads the video's intrinsic size (`loadedmetadata` /
`videoWidth`/`videoHeight`, or `naturalWidth/Height` / `mediaSize` props) to drive the
ratio. This keeps the video/`[&_video]:rounded-[inherit]` DirectComposition fix that
already lives in the frame.

**4. Sizing simplifies to natural-ratio + a single width clamp.**
`computeMediaBox` becomes: given natural ratio `r`, container width `cw`, and bounds,
`width = clamp(minWidth, min(cw, maxWidth, maxHeight × r))`, `height = width / r`. The old
wide/portrait/video branches collapse. When `minWidth` and `maxHeight` conflict (a tall
portrait whose `minWidth` forces `height > maxHeight`), **`minWidth` wins** — it is a hard
floor by intent; the frame is allowed to exceed `maxHeight` in that case.

**5. Video ratio caps are dropped.** The old "wide video → force 16/9, portrait video →
cap height" special-casing is removed; video uses its natural ratio with `maxHeight` as
the only height bound, identical to the image path. Fewer special cases, and consistent
behavior across `kind`.

## Risks / Trade-offs

- **[Breaking: look + DOM]** Call sites relying on the letterbox/`object-contain`
  appearance or on MediaBox's inner DOM shape change. → It's an intended visual fix;
  documented as BREAKING in the proposal and called out in the change notes. The public
  prop surface stays additive (`minWidth` added; `maxWidth`/`maxHeight`/`kind`/`src`
  unchanged).
- **[Provisional-ratio flash]** Before `onNaturalSize` fires (no dims props supplied), the
  frame uses a placeholder ratio and may reflow once on first load. → Consumers that know
  dims up front pass `naturalWidth/Height` or `mediaSize` and see no reflow; the neutral
  placeholder (e.g. 16/9) keeps the pre-load frame reasonable.
- **[Test coupling with WIP]** `computeMediaBox` and `media-box.test.tsx` are edited while
  the test file is WIP in the tree. → Rewrite the math and its tests together in the same
  task; run `types:check` + the media-box test before shipping.
- **[Registry graph]** `media-box.json` now depends on `card.json`. → Add it to
  `registryDependencies` and rebuild; the transitive install pulls CardMedia + tokens.
