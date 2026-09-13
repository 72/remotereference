export type Record = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  body: string;
  accent: [string, string];
};

export const records: Record[] = [
  {
    id: "aurora",
    title: "Aurora",
    subtitle: "Northern light study",
    meta: "12 frames · 2024",
    accent: ["#0ea5e9", "#4338ca"],
    body: "Long exposures collapse motion into a single frame. The interesting part is not the light itself but the way its edges refuse to resolve — always mid-transition, never settled.",
  },
  {
    id: "dunes",
    title: "Dunes",
    subtitle: "Wind-formed geometry",
    meta: "8 frames · 2023",
    accent: ["#f59e0b", "#b45309"],
    body: "Sand arranges itself into curves that look designed. Every ridge is the record of a force that has already moved on, which makes the whole surface a kind of slow animation.",
  },
  {
    id: "tide",
    title: "Tide",
    subtitle: "Interval series",
    meta: "24 frames · 2024",
    accent: ["#14b8a6", "#0f766e"],
    body: "Photographed at fixed intervals across a single afternoon. Played in sequence the water reads as breathing rather than moving, which was not the intention but is the better result.",
  },
  {
    id: "basalt",
    title: "Basalt",
    subtitle: "Columnar formations",
    meta: "6 frames · 2022",
    accent: ["#64748b", "#1e293b"],
    body: "Cooling lava fractures into hexagons for the same reason foam does — it is the cheapest way to divide a plane. Physics arriving at a grid system without being asked.",
  },
  {
    id: "bloom",
    title: "Bloom",
    subtitle: "Macro sequence",
    meta: "18 frames · 2025",
    accent: ["#ec4899", "#7e22ce"],
    body: "Shot close enough that depth of field becomes the subject. Only a few millimetres are ever in focus, so the eye is forced to move through the image rather than across it.",
  },
];
