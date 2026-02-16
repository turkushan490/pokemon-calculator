/**
 * Pokemon utility functions
 * Helper functions for Pokemon data manipulation and calculations
 */

import { TeamMember } from '../../shared/types/pokemon';

/**
 * Pokemon type colors for UI display
 */
export const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-gray-200', text: 'text-gray-800' },
  fire: { bg: 'bg-red-200', text: 'text-red-800' },
  water: { bg: 'bg-blue-200', text: 'text-blue-800' },
  electric: { bg: 'bg-yellow-200', text: 'text-yellow-800' },
  grass: { bg: 'bg-green-200', text: 'text-green-800' },
  ice: { bg: 'bg-cyan-200', text: 'text-cyan-800' },
  fighting: { bg: 'bg-orange-200', text: 'text-orange-800' },
  poison: { bg: 'bg-purple-200', text: 'text-purple-800' },
  ground: { bg: 'bg-amber-200', text: 'text-amber-800' },
  flying: { bg: 'bg-indigo-200', text: 'text-indigo-800' },
  psychic: { bg: 'bg-pink-200', text: 'text-pink-800' },
  bug: { bg: 'bg-lime-200', text: 'text-lime-800' },
  rock: { bg: 'bg-stone-200', text: 'text-stone-800' },
  ghost: { bg: 'bg-violet-200', text: 'text-violet-800' },
  dragon: { bg: 'bg-purple-300', text: 'text-purple-900' },
  dark: { bg: 'bg-gray-700', text: 'text-gray-100' },
  steel: { bg: 'bg-slate-300', text: 'text-slate-800' },
  fairy: { bg: 'bg-pink-300', text: 'text-pink-900' }
};

/**
 * Calculate total EVs for a team member
 * @param member - Team member data
 * @returns Total EV points (max should be 510)
 */
export function getTotalEVs(member: TeamMember): number {
  return (
    member.hp_ev +
    member.attack_ev +
    member.defense_ev +
    member.sp_attack_ev +
    member.sp_defense_ev +
    member.speed_ev
  );
}

/**
 * Calculate total IVs for a team member
 * @param member - Team member data
 * @returns Total IV points (max is 186 for perfect IVs)
 */
export function getTotalIVs(member: TeamMember): number {
  return (
    member.hp_iv +
    member.attack_iv +
    member.defense_iv +
    member.sp_attack_iv +
    member.sp_defense_iv +
    member.speed_iv
  );
}

/**
 * Check if EVs are valid (not exceeding 510 total)
 * @param member - Team member data
 * @returns true if EVs are valid
 */
export function areEVsValid(member: TeamMember): boolean {
  return getTotalEVs(member) <= 510;
}

/**
 * Format win rate as percentage
 * @param winRate - Win rate as decimal (0-1)
 * @returns Formatted percentage string
 */
export function formatWinRate(winRate: number): string {
  return `${(winRate * 100).toFixed(1)}%`;
}

/**
 * Get color class for win rate display
 * @param winRate - Win rate as decimal (0-1)
 * @returns Tailwind color class
 */
export function getWinRateColor(winRate: number): string {
  if (winRate >= 0.7) return 'text-green-600';
  if (winRate >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get all moves for a team member as array
 * @param member - Team member data
 * @returns Array of move names (non-empty only)
 */
export function getMoves(member: TeamMember): string[] {
  return [member.move1, member.move2, member.move3, member.move4].filter(Boolean);
}

/**
 * Format Pokemon name (capitalize first letter)
 * @param name - Pokemon name
 * @returns Formatted name
 */
export function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Get ranking badge info based on position
 * @param position - Ranking position (1, 2, 3, etc.)
 * @returns Badge configuration or null
 */
export function getRankingBadge(position: number): { emoji: string; color: string } | null {
  switch (position) {
    case 1:
      return { emoji: '🥇', color: 'text-yellow-500' };
    case 2:
      return { emoji: '🥈', color: 'text-gray-400' };
    case 3:
      return { emoji: '🥉', color: 'text-orange-600' };
    default:
      return null;
  }
}
