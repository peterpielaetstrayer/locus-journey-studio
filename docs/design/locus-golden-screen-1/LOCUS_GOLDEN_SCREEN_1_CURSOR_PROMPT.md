# LOCUS Golden Screen 1 — Enter the Landscape
## Surgical Cursor Implementation Prompt

You are the lead interaction engineer implementing one approved north-star screen inside the existing LOCUS Journey Studio codebase.

This is **not** another broad redesign sprint.

Your task is to make the public root route, `/`, faithfully express the approved **Enter the Landscape** visual direction while preserving the working LOCUS architecture.

---

# 1. Visual references

Read and inspect these reference images before editing:

```text
references/enter-landscape-primary-reference.png
references/enter-landscape-responsive-spec-reference.png
references/enter-landscape-implementation-board-reference.png
```

Reference priority:

1. `enter-landscape-primary-reference.png`
   - primary mood, hierarchy, atmosphere, typography, route thread, CTA placement;
2. `enter-landscape-responsive-spec-reference.png`
   - responsive behavior, component intention, motion, accessibility, palette;
3. `enter-landscape-implementation-board-reference.png`
   - secondary implementation notes only.

Do **not** ship any full mockup image as the page background.

The references are composition benchmarks. The actual interface must remain real HTML, CSS, React, accessible controls, and responsive media.

Do not invent fake dynamic information simply because it appears in a concept board. Do not add unverified weather, tide, coordinates, elevation, or condition data. Use only existing canonical project data unless a value is explicitly marked as prototype copy.

---

# 2. Current implementation

The current production implementation already uses:

```text
src/app/page.tsx
src/components/learner/EnvironmentalScene.tsx
src/data/first-landing-media.ts
src/components/learner/StudioDrawer.tsx
src/components/shared/AppChrome.tsx
src/components/shared/PrototypeBanner.tsx
src/app/globals.css
```

Known behavior to preserve:

- `/` is the public learner entrance;
- `/learner` begins the journey;
- `EnvironmentalScene` uses `next/image`;
- `getMedia("entrance")` provides the media record;
- the current development asset is:
  `public/images/first-landing/entrance.svg`;
- the intended production asset is:
  `public/images/first-landing/entrance.webp`;
- `AppChrome` keeps Studio access available;
- `PrototypeBanner compact` preserves the prototype disclosure;
- reduced-motion support already exists;
- Creator, Orchestrator, Reviewer, authentication, repositories, Supabase, learner state, and all other routes must remain unchanged.

The current root screen is structurally correct but visually under-authored. It uses a conventional content column and generic shared button. This pass should transform that one screen.

---

# 3. Branch and baseline

Start from the latest `main`.

```bash
git checkout main
git pull origin main
git checkout -b feature/golden-screen-enter-landscape
```

Before editing, run:

```bash
npm ci
npm run test
npm run typecheck
npm run lint
npm run build
```

Record the baseline result.

Do not modify database migrations, RLS, Supabase repository interfaces, authentication behavior, learner progression, or other product modes.

---

# 4. Experience objective

The learner should not feel that they opened an education application.

They should feel that they arrived at a real place whose hidden structure is beginning to reveal itself.

The screen must communicate:

```text
World first
→ mystery
→ invitation
→ action
```

Emotional target:

> Something is here that I have not learned to see yet.

The page should feel:

- cinematic;
- spatial;
- quiet;
- intelligent;
- field-rigorous;
- editorial;
- mature;
- mysterious without becoming theatrical;
- premium without becoming glossy SaaS.

---

# 5. Required content

Use this content hierarchy.

## Small brand label

```text
LOCUS / FIELD JOURNEY
```

## Place

```text
FIRST LANDING
```

Use the existing media location data. It may render as `First Landing` in accessible sentence case while the visual label uses restrained uppercase.

## Time

```text
7:18 AM
```

Use the existing media time data.

## Primary statement

```text
The water looks still.
It isn’t.
```

## Supporting sentence

Preferred copy:

```text
A place-based learning journey through the hidden work of water.
You’ll uncover it through evidence.
```

Keep the supporting copy to two short lines at desktop width. Do not add a feature explanation.

## Primary action

```text
Enter the landscape
```

Destination:

```text
/learner
```

## Studio access

Keep `StudioDrawer` accessible in the upper-right area. It must remain clearly secondary to the learner action.

## Prototype disclosure

Preserve the existing legally and ethically important prototype disclosure:

```text
Field-Test Draft · Prototype · Simulated AI
```

It may be visually refined and integrated into the top rail, but must not be removed, hidden, or made unreadable.

---

# 6. Desktop composition

Target breakpoint:

```text
1440px and wider
```

The page should use the full viewport.

## Background

- Use `EnvironmentalScene`.
- Use `next/image`.
- Use the production path `entrance.webp` when that asset exists.
- Keep the SVG and gradient fallback working.
- Use `priority`.
- Optimize for LCP.
- Use a responsive crop that preserves the cypress trunks, mist, water reflection, and open middle distance.
- The image should remain the largest and most important element.
- Apply a dark editorial grade through CSS overlays rather than baking all darkness into the asset.

## Layering

Build multiple restrained layers:

1. environmental image;
2. subtle atmospheric wash;
3. bottom-to-top legibility gradient;
4. very light side vignette;
5. interface and typography;
6. route thread.

Avoid a single heavy black overlay that flattens the image.

## Left editorial region

Position the place and headline in the lower-left region, with substantial breathing room.

Suggested visual zones:

```text
top-left:
LOCUS / FIELD JOURNEY

mid-to-lower-left:
FIRST LANDING
7:18 AM

lower-left:
The water looks still.
It isn’t.

supporting copy
```

Do not center the headline.

Do not put the content inside a rounded card.

## Right-side route thread

Introduce a subtle route path that begins low and moves upward through the landscape.

It should include:

- a thin amber or parchment line;
- a few restrained nodes;
- one or two tiny labels such as:
  `LOOK CLOSER`
  `FIND EVIDENCE`;
- partial visibility, suggesting that most of the journey remains undiscovered.

This is not navigation yet. It is an atmospheric preview of LOCUS’s route language.

Implement it as accessible decorative SVG with:

```tsx
aria-hidden="true"
```

Do not introduce a mapping dependency.

## CTA region

Place the primary action in the lower-right region on wide screens.

The reference uses a broad expedition-style action, not a generic rounded pill.

Required qualities:

- rectangular or subtly squared geometry;
- fine top and bottom rules or restrained border;
- warm parchment/amber text or surface;
- directional arrow;
- large enough to feel consequential;
- strong visible keyboard focus;
- minimum 44px interaction height;
- no bounce;
- no glow-heavy sci-fi effect.

Do not reuse the current shared Button unchanged if it visually reads as generic SaaS. Either:

1. add a clearly named `expedition` variant to the shared Button while preserving all existing variants; or
2. create a focused `EnterLandscapeAction` component.

Do not globally restyle every button in the app.

---

# 7. Mobile composition

Target first-class width:

```text
375–430px
```

Do not merely stack the desktop layout.

Required mobile behavior:

- full dynamic viewport height;
- background crop focused on wetland depth and cypress silhouette;
- brand label top-left;
- Studio access top-right;
- location and time near the top;
- headline in the lower-middle region;
- supporting copy below it;
- full-width or nearly full-width CTA within thumb reach;
- optional small route-progress trace near the bottom;
- no tiny interface labels;
- no content hidden behind browser chrome;
- test at short and tall mobile viewport heights.

The page must remain compelling in portrait orientation.

At mobile width, omit route labels that become decorative noise. Keep only a subtle trace or node.

---

# 8. Typography

Use the fonts already configured:

```text
Geist
Source Serif 4
```

Do not add another font dependency in this pass.

## Serif

Use Source Serif 4 for:

- the primary statement;
- carefully chosen emotional copy only.

## Sans

Use Geist for:

- brand label;
- place;
- time;
- Studio control;
- prototype disclosure;
- CTA label;
- metadata.

## Headline requirements

- responsive `clamp()` sizing;
- editorial line breaks;
- high contrast over image;
- no excessive shadow;
- avoid oversized marketing-landing-page scale;
- maintain readable line length;
- retain the exact two-part rhythm:
  `The water looks still.` / `It isn’t.`

The desired effect is literary and spatial, not promotional.

---

# 9. Motion

Motion must reveal, not decorate.

Approved entry sequence:

1. background is present immediately;
2. brand and place metadata fade in;
3. headline resolves in two restrained beats;
4. route thread draws slowly;
5. CTA becomes fully visible last.

Motion guidance:

```text
metadata: 350–500ms
headline beats: 500–800ms
route draw: 1200–1800ms
CTA settle: 500–700ms
```

Use CSS where practical. Do not add Framer Motion solely for this screen unless already installed and clearly justified.

No:

- bouncing;
- overshoot;
- parallax tied aggressively to pointer movement;
- constant animation;
- autoplay audio;
- loading spectacle.

Respect:

```css
prefers-reduced-motion: reduce
```

In reduced-motion mode:

- render all content immediately;
- disable route drawing animation;
- disable image scaling or drift;
- preserve full functionality.

---

# 10. Environmental media requirements

The current registry is correctly structured around:

```ts
src
productionSrc
alt
focal
fallbackGradient
location
time
```

Preserve that architecture.

## Asset handling

Expected final runtime asset:

```text
public/images/first-landing/entrance.webp
```

Do not use the full UI reference PNG as the runtime image.

If `entrance.webp` is not present:

- keep the current local SVG fallback;
- implement the complete responsive composition;
- report that final image parity remains blocked by the missing production environmental asset;
- do not claim pixel-level visual completion.

Use the visual references to determine focal point and crop behavior.

Update focal metadata only if needed after testing the actual production asset.

---

# 11. Component changes

Prefer a small, clear component structure.

Recommended:

```text
src/components/learner/EnterLandscapeScreen.tsx
src/components/learner/RouteThreadPreview.tsx
src/components/learner/EnterLandscapeAction.tsx
```

`src/app/page.tsx` should become a thin composition entry point.

Possible structure:

```tsx
export default function PublicEntrancePage() {
  const media = getMedia("entrance");
  return <EnterLandscapeScreen media={media} />;
}
```

Do not over-abstract.

Every new component must exist because it carries an approved LOCUS experience behavior.

## EnvironmentalScene

Extend `EnvironmentalScene` only when the capability is reusable and clean.

Possible justified extensions:

- overlay-strength variant;
- side vignette;
- `contentClassName`;
- more precise content alignment;
- optional atmospheric layer;
- child slot for decorative route overlay.

Do not break existing learner routes.

---

# 12. CSS and tokens

Use CSS variables and existing Magic Pass tokens.

Refine as needed:

```css
--env-black
--wetland-green
--water-blue
--fog
--field-note-paper
--map-ink
--quiet-amber
```

Add narrowly named tokens only where useful, such as:

```css
--entrance-vignette
--entrance-rule
--route-thread
--entrance-copy-muted
```

Avoid arbitrary one-off color values scattered across JSX.

Create focused classes such as:

```text
.enter-landscape
.enter-landscape__content
.enter-landscape__headline
.enter-landscape__route
.enter-landscape__action
.enter-landscape__vignette
```

Do not turn `globals.css` into an uncontrolled one-screen stylesheet. Use component-level Tailwind classes where clear and global CSS only for complex gradients, keyframes, or shared visual primitives.

---

# 13. Accessibility

Required:

- semantic `h1`;
- meaningful background image alt behavior;
- route preview marked decorative;
- visible keyboard focus;
- Studio drawer keyboard accessible;
- CTA accessible name exactly understandable;
- text contrast meeting WCAG AA over every responsive crop;
- no information communicated only by color;
- no autoplay audio;
- reduced-motion support;
- prototype disclosure available to assistive technology;
- page usable at 200% zoom;
- no focus trap introduced.

Do not remove the existing location stamp unless its semantic content is represented elsewhere.

---

# 14. Performance

Required:

- `next/image`;
- `priority` only for this LCP image;
- correct `sizes`;
- no unnecessary client component conversion;
- minimal JavaScript;
- route SVG inline or componentized without a library;
- no animation package added for a few fades;
- no remote hotlinked image;
- no giant unoptimized PNG used at runtime.

Run a production build and inspect for image/layout warnings.

---

# 15. Explicitly out of scope

Do not modify:

- `/learner`;
- Water Fingerprint;
- Living Atlas;
- Creator;
- Orchestrator;
- Reviewer;
- Supabase;
- migrations;
- RLS;
- auth;
- repositories;
- Zustand learning state;
- journey content;
- adaptive logic;
- database types.

Do not add:

- live weather;
- live tides;
- GPS;
- geolocation permission;
- analytics vendor;
- ambient audio implementation;
- AR;
- live AI;
- a new UI framework;
- a new icon library;
- a new motion dependency;
- a complete logo redesign.

This is one golden-screen implementation.

---

# 16. Required validation

Run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Manual testing:

```text
1440 × 900
1280 × 800
1024 × 768
430 × 932
390 × 844
375 × 667
```

Also test:

- keyboard only;
- reduced motion;
- 200% browser zoom;
- slow network;
- missing image fallback;
- Studio drawer open/close;
- CTA navigation to `/learner`;
- prototype banner visibility.

---

# 17. Visual QA checklist

Do not call the screen complete until all are true:

- The landscape is the dominant visual element.
- The screen does not resemble a conventional SaaS landing page.
- The headline feels editorial rather than promotional.
- The CTA feels like entering an expedition, not submitting a form.
- Studio access remains available but secondary.
- The route thread suggests an undiscovered system.
- No generic card contains the hero copy.
- No large rounded pill dominates the page.
- Mobile feels composed, not stacked.
- The prototype disclosure remains legible.
- The screen works without motion.
- The screen works when the final photograph is absent.
- Existing routes and tests are unchanged.

---

# 18. Completion report

At the end, report:

1. files changed;
2. components created;
3. exact `EnvironmentalScene` changes;
4. desktop composition;
5. mobile composition;
6. route-thread implementation;
7. motion and reduced-motion behavior;
8. accessibility changes;
9. image asset currently used;
10. whether `entrance.webp` exists;
11. remaining parity gaps from the visual reference;
12. test, typecheck, lint, and build results.

Do not claim pixel-perfect completion if the production environmental photograph is missing.

---

# Final product standard

The screen should communicate:

> This is not a course homepage.
> This is the doorway into a place.

Every element must earn its presence.
