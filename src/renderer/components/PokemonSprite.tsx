import React from 'react';

interface PokemonSpriteProps {
  nationalDexNumber: number;
  name?: string;
  animated?: boolean;
  className?: string;
}

/**
 * Pokemon sprite component with automatic fallback to GitHub CDN
 */
export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  nationalDexNumber,
  name,
  animated = true,
  className = ''
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    // Fallback chain: local animated -> local static -> GitHub animated -> GitHub static
    if (!img.dataset.fallback) {
      // First error: try local static
      img.dataset.fallback = '1';
      img.src = `poke://sprites/static/${nationalDexNumber}.png`;
    } else if (img.dataset.fallback === '1') {
      // Second error: try GitHub CDN (always use static for reliability)
      img.dataset.fallback = '2';
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalDexNumber}.png`;
    } else {
      // All failed - show a placeholder
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent && !parent.querySelector('.fallback-text')) {
        const fallback = document.createElement('div');
        fallback.className = 'fallback-text flex items-center justify-center bg-gray-200 text-gray-500';
        fallback.textContent = name ? `#${nationalDexNumber}` : '?';
        parent.appendChild(fallback);
      }
    }
  };

  return (
    <img
      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nationalDexNumber}.png`}
      alt={name || `Pokemon #${nationalDexNumber}`}
      className={className}
      onError={handleError}
    />
  );
};
