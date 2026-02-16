/**
 * Shared TypeScript interfaces for Pokemon data
 * Used across both main and renderer processes
 */

export interface Pokemon {
  id: number;
  name: string;
  national_dex_number: number;
  type1: string;
  type2?: string;
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
  total: number;
  generation: number;
  is_legendary: number;
  is_mythical: number;
}

export interface PokemonWithStats extends Pokemon {
  usage_count?: number;
  total_battles?: number;
  wins?: number;
  losses?: number;
  win_rate?: number;
}

export interface TeamMember {
  id: number;
  position: number;
  pokemon_id: number;
  nickname?: string;
  level: number;
  gender?: 'M' | 'F';
  nature: string;
  ability: string;
  item?: string;
  tera_type: string;
  hp_iv: number;
  attack_iv: number;
  defense_iv: number;
  sp_attack_iv: number;
  sp_defense_iv: number;
  speed_iv: number;
  hp_ev: number;
  attack_ev: number;
  defense_ev: number;
  sp_attack_ev: number;
  sp_defense_ev: number;
  speed_ev: number;
  move1: string;
  move2: string;
  move3: string;
  move4: string;
}

export interface Team {
  id: number;
  name: string;
  format: string;
  total_battles?: number;
  wins?: number;
  losses?: number;
  created_at?: string;
}

export interface TeamWithMembers {
  team: Team;
  members: TeamMember[];
}

export interface Battle {
  id: number;
  simulation_id: number;
  team1_id: number;
  team2_id: number;
  winner_id: number | null;
  turn_count: number;
  created_at: string;
}

export interface BattleLog {
  id: number;
  battle_id: number;
  turn_number: number;
  event_type: string;
  description: string;
  created_at: string;
}

export interface Simulation {
  id: number;
  team1_id: number;
  team2_id: number;
  num_battles: number;
  completed: number;
  team1_wins: number;
  team2_wins: number;
  created_at: string;
}
