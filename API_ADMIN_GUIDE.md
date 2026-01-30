# 🔧 API & Admin Panel Guide

## 📋 Overview

CTRXL DRACIN sekarang memiliki **custom API backend** yang bisa aggregate data dari multiple sources dengan automatic fallback. Anda juga mendapatkan **Admin Panel** untuk monitoring dan management.

### Fitur

- ✅ **Multiple API Sources**: Sansekai, Dramabos (Dramabox, ReelShort, MeloShort)
- ✅ **Automatic Fallback**: Jika satu API down, otomatis switch ke backup
- ✅ **Caching**: Response di-cache untuk performa optimal
- ✅ **Admin Panel**: Monitor status dan manage sources
- ✅ **Cloudflare Workers**: Deploy di edge, ultra-fast response

## 🏗️ Arsitektur

```
Frontend (Cloudflare Pages)
    ↓
Custom API Backend (Cloudflare Workers)
    ↓
Multiple Sources (Priority-based fallback):
    1. Sansekai Dramabox (Priority 1)
    2. Dramabos Dramabox (Priority 2)
    3. Dramabos ReelShort (Priority 3 - disabled by default)
    4. Dramabos MeloShort (Priority 4 - disabled by default)
```

## 🚀 Deployment API Backend

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Login ke Cloudflare

```bash
npx wrangler login
```

### 3. Create KV Namespace

```bash
npx wrangler kv:namespace create API_CACHE
```

Copy KV namespace ID yang muncul, lalu update `api/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "API_CACHE"
id = "YOUR_KV_NAMESPACE_ID_HERE"  # Paste ID di sini
```

### 4. Set Admin Password

```bash
npx wrangler secret put ADMIN_PASSWORD
# Masukkan password yang aman (minimal 12 karakter)
```

### 5. Deploy

```bash
npx wrangler deploy
```

Setelah deploy, Anda akan mendapat URL seperti:
```
https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
```

## ⚙️ Konfigurasi Frontend

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Edit `.env`

```env
# Enable custom API
VITE_USE_CUSTOM_API=true

# Set your API URL
VITE_API_URL=https://ctrxl-dracin-api.YOUR_SUBDOMAIN.workers.dev
```

### 3. Rebuild Frontend

```bash
pnpm run build
```

Cloudflare Pages akan otomatis rebuild jika Anda push ke GitHub.

## 🎛️ Admin Panel

### Akses Admin Panel

1. Buka: `https://yourdomain.com/admin`
2. Masukkan password yang Anda set di step deployment
3. Password akan disimpan di localStorage untuk akses berikutnya

### Fitur Admin Panel

#### 1. **Dashboard**
- Total API sources
- Enabled sources count
- Last update timestamp

#### 2. **API Sources Management**
- View all configured sources
- See status (enabled/disabled)
- Check priority order
- View base URLs

#### 3. **Cache Management**
- Clear API cache
- View cache statistics

#### 4. **Monitoring**
- Real-time status check
- Refresh button untuk update data

## 📡 API Endpoints

### Public Endpoints (No Auth Required)

```
GET /api/trending
GET /api/latest
GET /api/foryou
GET /api/search?query=<query>
GET /api/detail?bookId=<bookId>
GET /api/allepisode?bookId=<bookId>
GET /api/randomdrama
GET /api/dubindo
GET /api/populersearch
```

### Admin Endpoints (Auth Required)

```
GET /admin/sources
GET /admin/stats
GET /admin/cache/clear
```

**Authentication**: Add header `Authorization: Bearer YOUR_PASSWORD`

## 🔄 Cara Kerja Fallback

Ketika request masuk:

1. **Check Cache**: Jika ada di cache, return immediately
2. **Try Priority 1**: Sansekai Dramabox
   - Jika success → Cache & return
   - Jika fail → Try next
3. **Try Priority 2**: Dramabos Dramabox
   - Jika success → Cache & return
   - Jika fail → Try next
4. **Try Priority 3+**: Additional sources (if enabled)
5. **All Failed**: Return error 503

## 🎨 Customization

### Menambah API Source Baru

Edit `api/src/index.ts`:

```typescript
const API_SOURCES = {
  // ... existing sources
  
  your_new_source: {
    name: 'Your Source Name',
    baseUrl: 'https://api.yoursource.com',
    enabled: true,
    priority: 5,
  },
};
```

Kemudian deploy ulang:

```bash
cd api
npx wrangler deploy
```

### Mengubah Priority

Edit priority di `API_SOURCES` dan deploy ulang. Priority lebih kecil = lebih tinggi (1 = highest).

### Enable/Disable Source

Set `enabled: true` atau `enabled: false` di konfigurasi source.

## 📊 Monitoring

### View Logs

```bash
cd api
npx wrangler tail
```

Ini akan show real-time logs dari API worker.

### Check Performance

Buka Cloudflare Dashboard:
1. Workers & Pages
2. Pilih `ctrxl-dracin-api`
3. Tab "Metrics"

Anda bisa lihat:
- Request count
- Error rate
- Latency
- Cache hit rate

## 🔐 Security

### Admin Password

- **JANGAN** commit password ke Git
- Gunakan password yang kuat (minimal 12 karakter)
- Password disimpan sebagai Cloudflare secret (encrypted)

### API Rate Limiting

Cloudflare Workers otomatis handle rate limiting:
- Free tier: 100,000 requests/day
- Paid tier: Unlimited

### CORS

API sudah dikonfigurasi dengan CORS headers:
```
Access-Control-Allow-Origin: *
```

Untuk production, Anda bisa restrict ke domain specific.

## 🐛 Troubleshooting

### API Returns 503

**Problem**: All sources failed

**Solution**:
1. Check apakah sources masih online
2. Check Cloudflare Worker logs: `npx wrangler tail`
3. Try disable/enable sources
4. Clear cache di admin panel

### Admin Panel: Invalid Password

**Problem**: Password tidak diterima

**Solution**:
1. Verify password di Cloudflare Dashboard → Workers → Settings → Variables
2. Re-set password: `npx wrangler secret put ADMIN_PASSWORD`
3. Clear localStorage di browser

### Frontend Tidak Connect ke API

**Problem**: Frontend masih pakai API lama

**Solution**:
1. Check `.env` file sudah benar
2. Rebuild: `pnpm run build`
3. Hard refresh browser: Ctrl+Shift+R
4. Check console untuk error

### Cache Tidak Clear

**Problem**: Data lama masih muncul

**Solution**:
1. Clear cache di admin panel
2. Wait 5-10 menit untuk cache expire
3. Atau clear browser cache

## 💡 Best Practices

### 1. **Use Custom API in Production**

```env
VITE_USE_CUSTOM_API=true
```

Ini memberikan:
- Automatic fallback
- Better caching
- Monitoring capability

### 2. **Monitor Regularly**

Check admin panel minimal 1x per hari untuk:
- Verify all sources healthy
- Check error logs
- Monitor cache hit rate

### 3. **Keep Sources Updated**

API sources bisa berubah. Join Telegram group dramabos.asia untuk update.

### 4. **Backup Configuration**

Simpan konfigurasi `api/src/index.ts` di tempat aman.

## 📞 Support

### Dramabos API Issues

- Telegram: Join group di dramabos.asia
- Website: https://dramabos.asia

### Cloudflare Workers Issues

- Docs: https://developers.cloudflare.com/workers/
- Community: https://community.cloudflare.com/

## 🎉 Selesai!

Sekarang Anda punya:
- ✅ Custom API backend dengan multiple sources
- ✅ Automatic fallback system
- ✅ Admin panel untuk monitoring
- ✅ Production-ready setup

Jika ada pertanyaan atau masalah, check troubleshooting section atau logs!

---

**Last Updated**: 2026-01-30
**Version**: 1.0.0
