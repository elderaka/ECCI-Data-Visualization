import type { LaporanSection } from './types';

export const laporanSection03: LaporanSection = {
  id: 'laporan-03',
  title: 'Latar Belakang',
  align: "start",
  justify: "center",
  content: [
    {
      type: 'text',
      body: 'Perubahan iklim memberikan dampak signifikan terhadap kualitas perumahan dan kesehatan masyarakat di Inggris. Proyeksi hingga 2050 menunjukkan peningkatan risiko overheating, penurunan kualitas udara, dan berbagai dampak negatif lainnya.'
    },
    {
      type: 'text',
      body: 'Data co-benefits dari Edinburgh Climate Change Institute menyediakan informasi detail tentang dampak transisi net-zero terhadap 46,426 area kecil di Inggris, mencakup 11 jenis manfaat sosial-ekonomi dan 5 jalur dampak.'
    },
    {
      type: 'text',
      body: 'Visualisasi data spasial-temporal ini membantu pengambil keputusan memahami urgensi dan manfaat dari investasi adaptasi iklim di tingkat lokal.'
    }
  ],
  mapOpacity: 0.7,
};
