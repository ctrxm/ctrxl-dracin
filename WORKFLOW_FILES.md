# 📝 GitHub Actions Workflow Files

Karena permission issue, workflow files perlu dibuat manual via GitHub web interface.

## 🔧 Cara Membuat Workflow Files

### Step 1: Create Directory

1. Buka repository: https://github.com/ctrxm/ctrxl-dracin
2. Klik **Add file** → **Create new file**
3. Nama file: `.github/workflows/deploy-api.yml`
4. GitHub akan otomatis create directory

### Step 2: Deploy API Workflow

**File**: `.github/workflows/deploy-api.yml`

Copy paste code berikut:

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

**Commit message**: `ci: add API deployment workflow`

### Step 3: Setup KV Workflow

**File**: `.github/workflows/setup-kv.yml`

1. Klik **Add file** → **Create new file**
2. Nama file: `.github/workflows/setup-kv.yml`
3. Copy paste code berikut:

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

**Commit message**: `ci: add KV namespace setup workflow`

## ✅ Verify

Setelah create kedua files:

1. Buka: https://github.com/ctrxm/ctrxl-dracin/actions
2. Anda seharusnya lihat 2 workflows:
   - **Deploy API to Cloudflare Workers**
   - **Setup KV Namespace (One-time)**

## 🚀 Next Steps

Setelah workflows dibuat, lanjutkan dengan [QUICK_START.md](./QUICK_START.md) untuk setup deployment!

## 💡 Alternative: Local Files

Jika Anda punya akses local, workflow files sudah ada di:
- `.github/workflows/deploy-api.yml`
- `.github/workflows/setup-kv.yml`

Anda bisa commit manual dari local machine.
