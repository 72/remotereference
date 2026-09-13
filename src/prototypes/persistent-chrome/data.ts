export type Track = {
  id: string;
  title: string;
  artist: string;
  length: string;
  accent: [string, string];
};

export const tracks: Track[] = [
  { id: "t1", title: "Low Tide", artist: "Hana Mori", length: "3:42", accent: ["#0ea5e9", "#4338ca"] },
  { id: "t2", title: "Copper Hour", artist: "Ilse Vance", length: "4:08", accent: ["#f59e0b", "#b45309"] },
  { id: "t3", title: "Glasshouse", artist: "Nils Aker", length: "2:57", accent: ["#14b8a6", "#0f766e"] },
  { id: "t4", title: "Paper Kites", artist: "Sena", length: "5:21", accent: ["#ec4899", "#7e22ce"] },
  { id: "t5", title: "Understory", artist: "Foley Bros", length: "3:15", accent: ["#22c55e", "#15803d"] },
  { id: "t6", title: "Slate", artist: "Marguerite", length: "4:44", accent: ["#64748b", "#1e293b"] },
  { id: "t7", title: "Nightjar", artist: "Okabe", length: "3:03", accent: ["#a78bfa", "#6d28d9"] },
  { id: "t8", title: "Harbour Lights", artist: "Vela Quartet", length: "6:12", accent: ["#38bdf8", "#0369a1"] },
  { id: "t9", title: "Sitka", artist: "Ruth Ellery", length: "3:29", accent: ["#fb7185", "#be123c"] },
  { id: "t10", title: "Ember Room", artist: "Tobias Lune", length: "4:55", accent: ["#fbbf24", "#d97706"] },
];

export const sections = [
  { id: "listen", label: "Listen", title: "Listen Now" },
  { id: "browse", label: "Browse", title: "Browse" },
  { id: "library", label: "Library", title: "Your Library" },
] as const;
