export type Place = {
  id: string;
  name: string;
  kind: string;
  distance: string;
  accent: [string, string];
};

export const places: Place[] = [
  { id: "1", name: "Ferry Building", kind: "Market", distance: "0.4 mi", accent: ["#0ea5e9", "#4338ca"] },
  { id: "2", name: "Sightglass", kind: "Coffee", distance: "0.6 mi", accent: ["#f59e0b", "#b45309"] },
  { id: "3", name: "Dolores Park", kind: "Park", distance: "1.1 mi", accent: ["#14b8a6", "#0f766e"] },
  { id: "4", name: "Grand Central", kind: "Bakery", distance: "1.3 mi", accent: ["#ec4899", "#7e22ce"] },
  { id: "5", name: "Presidio Trail", kind: "Trailhead", distance: "2.2 mi", accent: ["#22c55e", "#15803d"] },
  { id: "6", name: "Palace of Fine Arts", kind: "Landmark", distance: "2.6 mi", accent: ["#64748b", "#1e293b"] },
  { id: "7", name: "Tartine Manufactory", kind: "Bakery", distance: "2.9 mi", accent: ["#f97316", "#c2410c"] },
  { id: "8", name: "Ocean Beach", kind: "Beach", distance: "4.8 mi", accent: ["#38bdf8", "#0369a1"] },
  { id: "9", name: "Lands End", kind: "Trailhead", distance: "5.2 mi", accent: ["#34d399", "#047857"] },
  { id: "10", name: "Twin Peaks", kind: "Viewpoint", distance: "3.4 mi", accent: ["#a78bfa", "#6d28d9"] },
  { id: "11", name: "Bernal Heights", kind: "Viewpoint", distance: "3.7 mi", accent: ["#fbbf24", "#d97706"] },
  { id: "12", name: "Swan Oyster Depot", kind: "Seafood", distance: "1.8 mi", accent: ["#60a5fa", "#1d4ed8"] },
  { id: "13", name: "Japanese Tea Garden", kind: "Garden", distance: "4.1 mi", accent: ["#4ade80", "#16a34a"] },
  { id: "14", name: "Coit Tower", kind: "Landmark", distance: "1.5 mi", accent: ["#f87171", "#b91c1c"] },
  { id: "15", name: "Baker Beach", kind: "Beach", distance: "5.6 mi", accent: ["#7dd3fc", "#0284c7"] },
  { id: "16", name: "Alamo Square", kind: "Park", distance: "2.4 mi", accent: ["#86efac", "#15803d"] },
  { id: "17", name: "Fort Point", kind: "Landmark", distance: "4.4 mi", accent: ["#94a3b8", "#334155"] },
  { id: "18", name: "Outerlands", kind: "Cafe", distance: "5.9 mi", accent: ["#fdba74", "#ea580c"] },
  { id: "19", name: "Stow Lake", kind: "Lake", distance: "4.6 mi", accent: ["#2dd4bf", "#0d9488"] },
  { id: "20", name: "Corona Heights", kind: "Viewpoint", distance: "2.8 mi", accent: ["#c084fc", "#7c3aed"] },
];
