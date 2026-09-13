# Mobile Interaction Playground — Project Brief

A space for prototyping mobile experiences that feel genuinely native to iOS: UI, gestures,
and screen transitions explored at high fidelity, viewable on a real phone via a URL.

---

## 1. Purpose

This is a **prototyping playground**, not a product. It exists to explore interaction ideas —
components, screens, and full experiences — at a level of fidelity where the *feel* can
actually be judged, not just the layout.

Three surfaces:

| Surface | What it holds |
|---|---|
| **Home** | Menu of built experiences, chosen and launched |
| **Prototypes** | Full interactive experiences running inside the app shell |
| **Gallery** | Components in isolation, with live controls to poke at parameters |

It is deliberately laptop-optional: files live in GitHub, Netlify builds every change, and
the result is reviewable on a phone browser from anywhere.

---

## 2. Interaction design objectives

These are the bar. Each is written so it can be tested by feel, with the failure mode named.

### 2.1 Continuity of chrome
Navigation bars and header actions **persist across screen transitions** and change state in
place, rather than unmounting and re-entering. The user stays grounded because the frame
around the content never blinks.

> **Fails when:** chrome fades out and back in, or shifts by a pixel, during navigation.

### 2.2 Shared element morph
An element that exists in two screens travels between them continuously — a card becoming a
detail hero, a thumbnail becoming a full image. The web equivalent of SwiftUI's
`matchedGeometryEffect`.

> **Fails when:** the element crossfades instead of moving, or "jumps" at either end.

### 2.3 Direct manipulation
Anything under a finger tracks that finger **1:1, in the same frame**. Motion is driven by
pointer position, never by a fixed-duration animation kicked off on touch.

> **Fails when:** there is any perceptible lag between finger and element, or the element
> animates *toward* the finger rather than being pinned to it.

### 2.4 Interruptibility
Every animation is grabbable mid-flight. A transition in progress can be caught, reversed,
and thrown back without snapping, restarting, or visibly re-targeting.

> **Fails when:** touching a moving element does nothing until it settles, or it jumps to a
> new position when grabbed.

### 2.5 Velocity handoff
When a finger lifts, the animation **inherits the gesture's exit velocity**. A fast flick and
a slow drag to the same release point produce different, physically sensible outcomes.

> **Fails when:** release always produces the same settle animation regardless of throw speed.

### 2.6 Spring-based, not duration-based
Anything the user initiates is driven by springs. Durations and easing curves are reserved
for non-interactive, system-initiated motion only.

> **Fails when:** user-driven motion has a fixed runtime and can't respond to input state.

### 2.7 Native-grade performance
Sustained frame rate under gesture, including on ProMotion (120Hz) devices. Only
compositor-friendly properties (`transform`, `opacity`) are animated.

> **Fails when:** animating layout properties causes reflow, or frames drop during a drag.

### 2.8 Respect the platform envelope
Safe-area insets, dynamic viewport units, and correct `touch-action` so the browser never
steals a gesture or breaks a layout when the Safari URL bar moves. Installable to the home
screen so it can run fullscreen with no browser chrome.

> **Fails when:** content sits under the notch/home indicator, or the layout jumps as the
> URL bar collapses.

---

## 3. The two mechanisms of continuity

The most important architectural distinction in this project — conflating these is the usual
reason web prototypes feel wrong.

**Persistent chrome.** The nav bar and header actions in apps like Claude, Threads, and
Reddit don't animate *between* screens — they **never unmount at all**. They live above the
router; screen content swaps underneath them while they stay mounted and animate their own
state in place. This is an architecture decision, not a library feature, and it is the larger
half of the continuity feeling.

**Shared element morph.** An element genuinely moving between two positions in the component
tree. This is the direct `matchedGeometryEffect` equivalent, implemented with FLIP-based
layout animation (`layoutId`).

Most web frameworks push toward page-based routing, which unmounts everything on navigation
and makes persistent chrome impossible. This project is architected the other way around.

---

## 4. Stack

| Choice | Role | Why |
|---|---|---|
| **Vite + React + TypeScript** | Foundation | Fast iteration, instant HMR, trivial Netlify builds |
| **Motion (`motion/react`)** | Animation core | `layoutId` FLIP, springs, motion values, drag |
| **`@use-gesture/react`** | Advanced gestures | Pinch, multi-touch, rich kinematics, custom rubber-banding |
| **Tailwind CSS** | Styling | Fast visual iteration without context-switching |
| **React Router** | Routing | With shared chrome mounted *above* the route tree |

`@use-gesture` drives Motion's `useMotionValue`s — gestures produce values, Motion animates
them. Clean separation, no fighting between the two.

### Why Motion over the View Transitions API

The View Transitions API is well supported now (Safari 18+ same-document, 18.2
cross-document, `match-element` in 18.4) and is tempting for screen transitions. It is the
wrong tool here.

VT is **snapshot-based**: it screenshots before/after states and morphs between them. It is
fire-and-forget and **not interruptible mid-gesture**. The moment a user should be able to
grab a transition halfway and throw it back, VT breaks down.

Motion's `layoutId` animates the live DOM with springs that recompute from current position
*and* velocity, so everything stays grabbable. Against objective 2.4, this is decisive.

### Considered and rejected

- **Konsta UI / Framework7 / Ionic** — provide iOS-*looking* components, but they are skinned
  widgets. They deliver the visual layer and almost none of the continuity or gesture
  fidelity, and they constrain exactly where this project needs freedom.
- **React Native Web / Expo** — real native primitives, but heavy, slower to iterate, and a
  poor fit for the Netlify-preview-on-a-phone loop that makes this project work.

---

## 5. Structure

**Registry-driven.** Each prototype is a folder with a small manifest. The home screen and
gallery generate themselves from the registry — adding a prototype means adding a folder,
never wiring up routes by hand.

```
src/
  shell/          Persistent chrome — nav bar, header. Mounted above the router.
  motion/         Spring tokens, shared transition config
  prototypes/
    <name>/
      manifest.ts Title, description, thumbnail
      index.tsx   The experience itself
  gallery/        Components in isolation, with live parameter controls
  registry.ts     Auto-collected manifests
```

**Presentation.** On desktop, prototypes render inside an iPhone-sized device frame with
simulated safe areas, so real proportions are visible while working on a laptop. On an actual
phone, full-bleed.

---

## 6. Motion vocabulary

Motion supports `{ type: "spring", duration, bounce }`, which maps almost 1:1 onto SwiftUI's
`response` / `dampingFraction` model. A shared `springs.ts` defines named tokens matching
SwiftUI's presets, so motion can be designed in familiar vocabulary:

| Token | SwiftUI equivalent | Character |
|---|---|---|
| `smooth` | `.smooth` — bounce 0 | Settles without overshoot |
| `snappy` | `.snappy` — bounce ~0.15 | Quick, slight overshoot |
| `bouncy` | `.bouncy` — bounce ~0.3 | Pronounced, playful overshoot |

All transitions reference these tokens rather than defining springs inline, so the motion
system stays coherent and tunable from one place.

---

## 7. Known constraints

**Haptics are not available.** iOS Safari has never implemented the Vibration API. A
well-known workaround abused the `<input type="checkbox" switch>` element (Safari 17.4+) to
fire the Taptic Engine; **Apple patched that path in iOS 26.5**. Programmatic haptics are
effectively off the table for web prototypes. Every other objective in §2 is reachable — this
one is a hard ceiling and should be factored into what gets prototyped here.

**Native scroll physics can't be beaten.** iOS momentum scrolling is native and better than
anything reimplemented in JS. Use native scroll wherever possible; only take it over when an
interaction genuinely requires it.

**Safari viewport behavior.** The collapsing URL bar makes `100vh` unreliable. Use `dvh`
units and `env(safe-area-inset-*)` throughout, and prefer Add to Home Screen for evaluating
anything where browser chrome would interfere.

---

## 8. Workflow

Laptop-optional by design:

1. A change is made and pushed to a branch
2. A PR is opened against `main`
3. Netlify comments on the PR with a Deploy Preview link and a QR code
4. The preview is reviewed on a phone — scan or tap, no Netlify dashboard needed
5. Merging to `main` publishes to production

Preview URLs follow a predictable pattern: `deploy-preview-<PR#>--72remote.netlify.app`
Production: `72remote.netlify.app`

---

## 9. Roadmap

**First build — playground shell + shared-element list → detail.** A list of cards where
tapping one expands into a full detail screen via `layoutId`, with the nav bar and header
actions persisting and morphing across the transition. This targets objectives 2.1, 2.2, 2.4,
and 2.6 simultaneously, so the fidelity bar is provable from the very first preview.

**Then, in rough order:**
- Draggable bottom sheet with detents — velocity settling, rubber-banding, interruptible drag
  (objectives 2.3, 2.4, 2.5)
- Tab bar with persistent chrome across multiple sections
- Gallery with live spring controls, for tuning motion tokens by feel
- Interruptible swipe-back navigation gesture
