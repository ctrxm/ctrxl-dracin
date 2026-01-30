# Desain Sistem CTRXL DRACIN v3: Corporate Cinematic Excellence

## 1. Filosofi Desain

**Visi:** Mentransformasi CTRXL DRACIN dari platform streaming bergaya *neo-noir* menjadi sebuah layanan premium dengan identitas **corporate yang kuat, profesional, dan berteknologi tinggi**. Desain baru ini memancarkan **kepercayaan, keunggulan, dan inovasi**, setara dengan platform enterprise kelas atas.

**Prinsip Utama:**

| Prinsip | Deskripsi |
| :--- | :--- |
| **Clarity over Clutter** | Setiap elemen memiliki tujuan yang jelas. Prioritaskan informasi dan fungsionalitas. |
| **Precision & Order** | Layout berbasis grid yang matematis, menciptakan harmoni dan keteraturan visual. |
| **Confident & Bold** | Tipografi yang kuat dan warna kontras tinggi untuk menunjukkan kepercayaan diri dan otoritas. |
| **Subtle Sophistication** | Interaksi mikro dan animasi yang halus untuk memberikan pengalaman yang elegan dan premium. |
| **Data as a Narrative** | Menyajikan data (seperti rating, tren) sebagai bagian dari cerita, bukan sekadar angka. |

## 2. Palet Warna: Executive Suite

Palet warna ini dirancang untuk menciptakan nuansa yang profesional, modern, dan mewah. Penggunaan warna gelap yang dominan dengan aksen cerah menonjolkan kesan teknologi dan eksklusivitas.

| Peran | Warna | Hex | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Primary Background** | Deep Navy | `#0A1628` | Latar belakang utama, memberikan nuansa corporate yang dalam. |
| **Card Background** | Midnight Blue | `#111C33` | Latar belakang untuk kartu, panel, dan elemen sekunder. |
| **Primary Text** | Cool White | `#F8FAFC` | Teks utama, judul, dan elemen penting lainnya. |
| **Secondary Text** | Platinum Silver | `#E5E7EB` | Teks sekunder, metadata, dan deskripsi. |
| **Border / Separator** | Slate Gray | `#334155` | Garis pemisah, border kartu, dan elemen struktural. |
| **Accent 1 (Primary)** | Electric Cyan | `#06B6D4` | Tombol utama, link aktif, highlight, dan elemen interaktif. |
| **Accent 2 (Secondary)**| Royal Purple | `#7C3AED` | Ikon, tag khusus, dan elemen visual sekunder. |
| **Accent 3 (Highlight)**| Amber Gold | `#F59E0B` | Rating bintang, badge premium, dan highlight pencapaian. |
| **Success** | Emerald Green | `#10B981` | Notifikasi sukses, status online. |
| **Error** | Crimson Red | `#EF4444` | Notifikasi error, peringatan. |

## 3. Tipografi: Executive Hierarchy

Menggunakan font `Inter` untuk keterbacaan yang superior di berbagai resolusi dan `JetBrains Mono` untuk elemen yang membutuhkan sentuhan teknis.

| Peran | Font | Weight | Size (Desktop / Mobile) | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Display (Hero)** | Inter | Extra Bold | 64px / 48px | -2% |
| **Heading 1** | Inter | Bold | 48px / 36px | -1.5% |
| **Heading 2** | Inter | Bold | 36px / 28px | -1% |
| **Heading 3** | Inter | SemiBold | 24px / 20px | Normal |
| **Body** | Inter | Regular | 16px / 16px | Normal |
| **Label / Caption** | Inter | Medium | 14px / 14px | +1% |
| **Button** | Inter | SemiBold | 16px / 16px | +2% |
| **Code / Data** | JetBrains Mono | Regular | 14px / 14px | Normal |

## 4. Layout & Spasi

Sistem spasi berbasis **kelipatan 4px** untuk konsistensi vertikal dan horizontal. Layout utama menggunakan grid 12 kolom dengan *gutter* yang lapang untuk memberikan ruang bernapas.

- **Base Unit:** `1rem` = `16px`
- **Key Spacings:**
  - `xs`: 4px (0.25rem)
  - `sm`: 8px (0.5rem)
  - `md`: 16px (1rem)
  - `lg`: 24px (1.5rem)
  - `xl`: 32px (2rem)
  - `2xl`: 48px (3rem)
  - `3xl`: 64px (4rem)
- **Container Width:** `1440px` (max)
- **Radius Sudut:**
  - **Small (Input, Badge):** 4px
  - **Medium (Card, Button):** 8px
  - **Large (Modal):** 16px

## 5. Komponen Inti

### Tombol (Button)
- **Primary:** Latar `Electric Cyan`, teks `Cool White`, dengan *glow effect* halus saat di-hover.
- **Secondary:** Latar transparan, border `Slate Gray`, teks `Platinum Silver`. Saat di-hover, border berubah menjadi `Electric Cyan`.
- **Destructive:** Latar transparan, teks `Crimson Red`.

### Kartu (Card)
- **Drama Card:** Latar `Midnight Blue`, border `Slate Gray` (1px). Saat di-hover, border berubah menjadi `Electric Cyan` dan kartu sedikit terangkat (`translateY(-4px)`).
- **Info Card:** Menggunakan efek *frosted glass* (Liquid Glass) dengan latar `rgba(17, 28, 51, 0.6)` dan `backdrop-filter: blur(12px)`.

### Input & Form
- Latar `Deep Navy`, border `Slate Gray`.
- Saat `focus`, border berubah menjadi `Electric Cyan` dengan *ring effect*.
- Label menggunakan `Platinum Silver`.

## 6. Animasi & Interaksi

Animasi harus terasa **halus, cepat, dan profesional**. Hindari animasi yang berlebihan atau kekanak-kanakan.

- **Timing Function:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Durasi Default:** `300ms`
- **Efek Hover:** Subtle lift, glow, atau perubahan warna.
- **Transisi Halaman:** Fade out-in yang cepat (`200ms`).
- **Loading State:** Skeleton shimmer dengan gradien `Slate Gray` ke `Midnight Blue`.
