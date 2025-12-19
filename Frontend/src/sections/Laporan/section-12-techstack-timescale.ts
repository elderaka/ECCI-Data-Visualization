import type { LaporanSection } from './types';

export const laporanSection12: LaporanSection = {
  id: 'laporan-12',
  title: 'TimescaleDB',
  align: 'start',
  justify: 'center',
  content: [
    {
      type: 'text',
      body: 'TimescaleDB adalah extension PostgreSQL yang dioptimalkan untuk data time-series, sempurna untuk proyeksi 26 tahun (2025-2050).'
    },
    {
      type: 'text',
      subheading: 'Implementasi',
    },
    {
      type: 'list',
      items: [
        'Hypertables dengan 5-year chunk intervals untuk partisi temporal',
        'Composite indexes (time_year, geography_id) untuk query cepat',
        'Mendukung 13.3 juta records untuk time-series level 2',
        'Query optimization dengan temporal partitioning (25x lebih cepat)'
      ]
    },
    {
      type: 'text',
      subheading: 'Strategi Timeline (TBA)',
      body: 'Visualisasi timeline akan menampilkan animasi perubahan data dari 2025 hingga 2050 dengan smooth transitions. Implementasi slider tahun dan auto-play animation sedang dalam development.'
    }
  ],
  cameraPosition: {
    center: [-0.8123, 51.7187],
    zoom: 9,
    pitch: 45,
    bearing: 30,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.8,
  showHeatmap: false,
};
