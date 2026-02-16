/**
 * Pokemon API Service
 * Handles all IPC communication with the main process for Pokemon data
 * Centralizes all database/API calls from the renderer
 */

import {
  Pokemon,
  PokemonWithStats,
  Team,
  TeamMember,
  TeamWithMembers,
  Simulation,
  Battle
} from '../../shared/types/pokemon';

/**
 * Standard API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all Pokemon from database
 */
export async function getAllPokemon(): Promise<Pokemon[]> {
  const result = await window.electronAPI.getPokemon();
  if (result.success) {
    return result.pokemon || [];
  }
  throw new Error(result.error || 'Failed to fetch Pokemon');
}

/**
 * Get all Pokemon with battle statistics and win rates
 */
export async function getPokemonWithRatings(): Promise<PokemonWithStats[]> {
  const result = await window.electronAPI.getPokemonWithRatings();
  if (result.success) {
    return result.pokemon || [];
  }
  throw new Error(result.error || 'Failed to fetch Pokemon with ratings');
}

/**
 * Get all teams from database
 */
export async function getAllTeams(): Promise<Team[]> {
  const result = await window.electronAPI.getTeams();
  if (result.success) {
    return result.teams || [];
  }
  throw new Error(result.error || 'Failed to fetch teams');
}

/**
 * Get a specific team with its members
 * @param teamId - Team ID
 */
export async function getTeam(teamId: number): Promise<TeamWithMembers> {
  const result = await window.electronAPI.getTeam(teamId);
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || 'Failed to fetch team');
}

/**
 * Create a new team
 * @param name - Team name
 * @param format - Battle format (e.g., 'gen9ou', 'vgc2024')
 * @param members - Array of team members
 */
export async function createTeam(
  name: string,
  format: string,
  members: Omit<TeamMember, 'id'>[]
): Promise<{ teamId: number }> {
  const result = await window.electronAPI.createTeam(name, format, members);
  if (result.success && result.teamId) {
    return { teamId: result.teamId };
  }
  throw new Error(result.error || 'Failed to create team');
}

/**
 * Delete a team
 * @param teamId - Team ID to delete
 */
export async function deleteTeam(teamId: number): Promise<void> {
  const result = await window.electronAPI.deleteTeam(teamId);
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete team');
  }
}

/**
 * Run a battle simulation between two teams
 * @param team1Id - First team ID
 * @param team2Id - Second team ID
 * @param numBattles - Number of battles to simulate
 */
export async function runSimulation(
  team1Id: number,
  team2Id: number,
  numBattles: number
): Promise<{ simulationId: number }> {
  const result = await window.electronAPI.runSimulation(team1Id, team2Id, numBattles);
  if (result.success && result.simulationId) {
    return { simulationId: result.simulationId };
  }
  throw new Error(result.error || 'Failed to run simulation');
}

/**
 * Get simulation results
 * @param simulationId - Simulation ID
 */
export async function getSimulationResults(simulationId: number): Promise<Simulation> {
  const result = await window.electronAPI.getSimulationResults(simulationId);
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || 'Failed to fetch simulation results');
}

/**
 * Get all simulations
 */
export async function getAllSimulations(): Promise<Simulation[]> {
  const result = await window.electronAPI.getSimulations();
  if (result.success) {
    return result.simulations || [];
  }
  throw new Error(result.error || 'Failed to fetch simulations');
}

/**
 * Get battles for a simulation
 * @param simulationId - Simulation ID
 */
export async function getBattles(simulationId: number): Promise<Battle[]> {
  const result = await window.electronAPI.getBattles(simulationId);
  if (result.success) {
    return result.battles || [];
  }
  throw new Error(result.error || 'Failed to fetch battles');
}

/**
 * Sync Pokemon data from PokeAPI
 */
export async function syncPokemonData(): Promise<void> {
  const result = await window.electronAPI.syncData();
  if (!result.success) {
    throw new Error(result.error || 'Failed to sync Pokemon data');
  }
}
