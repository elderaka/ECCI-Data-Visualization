import type { LaporanSection } from './types';

export const laporanSection07: LaporanSection = {
  id: 'laporan-07',
  title: 'Strategi Pengelompokan Data',
  align: "center",
  justify: "center",
  content: [
    {
      type: 'text',
      body: 'Untuk memudahkan analisis dan visualisasi, kami mengelompokkan 12 kolom data menjadi 3 kategori utama berdasarkan domain dampak:'
    },
    {
      type: 'card-grid',
      cards: [
        {
          title: 'Health & Wellbeing',
          description: 'Air Quality, Mortality, Morbidity, Mental Health, Productivity - Dampak kesehatan dan kesejahteraan masyarakat'
        },
        {
          title: 'Housing Comfort',
          description: 'Excess Heat, Fuel Poverty, Thermal Comfort, Energy Costs - Kenyamanan dan efisiensi perumahan'
        },
        {
          title: 'Road Mobility',
          description: 'Road Accidents, Road Noise, Active Travel - Transportasi dan mobilitas berkelanjutan'
        }
      ]
    },
    {
      type: 'text',
      body: 'Setiap kategori dihitung sebagai rata-rata dari variabel-variabel penyusunnya, memungkinkan analisis agregat yang bermakna sambil tetap mempertahankan akses ke data individual.'
    }
  ],
  mapOpacity: 0.5,
};
