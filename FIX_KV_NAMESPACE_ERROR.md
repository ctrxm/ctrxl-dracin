# 🔧 Fix KV Namespace Error

## ❌ Error

```
KV namespace 'YOUR_KV_NAMESPACE_ID' is not valid
```

## 🎯 Penyebab

File `api/wrangler.toml` masih berisi placeholder `YOUR_KV_NAMESPACE_ID`, belum diganti dengan KV namespace ID yang sebenarnya.

## ✅ Solusi (3 Langkah Mudah)

### Step 1: Run Setup KV Namespace Workflow

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin/actions
2. **Klik workflow**: "Setup KV Namespace (One-time)"
3. **Klik**: "Run workflow" (dropdown button)
4. **Klik**: "Run workflow" (green button)
5. **Wait** 1-2 menit sampai selesai

### Step 2: Copy KV Namespace ID dari Logs

1. **Klik workflow run** yang baru saja jalan (paling atas)
2. **Klik job**: "Create KV Namespace"
3. **Expand step**: "Create KV Namespace" (klik panah)
4. **Scroll ke bawah**, cari output seperti ini:

```
🌀 Creating namespace with title "ctrxl-dracin-api-API_CACHE"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "API_CACHE", id = "abc123def456789..." }
```

5. **Copy ID** (contoh: `abc123def456789...`)
   - ID adalah string panjang (32 karakter)
   - Format: huruf dan angka

### Step 3: Update wrangler.toml dengan ID

**Via GitHub Web Editor:**

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin/blob/main/api/wrangler.toml
2. **Klik icon pensil** (Edit this file) di kanan atas
3. **Cari baris**:
   ```toml
   [[kv_namespaces]]
   binding = "API_CACHE"
   id = "YOUR_KV_NAMESPACE_ID"
   ```
4. **Ganti** `YOUR_KV_NAMESPACE_ID` dengan ID yang Anda copy
   
   **Sebelum:**
   ```toml
   id = "YOUR_KV_NAMESPACE_ID"
   ```
   
   **Sesudah:**
   ```toml
   id = "abc123def456789..."
   ```

5. **Scroll ke bawah**
6. **Commit message**: `config: add KV namespace ID`
7. **Klik**: "Commit changes"

---

## 🚀 Setelah Update

Setelah commit, **Deploy API workflow akan otomatis jalan** dan seharusnya **SUCCESS** ✅

Check di: https://github.com/ctrxm/ctrxl-dracin/actions

---

## 🎯 Visual Guide

### Screenshot Step 2 (Copy ID):

Anda akan lihat output seperti ini di logs:

```
Run cd api
  cd api
  wrangler kv:namespace create API_CACHE
  shell: /usr/bin/bash -e {0}
  env:
    CLOUDFLARE_API_TOKEN: ***
    CLOUDFLARE_ACCOUNT_ID: ***

 ⛅️ wrangler 3.114.17
-----------------------------------------------

🌀 Creating namespace with title "ctrxl-dracin-api-API_CACHE"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "API_CACHE", id = "1234567890abcdef1234567890abcdef" }
                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                  COPY THIS ID!
```

### Screenshot Step 3 (Edit File):

File `api/wrangler.toml` akan terlihat seperti ini:

```toml
name = "ctrxl-dracin-api"
main = "src/index.ts"
compatibility_date = "2026-01-30"

[[kv_namespaces]]
binding = "API_CACHE"
id = "YOUR_KV_NAMESPACE_ID"  ← GANTI INI!
```

Setelah edit:

```toml
name = "ctrxl-dracin-api"
main = "src/index.ts"
compatibility_date = "2026-01-30"

[[kv_namespaces]]
binding = "API_CACHE"
id = "1234567890abcdef1234567890abcdef"  ← ID YANG BENAR!
```

---

## 🆘 Troubleshooting

### Setup KV Namespace Workflow Gagal

**Problem**: Workflow error saat create namespace

**Solution**:
1. Check GitHub Secrets sudah benar:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. Verify API token punya permission "Workers KV Storage → Edit"
3. Re-run workflow

### Tidak Menemukan ID di Logs

**Problem**: Logs tidak menampilkan ID

**Solution**:
1. Expand step "Create KV Namespace"
2. Scroll ke bawah sampai ketemu output wrangler
3. Cari baris yang ada `{ binding = "API_CACHE", id = "..." }`

### Deploy Masih Error Setelah Update

**Problem**: Deploy tetap gagal dengan error yang sama

**Solution**:
1. Verify file `api/wrangler.toml` sudah ter-update di GitHub
2. Check ID tidak ada typo
3. ID harus 32 karakter (huruf + angka)
4. Re-run Deploy API workflow

---

## 💡 Tips

- **Save ID** di tempat aman (Notes, Notepad) untuk referensi
- **Double check** ID sebelum commit (no typo!)
- **Wait** 1-2 menit setelah commit untuk auto-deploy
- **Monitor** di Actions tab untuk verify success

---

## 📞 Next Steps

Setelah deploy success:

1. **Get API URL** dari Cloudflare Dashboard
2. **Create `.env`** file dengan API URL
3. **Test admin panel**: `https://yourdomain.com/admin`
4. **Enjoy!** 🎉

---

**Need help?** Screenshot error dan kirim ke saya! 🚀
