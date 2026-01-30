# 🚀 Panduan Deployment Cloudflare Pages

Dokumen ini berisi panduan lengkap untuk deploy **CTRXL DRACIN** ke Cloudflare Pages.

## 📋 Prasyarat

- Akun Cloudflare (gratis)
- Repository GitHub yang sudah di-push
- Project sudah di-build dan test lokal

## ⚙️ Konfigurasi Build Settings

Ketika setup project di Cloudflare Pages, gunakan konfigurasi berikut:

### Build Configuration

| Setting | Value | Keterangan |
|---------|-------|------------|
| **Project name** | `ctrxl-dracin` | Nama project Anda |
| **Production branch** | `main` | Branch utama |
| **Framework preset** | `None` atau `Vite` | Preset framework |
| **Build command** | `pnpm run build` | Command untuk build |
| **Build output directory** | `dist/public` | Direktori output |
| **Root directory** | `/` | Root project |

### Environment Variables (Optional)

Jika ingin menggunakan pnpm versi spesifik:

```
PNPM_VERSION=10.4.1
```

## ⚠️ PENTING: Jangan Tambahkan Deploy Command!

**JANGAN** menambahkan custom deploy command seperti:
- ❌ `npx wrangler deploy`
- ❌ `wrangler pages deploy`
- ❌ Command deploy lainnya

Cloudflare Pages akan otomatis handle deployment setelah build selesai.

### Jika Anda Melihat Error Ini:

```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

**Penyebab**: Ada deploy command yang tidak seharusnya ada.

**Solusi**:
1. Buka project settings di Cloudflare Pages
2. Scroll ke **Build settings**
3. Pastikan **Deploy command** kosong atau tidak ada
4. Retry deployment

## 📝 Langkah-langkah Deployment

### 1. Login ke Cloudflare

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Login dengan akun Anda
3. Pilih **Pages** dari sidebar

### 2. Create New Project

1. Klik tombol **"Create a project"**
2. Pilih **"Connect to Git"**
3. Authorize Cloudflare untuk akses GitHub Anda
4. Pilih repository: `ctrxm/ctrxl-dracin`

### 3. Configure Build

Masukkan konfigurasi berikut:

**Project name**: `ctrxl-dracin` (atau nama yang Anda inginkan)

**Production branch**: `main`

**Build settings**:
- Framework preset: `None` (atau pilih `Vite`)
- Build command: `pnpm run build`
- Build output directory: `dist/public`

**Environment variables** (optional):
- Name: `PNPM_VERSION`
- Value: `10.4.1`

### 4. Save and Deploy

1. Review konfigurasi Anda
2. Klik **"Save and Deploy"**
3. Tunggu proses build (biasanya 2-3 menit)
4. Setelah selesai, Anda akan mendapat URL: `https://ctrxl-dracin.pages.dev`

## 🔄 Automatic Deployments

Setelah setup awal, Cloudflare Pages akan otomatis:

- ✅ **Production deployments**: Setiap push ke branch `main`
- ✅ **Preview deployments**: Setiap pull request
- ✅ **Rollback**: Jika build gagal, deployment sebelumnya tetap aktif

## 🌐 Custom Domain (Optional)

Untuk menggunakan domain sendiri:

### 1. Tambah Custom Domain

1. Buka project Anda di Cloudflare Pages
2. Klik tab **"Custom domains"**
3. Klik **"Set up a custom domain"**
4. Masukkan domain Anda (contoh: `dracin.com`)

### 2. Update DNS

Cloudflare akan memberikan instruksi untuk update DNS:

**Jika domain sudah di Cloudflare:**
- DNS akan otomatis dikonfigurasi

**Jika domain di registrar lain:**
- Tambahkan CNAME record:
  ```
  CNAME  @  ctrxl-dracin.pages.dev
  ```

### 3. SSL/TLS

SSL otomatis diaktifkan oleh Cloudflare. Tunggu beberapa menit untuk certificate provisioning.

## 🛠️ Troubleshooting

### Error: Build Command Failed

**Problem**: `pnpm: command not found`

**Solution**:
1. Tambahkan environment variable: `PNPM_VERSION=10.4.1`
2. Atau ubah build command ke: `npm install -g pnpm && pnpm install && pnpm run build`

---

**Problem**: TypeScript errors

**Solution**:
1. Pastikan semua dependencies sudah di-commit
2. Check `pnpm-lock.yaml` ada di repository
3. Run `pnpm run check` lokal untuk verify

---

**Problem**: Build timeout

**Solution**:
1. Optimize dependencies
2. Check apakah ada infinite loop di build process
3. Contact Cloudflare support jika masalah persist

### Error: Missing Entry Point

**Problem**: 
```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

**Solution**:
1. **Hapus deploy command** di build settings
2. Pastikan hanya ada **build command**, bukan deploy command
3. File `wrangler.toml` sudah ada di repository (sudah included)

### Error: 404 on Page Refresh

**Problem**: SPA routing tidak bekerja, 404 saat refresh

**Solution**:
File `_redirects` sudah included di `client/public/_redirects`:
```
/*    /index.html   200
```

Pastikan file ini ter-copy ke `dist/public/` saat build.

### Service Worker Tidak Bekerja

**Problem**: Video caching tidak berfungsi

**Solution**:
1. Service worker hanya bekerja di HTTPS atau localhost
2. Check di DevTools → Application → Service Workers
3. Clear cache dan reload: Ctrl+Shift+R
4. Check file `sw.js` ada di root URL

## 📊 Monitoring

### View Deployment Logs

1. Buka project di Cloudflare Pages
2. Klik deployment yang ingin dilihat
3. Scroll ke **"Build logs"** untuk detail

### Analytics

Cloudflare Pages menyediakan analytics gratis:
1. Buka tab **"Analytics"**
2. Lihat metrics: page views, bandwidth, requests

### Real-time Logs

Untuk real-time monitoring:
```bash
wrangler pages deployment tail
```

## 🔐 Security Headers

File `_headers` sudah dikonfigurasi dengan security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Headers ini otomatis diterapkan oleh Cloudflare Pages.

## 🚀 Performance

### Caching Strategy

- **Static assets**: Cache 1 year (immutable)
- **HTML**: No cache (always fresh)
- **Service Worker**: No cache (always fresh)
- **API responses**: Cached by service worker

### CDN

Cloudflare Pages otomatis menggunakan global CDN:
- 200+ data centers worldwide
- Automatic edge caching
- DDoS protection

## 📞 Support

Jika mengalami masalah:

1. **Check dokumentasi**: [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
2. **Community**: [Cloudflare Community](https://community.cloudflare.com/)
3. **Discord**: [Cloudflare Developers Discord](https://discord.gg/cloudflaredev)

## ✅ Checklist Deployment

Sebelum deploy, pastikan:

- [ ] Repository sudah di-push ke GitHub
- [ ] `pnpm-lock.yaml` sudah di-commit
- [ ] Build berhasil lokal: `pnpm run build`
- [ ] Type check passed: `pnpm run check`
- [ ] File `wrangler.toml` ada di root
- [ ] File `_redirects` ada di `client/public/`
- [ ] File `_headers` ada di `client/public/`
- [ ] Tidak ada deploy command di build settings

## 🎉 Selesai!

Setelah deployment berhasil, aplikasi Anda akan live di:
```
https://ctrxl-dracin.pages.dev
```

Atau di custom domain Anda jika sudah dikonfigurasi.

---

**Happy Deploying! 🚀**
