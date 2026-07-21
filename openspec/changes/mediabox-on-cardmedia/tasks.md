## 1. CardMedia — expose natural size

- [x] 1.1 Add optional `onNaturalSize?: (width: number, height: number) => void` to `CardMedia`'s props type in `registry/acrylic/card.tsx`
- [x] 1.2 Fire `onNaturalSize(img.naturalWidth, img.naturalHeight)` from the owned image's `onLoad` (alongside the existing attempt-reset), guarded on finite non-zero dims
- [x] 1.3 Update `card.mdx` API Reference with the `onNaturalSize` prop row

## 2. Sizing math

- [x] 2.1 Rewrite `computeMediaBox` to the natural-ratio model: `width = clamp(minWidth, min(containerWidth, maxWidth, maxHeight × ratio))`, `height = width / ratio`; `minWidth` wins over `maxHeight` on conflict
- [x] 2.2 Remove the wide/portrait/video branch special-cases and the video ratio caps (`MEDIA_BOX_MAX_VIDEO_HEIGHT` forcing, portrait cap) from the sizing path
- [x] 2.3 Update `registry/acrylic/media-box.test.tsx` to the new semantics: natural-ratio fill, the three width bounds, and `minWidth`-over-`maxHeight` conflict

## 3. MediaBox — rebuild on CardMedia

- [x] 3.1 Add `minWidth?: number` to `MediaBoxProps`
- [x] 3.2 Delete MediaBox's duplicate retry state machine (`failed`/`attempt`/`pending`/`handleImageError`/`clearRetryTimer` and their effects)
- [x] 3.3 Track the display ratio from `naturalWidth`/`naturalHeight` or `mediaSize` when supplied, else from `CardMedia`'s `onNaturalSize` (image) / video `loadedmetadata` (video); seed a neutral placeholder ratio before first measure
- [x] 3.4 Render the image case as `<CardMedia ratio={ratio} style={{ width }} src={src} alt fallback … />`, forwarding `onNaturalSize` to update the ratio
- [x] 3.5 Render the video case as `<CardMedia ratio={ratio} style={{ width }}><video …/></CardMedia>` (no `src`), keeping the `[&_video]:rounded-[inherit]` + `translateZ(0)` frame fix; measure video natural size in MediaBox
- [x] 3.6 Keep `onSizingChange` reporting the computed box; keep `maxWidth`/`maxHeight`/`kind` behavior unchanged apart from the sizing model

## 4. Registry

- [x] 4.1 Add `card.json` to `media-box`'s `registryDependencies` in `registry.json` (it now composes CardMedia)
- [x] 4.2 `npm run registry:build`; verify `public/r/media-box.json` embeds the CardMedia-composed source and lists the card dependency

## 5. Docs

- [x] 5.1 Update `content/docs/components/media-box.mdx` copy to describe the letterbox-free, natural-ratio behavior and the `minWidth` bound
- [x] 5.2 Re-verify the MediaBox demos render without black bars (dev site `/docs/components/media-box`)

## 6. Verify

- [x] 6.1 `npm run types:check` clean for `card.tsx` / `media-box.tsx` (pre-existing test-infra errors excepted)
- [x] 6.2 Run the media-box unit tests green
- [x] 6.3 Dev-site regression: `/docs/components/card` (gallery overlay) and `/docs/components/media-box` (no letterbox, retry fallback) look correct

## 7. Downstream — Stream app sync

- [ ] 7.1 Three-way-merge `card.tsx` and `media-box.tsx` into the Stream app's vendored `components/acrylic/` via the acrylic-ui sync method (BASE = pre-change registry content, NEW = rebuilt registry JSON, CURRENT = local patched)
- [ ] 7.2 Refactor Stream `MovieChannel` `PersonCard` to `<CardMedia ratio="2 / 3" src fallback>` + `<CardMediaOverlay>`, dropping the hand-rolled scrim
- [ ] 7.3 `pnpm typecheck` (frontend) + live-verify the cast rail overlay and any MediaBox surfaces render correctly
