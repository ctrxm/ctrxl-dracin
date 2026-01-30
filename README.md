# CTRXL DRACIN - Neo-Noir Cinema

[![Deploy to Cloudflare Pages](https://static.cloudflareinsights.com/pages/buttons/deploy-with-cloudflare-pages.svg)](https://dash.cloudflare.com/?to=/:account/pages/new/connect-github)

**CTRXL DRACIN** adalah platform streaming Drama China premium yang dirancang dengan estetika sinematik, neo-noir. Ini memberikan pengalaman menonton yang bebas gangguan dengan fokus pada kinerja dan pengalaman pengguna.

Proyek ini telah dioptimalkan untuk mengatasi masalah pemutaran video seperti lagging dan skipping, memastikan pengalaman streaming yang lancar bagi semua pengguna.

## ✨ Fitur

- **UI Sinematik**: Antarmuka gelap dan imersif yang terinspirasi oleh sinema neo-noir.
- **Streaming Video yang Dioptimalkan**:
    - **Buffering Adaptif**: Mengelola buffering video secara cerdas untuk mencegah gangguan.
    - **Caching Service Worker**: Menyimpan segmen video dan respons API dalam cache untuk waktu muat yang lebih cepat dan kemampuan pemutaran offline.
    - **Preloading**: Memuat episode mendatang untuk transisi yang mulus.
    - **Pemulihan Kesalahan**: Pulih secara otomatis dari kesalahan jaringan umum.
- **Manajemen Episode**: Beralih antar episode dengan mudah menggunakan laci khusus.
- **Riwayat Tontonan**: Mengingat kemajuan Anda dan episode terakhir yang ditonton untuk setiap drama.
- **Desain Responsif**: Kontrol yang mengutamakan seluler dan tata letak yang sepenuhnya responsif.
- **Pencarian & Penemuan**: Temukan drama melalui pencarian, trending, terbaru, dan bagian "untuk Anda".

## 🚀 Tumpukan Teknologi

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Routing**: [wouter](https://github.com/molefrog/wouter)
- **Manajemen State**: React Hooks & Context
- **Sumber API**: `api.sansekai.my.id`

## 🛠️ Pengembangan Lokal

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

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

## ☁️ Deployment di Cloudflare Pages

Proyek ini dikonfigurasi untuk kemudahan deployment di [Cloudflare Pages](https://pages.cloudflare.com/).

### Pengaturan Build & Deployment

Saat mengkonfigurasi proyek Anda di dasbor Cloudflare Pages, gunakan pengaturan berikut:

- **Framework preset**: `Vite`
- **Build command**: `pnpm run build`
- **Build output directory**: `dist/public`
- **Root directory**: `/`

### Variabel Lingkungan

Untuk memastikan `pnpm` digunakan selama proses build di Cloudflare, tambahkan variabel lingkungan berikut:

- **Variable name**: `NPM_VERSION`
- **Value**: `10.4.1` (atau versi pnpm yang Anda gunakan)

Setelah dikonfigurasi, Cloudflare Pages akan secara otomatis membangun dan men-deploy situs Anda setiap kali Anda melakukan push ke repositori GitHub Anda.
