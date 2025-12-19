import type { LaporanSection } from "./types";

export const laporanSection11: LaporanSection = {
  id: "laporan-11",
  title: "PostgreSQL & PostGIS",
  align: "start",
  justify: "center",
  content: [
    {
      type: "text",
      body: "PostgreSQL dengan extension PostGIS menyediakan kemampuan spatial database untuk menyimpan dan query geometri geografis dengan performa tinggi.",
    },
    {
      type: "text",
      body: "Visualisasi: Heatmap air quality pada small areas menunjukkan distribusi kualitas udara di seluruh Inggris.",
    },
  ],
  cameraPosition: {
    center: [-20, 55],
    zoom: 4.5,
    pitch: 0,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  showHeatmap: true,
  heatmapField: "air_quality",
};
