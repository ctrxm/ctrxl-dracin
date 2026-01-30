# 🔧 Fix GitHub Actions Error - Setup Secrets

## ❌ Error yang Terjadi

Workflows gagal karena **GitHub Secrets belum di-setup**. Workflows butuh credentials untuk akses Cloudflare.

**Error Messages:**
- `Create KV Namespace`: Process completed with exit code 1
- `Deploy API`: The process failed with exit code 1

## ✅ Solusi: Setup GitHub Secrets

Anda perlu menambahkan 3 secrets ke GitHub repository.

---

## 📋 Step 1: Dapatkan Cloudflare API Token

### 1.1 Login ke Cloudflare

1. **Buka**: https://dash.cloudflare.com
2. **Login** dengan akun Cloudflare Anda
3. Jika belum punya akun, **Sign up** dulu (gratis)

### 1.2 Buat API Token

1. **Klik profile** (icon orang) di kanan atas
2. **Pilih**: "API Tokens"
3. **Klik**: "Create Token"
4. **Pilih template**: "Edit Cloudflare Workers"
   - Atau scroll ke bawah dan klik "Use template" di card "Edit Cloudflare Workers"
5. **Review permissions** (seharusnya sudah benar):
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit
6. **Klik**: "Continue to summary"
7. **Klik**: "Create Token"
8. **COPY TOKEN** yang muncul (hanya muncul sekali!)
   - Simpan di tempat aman (Notepad, Notes app, dll)

### 1.3 Dapatkan Account ID

1. **Masih di Cloudflare Dashboard**
2. **Pilih domain/account** (jika ada multiple accounts)
3. **Scroll ke bawah** di sidebar kanan
4. **Lihat section "Account ID"**
5. **Copy Account ID** (format: 32 karakter alphanumeric)

---

## 📋 Step 2: Setup GitHub Secrets

### 2.1 Buka Repository Settings

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin
2. **Klik tab**: "Settings" (paling kanan)
3. **Sidebar kiri**: "Secrets and variables" → "Actions"
4. **Klik**: "New repository secret"

### 2.2 Tambahkan Secret #1: CLOUDFLARE_API_TOKEN

1. **Name**: `CLOUDFLARE_API_TOKEN` (exact, case-sensitive)
2. **Secret**: Paste API Token dari Step 1.2
3. **Klik**: "Add secret"

### 2.3 Tambahkan Secret #2: CLOUDFLARE_ACCOUNT_ID

1. **Klik**: "New repository secret" lagi
2. **Name**: `CLOUDFLARE_ACCOUNT_ID` (exact, case-sensitive)
3. **Secret**: Paste Account ID dari Step 1.3
4. **Klik**: "Add secret"

### 2.4 Tambahkan Secret #3: ADMIN_PASSWORD

1. **Klik**: "New repository secret" lagi
2. **Name**: `ADMIN_PASSWORD` (exact, case-sensitive)
3. **Secret**: Buat password untuk admin panel
   - Minimal 12 karakter
   - Gunakan kombinasi huruf, angka, simbol
   - Contoh: `MySecurePass123!`
4. **Klik**: "Add secret"

### 2.5 Verify Secrets

Setelah selesai, Anda seharusnya punya **3 secrets**:

```
✅ CLOUDFLARE_API_TOKEN
✅ CLOUDFLARE_ACCOUNT_ID
✅ ADMIN_PASSWORD
```

---

## 📋 Step 3: Run Workflows Lagi

### 3.1 Run Setup KV Namespace

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin/actions
2. **Klik workflow**: "Setup KV Namespace (One-time)"
3. **Klik**: "Run workflow" dropdown
4. **Klik**: "Run workflow" button (hijau)
5. **Wait** 1-2 menit untuk selesai

### 3.2 Check Logs untuk KV Namespace ID

1. **Klik workflow run** yang baru saja jalan
2. **Klik job**: "Create KV Namespace"
3. **Expand step**: "Create KV Namespace"
4. **Lihat output**, cari baris seperti:
   ```
   🌀 Creating namespace with title "ctrxl-dracin-api-API_CACHE"
   ✨ Success!
   Add the following to your configuration file in your kv_namespaces array:
   { binding = "API_CACHE", id = "abc123def456..." }
   ```
5. **Copy ID** (contoh: `abc123def456...`)

### 3.3 Update wrangler.toml dengan KV ID

**Option A: Via GitHub Web Editor**

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin/blob/main/api/wrangler.toml
2. **Klik icon pensil** (Edit)
3. **Cari baris**:
   ```toml
   [[kv_namespaces]]
   binding = "API_CACHE"
   id = "YOUR_KV_NAMESPACE_ID"
   ```
4. **Ganti** `YOUR_KV_NAMESPACE_ID` dengan ID yang Anda copy
5. **Commit message**: `config: add KV namespace ID`
6. **Commit changes**

**Option B: Via Mobile (jika susah edit)**

Kirim ID ke saya, nanti saya bantu update file-nya.

### 3.4 Deploy API

Setelah commit wrangler.toml, **Deploy API workflow akan otomatis jalan**!

Atau manual trigger:
1. **Actions** → "Deploy API to Cloudflare Workers"
2. **Run workflow**

---

## ✅ Verifikasi Success

### Check Workflow Success

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin/actions
2. **Workflow "Deploy API"** seharusnya **✅ green checkmark**
3. **Klik workflow** untuk lihat logs

### Get API URL

1. **Buka**: https://dash.cloudflare.com
2. **Sidebar**: "Workers & Pages"
3. **Cari**: `ctrxl-dracin-api`
4. **Copy URL**: `https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev`

### Test API

Buka di browser:
```
https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
```

Seharusnya return JSON dengan API info.

---

## 📋 Step 4: Configure Frontend

### 4.1 Create .env File

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin
2. **Klik**: "Add file" → "Create new file"
3. **Nama file**: `.env`
4. **Isi**:
   ```env
   VITE_USE_CUSTOM_API=true
   VITE_API_URL=https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
   ```
   (Ganti `YOUR_SUBDOMAIN` dengan subdomain Anda)
5. **Commit**: `config: enable custom API backend`

### 4.2 Wait Cloudflare Pages Rebuild

Cloudflare Pages akan otomatis rebuild (2-3 menit).

### 4.3 Test Website

1. **Buka website** Anda
2. **Hard refresh**: Ctrl+Shift+R (atau Cmd+Shift+R di Mac)
3. **Buka admin panel**: `https://yourdomain.com/admin`
4. **Login** dengan password dari `ADMIN_PASSWORD`

---

## 🎉 Selesai!

Sekarang:
- ✅ API backend deployed
- ✅ Frontend connected ke custom API
- ✅ Admin panel accessible
- ✅ Auto-deploy on push

---

## 🆘 Troubleshooting

### Error: Invalid API Token

**Problem**: Token salah atau expired

**Solution**:
1. Generate token baru di Cloudflare
2. Update `CLOUDFLARE_API_TOKEN` secret di GitHub
3. Re-run workflow

### Error: Account ID not found

**Problem**: Account ID salah

**Solution**:
1. Verify Account ID di Cloudflare Dashboard
2. Update `CLOUDFLARE_ACCOUNT_ID` secret
3. Re-run workflow

### KV Namespace Creation Failed

**Problem**: Permission insufficient

**Solution**:
1. Check API token permissions include "Workers KV Storage → Edit"
2. Generate new token dengan correct permissions
3. Update secret dan re-run

### Deploy Failed: KV Namespace Not Found

**Problem**: KV namespace ID belum di-set di wrangler.toml

**Solution**:
1. Run "Setup KV Namespace" workflow
2. Copy ID dari logs
3. Update `api/wrangler.toml`
4. Commit dan re-deploy

---

## 💡 Tips

- **Save credentials** di password manager
- **Jangan share** API token ke orang lain
- **Monitor** workflows di Actions tab
- **Check logs** jika ada error

---

## 📞 Butuh Bantuan?

Jika masih error:
1. Screenshot error message
2. Check workflow logs
3. Kirim ke saya untuk analisis

---

**Good luck!** 🚀
