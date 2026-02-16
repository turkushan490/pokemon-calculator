# Pokemon Sprite Guide

Complete guide to using Pokemon sprites in the Battle Simulator.

## Available Sprite Formats

| Format | Type | Quality | File Size | Animation | Best For |
|--------|------|---------|-----------|-----------|----------|
| **animated** | GIF | Medium | Medium | Yes | General use, battles |
| **static** | PNG | Low | Small | No | Fallback, lists |
| **official-artwork** | PNG | Very High | Large | No | Showcasing, profiles |
| **home** | PNG | High | Medium | No | Modern look, teams |
| **showdown** | GIF | Medium | Medium | Yes | Competitive battles |
| **shiny** | PNG | Low | Small | No | Shiny variants |
| **shiny-home** | PNG | High | Medium | No | Shiny showcase |

## Downloading Sprites

### Download Default Formats (Recommended)
```bash
npm run download-sprites
```
This downloads **animated** (649 Pokemon) and **static** (1025 Pokemon) sprites.

### Download Specific Formats
```bash
# High-quality artwork for showcasing
npm run download-sprites -- official-artwork

# Modern Pokemon Home style
npm run download-sprites -- home

# Competitive battle sprites
npm run download-sprites -- showdown

# Multiple formats at once
npm run download-sprites -- official-artwork home showdown
```

### Download Shiny Variants
```bash
# Basic shiny sprites
npm run download-sprites -- shiny

# High-quality shiny sprites
npm run download-sprites -- shiny-home

# Both shiny formats
npm run download-sprites -- shiny shiny-home
```

## Using Sprites in Components

### Basic Usage
```typescript
import { getSpriteUrl, handleSpriteError } from '../utils/sprites';

// In your component:
<img
  src={getSpriteUrl(pokemon.national_dex_number, 'animated')}
  alt={pokemon.name}
  onError={(e) => handleSpriteError(e, pokemon.national_dex_number)}
/>
```

### With Automatic Fallbacks
The `handleSpriteError` function automatically tries:
1. Animated GIF (local)
2. Static PNG (local)
3. GitHub CDN (online fallback)

```typescript
<img
  src={`/sprites/animated/${pokemon.national_dex_number}.gif`}
  alt={pokemon.name}
  onError={(e) => {
    const img = e.currentTarget;
    if (img.src.includes('/sprites/animated/')) {
      img.src = `/sprites/static/${pokemon.national_dex_number}.png`;
    } else if (img.src.includes('/sprites/static/')) {
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.national_dex_number}.png`;
    }
  }}
/>
```

### Using Different Formats
```typescript
// Official high-quality artwork
<img src={getSpriteUrl(pokemon.national_dex_number, 'official-artwork')} />

// Pokemon Home style
<img src={getSpriteUrl(pokemon.national_dex_number, 'home')} />

// Shiny variant
<img src={getSpriteUrl(pokemon.national_dex_number, 'shiny')} />
```

## Sprite Locations

After downloading, sprites are saved to:
```
public/sprites/
├── animated/           # Gen 5 Black/White animated GIFs (649 Pokemon)
├── static/            # Default PNG sprites (1025 Pokemon)
├── official-artwork/  # High-quality official artwork
├── home/             # Pokemon Home style sprites
├── showdown/         # Pokemon Showdown battle sprites
├── shiny/            # Shiny variant sprites
└── shiny-home/       # Shiny Pokemon Home style sprites
```

## Sprite Downloader Configuration

The sprite downloader (`scripts/download-sprites.js`) is fully configurable:

### Add New Sprite Format
```javascript
// Edit scripts/download-sprites.js
const SPRITE_FORMATS = {
  'your-format': {
    name: 'Your Format Name',
    url: (id) => `https://url-to-sprite/${id}.png`,
    path: 'your-format',
    extension: 'png',
    maxId: 1025,
    description: 'Description of your format'
  }
};
```

### Format Options
- `name` - Display name for logging
- `url` - Function that takes Pokemon ID and returns download URL
- `path` - Folder name in `public/sprites/`
- `extension` - File extension (png, gif, svg, etc.)
- `maxId` - Maximum Pokemon ID to download (649 for Gen 5, 1025 for all)
- `description` - Format description

## Performance Tips

1. **Use animated sprites sparingly** - They're larger files
2. **Prefer static for lists** - Faster loading for Pokemon lists
3. **Use official-artwork for details** - Show high-quality images on detail pages
4. **Enable fallbacks** - Always use `handleSpriteError` for reliability
5. **Pre-download sprites** - Run download script before packaging app

## Troubleshooting

### Sprites not loading?
1. Check if sprites are downloaded: `ls public/sprites/animated`
2. Check webpack copied them: `ls .webpack/renderer/main_window/sprites`
3. Restart the app: `npm start`
4. Clear webpack cache: Delete `.webpack` folder and restart

### 404 errors?
- Make sure webpack dev server is running (should be on localhost:9000)
- Check Content Security Policy in `src/renderer/index.html`
- Verify sprite files exist in the correct folder

### Slow downloads?
- Download fewer formats at once
- Use smaller formats first (static before official-artwork)
- Check your internet connection

## Sprite Sources

All sprites are from [PokeAPI/sprites](https://github.com/PokeAPI/sprites):
- Licensed under CC0 (Public Domain)
- Updated regularly with new Pokemon
- Hosted on GitHub CDN for fallback

## Examples

### Team Builder Card
```typescript
<div className="pokemon-card">
  <img
    src={getSpriteUrl(pokemon.national_dex_number, 'home')}
    alt={pokemon.name}
    onError={(e) => handleSpriteError(e, pokemon.national_dex_number)}
    className="w-24 h-24"
  />
  <h3>{pokemon.name}</h3>
</div>
```

### Battle View
```typescript
<div className="battle-sprite">
  <img
    src={getSpriteUrl(pokemon.national_dex_number, 'showdown')}
    alt={pokemon.name}
    className="w-32 h-32"
  />
</div>
```

### Pokemon Profile
```typescript
<div className="pokemon-profile">
  <img
    src={getSpriteUrl(pokemon.national_dex_number, 'official-artwork')}
    alt={pokemon.name}
    className="w-64 h-64 object-contain"
  />
</div>
```

## Need Help?

- Check `PROJECT_STRUCTURE.md` for overall project documentation
- See `src/renderer/utils/sprites.ts` for sprite utility functions
- Check `scripts/download-sprites.js` for download configuration
