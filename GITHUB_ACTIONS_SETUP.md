# 🚀 GitHub Actions Auto-Deploy Setup

## 📋 Overview

Dengan GitHub Actions, API backend akan **otomatis deploy** ke Cloudflare Workers setiap kali Anda push ke GitHub. **Tidak perlu PC atau VPS!**

## ✨ Fitur

- ✅ **Auto-deploy** saat push ke `main` branch
- ✅ **No local setup** required
- ✅ **Free** (GitHub Actions + Cloudflare Workers free tier)
- ✅ **Secure** (secrets encrypted)

## 🔧 Setup (One-time)

### Step 1: Dapatkan Cloudflare API Token

1. **Login ke Cloudflare Dashboard**
   - Buka: https://dash.cloudflare.com

2. **Buat API Token**
   - Klik profile (kanan atas) → **API Tokens**
   - Klik **Create Token**
   - Pilih template: **Edit Cloudflare Workers**
   - Atau buat custom dengan permissions:
     - Account → Workers Scripts → Edit
     - Account → Workers KV Storage → Edit
   - Klik **Continue to summary**
   - Klik **Create Token**
   - **COPY TOKEN** (hanya muncul sekali!)

3. **Dapatkan Account ID**
   - Di Cloudflare Dashboard, pilih domain/account
   - Scroll ke bawah di sidebar kanan
   - Copy **Account ID**

### Step 2: Setup GitHub Secrets

1. **Buka Repository Settings**
   - Buka: https://github.com/ctrxm/ctrxl-dracin
   - Klik **Settings** tab
   - Sidebar kiri: **Secrets and variables** → **Actions**

2. **Tambahkan Secrets**

   Klik **New repository secret** untuk setiap secret berikut:

   **a. CLOUDFLARE_API_TOKEN**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: Paste API token dari Step 1
   - Klik **Add secret**

   **b. CLOUDFLARE_ACCOUNT_ID**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: Paste Account ID dari Step 1
   - Klik **Add secret**

   **c. ADMIN_PASSWORD**
   - Name: `ADMIN_PASSWORD`
   - Secret: Password untuk admin panel (minimal 12 karakter, gunakan password yang kuat)
   - Klik **Add secret**

3. **Verify Secrets**
   
   Pastikan ada 3 secrets:
   - ✅ CLOUDFLARE_API_TOKEN
   - ✅ CLOUDFLARE_ACCOUNT_ID
   - ✅ ADMIN_PASSWORD

### Step 3: Create KV Namespace

1. **Run Setup Workflow**
   - Buka: https://github.com/ctrxm/ctrxl-dracin/actions
   - Pilih workflow: **Setup KV Namespace (One-time)**
   - Klik **Run workflow** → **Run workflow**

2. **Get KV Namespace ID**
   - Wait workflow selesai (1-2 menit)
   - Klik workflow run untuk lihat logs
   - Copy **KV Namespace ID** dari output

3. **Update wrangler.toml**
   
   **Via GitHub Web Editor:**
   - Buka: https://github.com/ctrxm/ctrxl-dracin/blob/main/api/wrangler.toml
   - Klik **Edit** (icon pensil)
   - Ganti `YOUR_KV_NAMESPACE_ID` dengan ID yang Anda copy
   
   ```toml
   [[kv_namespaces]]
   binding = "API_CACHE"
   id = "abc123def456"  # Paste ID di sini
   ```
   
   - Scroll ke bawah
   - Commit message: `config: add KV namespace ID`
   - Klik **Commit changes**

### Step 4: Deploy API

Setelah commit wrangler.toml, GitHub Actions akan **otomatis deploy**!

1. **Monitor Deployment**
   - Buka: https://github.com/ctrxm/ctrxl-dracin/actions
   - Lihat workflow: **Deploy API to Cloudflare Workers**
   - Klik untuk lihat progress

2. **Get API URL**
   - Setelah deploy selesai, check logs
   - Atau buka Cloudflare Dashboard → Workers & Pages
   - Copy URL: `https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev`

3. **Test API**
   
   Buka di browser:
   ```
   https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
   ```
   
   Seharusnya return JSON dengan API info.

### Step 5: Configure Frontend

1. **Edit .env via GitHub**
   - Buka: https://github.com/ctrxm/ctrxl-dracin
   - Create file: `.env` (jika belum ada)
   - Isi dengan:
   
   ```env
   VITE_USE_CUSTOM_API=true
   VITE_API_URL=https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
   ```
   
   - Commit changes

2. **Cloudflare Pages Auto-Rebuild**
   - Cloudflare Pages akan detect perubahan
   - Otomatis rebuild frontend
   - Wait 2-3 menit

3. **Test**
   - Buka website Anda
   - Hard refresh: Ctrl+Shift+R
   - Check console untuk verify API URL

## 🎯 Cara Kerja

```
Push ke GitHub (main branch)
    ↓
GitHub Actions triggered
    ↓
Install dependencies
    ↓
Deploy to Cloudflare Workers
    ↓
API live! ✅
```

## 🔄 Future Updates

Setelah setup selesai, untuk update API:

1. **Edit code** di `api/` folder (via GitHub web atau local)
2. **Commit & push** ke main branch
3. **GitHub Actions otomatis deploy** 🚀

Tidak perlu manual deployment lagi!

## 📝 File Structure

```
.github/
  workflows/
    deploy-api.yml      # Auto-deploy saat push
    setup-kv.yml        # One-time KV setup

api/
  src/
    index.ts            # API code
  wrangler.toml         # Cloudflare config
  package.json
```

## 🔐 Security

- ✅ **Secrets encrypted** di GitHub
- ✅ **API token** tidak pernah exposed di code
- ✅ **Admin password** hanya di GitHub Secrets
- ✅ **No credentials** di repository

## 💰 Biaya

**100% GRATIS!**

- GitHub Actions: 2,000 menit/bulan (free)
- Cloudflare Workers: 100,000 requests/day (free)
- Cloudflare KV: 100,000 reads/day (free)

## 🐛 Troubleshooting

### Workflow Failed: Invalid API Token

**Problem**: Token tidak valid atau expired

**Solution**:
1. Generate token baru di Cloudflare
2. Update `CLOUDFLARE_API_TOKEN` secret di GitHub
3. Re-run workflow

### Workflow Failed: Account ID not found

**Problem**: Account ID salah

**Solution**:
1. Verify Account ID di Cloudflare Dashboard
2. Update `CLOUDFLARE_ACCOUNT_ID` secret di GitHub
3. Re-run workflow

### KV Namespace Creation Failed

**Problem**: Permission insufficient

**Solution**:
1. Check API token permissions include "Workers KV Storage → Edit"
2. Generate new token dengan correct permissions
3. Update secret dan re-run

### API Deployed but Returns 500

**Problem**: KV namespace ID tidak set atau salah

**Solution**:
1. Verify `api/wrangler.toml` punya correct KV namespace ID
2. Re-run setup-kv workflow untuk get ID
3. Update wrangler.toml dan push

### Frontend Tidak Connect ke API

**Problem**: `.env` tidak ter-load atau salah

**Solution**:
1. Pastikan `.env` file ada di root directory
2. Check `VITE_API_URL` sesuai dengan Workers URL
3. Rebuild Cloudflare Pages
4. Hard refresh browser

## 📊 Monitoring

### View Deployment Logs

1. Buka: https://github.com/ctrxm/ctrxl-dracin/actions
2. Klik workflow run
3. Klik job "Deploy API"
4. Expand steps untuk lihat logs

### View API Logs (Live)

Tidak bisa via GitHub Actions, tapi bisa via Cloudflare Dashboard:
1. Workers & Pages → ctrxl-dracin-api
2. Tab "Logs" (real-time)

## 🎉 Selesai!

Setup selesai! Sekarang:

- ✅ API otomatis deploy saat push
- ✅ No PC/VPS needed
- ✅ Free forever (dalam free tier limits)
- ✅ Secure & encrypted

## 🔗 Quick Links

- **GitHub Actions**: https://github.com/ctrxm/ctrxl-dracin/actions
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **API URL**: https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
- **Admin Panel**: https://yourdomain.com/admin

## 💡 Tips

1. **Test locally** sebelum push (optional):
   ```bash
   cd api
   npm install
   npm run dev
   ```

2. **Manual trigger** deployment:
   - GitHub Actions → Deploy API → Run workflow

3. **Check deployment status**:
   - GitHub Actions badge di README
   - Cloudflare Dashboard

4. **Rollback** jika ada masalah:
   - Cloudflare Dashboard → Workers → Rollback

---

**Last Updated**: 2026-01-30
**Version**: 1.0.0
