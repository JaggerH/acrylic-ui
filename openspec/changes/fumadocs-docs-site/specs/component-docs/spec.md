## ADDED Requirements

### Requirement: Per-component routed pages
The docs site SHALL render one routed page per component at a stable path (e.g. `/docs/components/<name>`), so each component is an independently addressable, shareable URL rather than a section of a single scrolling page.

#### Scenario: Navigating to a component page
- **WHEN** a user opens `/docs/components/button`
- **THEN** only the Button page renders (title, description, install command, examples), and the URL reflects the current component

#### Scenario: Direct deep link
- **WHEN** a user loads a component page URL directly or via browser back/forward
- **THEN** the correct component page renders without falling back to a default or 404

### Requirement: Sidebar navigation, alphabetical
The docs site SHALL present a left sidebar listing all component pages ordered alphabetically by component name, with the active page visually highlighted.

#### Scenario: Switching components via sidebar
- **WHEN** a user clicks a component in the sidebar
- **THEN** the app navigates to that component's page and marks it active

#### Scenario: Ordering
- **WHEN** the sidebar lists components
- **THEN** they appear in case-insensitive alphabetical order (e.g. Alert Dialog, AutoTextarea, Button, …)

### Requirement: Table of contents
Each component page SHALL show an "On This Page" table of contents derived from the page's headings, with the current section tracked while scrolling.

#### Scenario: TOC reflects headings
- **WHEN** a component page contains multiple sections (e.g. Installation, Usage, Examples)
- **THEN** the TOC lists those sections and clicking an entry scrolls to it

### Requirement: Dark/light theming
The docs site SHALL support a dark/light theme toggle that flips the Acrylic `--acr-*` token set and the macOS-26 semantic colors, so every component preview re-themes consistently.

#### Scenario: Toggling theme
- **WHEN** a user toggles the theme control
- **THEN** the documented components and the docs chrome switch between the light and dark token sets without reload

### Requirement: Zero-migration authoring flow
Adding a new component to the docs SHALL require only content/registry edits — a component source file, a `registry.json` entry, one MDX page, and one example — with no changes to framework, routing, or build configuration.

#### Scenario: Adding a component
- **WHEN** an author adds a component source file, its `registry.json` item, an MDX page, and an example file
- **THEN** the new component appears in the sidebar and renders its page (with working preview) on the next dev/build, with no edits to app routing or config
