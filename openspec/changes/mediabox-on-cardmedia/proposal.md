## Why

MediaBox sizes a fixed-ratio box and drops an `object-contain` image into it, so any
image whose aspect differs from the box shows black letterbox bars — visible even in the
docs examples. Meanwhile the new `CardMedia` already frames a ratio box and owns an image
with a retry-on-error strategy that is a byte-for-byte duplicate of MediaBox's. The two
should share one image primitive, and MediaBox's letterbox should go away.

## What Changes

- **`CardMedia` becomes the single media-cover primitive.** It already owns an
  `object-cover` retry image; it gains an `onNaturalSize(width, height)` callback so a
  consumer can learn the loaded image's intrinsic dimensions.
- **MediaBox is rebuilt on top of CardMedia.** Instead of `object-contain` in a fixed
  box, MediaBox measures the media's natural dimensions, computes a **display ratio equal
  to that natural aspect**, and renders `<CardMedia ratio={naturalRatio} style={{ width }}>`.
  Because the frame's ratio matches the media, `object-cover` neither crops nor
  letterboxes — **BREAKING** for anyone depending on the old letterbox/`object-contain`
  look, and on the internal DOM structure.
- **Retry logic is owned solely by CardMedia.** MediaBox's duplicate retry state machine
  is deleted; it inherits retry/fallback from CardMedia for the image case.
- **Video stays in MediaBox.** Video is passed as `children` into CardMedia (frame +
  rounding only); MediaBox still measures video natural size and drives the ratio.
- **MediaBox gains `minWidth`** alongside the existing `maxWidth` / `maxHeight`. Width is
  clamped to `[minWidth, min(containerWidth, maxWidth, maxHeight × ratio)]`; when
  `minWidth` and `maxHeight` conflict (a tall portrait), **`minWidth` wins**.
- **Video ratio caps are dropped.** The old "force 16/9 for wide video / cap portrait
  height" special cases are removed; video uses its natural ratio with `maxHeight` as the
  only height bound — matching the image path.
- `computeMediaBox` is rewritten to the simpler natural-ratio + width-clamp model; its
  unit tests are updated to the new semantics.

## Capabilities

### New Capabilities
- `card-media`: The Card media-cover anatomy and its sizing/retry behavior — `CardMedia`
  (ratio-locked `object-cover` frame that owns a retry-on-error image and reports natural
  size), `CardMediaOverlay` (on-media caption scrim), and MediaBox's natural-ratio,
  min/max-width sizing built on top of them.

### Modified Capabilities
<!-- No existing spec captures Card or MediaBox behavior; all requirements land in the new card-media capability. -->

## Impact

- **Source:** `registry/acrylic/card.tsx` (add `onNaturalSize`), `registry/acrylic/media-box.tsx` (rebuild on CardMedia, add `minWidth`, drop duplicate retry + video caps).
- **Sizing math:** `computeMediaBox` rewritten; `registry/acrylic/media-box.test.tsx` updated (currently WIP in the working tree).
- **Registry:** `registry.json` — `media-box` gains `card.json` in `registryDependencies` (it now composes CardMedia); rebuild `public/r/*.json`.
- **Docs:** `content/docs/components/media-box.mdx` + demos re-shot without letterbox; `card.mdx` documents `onNaturalSize`.
- **Dependents:** the Stream app vendors both files and must re-sync via the acrylic-ui three-way-merge method; MediaBox call sites gain the letterbox-free look for free.
