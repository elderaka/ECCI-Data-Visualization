import type { LaporanSection } from './types';

export const laporanSection06: LaporanSection = {
  id: 'laporan-06',
  title: 'Column Overview',
  align: 'center',
  justify: 'center',
  width: '80vw',
  content: [
    {
      type: 'text',
    },
    {
      type: 'card-grid',
      cards: [
        {
          title: 'Air Quality',
          description: 'Kualitas udara dan dampak polusi terhadap kesehatan'
        },
        {
          title: 'Excess Heat',
          description: 'Risiko overheating dalam bangunan residensial'
        },
        {
          title: 'Mortality',
          description: 'Tingkat kematian terkait kondisi perumahan'
        },
        {
          title: 'Morbidity',
          description: 'Tingkat kesakitan dan penyakit terkait lingkungan'
        },
        {
          title: 'Mental Health',
          description: 'Kesehatan mental dipengaruhi kualitas perumahan'
        },
        {
          title: 'Productivity',
          description: 'Produktivitas kerja dipengaruhi kondisi rumah'
        },
        {
          title: 'Road Accidents',
          description: 'Kecelakaan lalu lintas terkait infrastruktur'
        },
        {
          title: 'Road Noise',
          description: 'Polusi suara dari lalu lintas kendaraan'
        },
        {
          title: 'Fuel Poverty',
          description: 'Kemiskinan energi dan biaya pemanas rumah'
        },
        {
          title: 'Thermal Comfort',
          description: 'Kenyamanan termal dalam bangunan'
        },
        {
          title: 'Active Travel',
          description: 'Aktivitas fisik melalui transportasi aktif'
        },
        {
          title: 'Energy Costs',
          description: 'Biaya energi rumah tangga tahunan'
        }
      ]
    }
  ],
  mapOpacity: 0.5,
};
