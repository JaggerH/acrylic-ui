## ADDED Requirements

### Requirement: Preview / Code tabbed block
Component pages SHALL render examples in a tabbed block exposing a live **Preview** (the rendered example) and a **Code** view (the example's source), authored in MDX by referencing an example by name.

#### Scenario: Viewing an example
- **WHEN** a component page includes an example reference (e.g. `<ComponentPreview name="button-demo" />`)
- **THEN** the Preview tab renders the live example and the Code tab shows that example's source

#### Scenario: Interacting in Preview
- **WHEN** a user interacts with a live example (clicks a button, opens a dialog, toggles theme)
- **THEN** the rendered component responds as the real installed component would

### Requirement: Lazy-loaded example index
Examples SHALL be exposed through a generated index mapping example name → a dynamically imported component and its raw source string, so previews code-split and the Code tab shows real source without hand-duplication.

#### Scenario: Lazy loading
- **WHEN** a component page is opened
- **THEN** only that page's referenced examples are loaded (dynamic import), not every example in the registry

#### Scenario: Index is generated, not hand-edited
- **WHEN** the registry/example set changes and the build runs
- **THEN** the example index is regenerated from the registry as the single source of truth (never hand-maintained)

### Requirement: Registry JSON build and hosting
The same application SHALL build the registry items to JSON (`shadcn build` → `public/r/*.json`) and serve them, so the docs host is also the registry endpoint consumers install from.

#### Scenario: Installing from the docs host
- **WHEN** a consumer configures `@acrylic` to point at `<docs-host>/r/{name}.json` and runs `npx shadcn add @acrylic/button`
- **THEN** the served JSON resolves and installs the component

#### Scenario: Build emits all items
- **WHEN** the registry build runs
- **THEN** every component and example item in `registry.json` produces a corresponding `public/r/<name>.json`
