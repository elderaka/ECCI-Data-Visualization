# 🚀 Deploy to Vercel - No CLI Installation Required

## ⚠️ Important: C: Drive is Full

Your C: drive has 0 GB free space, so we cannot install Vercel CLI. 

**Solution:** Use GitHub + Vercel Dashboard (100% web-based, no local installation needed!)

---

## Step-by-Step Deployment Guide

### Step 1: Check Git Status

```powershell
cd d:\Websites\ECCI
git status
```

If git is not initialized, run:
```powershell
git init
```

### Step 2: Create .gitignore

Create or verify `.gitignore` file exists with:

```
node_modules/
dist/
.env.local
*.log
Backend/Data/
Backend/tiles/*.pmtiles
PMTiles/*.pmtiles
tippecanoe-2.79.0/
```

### Step 3: Commit Your Code

```powershell
git add .
git commit -m "Prepare for Vercel deployment"
```

### Step 4: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `ecci-cobenefits` (or any name)
3. **Visibility:** Public or Private (your choice)
4. **DO NOT** check "Initialize with README" (we already have files)
5. **Click:** "Create repository"

### Step 5: Push to GitHub

Copy the commands from GitHub, or use:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/ecci-cobenefits.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 6: Deploy to Vercel

1. **Go to:** https://vercel.com/signup
2. **Sign up/Login** with your GitHub account
3. **After login, go to:** https://vercel.com/new
4. **Click:** "Import Git Repository"
5. **Select:** Your `ecci-cobenefits` repository

### Step 7: Configure Build Settings

Vercel will show a configuration page. Update these settings:

```
Framework Preset: Vite

Root Directory: Frontend
  (Click "Edit" next to Root Directory and select "Frontend" folder)

Build Command: npm run build
  (Should auto-detect, but verify)

Output Directory: dist
  (Should auto-detect, but verify)

Install Command: npm install
  (Should auto-detect, but verify)
```

### Step 8: Add Environment Variables

**Before clicking Deploy**, scroll down to "Environment Variables":

1. **Click:** "Add" under Environment Variables
2. **Name:** `VITE_API_SERVER_URL`
3. **Value:** `https://unvamped-natalya-resourcefully.ngrok-free.dev`
4. **Environments:** Check all three:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### Step 9: Deploy!

1. **Click:** "Deploy" button
2. **Wait 2-3 minutes** while Vercel:
   - Clones your repository
   - Installs dependencies
   - Builds your project
   - Deploys to global CDN

### Step 10: Get Your Live URL

After deployment completes, you'll see:

```
✅ Your project is live!
https://ecci-cobenefits.vercel.app
```

**Click the URL to view your live site!**

---

## Configure Custom Domain from Name.com

### Step 1: Add Domain in Vercel

1. **Vercel Dashboard** → Select your project
2. **Settings** → **Domains**
3. **Add Domain**
4. **Enter:** `yourdomain.com` or `www.yourdomain.com`

### Step 2: Get DNS Records from Vercel

Vercel will show you which DNS records to add. Usually:

**For root domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: Configure DNS on Name.com

1. **Login to Name.com**
2. **Go to:** My Domains
3. **Select:** Your domain
4. **Click:** "Manage DNS Records" or "DNS Records"
5. **Add the records from Vercel:**

#### Add A Record:
- **Type:** A
- **Host:** @ (leave blank or use @)
- **Answer:** 76.76.21.21
- **TTL:** 300

#### Add CNAME Record:
- **Type:** CNAME
- **Host:** www
- **Answer:** cname.vercel-dns.com.
- **TTL:** 300

6. **Save changes**

### Step 4: Wait for DNS Propagation

- **Time:** 5-30 minutes (usually under 10 minutes)
- **Check status:** https://dnschecker.org/#A/yourdomain.com

### Step 5: Verify SSL Certificate

Once DNS propagates:
- Vercel automatically provisions SSL certificate
- Your site will be available at `https://yourdomain.com` with HTTPS

---

## Important: Keep Backend Running

Your Vercel frontend needs the backend to be running!

### Option A: Keep PC Running with Ngrok (Temporary)

**Pros:** Free, works immediately  
**Cons:** PC must stay on, ngrok URL changes periodically

```powershell
# Terminal 1 - Backend
cd d:\Websites\ECCI\Backend
node server.js

# Terminal 2 - Ngrok
ngrok http 3000
```

### Option B: Deploy Backend to Railway (Recommended)

**Pros:** Always online, free tier available, permanent URL  
**Cons:** Requires setup

1. **Go to:** https://railway.app/
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select:** Your ECCI repository
5. **Configure:**
   - Root Directory: `Backend`
   - Start Command: `node server.js`
6. **Add PostgreSQL** (if needed):
   - Click "Add New" → "Database" → "PostgreSQL"
   - Railway will provide connection string automatically
7. **Get Railway URL:** `https://your-backend.railway.app`

8. **Update Vercel Environment Variable:**
   - Vercel Dashboard → Settings → Environment Variables
   - Edit `VITE_API_SERVER_URL`
   - New value: `https://your-backend.railway.app`
   - **Redeploy:** Vercel Dashboard → Deployments → ⋯ → "Redeploy"

---

## Troubleshooting

### "Failed to build"

**Check Vercel build logs:**
1. Vercel Dashboard → Your project → Deployments
2. Click on failed deployment
3. View logs to see error

**Common fixes:**
- Verify Root Directory is set to `Frontend`
- Check `Frontend/package.json` has all dependencies
- Ensure build command is `npm run build`

### "Page Not Found" after deployment

- Verify Output Directory is `dist`
- Check build logs for errors
- Verify `Frontend/index.html` exists

### CORS Errors

Your backend needs to allow requests from Vercel domain:

Edit `Backend/server.js` (around line 35):

```javascript
res.header('Access-Control-Allow-Origin', '*');
// Or specifically:
// res.header('Access-Control-Allow-Origin', 'https://your-project.vercel.app');
```

### Environment Variables Not Working

- Must start with `VITE_` prefix
- Set for all environments (Production, Preview, Development)
- **Must redeploy** after changing environment variables

### Domain Not Connecting

- Verify DNS records on Name.com match Vercel's requirements
- Check DNS propagation: https://dnschecker.org/
- Wait 5-30 minutes for propagation
- Ensure no conflicting records exist

---

## Quick Reference

### Files Created for Deployment:

✅ [vercel.json](vercel.json) - Vercel build configuration  
✅ [Frontend/.env.production](Frontend/.env.production) - Production environment  
✅ [.vercelignore](.vercelignore) - Files to exclude  

### Required Terminals (if using ngrok):

```powershell
# Terminal 1 - Backend
cd d:\Websites\ECCI\Backend
node server.js

# Terminal 2 - Ngrok
ngrok http 3000
```

### Current URLs:

- **Local Frontend:** http://localhost:5173
- **Backend (ngrok):** https://unvamped-natalya-resourcefully.ngrok-free.dev
- **Vercel (after deployment):** https://your-project.vercel.app
- **Custom Domain (after DNS):** https://yourdomain.com

---

## Next Steps

1. ✅ **Push code to GitHub**
2. ✅ **Import to Vercel from GitHub**
3. ✅ **Configure build settings**
4. ✅ **Add environment variables**
5. ✅ **Deploy and get live URL**
6. ⏳ **Add custom domain from Name.com**
7. ⏳ **Configure DNS records**
8. ⏳ **Wait for SSL certificate**
9. 🎯 **Consider deploying backend to Railway for permanence**

---

## Summary

**What You Need to Do:**
1. Push to GitHub (5 minutes)
2. Import to Vercel (2 minutes)
3. Configure & Deploy (3 minutes)
4. Add domain & DNS (10 minutes)

**Total Time:** ~20 minutes

**Cost:** $0 (completely free with Vercel + ngrok free tier)

**Result:** Your app live on the internet with custom domain! 🚀

---

**Start here:**
```powershell
cd d:\Websites\ECCI
git status
git add .
git commit -m "Prepare for Vercel deployment"
# Then push to GitHub and import to Vercel!
```
