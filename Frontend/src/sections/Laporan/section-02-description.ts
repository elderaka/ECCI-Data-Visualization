import type { LaporanSection } from "./types";

export const laporanSection02: LaporanSection = {
  id: "laporan-02",
  title: "Deskripsi Proyek",
  align: "start",
  justify: "center",
  content: [
    {
      type: "text",
      body: "Proyek ini bertujuan untuk memvisualisasikan data proyeksi krisis perumahan di Inggris hingga tahun 2050. Kami menggunakan data spasial yang mencakup berbagai tingkat geografis (Nations, Local Authorities, dan Small Areas) dengan proyeksi 26 tahun ke depan (2025-2050).",
    },
    {
      type: "text",
      subheading: "Tools yang Digunakan",
      body: "MapLibre GL JS, PMTiles, PostgreSQL dengan PostGIS, TimescaleDB, TypeScript, dan Vite untuk membangun platform visualisasi interaktif yang responsif dan scalable.",
    },
  ],
  mapOpacity: 0.7,
};
