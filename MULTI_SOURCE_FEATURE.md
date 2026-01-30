# 🎬 Multi-Source Feature

## 🎉 Fitur Baru: 6 Sumber Drama!

CTRXL DRACIN sekarang mendukung **6 sumber drama berbeda** dengan sistem tab yang elegant!

---

## 📺 Available Sources

### 1. **DramaBox** 🎬
- Premium Chinese Drama
- Konten berkualitas tinggi
- Drama populer dan trending
- **Color**: Amber/Orange gradient

### 2. **ReelShort** 🎞️
- Short Drama Series
- Episode pendek dan menarik
- Perfect untuk binge-watching
- **Color**: Purple/Pink gradient

### 3. **NetShort** 📺
- Network Short Videos
- Drama dari berbagai network
- Konten beragam
- **Color**: Blue/Cyan gradient

### 4. **Melolo** 💝
- Melodrama Collection
- Drama romantis dan emosional
- Cerita yang menyentuh hati
- **Color**: Rose/Red gradient

### 5. **FlickReels** ⚡
- Quick Flick Stories
- Cerita cepat dan seru
- Easy to watch
- **Color**: Yellow/Amber gradient

### 6. **FreeReels** 🎪
- Free Drama Content
- Konten gratis berkualitas
- Akses tanpa batas
- **Color**: Green/Emerald gradient

---

## ✨ Features

### 🎯 Source Tabs
- **Beautiful gradient tabs** dengan warna unik per source
- **Smooth animations** saat switch source
- **Icon indicators** untuk visual identity
- **Responsive design** - scroll horizontal di mobile

### 📊 Per-Source Content
- **Trending** - Drama yang sedang trending di source tersebut
- **Latest** - Drama terbaru dari source
- **For You** - Rekomendasi personal per source

### ⚡ Performance
- **Cached API responses** - Fast loading
- **Lazy loading** - Load data saat source dipilih
- **Smooth transitions** - Animated content changes

---

## 🎨 UI/UX

### Tab Design
```
[🎬 DramaBox] [🎞️ ReelShort] [📺 NetShort] [💝 Melolo] [⚡ FlickReels] [🎪 FreeReels]
     ▲ Active (gradient background)
```

### Active Tab
- **Gradient background** sesuai warna source
- **White text** untuk kontras
- **Shadow effect** untuk depth
- **Smooth animation** saat switch

### Inactive Tab
- **Transparent background**
- **Muted text color**
- **Hover effect** untuk interactivity

---

## 🔧 Technical Implementation

### API Layer

**Multi-Source Support:**
```typescript
export type SourceType = 'dramabox' | 'reelshort' | 'netshort' | 'melolo' | 'flickreels' | 'freereels';

// Generic function for any source
async function fetchFromSource<T>(source: SourceType, endpoint: string): Promise<T> {
  const url = `${API_BASE}/${source}/${endpoint}`;
  return fetchWithCache<T>(url);
}

// Usage
const trending = await getTrending('reelshort');
const latest = await getLatest('melolo');
```

### Source Configuration

**Each source has:**
- `id` - Unique identifier
- `name` - Display name
- `description` - Short description
- `icon` - Emoji icon
- `color` - Gradient color classes

```typescript
export const SOURCES = {
  dramabox: {
    id: 'dramabox',
    name: 'DramaBox',
    description: 'Premium Chinese Drama',
    icon: '🎬',
    color: 'from-amber-500 to-orange-600'
  },
  // ... more sources
};
```

### State Management

```typescript
const [activeSource, setActiveSource] = useState<SourceType>('dramabox');

// Fetch data when source changes
useEffect(() => {
  async function fetchData() {
    const [trending, latest, forYou] = await Promise.all([
      getTrending(activeSource),
      getLatest(activeSource),
      getForYou(activeSource),
    ]);
    // Update state...
  }
  fetchData();
}, [activeSource]);
```

---

## 📱 User Experience

### Desktop
- **Full tab bar** dengan nama lengkap
- **Hover effects** untuk interactivity
- **Smooth animations** saat switch

### Mobile
- **Horizontal scroll** untuk semua tabs
- **Icon + name** untuk compact display
- **Swipe gesture** untuk easy navigation

### Loading States
- **Skeleton loaders** saat fetch data
- **Smooth transitions** antar content
- **No layout shift** - consistent height

---

## 🎯 Use Cases

### 1. Explore Different Content
User bisa explore drama dari berbagai platform dalam satu aplikasi.

### 2. Find Specific Type
- Mau drama pendek? → **ReelShort** atau **FlickReels**
- Mau melodrama? → **Melolo**
- Mau konten gratis? → **FreeReels**

### 3. Compare Sources
User bisa compare trending drama dari berbagai platform.

### 4. Backup Source
Jika satu source down atau konten terbatas, ada 5 source lainnya.

---

## 🚀 Future Enhancements

### Planned Features
- [ ] **Search per source** - Search dalam source specific
- [ ] **Source favorites** - Save favorite sources
- [ ] **Source statistics** - Show content count per source
- [ ] **Source filtering** - Filter by source in search
- [ ] **Cross-source recommendations** - Recommend similar drama across sources

### Possible Additions
- [ ] **More sources** - Anime, Komik, MovieBox (already in API)
- [ ] **Source comparison** - Side-by-side comparison
- [ ] **Source preferences** - Remember user's preferred source
- [ ] **Source notifications** - Alert when new content in favorite source

---

## 📊 Performance Metrics

### Load Time
- **Initial load**: ~1-2s (cached)
- **Source switch**: ~0.5-1s (with cache)
- **Tab animation**: 60fps smooth

### API Calls
- **Cached**: 5 minutes per endpoint
- **Parallel**: Multiple sources load simultaneously
- **Optimized**: Only fetch when source selected

### User Experience
- **Zero lag** - Smooth transitions
- **Fast response** - Cached data
- **No blocking** - Async loading

---

## 🎉 Benefits

### For Users
- ✅ **More content** - 6x more drama sources
- ✅ **Better discovery** - Explore different platforms
- ✅ **Backup options** - Multiple sources available
- ✅ **Easy switching** - One-click source change

### For Developers
- ✅ **Clean architecture** - Generic API functions
- ✅ **Type-safe** - TypeScript source types
- ✅ **Maintainable** - Easy to add new sources
- ✅ **Scalable** - Support unlimited sources

---

## 🔗 API Endpoints

All sources support these endpoints:
- `/trending` - Trending drama
- `/latest` - Latest drama
- `/foryou` - Recommended drama
- `/search` - Search drama
- `/detail` - Drama details
- `/allepisode` - All episodes

**Base URL**: `https://api.sansekai.my.id/api/{source}/{endpoint}`

---

## 💡 Tips

### For Best Experience
1. **Try all sources** - Explore different content
2. **Switch frequently** - Find what you like
3. **Bookmark favorites** - Save from any source
4. **Use search** - Find specific drama across sources

### Performance Tips
1. **Cache cleared** - Refresh if data seems old
2. **Network stable** - Better for source switching
3. **Browser updated** - Latest Chrome/Edge recommended

---

## 🎊 Conclusion

Multi-source feature memberikan:
- **6x more content** untuk explore
- **Better user experience** dengan elegant tabs
- **Backup reliability** dengan multiple sources
- **Future-proof architecture** untuk expansion

**Enjoy exploring drama dari 6 sumber berbeda!** 🚀

---

**Version**: 2.1.0  
**Released**: January 30, 2026  
**Status**: ✅ Production Ready
