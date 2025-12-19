import type { LaporanSection } from './types';

export const laporanSection08: LaporanSection = {
  id: 'laporan-08',
  title: 'Tech Stack',
  align: "center",
  justify: "center",
  content: [
    {
      type: 'text',
      heading: 'Tech Stack yang Kami Gunakan',
      body: 'Platform visualisasi ini dibangun menggunakan teknologi modern untuk memastikan performa tinggi, skalabilitas, dan user experience yang optimal.'
    }
  ],
  cameraPosition: {
    center: [-5, 55],
    zoom: 8,
    pitch: 0,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.8,
};
