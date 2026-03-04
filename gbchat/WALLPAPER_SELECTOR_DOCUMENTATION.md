# 🖼️ Wallpaper System Documentation

**Version**: 1.0.0
**Last Updated**: 2026-03-04
**Status**: Production Ready ✅

---

## 🎯 OVERVIEW

Enhanced wallpaper system with **12+ built-in wallpapers**, **per-chat customization**, and **custom URL support**, featuring the classic WhatsApp default pattern.

---

## ✨ FEATURES

### **1. Built-in Wallpaper Collection**

#### **Patterns (6)**
1. **WhatsApp Default** - Classic green geometric pattern
2. **Polka Dots** - Subtle dot pattern
3. **Diagonal Stripes** - Green stripe design
4. **Waves** - Cyan wave pattern
5. **Dark Dots** - Dark theme dots
6. **Nature Leaves** - Green leaf pattern
7. **Ocean Waves** - Blue wave pattern

#### **Gradients (6)**
1. **Blue Gradient** - Light to medium blue
2. **Purple Gradient** - Lavender to purple
3. **Sunset Gradient** - Yellow to orange
4. **Forest Gradient** - Light to green
5. **Dark Gradient** - Gray to black
6. **Ocean Deep** - Deep blue gradient

### **2. Per-Chat Wallpapers**
- ✅ Each chat has its own wallpaper
- ✅ Stored in localStorage
- ✅ Persists across sessions
- ✅ Changes apply immediately

### **3. Custom Wallpaper Support**
- ✅ Upload custom images
- ✅ Use image URLs
- ✅ Supports JPG, PNG, WebP
- ✅ Auto-saves to chat

### **4. Default WhatsApp Pattern**
- ✅ Classic WhatsApp design
- ✅ Light green geometric shapes
- ✅ Subtle and clean
- ✅ Applied by default

---

## 🎨 WALLPAPER CATALOG

### Pattern Wallpapers

| ID | Name | Description |
|----|------|-------------|
| `default` | WhatsApp Default | Classic green pattern |
| `dots` | Polka Dots | Subtle purple dots |
| `stripes` | Diagonal Stripes | Green diagonal lines |
| `waves` | Waves | Cyan wave pattern |
| `dark-dots` | Dark Dots | Dark theme dots |
| `nature-leaves` | Nature Leaves | Green leaf shapes |
| `ocean-waves` | Ocean Waves | Blue ocean pattern |

### Gradient Wallpapers

| ID | Name | Colors |
|----|------|--------|
| `gradient-blue` | Blue Gradient | Light blue → Blue |
| `gradient-purple` | Purple Gradient | Lavender → Purple |
| `gradient-sunset` | Sunset Gradient | Yellow → Orange |
| `gradient-forest` | Forest Gradient | Light green → Green |
| `dark-gradient` | Dark Gradient | Gray → Black |

---

## 📱 USAGE GUIDE

### **Setting Wallpaper for a Chat**

1. **Open the chat** you want to customize
2. **Click Menu (⋮)** in chat header
3. **Select "Wallpaper"**
4. **Choose from gallery**:
   - Browse patterns
   - Browse gradients
   - Use custom URL
5. **Tap to apply**

### **Reset to Default**

1. Open wallpaper selector
2. Click "Reset to Default" at bottom
3. WhatsApp default pattern applied

### **Custom Wallpaper**

1. Open wallpaper selector
2. Click "Custom URL" tile
3. Enter image URL
4. Click "Apply"

---

## 🔧 TECHNICAL IMPLEMENTATION

### WallpaperSelector Component

**Location**: `client/src/components/chat/WallpaperSelector.jsx`

**Features**:
- Modal bottom sheet (mobile) / Centered modal (desktop)
- Category tabs (All, Patterns, Gradients)
- Live preview with checkmark
- Custom URL input
- Reset to default option

**Props**:
```jsx
<WallpaperSelector
  isOpen={true/false}
  onClose={() => setShow(false)}
  onSelect={(url) => handleWallpaper(url)}
  currentWallpaper={currentUrl}
/>
```

### Per-Chat Storage

**localStorage Structure**:
```javascript
{
  "chat-wallpapers": {
    "69a6d6ec9f38129df01b2c85": "wallpaper-url-1",
    "69a6d6ec9f38129df01b2c86": "wallpaper-url-2"
  }
}
```

**Storage Key**: `chat-wallpapers`

### Wallpaper Change Event

**Event**: `wallpaper-change`

**Detail**:
```javascript
{
  chatId: '69a6d6ec9f38129df01b2c85',
  wallpaper: 'wallpaper-url'
}
```

---

## 🎨 DEFAULT WALLPAPER

The **WhatsApp Default** pattern uses an SVG with geometric shapes:

```svg
<svg width='100' height='100' viewBox='0 0 100 100'>
  <g fill='#dcfce7' fill-opacity='0.4'>
    <circle patterns at positions
  </g>
</svg>
```

**Characteristics**:
- Light green color (`#dcfce7`)
- 40% opacity
- 100x100px repeating pattern
- Circle and flower-like shapes
- Subtle and non-distracting

---

## 📊 WALLPAPER COMPARISON

### Pattern Wallpapers
- **File Size**: < 1KB (SVG)
- **Loading**: Instant
- **Repeating**: Seamless tile
- **Best For**: Text readability

### Gradient Wallpapers
- **File Size**: < 1KB (SVG)
- **Loading**: Instant  
- **Repeating**: Stretched
- **Best For**: Modern look

### Custom Images
- **File Size**: Varies
- **Loading**: Depends on size
- **Repeating**: Cover/contain
- **Best For**: Personalization

---

## 🎯 BEST PRACTICES

### For Users
1. **Choose subtle patterns** for better readability
2. **Use darker wallpapers** in dark mode
3. **Avoid busy images** that distract from messages
4. **Reset to default** for consistent experience

### For Developers
1. **Always provide fallback** to default wallpaper
2. **Handle loading states** for custom images
3. **Test with long chat lists** for performance
4. **Clear old wallpapers** when chats are deleted

---

## 🔧 CUSTOMIZATION

### Adding New Wallpapers

Edit `WALLPAPERS` array in `WallpaperSelector.jsx`:

```javascript
{
  id: 'my-wallpaper',
  name: 'My Wallpaper',
  url: 'url-or-data-uri',
  type: 'pattern' | 'gradient',
  preview: 'bg-color-class',
}
```

### Changing Default Wallpaper

Update `DEFAULT_WALLPAPER` constant:

```javascript
const DEFAULT_WALLPAPER = "data:image/svg+xml,..."
```

### Custom Storage Key

Change localStorage key:

```javascript
localStorage.setItem('my-chat-wallpapers', ...)
```

---

## 🐛 TROUBLESHOOTING

### Wallpaper Not Showing

**Solution**:
1. Check URL is valid
2. Verify CORS for external images
3. Clear browser cache
4. Check localStorage quota

### Custom Image Not Loading

**Solution**:
1. Use HTTPS URLs
2. Check image format (JPG/PNG/WebP)
3. Ensure image is accessible
4. Try smaller file size

### Wallpaper Resets After Refresh

**Solution**:
1. Check localStorage not cleared
2. Verify chat ID matches
3. Ensure event listener attached
4. Check browser settings

---

## 📱 RESPONSIVE DESIGN

### Mobile (< 768px)
- Bottom sheet modal
- 2-column grid
- Touch-optimized tiles
- Drag handle indicator

### Desktop (≥ 768px)
- Centered modal
- 3-column grid
- Hover effects
- Max width 2xl

---

## ✅ COMPLETION STATUS

**Built-in Wallpapers**: 12+ ✅
**Per-Chat Support**: ✅
**Custom URL**: ✅
**Default WhatsApp**: ✅
**Storage**: localStorage ✅
**Event System**: ✅
**Responsive**: ✅
**Dark Mode**: ✅

---

## 📁 FILES

### Created
- `WallpaperSelector.jsx` - Main selector component
- `WALLPAPER_SELECTOR_DOCUMENTATION.md` - This file

### Modified
- `ChatHeader.jsx` - Added wallpaper menu option
- `ChatArea.jsx` - Per-chat wallpaper support

---

## 🚀 FUTURE ENHANCEMENTS

### Planned
- [ ] Wallpaper preview before applying
- [ ] Import/export wallpaper settings
- [ ] Solid color backgrounds
- [ ] Animated wallpapers
- [ ] Wallpaper blur intensity control
- [ ] Auto-wallpaper by time of day

### Possible
- [ ] Wallpaper suggestions based on chat theme
- [ ] Seasonal wallpapers
- [ ] User-uploaded wallpaper gallery
- [ ] Wallpaper scheduling

---

**GBChat Wallpaper System v1.0.0**
**Built with ❤️ for Beautiful Chats**
**Status**: Production Ready ✅

**Last Updated**: 2026-03-04
**Maintained by**: GBChat Team
**License**: MIT
