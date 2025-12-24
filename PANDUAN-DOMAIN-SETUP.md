# Panduan Setup Domain Name.com dengan Ngrok

## Status Saat Ini ✅

### Server yang Berjalan:
1. **Backend Server** - Port 3000
   - URL Lokal: `http://localhost:3000`
   - URL Ngrok: `https://unvamped-natalya-resourcefully.ngrok-free.dev`
   - Status: ✅ Running

2. **Frontend Server** - Port 5173
   - URL Lokal: `http://localhost:5173`
   - Status: ✅ Running
   - Backend dikonfigurasi menggunakan ngrok URL

---

## Opsi 1: Domain untuk Backend API (Direkomendasikan)

### Langkah 1: Upgrade Ngrok ke Plan Berbayar
Untuk menggunakan custom domain dengan ngrok, Anda perlu upgrade ke **ngrok Pro Plan** atau lebih tinggi:

- **Pricing**: $10-20/bulan
- **Benefit**: Custom domain, reserved domain, multiple tunnels
- **Website**: https://ngrok.com/pricing

### Langkah 2: Reserve Custom Domain di Ngrok
Setelah upgrade, reserve domain Anda:

```powershell
# Login ke ngrok (jika belum)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Reserve custom domain (misal: api.domainanda.com)
ngrok http 3000 --domain=api.domainanda.com
```

### Langkah 3: Konfigurasi DNS di Name.com

1. Login ke **Name.com Dashboard**
2. Pilih domain Anda
3. Masuk ke **DNS Records**
4. Tambahkan CNAME record:

```
Type: CNAME
Host: api (untuk api.domainanda.com)
Answer: YOUR-RESERVED-DOMAIN.ngrok.app
TTL: 300
```

### Langkah 4: Update Frontend Configuration

Update file [Frontend/.env](Frontend/.env):

```env
VITE_API_SERVER_URL=https://api.domainanda.com
```

Restart frontend server untuk apply perubahan.

---

## Opsi 2: Domain untuk Frontend (Production Setup)

Untuk production deployment yang proper, sebaiknya:

### A. Deploy Frontend ke Hosting Service

#### Opsi A1: Vercel (Gratis & Mudah)

1. **Install Vercel CLI:**
```powershell
npm install -g vercel
```

2. **Deploy Frontend:**
```powershell
cd d:\Websites\ECCI\Frontend
vercel
```

3. **Setup Domain di Vercel:**
   - Masuk ke Vercel Dashboard
   - Pilih project Anda
   - Settings → Domains
   - Tambahkan `domainanda.com`
   - Copy nameservers yang diberikan

4. **Update Nameservers di Name.com:**
   - Login ke Name.com
   - Pilih domain
   - Masuk ke **Nameservers**
   - Ganti dengan nameservers dari Vercel

#### Opsi A2: Netlify (Gratis & Mudah)

1. **Install Netlify CLI:**
```powershell
npm install -g netlify-cli
```

2. **Build & Deploy:**
```powershell
cd d:\Websites\ECCI\Frontend
npm run build
netlify deploy --prod
```

3. **Setup Domain:**
   - Netlify Dashboard → Domain settings
   - Add custom domain
   - Follow DNS instructions

#### Opsi A3: Cloudflare Pages (Gratis)

1. **Build Frontend:**
```powershell
cd d:\Websites\ECCI\Frontend
npm run build
```

2. **Upload ke Cloudflare Pages:**
   - Login ke Cloudflare
   - Pages → Create a project
   - Upload `dist` folder
   - Connect domain dari Name.com

### B. Keep Backend on Ngrok

Backend tetap menggunakan ngrok dengan subdomain:
- Backend: `https://api.domainanda.com` (via ngrok Pro)
- Frontend: `https://domainanda.com` (via Vercel/Netlify/Cloudflare)

---

## Opsi 3: Self-Host dengan Port Forwarding (Tidak Direkomendasikan)

⚠️ **Warning**: Memerlukan IP publik statis dan konfigurasi router yang rumit.

### Langkah Manual:

1. **Setup Static IP** (dari ISP Anda)
2. **Configure Router Port Forwarding:**
   - Frontend: Port 5173 → PC Anda
   - Backend: Port 3000 → PC Anda

3. **DNS Configuration di Name.com:**
```
Type: A
Host: @
Answer: YOUR_PUBLIC_IP
TTL: 300

Type: A
Host: api
Answer: YOUR_PUBLIC_IP
TTL: 300
```

4. **Setup Nginx Reverse Proxy** (untuk production):
```powershell
# Install Nginx untuk Windows
# Configure nginx.conf
```

**Masalah dengan opsi ini:**
- ❌ PC harus selalu online 24/7
- ❌ IP publik bisa berubah (kecuali static IP)
- ❌ Keamanan kurang (expose PC ke internet)
- ❌ Tidak ada SSL/HTTPS otomatis
- ❌ Bandwidth terbatas dari ISP

---

## Rekomendasi Setup

### Untuk Development/Testing:
```
✅ Frontend: http://localhost:5173 (Vite dev server)
✅ Backend: https://unvamped-natalya-resourcefully.ngrok-free.dev (ngrok free)
```

### Untuk Production (Best Practice):
```
✅ Frontend: https://domainanda.com (Vercel/Netlify - Gratis)
✅ Backend: https://api.domainanda.com (ngrok Pro - $10/bulan)
   ATAU
✅ Backend: Deploy ke cloud service (AWS/DigitalOcean/Railway)
```

### Untuk Production (Budget Friendly):
```
✅ Frontend: https://domainanda.com (Cloudflare Pages - Gratis)
✅ Backend: Deploy ke Railway.app (Gratis sampai 500 jam/bulan)
   Railway akan memberikan domain: your-app.railway.app
```

---

## Quick Start dengan Railway (Alternative Ngrok)

Railway menawarkan solusi gratis untuk deploy backend:

1. **Install Railway CLI:**
```powershell
npm install -g @railway/cli
```

2. **Login & Deploy:**
```powershell
cd d:\Websites\ECCI\Backend
railway login
railway init
railway up
```

3. **Get Railway URL:**
Railway akan memberikan URL seperti: `https://your-app.railway.app`

4. **Connect Custom Domain (Free):**
   - Railway Dashboard → Settings → Domains
   - Add domain: `api.domainanda.com`
   - Copy CNAME record
   - Add ke Name.com DNS

5. **Update Frontend .env:**
```env
VITE_API_SERVER_URL=https://api.domainanda.com
```

**Railway Advantages:**
- ✅ Gratis (500 jam/bulan)
- ✅ Custom domain gratis
- ✅ SSL otomatis
- ✅ Always online
- ✅ PostgreSQL hosting included

---

## Langkah Selanjutnya

1. **Untuk Testing Cepat:** 
   - Gunakan setup yang ada sekarang (localhost:5173 + ngrok free)

2. **Untuk Production:**
   - Deploy frontend ke Vercel/Netlify (gratis)
   - Deploy backend ke Railway (gratis) atau upgrade ngrok Pro ($10/bulan)
   - Connect domain dari Name.com

3. **Next Action:**
   - Pilih strategi deployment yang sesuai budget
   - Setup DNS di Name.com
   - Deploy aplikasi

---

## Troubleshooting

### Ngrok Rate Limit
Ngrok free tier memiliki batasan:
- **Solution**: Upgrade ke Pro atau gunakan Railway

### CORS Errors
Jika frontend di domain berbeda dari backend:
- **Solution**: Sudah dikonfigurasi di `Backend/server.js` (line 34-36)

### SSL Certificate Issues
- **Solution**: Hosting providers (Vercel/Netlify) menyediakan SSL otomatis

---

## Commands Reference

### Check Servers Running:
```powershell
# Backend
curl http://localhost:3000/api/random-area

# Frontend
# Open browser: http://localhost:5173

# Ngrok
curl http://localhost:4040/api/tunnels
```

### Stop Servers:
```powershell
# Stop all Node processes
Get-Process node | Stop-Process -Force

# Stop ngrok
Get-Process ngrok | Stop-Process -Force
```

### Restart Everything:
```powershell
# Terminal 1 - Backend
cd d:\Websites\ECCI\Backend
node server.js

# Terminal 2 - Ngrok
ngrok http 3000

# Terminal 3 - Frontend
cd d:\Websites\ECCI\Frontend
npm run dev
```

---

**Dibuat:** 24 Desember 2025  
**Status:** ✅ Ready untuk testing lokal  
**Next:** Deploy ke production dengan domain Name.com
