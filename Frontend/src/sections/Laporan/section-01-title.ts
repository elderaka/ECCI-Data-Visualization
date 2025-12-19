import type { LaporanSection } from './types';

export const laporanSection01: LaporanSection = {
  id: 'laporan-01',
  title: 'Progress Visualisasi Data',
  align: 'center',
  justify: 'center',
  width: '50vw',
  content: [
    {
      type: 'text',
      subheading: 'The 2050 Housing Crisis We Can Prevent',
      body: 'By Kelompok 4'
    },
    {
      type: 'list',
      items: [
        'Lauda Dhia Raka',
        'Falah Akbar',
        'M. Iqbal Rasyid'
      ]
    }
  ],
  cameraPosition: {
    center: [-3.5, 54.5],
    zoom: 6.5,
    pitch: 60,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.7,
};
