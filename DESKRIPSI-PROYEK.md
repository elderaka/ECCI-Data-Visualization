# Deskripsi Proyek: Atlas Interaktif Co-Benefits Net-Zero UK

## Ringkasan Proyek

Atlas Web Interaktif Co-Benefits Net-Zero UK adalah platform visualisasi data geospasial yang menampilkan manfaat sosial-ekonomi dari transisi Inggris menuju net-zero hingga tahun 2050. Dikembangkan oleh Edinburgh Climate Change Institute, University of Edinburgh, proyek ini mengolah 66,4 juta data points untuk memberikan wawasan tingkat lokal tentang dampak kebijakan iklim.

## Data & Analisis

**Cakupan Data:**
- 46.426 area kecil (Datazones/LSOAs) di seluruh UK
- 374 otoritas lokal dan 4 negara (England, Scotland, Wales, Northern Ireland)
- 11 kategori co-benefit (kualitas udara, kesehatan perumahan, perubahan pola makan, dll.)
- Proyeksi 26 tahun (2025-2050)
- Total manfaat ekonomi: £99,7 miliar (nilai sekarang berdiskonto)

**Metodologi Analisis:**
Database PostgreSQL dengan ekstensi PostGIS dan TimescaleDB mengolah data time-series dan spatial queries. Analisis mencakup trade-off (misalnya, rebound effect transportasi) dan manfaat bersih per kategori.

## Pesan Utama

Proyek ini membuktikan bahwa aksi iklim menghasilkan manfaat ekonomi konkret untuk komunitas lokal: udara lebih bersih, rumah lebih sehat, dan beban kesehatan lebih rendah. Dengan visualisasi interaktif, warga dapat melihat manfaat spesifik untuk wilayah mereka dan mengadvokasi kebijakan iklim ke pemerintah lokal.

## Tools & Teknologi

**Frontend:**
- **MapLibre GL JS** - rendering peta vector berbasis GPU
- **PMTiles** - format tile cloud-optimized untuk performa tinggi
- **TypeScript + Vite** - development environment modern
- **Plotly.js** - visualisasi data interaktif
- **Scrollytelling** - narasi berbasis scroll dengan animasi FLIP

**Backend:**
- **Node.js + Express.js** - REST API server
- **PostgreSQL 16 + PostGIS** - database geospasial
- **TimescaleDB** - optimisasi data time-series

**Deployment:**
- Vite build system dengan code-splitting
- PMTiles untuk serving tile tanpa server database
- Nginx reverse proxy untuk production

**DOI Data:** 10.7488/ds/7978

---
*Jumlah kata: 289*
