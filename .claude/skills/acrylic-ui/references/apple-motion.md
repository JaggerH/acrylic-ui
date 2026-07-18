# Apple Motion — the philosophy behind acrylic's springs

> **Source:** adapted and trimmed from Emil Kowalski's `apple-design` skill
> (github.com/emilkowalski/skills), which distills Apple's WWDC design talks —
> chiefly *Designing Fluid Interfaces* (WWDC 2018). This file is **inherited
> knowledge**: the general "why." Acrylic's concrete conventions (tokens,
> tiering, per-component recipes) live in [rules/motion.md](../rules/motion.md).

The through-line: **an interface feels alive when motion starts from the current
on-screen value, inherits the user's velocity, projects momentum forward, and can
be grabbed and reversed at any instant.** Springs are the tool that makes this
natural — they are inherently interruptible and velocity-aware.

## The principles acrylic builds on

1. **Response — kill latency.** Feedback on pointer-*down*, not release. Update the
   UI 1:1 *during* a drag/slider/drawer, never only when the gesture completes.

2. **Direct manipulation — 1:1 tracking.** A dragged element stays glued to the
   finger and respects the offset from *where it was grabbed*. Use Pointer Events +
   capture so tracking survives leaving the element's bounds.

3. **Interruptibility (the most important one).** Every animation must be grabbable
   and reversible mid-flight. Always animate from the **presentation (live) value**,
   never the logical target — otherwise an interrupt jumps. Avoid CSS transitions /
   `@keyframes` for anything gesture-driven; springs animate from the current value
   and re-target without a velocity "brick wall."

4. **Behavior over animation — springs, not durations.** A fixed-duration animation
   can't respond to new input; a spring just changes target and stays continuous.
   Two designer parameters instead of mass/stiffness/damping:
   - **Damping ratio** — overshoot. `1.0` = critically damped (no bounce, graceful
     settle). `<1.0` overshoots; lower = bouncier.
   - **Response** — how fast it reaches target, in seconds. *Not* a duration — a
     spring has no fixed end; settle time emerges from the parameters.
   - **Default critically damped (`1.0`).** Add bounce (`~0.8`) **only when the
     gesture carried momentum** (a flick, a throw, a drag release). Overshoot on a
     menu that just faded in feels wrong; on a card you flicked it feels right.

   Apple's shipped values: move/reposition `1.0`/`0.4`; rotation `0.8`/`0.4`;
   drawer/sheet `0.8`/`0.3`.

5. **Velocity handoff.** When a gesture ends, the animation continues at the
   finger's exact release velocity — no seam between dragging and animating.

6. **Momentum projection.** Don't snap from the release point; use velocity to
   project the resting position (scroll-deceleration style), then snap to the target
   nearest that projection. A flick throws the element farther than a slow drag.
   `projected = current + (v/1000)·d/(1−d)`, `d ≈ 0.998`.

7. **Spatial consistency.** Enter and exit along the *same* path (a panel in from the
   right dismisses to the right). Anchor popovers/sheets to their trigger origin.

8. **Rubber-banding.** At a boundary, resist progressively instead of stopping hard.

9. **Materials & depth.** Translucent layers (`backdrop-filter`) as a floating
   functional layer. Heavier/darker materials separate structure; lighter ones draw
   attention. Never stack a light translucent surface on another. Dim to focus
   (scrim) for modal tasks; offset without a scrim for parallel panels. Vibrancy
   keeps text legible — higher contrast + slightly heavier weight over glass.

10. **Reduced motion / transparency / contrast.** Reduced motion ≠ no feedback:
    cross-fade instead of slide/spring, drop overshoot. Reduced transparency →
    frostier/solid surfaces. Increased contrast → near-solid + defined border.

11. **Typography.** Tracking is size-specific — tighten large display text (negative),
    body near `0`. Leading tracks size inversely (tight on headings, looser on body).
    Prefer the platform system font (ships optical sizing + tracking tables).

12. **The eight design foundations** (the names to reason with): Purpose, Agency,
    Responsibility, Familiarity, Flexibility, Simplicity (not minimalism), Craft,
    Delight. Craft — every spacing, timing, alignment value is a deliberate choice
    you can defend — is what "the material is the design" cashes out to.

## How this maps to acrylic

Acrylic already implements **§9 materials** (the `--acr-*` token system) and **§11
typography** (the `--text-*` scale + tracking/leading companions). This change adds
**§3–8 motion** as the `--acr-spring-*` tokens and the CSS/JS tiering. See
[rules/motion.md](../rules/motion.md) for the concrete tokens and the Sheet recipe.
