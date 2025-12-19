import type { LaporanSection } from './types';

export const laporanSection16: LaporanSection = {
  id: 'laporan-16',
  title: 'Terima Kasih',
  align: 'center',
    justify: 'center',
  content: [
    {
      type: 'text',
      body: 'Atas perhatian dan waktunya untuk mendengarkan presentasi progress visualisasi data kami.'
    },
  ],
  cameraPosition: {
    center: [-3.5, 54.5],
    zoom: 5.5,
    pitch: 60,
    bearing: 360,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.6,
};
