# 🎬 CTRXL DRACIN - Neo-Noir Cinema

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/?to=/:account/pages/new/connect-github)

**Platform streaming Drama China premium** dengan desain sinematik neo-noir yang elegan. Pengalaman menonton tanpa lag dengan optimasi maksimal!

---

## ✨ Features

### 🎥 Video Player
- **Zero Lag Playback** - Hardware acceleration, GPU rendering
- **Auto Next Episode** - Seamless binge-watching
- **Progress Tracking** - Resume dari terakhir ditonton
- **Smart Buffering** - Adaptive buffer management

### 🎨 Design
- **Neo-Noir Cinema** aesthetic
- **Dark Mode** native
- **Film Grain Effect** untuk cinematic feel
- **Smooth Animations** dengan Framer Motion
- **Responsive** untuk semua device

### 📱 User Experience
- **Search & Discovery** - Trending, latest, for you
- **Bookmarks** - Save drama favorit
- **Watch History** - Track progress otomatis
- **Episode Management** - Easy navigation

---

## 🚀 Quick Deploy (5 Menit!)

### Step 1: Fork Repository

Fork repository ini ke akun GitHub Anda.

### Step 2: Deploy ke Cloudflare Pages

1. **Login** ke [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. **Create a project** → Connect to Git
3. **Pilih repository**: `ctrxl-dracin`
4. **Build settings**:
   
   | Setting | Value |
   |---------|-------|
   | **Framework preset** | `Vite` |
   | **Build command** | `pnpm run build` |
   | **Build output directory** | `dist/public` |

5. **Save and Deploy** - Done! 🎉

Website akan live di: `https://your-project.pages.dev`

### ⚠️ Penting

**JANGAN** tambahkan deploy command di settings. Cloudflare Pages otomatis handle deployment setelah build.

---

## 🛠️ Local Development

### Prerequisites

- Node.js 20+
- pnpm (recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/ctrxm/ctrxl-dracin.git
cd ctrxl-dracin

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Development server: http://localhost:3000

---

## 📁 Project Structure

```
ctrxl-dracin/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities & API
│   │   ├── hooks/         # Custom React hooks
│   │   └── contexts/      # React contexts
│   └── public/            # Static assets
│       ├── _headers       # Cloudflare headers config
│       ├── _redirects     # SPA routing config
│       └── sw.js          # Service Worker
├── server/                # Backend (optional)
├── wrangler.toml          # Cloudflare config
└── vite.config.ts         # Vite config
```

---

## 🎯 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Wouter** - Routing
- **shadcn/ui** - UI components

### API & Hosting
- **Sansekai API** - Drama data source
- **Cloudflare Pages** - Hosting & CDN
- **Service Worker** - Caching strategy

---

## 🎨 Video Player Optimization

### Problem Solved
Video lag dan skip setiap 1-3 detik ❌

### Solutions Implemented
1. **Minimal Re-renders** - Refs instead of state ✅
2. **Hardware Acceleration** - CSS GPU rendering ✅
3. **Throttled Updates** - Reduced overhead ✅
4. **Optimized Event Listeners** - Only essential ✅
5. **Service Worker** - Smart caching ✅

### Result
Smooth 60fps playback, zero lag! 🎉

---

## 🔧 Configuration

### No Configuration Needed!

Semua sudah dikonfigurasi otomatis. Langsung deploy dan jalan!

### Optional: Custom Domain

1. Buka project di Cloudflare Pages
2. Tab **"Custom domains"**
3. **"Set up a custom domain"**
4. Ikuti instruksi

---

## 📊 Performance

### Target Metrics
- **Lighthouse Performance**: 95+
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Video Buffering**: < 1s
- **Frame Rate**: 60fps stable

### Optimization Features
- **Edge Caching** - Cloudflare CDN
- **Code Splitting** - Lazy loading
- **Image Optimization** - WebP format
- **Service Worker** - Offline support
- **Hardware Acceleration** - GPU rendering

---

## 🚨 Troubleshooting

### Build Gagal di Cloudflare

**Solution**:
1. Check build settings: Framework = Vite
2. Verify build command: `pnpm run build`
3. Check output dir: `dist/public`
4. Pastikan tidak ada deploy command

### Video Tidak Play

**Solution**:
1. Clear cache: Ctrl+Shift+R
2. Check browser: Gunakan Chrome/Edge
3. Disable extensions: Ad blocker bisa interfere
4. Check console untuk error

### Deployment Error

**Solution**:
1. Pastikan `pnpm-lock.yaml` ter-commit
2. Check environment variables (jika ada)
3. Retry deployment

---

## 📚 Dokumentasi Lengkap

- **[FIX_LAG_DETAILS.md](./FIX_LAG_DETAILS.md)** - Technical details optimasi video
- **[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)** - Deployment troubleshooting
- **[PERUBAHAN_OPTIMASI.md](./PERUBAHAN_OPTIMASI.md)** - Changelog optimasi

---

## 📝 Changelog

### v2.0.0 (Latest) - Simplified ✨
- ✅ Removed complex API backend
- ✅ Direct API integration
- ✅ No GitHub Actions needed
- ✅ No secrets configuration
- ✅ Easier deployment
- ✅ Same great features!

### v1.0.0 - Initial Release
- ✅ Video player optimization
- ✅ Neo-Noir Cinema design
- ✅ Search & bookmarks
- ✅ Responsive design

---

## 🤝 Contributing

Contributions welcome! 

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

MIT License - free for personal or commercial use!

---

## 🙏 Credits

- **API Provider**: [Sansekai](https://api.sansekai.my.id)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Icons**: [Lucide Icons](https://lucide.dev)
- **Design Inspiration**: Neo-Noir Cinema aesthetic

---

## 📞 Support

Ada pertanyaan atau masalah?
1. Check **Troubleshooting** section
2. Open issue di GitHub
3. Check dokumentasi lengkap

---

## 🎉 Enjoy!

**CTRXL DRACIN** - Premium Chinese Drama Streaming Platform

Made with ❤️ for drama lovers

---

**Repository**: https://github.com/ctrxm/ctrxl-dracin

**Deploy Now**: [![Deploy](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/?to=/:account/pages/new/connect-github)
