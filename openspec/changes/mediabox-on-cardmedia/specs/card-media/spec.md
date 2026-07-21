## ADDED Requirements

### Requirement: CardMedia frames media at a locked aspect ratio

`CardMedia` SHALL render a `relative overflow-hidden` frame whose aspect ratio is set by
its `ratio` prop (CSS `aspect-ratio`, e.g. `"16 / 9"`). An explicit `style.aspectRatio`
supplied by the caller SHALL take precedence over `ratio`. A direct `<img>` child SHALL be
sized to fill and crop the frame (`object-cover`).

#### Scenario: Ratio locks the frame shape
- **WHEN** `CardMedia` is given `ratio="2 / 3"`
- **THEN** the frame element renders with `aspect-ratio: 2 / 3`

#### Scenario: Explicit style aspect-ratio wins
- **WHEN** both `ratio="16 / 9"` and `style={{ aspectRatio: "1 / 1" }}` are passed
- **THEN** the frame renders with `aspect-ratio: 1 / 1`

### Requirement: CardMedia owns a cover image with retry-on-error

When given `src`, `CardMedia` SHALL render and own an `object-cover` `<img>`. On a load
error it SHALL retry with exponential backoff (`retryDelayMs × 2 ** attempt`, default base
`800`ms) up to `maxRetries` attempts (default `2`), remounting the image each attempt. A
successful load SHALL reset the attempt counter. After the retries are exhausted it SHALL
show `fallback` (default an `ImageOff` glyph). A new `src` SHALL reset the retry state.

#### Scenario: Transient failure recovers within the retry budget
- **WHEN** the image fails once and then the retried request succeeds
- **THEN** the recovered image is shown and no fallback is rendered

#### Scenario: Persistent failure shows the fallback
- **WHEN** the image fails more than `maxRetries` times
- **THEN** the `fallback` placeholder is shown in place of the image

#### Scenario: Missing src with a fallback shows the placeholder immediately
- **WHEN** `src` is absent but a `fallback` is provided
- **THEN** the fallback placeholder is shown without any load attempt

### Requirement: CardMedia reports the loaded image's natural size

`CardMedia` SHALL invoke an optional `onNaturalSize(width, height)` callback with the
loaded image's intrinsic pixel dimensions when its owned image finishes loading, so a
consumer can drive layout from the media's natural aspect.

#### Scenario: Natural size is reported on load
- **WHEN** the owned image loads with intrinsic size 1280×720
- **THEN** `onNaturalSize` is called with `1280, 720`

### Requirement: CardMediaOverlay retypes captions for on-media contrast

`CardMediaOverlay` SHALL render a bottom scrim inside `CardMedia` and SHALL restyle nested
`CardTitle` / `CardDescription` for legibility over media: white / white-70 text, stepped
down to the caption scale (title 13px, description 12px), left-aligned and truncated.

#### Scenario: Caption reads as on-media text
- **WHEN** a `CardTitle` and `CardDescription` are nested in `CardMediaOverlay`
- **THEN** the title renders at 13px white and the description at 12px white-70, both left-aligned and single-line truncated

## ADDED Requirements

### Requirement: MediaBox frames media at its natural ratio with no letterbox

`MediaBox` SHALL determine the media's natural aspect ratio and render a `CardMedia` whose
`ratio` equals that natural ratio, so the media fills the frame with neither crop nor
letterbox. `MediaBox` SHALL NOT letterbox media against a mismatched fixed box.

#### Scenario: Wide image fills without bars
- **WHEN** a 16:9 image is shown in `MediaBox`
- **THEN** the frame ratio is 16:9 and no black letterbox bars are visible

#### Scenario: Portrait image fills without bars
- **WHEN** a 2:3 image is shown in `MediaBox`
- **THEN** the frame ratio is 2:3 and no black letterbox bars are visible

### Requirement: MediaBox delegates image loading and retry to CardMedia

For `kind="image"`, `MediaBox` SHALL pass `src` to `CardMedia` and rely on CardMedia's
retry-on-error and fallback. `MediaBox` SHALL NOT carry its own image retry state machine.

#### Scenario: Image retry is inherited
- **WHEN** an image in `MediaBox` fails transiently and later loads
- **THEN** the recovery is handled by CardMedia's retry with no MediaBox-local retry code involved

### Requirement: MediaBox resizes when the inner media changes

`MediaBox` SHALL measure the media's natural dimensions — from `naturalWidth`/`naturalHeight`
or `mediaSize` props when supplied, otherwise from the loaded media — and SHALL recompute
the frame ratio and width when the media source changes.

#### Scenario: Swapping media updates the frame
- **WHEN** `src` changes from a 16:9 image to a 2:3 image
- **THEN** the frame ratio updates from 16:9 to 2:3

### Requirement: MediaBox bounds width by minWidth, maxWidth, and maxHeight

`MediaBox` SHALL compute frame width as `clamp(minWidth, min(containerWidth, maxWidth,
maxHeight × ratio))` and height as `width / ratio`. When `minWidth` and `maxHeight`
conflict, `minWidth` SHALL win (the frame MAY exceed `maxHeight`).

#### Scenario: Max height caps a wide frame's width
- **WHEN** a wide image's width at container size would exceed `maxHeight × ratio`
- **THEN** width is reduced so height equals `maxHeight`

#### Scenario: Min width overrides max height on a tall portrait
- **WHEN** satisfying `minWidth` forces `height > maxHeight` for a portrait image
- **THEN** the frame keeps `minWidth` and its height exceeds `maxHeight`

### Requirement: MediaBox frames video through CardMedia at its natural ratio

For `kind="video"`, `MediaBox` SHALL render the `<video>` as a child of `CardMedia` (frame
+ rounding only, no `src` image) and SHALL size the frame to the video's natural ratio
bounded only by `maxHeight`. The old wide-video 16:9 forcing and portrait-video height cap
SHALL NOT apply.

#### Scenario: Video uses its natural ratio
- **WHEN** a 4:3 video is shown in `MediaBox`
- **THEN** the frame ratio is 4:3 (not forced to 16:9)
