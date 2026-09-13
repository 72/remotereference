import type { Transition } from "motion/react";

/**
 * Motion's `duration` + `bounce` spring maps onto SwiftUI's `response` +
 * `dampingFraction`, so these read the same way they do in SwiftUI:
 * bounce ≈ 1 - dampingFraction.
 *
 * Every transition in the playground references a token here. Nothing defines a
 * spring inline — tuning the feel should happen in one place.
 */

export const smooth: Transition = { type: "spring", duration: 0.5, bounce: 0 };
export const snappy: Transition = { type: "spring", duration: 0.35, bounce: 0.15 };
export const bouncy: Transition = { type: "spring", duration: 0.5, bounce: 0.3 };

/** Layout morphs: fast enough to feel connected, no overshoot on large travel. */
export const morph: Transition = { type: "spring", duration: 0.42, bounce: 0.08 };

/** Cross-fades riding alongside a morph. Opacity wants duration, not physics. */
export const fade: Transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };

export const springs = { smooth, snappy, bouncy, morph, fade } as const;

export type SpringToken = keyof typeof springs;
