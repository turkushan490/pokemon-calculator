/**
 * Sprite utility functions
 * Handles sprite path generation and fallback logic for Pokemon images
 */

export type SpriteFormat =
  | 'animated'
  | 'static'
  | 'official-artwork'
  | 'home'
  | 'showdown'
  | 'shiny'
  | 'shiny-home';

export interface SpriteConfig {
  format: SpriteFormat;
  extension: string;
  path: string;
  description: string;
}

/**
 * Available sprite formats with configuration
 */
export const SPRITE_FORMATS: Record<SpriteFormat, SpriteConfig> = {
  'animated': {
    format: 'animated',
    extension: 'gif',
    path: 'animated',
    description: 'Animated GIF sprites from Pokemon Black/White'
  },
  'static': {
    format: 'static',
    extension: 'png',
    path: 'static',
    description: 'Default static PNG sprites'
  },
  'official-artwork': {
    format: 'official-artwork',
    extension: 'png',
    path: 'official-artwork',
    description: 'High-quality official Pokemon artwork'
  },
  'home': {
    format: 'home',
    extension: 'png',
    path: 'home',
    description: 'Modern Pokemon Home style sprites'
  },
  'showdown': {
    format: 'showdown',
    extension: 'gif',
    path: 'showdown',
    description: 'Pokemon Showdown competitive battle sprites'
  },
  'shiny': {
    format: 'shiny',
    extension: 'png',
    path: 'shiny',
    description: 'Shiny variant sprites'
  },
  'shiny-home': {
    format: 'shiny-home',
    extension: 'png',
    path: 'shiny-home',
    description: 'Shiny variants in Pokemon Home style'
  }
};

/**
 * Get local sprite URL for a Pokemon
 * @param nationalDexNumber - National Pokedex number
 * @param format - Sprite format to use
 * @returns Local sprite path
 */
export function getSpriteUrl(nationalDexNumber: number, format: SpriteFormat = 'animated'): string {
  const config = SPRITE_FORMATS[format];
  return `poke://sprites/${config.path}/${nationalDexNumber}.${config.extension}`;
}

/**
 * Get GitHub CDN URL for a sprite (used as fallback)
 * @param nationalDexNumber - National Pokedex number
 * @param format - Sprite format
 * @returns GitHub CDN URL
 */
export function getGitHubSpriteUrl(nationalDexNumber: number, format: SpriteFormat = 'static'): string {
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

  switch (format) {
    case 'animated':
      return `${baseUrl}/versions/generation-v/black-white/animated/${nationalDexNumber}.gif`;
    case 'official-artwork':
      return `${baseUrl}/other/official-artwork/${nationalDexNumber}.png`;
    case 'home':
      return `${baseUrl}/other/home/${nationalDexNumber}.png`;
    case 'showdown':
      return `${baseUrl}/other/showdown/${nationalDexNumber}.gif`;
    case 'shiny':
      return `${baseUrl}/shiny/${nationalDexNumber}.png`;
    case 'shiny-home':
      return `${baseUrl}/other/home/shiny/${nationalDexNumber}.png`;
    default:
      return `${baseUrl}/${nationalDexNumber}.png`;
  }
}

/**
 * Get fallback sprite URLs in order of preference
 * @param nationalDexNumber - National Pokedex number
 * @returns Array of sprite URLs to try in order
 */
export function getSpriteFallbacks(nationalDexNumber: number): string[] {
  return [
    getSpriteUrl(nationalDexNumber, 'animated'),
    getSpriteUrl(nationalDexNumber, 'static'),
    getGitHubSpriteUrl(nationalDexNumber, 'static')
  ];
}

/**
 * Handle image error and load fallback sprite
 * Use this in onError handlers for <img> elements
 * @param event - Image error event
 * @param nationalDexNumber - National Pokedex number
 */
export function handleSpriteError(
  event: React.SyntheticEvent<HTMLImageElement>,
  nationalDexNumber: number
): void {
  const img = event.currentTarget;

  // Try fallback chain: animated -> static -> GitHub CDN
  if (img.src.includes('animated/')) {
    img.src = getSpriteUrl(nationalDexNumber, 'static');
  } else if (img.src.includes('static/')) {
    img.src = getGitHubSpriteUrl(nationalDexNumber, 'static');
  }
  // If GitHub CDN also fails, just let it show broken image
}

// ============================================================================
// LEGACY FUNCTIONS (kept for backward compatibility)
// ============================================================================

/**
 * @deprecated Use getSpriteUrl() instead
 * Get Pokemon sprite path (local)
 */
export const getPokemonSprite = (nationalDexNumber: number, animated: boolean = true): string => {
  return getSpriteUrl(nationalDexNumber, animated ? 'animated' : 'static');
};

/**
 * @deprecated Use getGitHubSpriteUrl() instead
 * Get GitHub sprite URL
 */
export const getGitHubSprite = (nationalDexNumber: number, animated: boolean = true): string => {
  return getGitHubSpriteUrl(nationalDexNumber, animated ? 'animated' : 'static');
};
