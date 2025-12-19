import type { LaporanSection } from './types';

export const laporanSection14: LaporanSection = {
  id: 'laporan-14',
  title: 'Progress Selanjutnya',
  content: [
    {
      type: 'text',
      subheading: 'Naik ke Level 2 dan Level 3',
    },
    {
      type: 'text',
      body: 'Saat ini kami berada di Level 1 dengan data agregat. Rencana pengembangan selanjutnya:'
    },
    {
      type: 'card-grid',
      cards: [
        {
          title: 'Level 2: Annual Data',
          description: '13.3 juta records dengan nilai tahunan 2025-2050. Timeline slider untuk animasi temporal. PMTiles per tahun (26 files x 100MB).'
        },
        {
          title: 'Level 3: Damage Pathways',
          description: '66.4 juta records dengan breakdown per damage pathway. Interactive drill-down untuk analisis detail. Hybrid PMTiles + JSON approach.'
        }
      ]
    },
    {
      type: 'text',
      subheading: 'Fitur Tambahan',
    },
    {
      type: 'list',
      items: [
        'Story mode dengan scroll-based narrative',
        'Interactive charts dan comparisons',
        'Economic ROI calculator untuk decision makers',
        'Export functionality untuk reports'
      ]
    }
  ],
  cameraPosition: {
    center: [-3.5, 54.5],
    zoom: 5.5,
    pitch: 60,
    bearing: 270,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.7,
};
