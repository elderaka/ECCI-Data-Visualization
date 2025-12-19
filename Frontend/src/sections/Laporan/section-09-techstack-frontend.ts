import type { LaporanSection } from './types';

export const laporanSection09: LaporanSection = {
  id: 'laporan-09',
  title: 'Frontend Technologies',
  justify: 'center',
  align: 'center',
  content: [
    {
      type: 'card-grid',
      cards: [
        {
          image: '/images/Vitejs-logo.png',
          title: 'Vite',
          description: 'Build tool modern dengan Hot Module Replacement untuk development yang cepat'
        },
        {
          image: '/images/Typescript_logo_2020.svg.png',
          title: 'TypeScript',
          description: 'Type safety untuk data geospasial kompleks dan error prevention'
        },
        {
          image: '/images/MapLibre Logotype Final.png',
          title: 'MapLibre GL JS',
          description: 'Library rendering peta berbasis WebGL untuk visualisasi 60 FPS'
        },
        {
          image: '/images/Logo_D3.svg.png',
          title: 'D3.js',
          description: 'Library visualisasi data untuk charts dan interactive graphics'
        }
      ]
    }
  ],
  mapOpacity: 0.8,
};
