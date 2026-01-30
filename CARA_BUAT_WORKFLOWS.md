# 📝 Cara Membuat GitHub Actions Workflows (Step-by-Step)

## 🎯 Tujuan

Membuat 2 workflow files untuk auto-deploy API ke Cloudflare Workers:
1. `deploy-api.yml` - Auto-deploy saat push
2. `setup-kv.yml` - Setup KV namespace (one-time)

## ⏱️ Waktu: 5 menit

---

## 📋 Step 1: Edit File main.yml yang Sudah Ada

### 1.1 Buka File Editor

1. **Login ke GitHub**: https://github.com/login
2. **Buka repository**: https://github.com/ctrxm/ctrxl-dracin
3. **Klik folder**: `.github/workflows`
4. **Klik file**: `main.yml`
5. **Klik icon pensil** (Edit this file) di kanan atas

### 1.2 Ganti Isi File

**HAPUS SEMUA** isi file `main.yml` yang ada, lalu **PASTE** code berikut:

```yaml
name: Deploy API to Cloudflare Workers

on:
  push:
    branches:
      - main
    paths:
      - 'api/**'
      - '.github/workflows/deploy-api.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy API
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd api
          npm install

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: 'api'
          command: deploy
          secrets: |
            ADMIN_PASSWORD
        env:
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
```

### 1.3 Rename File

1. **Scroll ke atas** ke bagian "Edit file"
2. **Ubah nama file** dari `main.yml` menjadi: `deploy-api.yml`
3. **Commit message**: `ci: add API deployment workflow`
4. **Klik**: "Commit changes"

---

## 📋 Step 2: Buat File setup-kv.yml

### 2.1 Create New File

1. **Kembali ke folder**: `.github/workflows`
2. **Klik**: "Add file" → "Create new file"
3. **Nama file**: `setup-kv.yml`

### 2.2 Paste Code

**PASTE** code berikut ke dalam file:

```yaml
name: Setup KV Namespace (One-time)

# This workflow only runs manually to create KV namespace
on:
  workflow_dispatch:

jobs:
  setup:
    runs-on: ubuntu-latest
    name: Create KV Namespace
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Wrangler
        run: npm install -g wrangler

      - name: Create KV Namespace
        run: |
          cd api
          wrangler kv:namespace create API_CACHE
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Instructions
        run: |
          echo "✅ KV Namespace created!"
          echo ""
          echo "📝 Next steps:"
          echo "1. Copy the KV namespace ID from the output above"
          echo "2. Update api/wrangler.toml with the ID"
          echo "3. Commit and push the changes"
          echo ""
          echo "Example:"
          echo "[[kv_namespaces]]"
          echo "binding = \"API_CACHE\""
          echo "id = \"YOUR_KV_NAMESPACE_ID_HERE\""
```

### 2.3 Commit File

1. **Commit message**: `ci: add KV namespace setup workflow`
2. **Klik**: "Commit changes"

---

## ✅ Verifikasi

### Check Workflows Berhasil Dibuat

1. **Buka**: https://github.com/ctrxm/ctrxl-dracin/actions
2. **Seharusnya muncul 2 workflows**:
   - ✅ **Deploy API to Cloudflare Workers**
   - ✅ **Setup KV Namespace (One-time)**

### Screenshot

Anda seharusnya melihat seperti ini:

```
Actions

All workflows

🔄 Deploy API to Cloudflare Workers
⚙️ Setup KV Namespace (One-time)
```

---

## 🎉 Selesai!

Workflows sudah siap! Sekarang lanjut ke **QUICK_START.md** untuk:
1. Setup GitHub Secrets
2. Run Setup KV Namespace workflow
3. Deploy API

---

## 🆘 Troubleshooting

### File main.yml Tidak Bisa Diedit

**Solusi**: 
1. Delete file `main.yml`
2. Create new file `deploy-api.yml` dengan code di atas

### Tidak Ada Tombol "Edit"

**Solusi**:
1. Pastikan Anda sudah login
2. Pastikan ini repository Anda sendiri (bukan fork)
3. Refresh halaman

### Workflows Tidak Muncul di Actions

**Solusi**:
1. Wait 1-2 menit
2. Refresh halaman Actions
3. Check apakah files ada di `.github/workflows/`

---

## 📞 Next Steps

Setelah workflows dibuat:

1. **Setup GitHub Secrets** (lihat QUICK_START.md)
2. **Run Setup KV Namespace**
3. **Deploy API**
4. **Test & Enjoy!** 🚀

---

**Butuh bantuan?** Lihat dokumentasi lengkap di:
- [QUICK_START.md](./QUICK_START.md)
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
