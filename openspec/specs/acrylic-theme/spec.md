## ADDED Requirements

### Requirement: Region-scoped appearance classes

The theme system SHALL expose `light`, `dark`, and `acrylic` as class selectors that each define the full design-token block, and these classes SHALL be applicable to any element (not only `:root`). A region carrying a theme class SHALL re-scope the design tokens for its own subtree, so descendant components render in that region's appearance without per-component changes.

#### Scenario: Global theme on the document root
- **WHEN** the `html` element carries `light`, `dark`, or `acrylic`
- **THEN** the whole document resolves that theme's tokens, and components render in that appearance

#### Scenario: A region overrides the global theme
- **WHEN** an element inside the page carries a theme class different from the document root's
- **THEN** that element's subtree resolves the region's tokens, and the rest of the page is unaffected

#### Scenario: Composed sidebar + main
- **WHEN** the sidebar region carries `acrylic` and the main region carries `light`, `dark`, or `acrylic`
- **THEN** the sidebar renders as dark frosted glass and the main renders in its own appearance, independently and simultaneously

### Requirement: Acrylic is a dark-based frosted appearance

The `acrylic` appearance SHALL use the dark foreground token set (white-on-dark text) and dark, translucent/frosted surfaces. Frosted surfaces under `acrylic` (panels, cards, dialogs, popovers, inputs, sidebar) SHALL present white text by default.

#### Scenario: Text on an acrylic surface
- **WHEN** any text-bearing component renders inside an `acrylic` region
- **THEN** its foreground resolves to the white-on-dark token set, readable against the dark frosted surface

#### Scenario: Surface material under acrylic
- **WHEN** a frosted surface (e.g. Card, Dialog, Sidebar) renders inside an `acrylic` region
- **THEN** it presents as a dark translucent material, not a light one

### Requirement: Backdrop base layer with region opacity

The system SHALL provide a `Backdrop` primitive mounted once at the application root that renders a full-bleed base layer behind the app. Acrylic regions SHALL be translucent so the Backdrop shows through them; `light`/`dark` regions SHALL be opaque and cover it. When the host window has applied native vibrancy (a `vibrancy` marker on the root), the Backdrop SHALL be transparent so the native OS material shows instead.

#### Scenario: Acrylic region over the backdrop
- **WHEN** an `acrylic` region is painted above the mounted Backdrop on the web
- **THEN** the Backdrop is visible (blurred) through the region's translucent surface

#### Scenario: Opaque region hides the backdrop
- **WHEN** a `light` or `dark` region is painted above the Backdrop
- **THEN** the region is opaque and the Backdrop is not visible through it

#### Scenario: No acrylic region present
- **WHEN** a page mounts the Backdrop but contains no `acrylic` region
- **THEN** the Backdrop is fully covered by opaque regions and has no visible effect

#### Scenario: Native vibrancy host
- **WHEN** the root carries the `vibrancy` marker
- **THEN** the Backdrop is transparent and the native OS material shows through the acrylic regions

### Requirement: No standalone content concept

The main content area SHALL be an ordinary themed region — it MUST NOT require a dedicated content component, content material token, or content utility class. Removing the previous `content` mechanism (the `--acr-content` token, the `.acr-content` utility, the inset content-frost, and the docs `#nd-page` rule) SHALL NOT remove the ability to render a frosted main panel, because an `acrylic` region over the Backdrop already produces it.

#### Scenario: Frosted main panel without a content primitive
- **WHEN** the main region carries `acrylic` and sits over the mounted Backdrop
- **THEN** it renders as a dark frosted main panel using only the region's theme tokens, with no content-specific token, utility, or component

#### Scenario: Plain main panel
- **WHEN** the main region carries `light` or `dark`
- **THEN** it renders as an opaque content surface in that appearance, beside an `acrylic` sidebar if present

### Requirement: Size-specific typography tracking and leading tokens

The macOS type-scale tokens (`--text-*`) SHALL each carry a companion tracking (letter-spacing) token and a companion leading (line-height) token, so tracking and leading vary with size instead of a single fixed value applied across all sizes. Large display sizes SHALL use negative tracking and tight leading; body sizes SHALL use near-zero tracking and comfortable leading. The companions SHALL be usable independently so a component can pair a size with its matching tracking and leading.

#### Scenario: Display text tightens as it grows
- **WHEN** a component styles large-title text using the large-title size token and its companion tracking/leading tokens
- **THEN** it renders with negative letter-spacing and tight line-height appropriate to that size

#### Scenario: Body text stays comfortable
- **WHEN** a component styles body text using the body size token and its companion tracking/leading tokens
- **THEN** it renders with near-zero letter-spacing and a comfortable line-height

#### Scenario: Tracking is no longer size-independent
- **WHEN** two different type sizes are rendered with their respective companion tokens
- **THEN** their tracking values differ, so no single fixed letter-spacing is imposed across sizes
