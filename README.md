# CTRXL DRACIN - Neo-Noir Cinema

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/?to=/:account/pages/new/connect-github)

**CTRXL DRACIN** adalah platform streaming Drama China premium yang dirancang dengan estetika sinematik neo-noir. Aplikasi ini memberikan pengalaman menonton yang bebas gangguan dengan fokus pada kinerja dan pengalaman pengguna yang optimal.

Proyek ini telah dioptimalkan untuk mengatasi masalah pemutaran video seperti lagging dan skipping, memastikan pengalaman streaming yang lancar bagi semua pengguna.

## ✨ Fitur

### 🎥 Video Player
- **UI Sinematik**: Antarmuka gelap dan imersif yang terinspirasi oleh sinema neo-noir
- **Zero Lag Playback**: Hardware acceleration, optimasi rendering GPU
- **Auto Next Episode**: Seamless binge-watching experience
- **Progress Tracking**: Resume dari terakhir ditonton

### 🔧 Custom API Backend (NEW!)
- **Multiple Sources**: Aggregate dari Sansekai & Dramabos
- **Automatic Fallback**: Redundancy jika satu API down
- **Edge Caching**: Ultra-fast response via Cloudflare KV
- **Admin Panel**: Monitor dan manage API sources
- **GitHub Actions**: Auto-deploy tanpa PC/VPS

### 📱 User Experience
- **Streaming Video yang Dioptimalkan**:
    - **Buffering Adaptif**: Mengelola buffering video secara cerdas untuk mencegah gangguan
    - **Caching Service Worker**: Menyimpan segmen video dan respons API dalam cache untuk waktu muat yang lebih cepat dan kemampuan pemutaran offline
    - **Preloading**: Memuat episode mendatang untuk transisi yang mulus
    - **Pemulihan Kesalahan**: Pulih secara otomatis dari kesalahan jaringan umum
- **Manajemen Episode**: Beralih antar episode dengan mudah menggunakan laci khusus
- **Riwayat Tontonan**: Mengingat kemajuan Anda dan episode terakhir yang ditonton untuk setiap drama
- **Desain Responsif**: Kontrol yang mengutamakan seluler dan tata letak yang sepenuhnya responsif
- **Pencarian & Penemuan**: Temukan drama melalui pencarian, trending, terbaru, dan bagian "untuk Anda"

## 🚀 Tumpukan Teknologi

- **Frontend**: [React](https://react.dev/) 19, [Vite](https://vitejs.dev/) 7, [TypeScript](https://www.typescriptlang.org/) 5.6
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/)
- **Routing**: [wouter](https://github.com/molefrog/wouter) - Lightweight React router
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Manajemen State**: React Hooks & Context API
- **API Backend**: Cloudflare Workers (custom aggregator)
- **API Sources**: Sansekai, Dramabos (multiple sources dengan fallback)
- **Caching**: Cloudflare KV
- **CI/CD**: GitHub Actions

## 🛠️ Pengembangan Lokal

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

### Prasyarat

- Node.js 22.x atau lebih tinggi
- pnpm 10.x atau lebih tinggi

### Langkah-langkah

1.  **Clone repositori:**
    ```bash
    git clone https://github.com/ctrxm/ctrxl-dracin.git
    cd ctrxl-dracin
    ```

2.  **Instal dependensi menggunakan pnpm:**
    ```bash
    pnpm install
    ```

3.  **Mulai server pengembangan:**
    ```bash
    pnpm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:3000`.

4.  **Build untuk produksi:**
    ```bash
    pnpm run build
    ```
    Output akan berada di direktori `dist/public/`.

## 🚀 Quick Start Deployment

### Deploy API Backend (10 menit)

**Tanpa PC/VPS - Hanya dari browser!**

Ikuti panduan lengkap: **[QUICK_START.md](./QUICK_START.md)**

Atau lihat dokumentasi detail: **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)**

### Deploy Frontend (Cloudflare Pages)

## ☁️ Deployment di Cloudflare Pages

Proyek ini dikonfigurasi untuk kemudahan deployment di [Cloudflare Pages](https://pages.cloudflare.com/).

### Metode 1: Deployment via Dashboard (Recommended)

1. **Login ke Cloudflare Dashboard**
   - Buka [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Klik **"Create a project"**

2. **Connect ke Git Repository**
   - Pilih **"Connect to Git"**
   - Pilih repository: `ctrxm/ctrxl-dracin`
   - Klik **"Begin setup"**

3. **Konfigurasi Build Settings**
   
   Gunakan pengaturan berikut:

   | Setting | Value |
   |---------|-------|
   | **Project name** | `ctrxl-dracin` (atau nama pilihan Anda) |
   | **Production branch** | `main` |
   | **Framework preset** | `None` (atau `Vite`) |
   | **Build command** | `pnpm run build` |
   | **Build output directory** | `dist/public` |
   | **Root directory** | `/` (default) |

4. **Environment Variables** (Optional)
   
   Jika Anda ingin menggunakan pnpm versi spesifik:
   
   - **Variable name**: `PNPM_VERSION`
   - **Value**: `10.4.1`

5. **Deploy**
   - Klik **"Save and Deploy"**
   - Tunggu proses build selesai (biasanya 2-3 menit)
   - Setelah selesai, aplikasi Anda akan live!

### Metode 2: Deployment via Wrangler CLI

Jika Anda ingin deploy dari command line:

```bash
# Install wrangler globally (jika belum)
npm install -g wrangler

# Login ke Cloudflare
wrangler login

# Build project
pnpm run build

# Deploy ke Cloudflare Pages
wrangler pages deploy dist/public --project-name=ctrxl-dracin
```

### ⚠️ Catatan Penting untuk Deployment

**JANGAN** menambahkan custom deploy command di Cloudflare Pages settings. Cloudflare Pages akan otomatis menjalankan build command yang Anda tentukan.

Jika Anda melihat error seperti:
```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

Ini berarti ada **deploy command** yang tidak seharusnya ada. Pastikan di **Build settings** Anda:
- **Deploy command**: Kosongkan (leave empty)
- Atau hapus baris `npx wrangler deploy` jika ada

### Automatic Deployments

Setelah konfigurasi awal, Cloudflare Pages akan otomatis:
- ✅ Build dan deploy setiap push ke branch `main`
- ✅ Membuat preview deployment untuk setiap pull request
- ✅ Rollback otomatis jika build gagal

### Custom Domain (Optional)

Untuk menggunakan custom domain:
1. Buka project Anda di Cloudflare Pages
2. Klik tab **"Custom domains"**
3. Klik **"Set up a custom domain"**
4. Ikuti instruksi untuk menambahkan domain Anda

## 🎛️ Admin Panel

Akses admin panel untuk manage API sources:

1. Buka: `https://yourdomain.com/admin`
2. Login dengan password yang di-set di GitHub Secrets
3. Monitor API sources, view stats, clear cache

**Features:**
- View all API sources status
- Monitor enabled/disabled sources
- Check system statistics
- Clear API cache
- Real-time monitoring

## 📚 Dokumentasi

- **[QUICK_START.md](./QUICK_START.md)** - Deploy API dalam 10 menit
- **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - Setup GitHub Actions auto-deploy
- **[API_ADMIN_GUIDE.md](./API_ADMIN_GUIDE.md)** - Panduan lengkap API & Admin Panel
- **[FIX_LAG_DETAILS.md](./FIX_LAG_DETAILS.md)** - Technical details optimasi video
- **[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)** - Deployment troubleshooting

## 📁 Struktur Project

```
ctrxl-dracin/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   │   ├── _headers       # Cloudflare Pages headers config
│   │   ├── _redirects     # SPA routing config
│   │   ├── sw.js          # Service Worker for caching
│   │   └── manifest.json  # PWA manifest
│   └── src/               # Source code
│       ├── components/    # React components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utilities and API
│       └── pages/         # Page components
├── server/                # Server (for local dev only)
├── wrangler.toml          # Cloudflare configuration
├── package.json           # Dependencies
└── vite.config.ts         # Vite configuration
```

## 🎯 Optimasi Video

Aplikasi ini menggunakan beberapa teknik untuk memastikan video tidak lag:

### 1. Service Worker Caching
- Menyimpan video yang sudah ditonton (max 100MB)
- Mendukung range requests untuk seeking
- Otomatis cleanup ketika cache penuh

### 2. Adaptive Buffering
- Memonitor buffer video secara real-time
- Otomatis adjust berdasarkan kondisi jaringan
- Recovery otomatis dari network errors

### 3. Preloading
- Memuat episode berikutnya di background
- Transisi antar episode lebih smooth
- Mengurangi waktu tunggu

### 4. Video Element Optimization
- `preload="auto"` untuk preload penuh
- `crossOrigin="anonymous"` untuk CORS caching
- `playsInline` untuk mobile playback

## 🔧 Troubleshooting

### Build Gagal di Cloudflare

**Problem**: Build error atau timeout

**Solution**:
1. Pastikan `pnpm-lock.yaml` sudah di-commit
2. Check environment variables sudah benar
3. Pastikan tidak ada deploy command yang tidak perlu

### Video Tidak Muncul

**Problem**: Video player hitam atau error

**Solution**:
1. Check browser console untuk error
2. Pastikan API `api.sansekai.my.id` accessible
3. Clear browser cache dan reload

### Service Worker Tidak Bekerja

**Problem**: Caching tidak berfungsi

**Solution**:
1. Pastikan menggunakan HTTPS (atau localhost)
2. Check DevTools → Application → Service Workers
3. Unregister dan register ulang service worker

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🙏 Credits

- API: [Sansekai API](https://api.sansekai.my.id)
- UI Components: [shadcn/ui](https://ui.shadcn.com)
- Icons: [Lucide Icons](https://lucide.dev)

---

**Dibuat dengan ❤️ untuk penggemar drama China**
