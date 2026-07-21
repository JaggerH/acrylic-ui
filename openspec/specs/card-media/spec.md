# card-media Specification

## Purpose
TBD - created by archiving change mediabox-on-cardmedia. Update Purpose after archive.
## Requirements
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

