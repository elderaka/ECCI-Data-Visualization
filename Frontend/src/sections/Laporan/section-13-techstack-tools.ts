import type { LaporanSection } from './types';

export const laporanSection13: LaporanSection = {
  id: 'laporan-13',
  title: 'Geospatial Tools',
  align: "center",
  justify: "center",
  content: [
    {
      type: 'card-grid',
      cards: [
        {
          title: 'QGIS',
          description: 'Desktop GIS untuk inspeksi data, konversi format, dan reprojection'
        },
        {
          title: 'GDAL/OGR',
          description: 'Command-line tools untuk batch conversion dan optimization'
        },
        {
          title: 'Tippecanoe',
          description: 'Vector tile generator dengan smart simplification dan LOD strategy'
        }
      ]
    },
    {
      type: 'text',
      subheading: 'Workflow',
      body: 'Shapefile -> QGIS (clean & reproject) -> GeoJSON -> Tippecanoe -> PMTiles -> CDN/Static hosting'
    }
  ],
  cameraPosition: {
    center: [-3.5, 54.5],
    zoom: 5.5,
    pitch: 60,
    bearing: 90,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.8,
};
