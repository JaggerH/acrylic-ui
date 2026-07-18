## ADDED Requirements

### Requirement: Spring motion tokens with dual CSS/JS form

The theme SHALL define a set of spring motion tokens, each derived from a single `(damping, response)` pair and exposed in two forms: a CSS `linear()` easing value usable directly in a `transition`, and the raw `damping` and `response` numbers a JS spring library can consume. The two forms of a given token SHALL describe the same physical spring so that CSS-driven and JS-driven motion match. At minimum the set SHALL include a critically-damped default preset, a drawer/sheet preset, and a momentum/bounce preset.

#### Scenario: CSS transition uses a spring token
- **WHEN** a component sets `transition-timing-function: var(--acr-spring-default)`
- **THEN** the transition eases along the sampled spring curve (no fixed cubic-bezier), producing spring-like motion without any JS runtime

#### Scenario: JS spring reads the same token numbers
- **WHEN** a gesture-driven component animates with the JS spring library using `--acr-spring-drawer`'s damping and response numbers
- **THEN** its motion matches the CSS `linear()` form of the same token within perceptual tolerance

#### Scenario: Presets encode Apple's damping discipline
- **WHEN** a default (non-gesture) UI element animates with the default preset
- **THEN** it is critically damped with no overshoot; and the bounce preset (used only for momentum-carried gestures) overshoots deliberately

### Requirement: Tiered motion substrate

Enter/exit and hover motion on components SHALL use the CSS spring tokens by default and SHALL NOT require a JS animation runtime. A JS spring library SHALL be introduced only as an opt-in registry dependency on components that need gesture physics, and SHALL NOT be a default dependency of the registry or of non-gesture components.

#### Scenario: Non-gesture component stays dependency-free
- **WHEN** a component whose only motion is enter/exit or hover is installed from the registry
- **THEN** installing it adds no JS animation-library dependency, and its motion is driven purely by CSS spring tokens

#### Scenario: Gesture component opts into the JS library
- **WHEN** a gesture-driven component (e.g. Sheet) is installed from the registry
- **THEN** the JS spring library is declared as that component's own dependency, isolated to it

### Requirement: Gesture interaction contract

A gesture-driven component SHALL respond on pointer-down (not on release), track the pointer 1:1 while respecting the grab offset, remain interruptible so an in-flight animation can be grabbed and reversed from its live on-screen value, hand off the pointer's release velocity to the settling animation, and project momentum from release velocity to choose the resting state. At boundaries it SHALL resist progressively (rubber-band) rather than stopping hard.

#### Scenario: Immediate, continuous feedback
- **WHEN** the user presses and drags the component
- **THEN** visual feedback begins on pointer-down and the element tracks the pointer 1:1 throughout the drag, not only at release

#### Scenario: Interruptible in-flight
- **WHEN** the user grabs the element while it is animating
- **THEN** the new motion starts from the element's current on-screen value with no visible jump, and can be reversed

#### Scenario: Velocity handoff and momentum projection
- **WHEN** the user releases mid-drag with velocity
- **THEN** the settling animation continues at the release velocity and snaps to the state nearest the projected endpoint, so a flick can commit a gesture a slow drag would not

#### Scenario: Rubber-band at the boundary
- **WHEN** the user drags past the component's boundary
- **THEN** resistance increases with distance instead of a hard stop

### Requirement: Motion respects accessibility preferences

The theme SHALL bake reduced-motion, reduced-transparency, and increased-contrast handling into the token layer so components inherit it. Under `prefers-reduced-motion: reduce`, spring/slide/parallax motion SHALL degrade to a short opacity cross-fade with overshoot removed while comprehension-aiding opacity/color changes are kept. Under `prefers-reduced-transparency: reduce`, translucent surfaces SHALL become frostier/solid (raised background opacity, blur dropped). Under `prefers-contrast: more`, surfaces SHALL be near-solid with a defined contrasting border. Gesture components SHALL additionally guard their JS motion path on the reduced-motion signal.

#### Scenario: Reduced motion degrades gracefully
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** a component that would spring or slide instead cross-fades with no overshoot, and gesture components skip velocity-driven animation in favor of a direct transition

#### Scenario: Reduced transparency solidifies surfaces
- **WHEN** `prefers-reduced-transparency: reduce` is set
- **THEN** frosted surfaces raise their background opacity and drop `backdrop-filter` blur, remaining legible

#### Scenario: Increased contrast defines edges
- **WHEN** `prefers-contrast: more` is set
- **THEN** surfaces render near-solid with a defined contrasting border

### Requirement: Sheet realizes the motion contract

The Sheet component SHALL be the reference adopter of this capability: it SHALL animate enter and exit with a spring (drawer preset) from the live value along a path symmetric with its entry edge, support 1:1 drag toward its edge with rubber-band resistance past the closed bound, dismiss or spring back on release based on projected momentum with velocity handoff, dim its scrim in proportion to drag progress, and preserve the underlying primitive's focus trap, scroll lock, ESC-to-close, and ARIA semantics.

#### Scenario: Spring enter and exit
- **WHEN** the Sheet opens and later closes
- **THEN** the panel springs in from its edge and exits back along the same edge, interruptibly, not via a fixed keyframe

#### Scenario: Swipe to dismiss
- **WHEN** the user drags the open Sheet toward its edge and releases with enough projected momentum
- **THEN** the Sheet continues at the release velocity and closes; and if the projected momentum is insufficient it springs back open

#### Scenario: Accessibility preserved under gesture
- **WHEN** the Sheet is opened, dragged, and dismissed
- **THEN** focus remains trapped while open and returns to the trigger on close, body scroll stays locked while open, and ESC still closes it
