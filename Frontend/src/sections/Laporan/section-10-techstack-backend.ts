import type { LaporanSection } from "./types";

export const laporanSection10: LaporanSection = {
  id: "laporan-10",
  title: "Backend Technologies",
  align: "center",
  justify: "center",
  content: [
    {
      type: "card-grid",
      cards: [
        {
          image: "/images/Node.js_logo.svg.png",
          title: "Node.js + Express",
          description:
            "Server JavaScript untuk API dan tile serving dengan non-blocking I/O",
        },
        {
          image: "/images/Postgresql_elephant.svg.png",
          title: "PostgreSQL 15",
          description:
            "Database relational dengan JSONB support dan table partitioning",
        },
        {
          image: "/images/postgis-logo_trans.png",
          title: "PostGIS 3.4",
          description:
            "Extension spatial database untuk geometry types dan spatial indexing",
        },
        {
          image: "/images/PMTiles.jpg",
          title: "PMTiles",
          description:
            "Format vector tile cloud-optimized dengan HTTP Range request untuk serving tiles",
        },
        {
          image: "/images/timescaledb.webp",
          title: "TimescaleDB",
          description:
            "Time-series database extension untuk PostgreSQL, optimized untuk data temporal 2025-2050",
        },
      ],
    },
  ],
  mapOpacity: 0.8,
};
