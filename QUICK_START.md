# ⚡ Quick Start - Deploy API Tanpa PC/VPS

## 🎯 Goal

Deploy API backend ke Cloudflare Workers **hanya dari browser**, tanpa PC/VPS!

## ⏱️ Estimasi Waktu: 10 menit

## 📝 Checklist

### 1️⃣ Dapatkan Cloudflare API Token (3 menit)

- [ ] Login ke https://dash.cloudflare.com
- [ ] Profile → API Tokens → Create Token
- [ ] Pilih template: **Edit Cloudflare Workers**
- [ ] Create Token → **Copy token** (simpan!)
- [ ] Copy **Account ID** dari dashboard

### 2️⃣ Setup GitHub Secrets (2 menit)

- [ ] Buka https://github.com/ctrxm/ctrxl-dracin/settings/secrets/actions
- [ ] Add secret: `CLOUDFLARE_API_TOKEN` = (paste token)
- [ ] Add secret: `CLOUDFLARE_ACCOUNT_ID` = (paste account ID)
- [ ] Add secret: `ADMIN_PASSWORD` = (password untuk admin panel)

### 3️⃣ Create KV Namespace (2 menit)

- [ ] Buka https://github.com/ctrxm/ctrxl-dracin/actions
- [ ] Pilih workflow: **Setup KV Namespace**
- [ ] Run workflow → Wait selesai
- [ ] Copy **KV Namespace ID** dari logs

### 4️⃣ Update Config (1 menit)

- [ ] Buka https://github.com/ctrxm/ctrxl-dracin/blob/main/api/wrangler.toml
- [ ] Edit → Ganti `YOUR_KV_NAMESPACE_ID` dengan ID yang di-copy
- [ ] Commit changes

### 5️⃣ Deploy! (2 menit)

- [ ] GitHub Actions otomatis deploy setelah commit
- [ ] Buka https://github.com/ctrxm/ctrxl-dracin/actions
- [ ] Wait workflow **Deploy API** selesai
- [ ] Copy **API URL** dari Cloudflare Dashboard

### 6️⃣ Configure Frontend (1 menit)

- [ ] Create file `.env` di root repository
- [ ] Isi:
  ```env
  VITE_USE_CUSTOM_API=true
  VITE_API_URL=https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
  ```
- [ ] Commit → Cloudflare Pages auto-rebuild

### 7️⃣ Test! (1 menit)

- [ ] Buka website Anda
- [ ] Hard refresh: Ctrl+Shift+R
- [ ] Buka `/admin` → Login dengan password
- [ ] Check API sources status

## ✅ Selesai!

API backend sudah live dan otomatis deploy setiap push! 🎉

## 🆘 Butuh Help?

Lihat dokumentasi lengkap: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

## 🔗 Links

- **Actions**: https://github.com/ctrxm/ctrxl-dracin/actions
- **Cloudflare**: https://dash.cloudflare.com
- **Admin Panel**: https://yourdomain.com/admin
