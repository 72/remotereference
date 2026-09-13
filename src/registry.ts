import type { ComponentType } from "react";

export type PrototypeManifest = {
  slug: string;
  title: string;
  blurb: string;
  /** Which objectives from docs/PLAYGROUND.md §2 this one is meant to prove. */
  objectives: string[];
  accent: [string, string];
};

export type PrototypeEntry = PrototypeManifest & { Screen: ComponentType };

const manifests = import.meta.glob<{ manifest: PrototypeManifest }>(
  "./prototypes/*/manifest.ts",
  { eager: true },
);

const screens = import.meta.glob<{ default: ComponentType }>("./prototypes/*/index.tsx", {
  eager: true,
});

export const prototypes: PrototypeEntry[] = Object.entries(manifests)
  .map(([path, mod]) => {
    const dir = path.slice(0, path.lastIndexOf("/"));
    const screen = screens[`${dir}/index.tsx`];
    if (!screen) throw new Error(`Prototype "${dir}" has a manifest but no index.tsx`);
    return { ...mod.manifest, Screen: screen.default };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export function findPrototype(slug: string | undefined) {
  return prototypes.find((p) => p.slug === slug);
}
