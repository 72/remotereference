import type { PrototypeManifest } from "../../registry";

export const manifest: PrototypeManifest = {
  slug: "persistent-chrome",
  title: "Persistent chrome",
  blurb:
    "Three sections sharing one tab bar and one mini player. Switch tabs — nothing unmounts, scroll is kept, and the player expands in place.",
  objectives: ["2.1 continuity", "2.2 morph", "2.4 interruptible", "2.5 velocity"],
  accent: ["#ec4899", "#7e22ce"],
};
