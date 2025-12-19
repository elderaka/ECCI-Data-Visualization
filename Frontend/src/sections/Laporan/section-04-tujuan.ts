import type { LaporanSection } from './types';

export const laporanSection04: LaporanSection = {
  id: 'laporan-04',
  title: 'Tujuan',
  align: "start",
  justify: "center",
  content: [
    {
      type: 'list',
      items: [
        'Memvisualisasikan proyeksi dampak perubahan iklim terhadap perumahan di Inggris (2025-2050)',
        'Menyediakan platform interaktif untuk eksplorasi data spasial multi-level (Nations, Local Authorities, Small Areas)',
        'Mengintegrasikan data time-series dengan visualisasi peta untuk analisis temporal',
        'Membangun sistem yang scalable dan performant untuk menangani 66.4 juta data points',
        'Memfasilitasi pengambilan keputusan berbasis data untuk investasi adaptasi iklim',
        'Mengkomunikasikan co-benefits dari aksi iklim kepada stakeholder lokal'
      ]
    }
  ],
  mapOpacity: 0.7,
};
