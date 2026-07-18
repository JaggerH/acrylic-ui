## ADDED Requirements

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
