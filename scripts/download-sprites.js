const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Pokemon Sprite Downloader
 * Downloads various sprite formats from PokeAPI
 *
 * Available sprite formats:
 * - animated: Gen 5 Black/White animated GIFs
 * - static: Default static PNG sprites
 * - official-artwork: High-quality official artwork (PNG)
 * - home: Pokemon Home style sprites (PNG)
 * - showdown: Pokemon Showdown battle sprites (GIF)
 * - shiny: Shiny variant sprites (PNG)
 *
 * Usage:
 * node scripts/download-sprites.js [format1] [format2] ...
 * Example: node scripts/download-sprites.js animated official-artwork
 * No args = downloads animated and static only
 */

// Sprite format configurations
const SPRITE_FORMATS = {
  animated: {
    name: 'Animated (Gen 5)',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`,
    path: 'animated',
    extension: 'gif',
    maxId: 649, // Gen 5 only has up to Gen 5 Pokemon
    description: 'Animated GIF sprites from Pokemon Black/White'
  },
  static: {
    name: 'Static (Default)',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    path: 'static',
    extension: 'png',
    maxId: 1025,
    description: 'Default static PNG sprites'
  },
  'official-artwork': {
    name: 'Official Artwork',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    path: 'official-artwork',
    extension: 'png',
    maxId: 1025,
    description: 'High-quality official Pokemon artwork (best for showcasing)'
  },
  home: {
    name: 'Pokemon Home',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
    path: 'home',
    extension: 'png',
    maxId: 1025,
    description: 'Modern Pokemon Home style sprites'
  },
  showdown: {
    name: 'Showdown',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
    path: 'showdown',
    extension: 'gif',
    maxId: 1025,
    description: 'Pokemon Showdown competitive battle sprites (animated)'
  },
  shiny: {
    name: 'Shiny',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
    path: 'shiny',
    extension: 'png',
    maxId: 1025,
    description: 'Shiny variant sprites'
  },
  'shiny-home': {
    name: 'Shiny Home',
    url: (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`,
    path: 'shiny-home',
    extension: 'png',
    maxId: 1025,
    description: 'Shiny variants in Pokemon Home style'
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const requestedFormats = args.length > 0 ? args : ['animated', 'static'];

// Validate requested formats
const invalidFormats = requestedFormats.filter(f => !SPRITE_FORMATS[f]);
if (invalidFormats.length > 0) {
  console.error(`Invalid format(s): ${invalidFormats.join(', ')}`);
  console.log('\nAvailable formats:');
  Object.entries(SPRITE_FORMATS).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(20)} - ${config.description}`);
  });
  process.exit(1);
}

/**
 * Download a single file from a URL
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        fs.unlink(dest, () => {}); // Delete the file if download failed
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * Download all sprites for a specific format
 */
async function downloadFormat(formatKey, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Downloading: ${config.name}`);
  console.log(`Description: ${config.description}`);
  console.log(`Pokemon count: 1-${config.maxId}`);
  console.log('='.repeat(60));

  const spriteDir = path.join(__dirname, '..', 'public', 'sprites', config.path);

  // Create directory if it doesn't exist
  if (!fs.existsSync(spriteDir)) {
    fs.mkdirSync(spriteDir, { recursive: true });
    console.log(`Created directory: public/sprites/${config.path}`);
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 1; i <= config.maxId; i++) {
    try {
      const url = config.url(i);
      const dest = path.join(spriteDir, `${i}.${config.extension}`);

      // Skip if file already exists
      if (fs.existsSync(dest)) {
        skipped++;
        continue;
      }

      await downloadFile(url, dest);
      downloaded++;

      // Progress indicator every 50 Pokemon
      if (i % 50 === 0) {
        console.log(`Progress: ${i}/${config.maxId} (${downloaded} new, ${skipped} skipped, ${failed} failed)`);
      }
    } catch (error) {
      failed++;
      // Some Pokemon don't have all sprite variants, that's ok
      if (failed < 10) {
        // Only show first few failures to avoid spam
        console.log(`  Warning: Failed to download #${i} (${error.message})`);
      }
    }
  }

  console.log(`\n${config.name} complete!`);
  console.log(`  Downloaded: ${downloaded} new sprites`);
  console.log(`  Skipped: ${skipped} (already exist)`);
  console.log(`  Failed: ${failed} (likely unavailable)`);
  console.log(`  Saved to: public/sprites/${config.path}/`);

  return { downloaded, skipped, failed };
}

/**
 * Main download function
 */
async function downloadSprites() {
  console.log('Pokemon Sprite Downloader');
  console.log('='.repeat(60));
  console.log(`Formats to download: ${requestedFormats.join(', ')}`);

  const startTime = Date.now();
  const totals = { downloaded: 0, skipped: 0, failed: 0 };

  for (const formatKey of requestedFormats) {
    const config = SPRITE_FORMATS[formatKey];
    const results = await downloadFormat(formatKey, config);
    totals.downloaded += results.downloaded;
    totals.skipped += results.skipped;
    totals.failed += results.failed;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('ALL DOWNLOADS COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Total downloaded: ${totals.downloaded} sprites`);
  console.log(`Total skipped: ${totals.skipped} (already existed)`);
  console.log(`Total failed: ${totals.failed} (unavailable)`);
  console.log(`Time elapsed: ${elapsed}s`);
  console.log('\nSprites saved to: public/sprites/');
  console.log('\nTip: Run with specific formats to download more:');
  console.log('  npm run download-sprites -- official-artwork home showdown');
}

// Run the script
downloadSprites().catch(console.error);
