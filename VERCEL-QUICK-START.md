# Vercel Deployment - Web Dashboard Method (No CLI Required)

⚠️ **Note:** Your C: drive is full, so we'll use the Vercel web dashboard instead of CLI.

---

## Quick Deploy Steps

### Step 1: Build the Project Locally

```powershell
cd d:\Websites\ECCI\Frontend
npm run build
```

This creates a `dist` folder with all your production files.

---

### Step 2: Option A - Deploy via Vercel Dashboard (Drag & Drop)

1. **Go to:** https://vercel.com/new
2. **Sign up/Login** with GitHub, GitLab, or email
3. **Skip** the "Import Git Repository" section
4. **Look for** "Deploy from folder" or drag-drop option
5. **Upload** the `d:\Websites\ECCI\Frontend\dist` folder

**Problem:** Vercel web interface prefers Git repositories.

---

### Step 2: Option B - Use Git (Recommended)

#### 2.1 Initialize Git (if not already)

```powershell
cd d:\Websites\ECCI
git init
```

#### 2.2 Create .gitignore

Already exists, but verify it includes:
```
node_modules/
dist/
.env.local
```

#### 2.3 Commit your code

```powershell
git add .
git commit -m "Prepare for Vercel deployment"
```

#### 2.4 Push to GitHub

1. **Create a new repository** on GitHub:
   - Go to https://github.com/new
   - Name: `ecci-cobenefits`
   - Private or Public (your choice)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

2. **Push your code:**

```powershell
git remote add origin https://github.com/YOUR_USERNAME/ecci-cobenefits.git
git branch -M main
git push -u origin main
```

#### 2.5 Import to Vercel

1. **Go to:** https://vercel.com/new
2. **Click:** "Import Git Repository"
3. **Select:** Your GitHub repository
4. **Configure Build Settings:**

   ```
   Framework Preset: Vite
   Root Directory: Frontend (click Edit and select Frontend folder)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Add Environment Variable:**
   - Click "Environment Variables"
   - Name: `VITE_API_SERVER_URL`
   - Value: `https://unvamped-natalya-resourcefully.ngrok-free.dev`
   - Check all environments (Production, Preview, Development)

6. **Click "Deploy"**

---

### Step 3: Wait for Deployment

Vercel will:
- ✅ Clone your repository
- ✅ Install dependencies
- ✅ Build your project
- ✅ Deploy to CDN
- ✅ Provide a URL like: `https://ecci-cobenefits.vercel.app`

This takes about 2-3 minutes.

---

## Alternative: Use npx vercel (No Global Install)

If you have some space, try using `npx` which doesn't require global installation:

```powershell
cd d:\Websites\ECCI

# Login
npx vercel login

# Deploy
npx vercel

# Deploy to production
npx vercel --prod
```

---

## After Successful Deployment

### Your app will be live at:
```
https://your-project-name.vercel.app
```

### To add custom domain:

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add Domain:** `yourdomain.com`
3. **Configure Name.com DNS:**

Add these records on Name.com:

```
Type: A
Host: @
Value: 76.76.21.21
TTL: 300

Type: CNAME  
Host: www
Value: cname.vercel-dns.com
TTL: 300
```

4. **Wait 5-30 minutes** for DNS propagation
5. **SSL Certificate** will be auto-provisioned by Vercel

---

## Troubleshooting

### "No space left on device"
- **Solution:** Use Git + Vercel Dashboard method (no CLI needed)
- Or clean up C: drive and try `npx vercel`

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify `Frontend/package.json` has all dependencies
- Check Node.js version compatibility

### CORS errors after deployment
- Update backend CORS to allow your Vercel domain
- In `Backend/server.js`, update line 35 to include your domain

### Environment variables not working
- Must start with `VITE_` prefix
- Redeploy after changing variables in Vercel dashboard

---

## Current Setup Summary

✅ **Configured Files:**
- `vercel.json` - Vercel configuration
- `Frontend/.env.production` - Production environment variables
- `.vercelignore` - Files to exclude from deployment

✅ **Backend:**
- Running on ngrok: `https://unvamped-natalya-resourcefully.ngrok-free.dev`
- Keep terminal with `node server.js` and `ngrok http 3000` running

✅ **Ready to deploy!**
- Option 1: Push to GitHub → Import to Vercel (Recommended)
- Option 2: Use `npx vercel` (if space available)
- Option 3: Build locally → Manual upload (less ideal)

---

## Recommended: Push to GitHub First

```powershell
# 1. Check git status
cd d:\Websites\ECCI
git status

# 2. Add all files
git add .

# 3. Commit
git commit -m "Ready for Vercel deployment"

# 4. Create GitHub repo at https://github.com/new

# 5. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/ecci-cobenefits.git
git push -u origin main

# 6. Import to Vercel from GitHub
# Go to: https://vercel.com/new
```

This is the cleanest and most maintainable approach! 🚀
