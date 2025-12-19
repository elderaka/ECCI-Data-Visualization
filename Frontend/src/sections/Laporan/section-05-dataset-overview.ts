import type { LaporanSection } from './types';

export const laporanSection05: LaporanSection = {
  id: 'laporan-05',
  title: 'Dataset Overview',
  align: "start",
  justify: "center",
  content: [
    {
      type: 'text',
      body: 'Dataset UK Co-Benefits Atlas mencakup proyeksi dampak transisi net-zero di berbagai tingkat geografis:'
    },
    {
      type: 'animation',
      items: [
        'Nations: 4 negara (England, Scotland, Wales, Northern Ireland)',
        'Local Authorities: 380 otoritas lokal di seluruh Inggris',
        'Small Areas: 46,426 area kecil dengan resolusi tinggi'
      ]
    },
    {
      type: 'text',
      body: 'Total data points: 66.4 juta records mencakup 26 tahun proyeksi (2025-2050), 11 jenis co-benefit, dan 5 damage pathways per benefit.'
    }
  ],
  cameraPosition: {
    center: [-3.5, 54.5],
    zoom: 5.5,
    pitch: 80,
    bearing: 185,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.7,
};
