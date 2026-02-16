import { Dex } from '@pkmn/dex';
import Database from 'better-sqlite3';

export interface BattleResult {
  winner: 'p1' | 'p2' | 'tie';
  turns: number;
  p1Fainted: number;
  p2Fainted: number;
  log: string[];
}

export interface PokemonSet {
  name: string;
  species: string;
  item?: string;
  ability: string;
  moves: string[];
  nature: string;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  level: number;
  gender?: 'M' | 'F';
  teraType?: string;
}

export interface TeamData {
  id: number;
  pokemon: PokemonSet[];
}

interface BattleLogEntry {
  turn: number;
  type: 'switch' | 'move' | 'faint' | 'status' | 'weather' | 'field';
  actor?: string;
  target?: string;
  move?: string;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  success?: boolean;
  message: string;
}

export class BattleEngine {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async runBattle(team1: TeamData, team2: TeamData, format: string = 'gen9vgc2024regg'): Promise<BattleResult> {
    // Enhanced simulation with detailed battle logs
    const fullLog: string[] = [];
    let currentTurn = 0;
    let p1Fainted = 0;
    let p2Fainted = 0;

    // Initialize battle
    fullLog.push('|player|p1|Player 1|');
    fullLog.push('|player|p2|Player 2|');
    fullLog.push(`|teamsize|p1|${team1.pokemon.length}`);
    fullLog.push(`|teamsize|p2|${team2.pokemon.length}`);
    fullLog.push('|start');

    // Simulate battle (simplified but with realistic logs)
    const p1Active = [...team1.pokemon];
    const p2Active = [...team2.pokemon];

    // Track HP for each Pokemon (as percentage)
    const p1HP = p1Active.map(() => 100);
    const p2HP = p2Active.map(() => 100);

    let p1CurrentIndex = 0;
    let p2CurrentIndex = 0;

    // Initial switches
    fullLog.push(`|switch|p1a: ${p1Active[0].name}|${p1Active[0].species}, L${p1Active[0].level}|100/100`);
    fullLog.push(`|switch|p2a: ${p2Active[0].name}|${p2Active[0].species}, L${p2Active[0].level}|100/100`);

    // Battle loop
    const maxTurns = 50;
    for (let turn = 1; turn <= maxTurns; turn++) {
      currentTurn = turn;
      fullLog.push(`|turn|${turn}`);

      // Check if battle is over
      if (p1Fainted >= Math.min(4, p1Active.length) || p2Fainted >= Math.min(4, p2Active.length)) {
        break;
      }

      // Find next alive Pokemon if current is fainted
      while (p1HP[p1CurrentIndex] <= 0 && p1CurrentIndex < p1Active.length - 1) {
        p1CurrentIndex++;
        if (p1HP[p1CurrentIndex] > 0) {
          fullLog.push(`|switch|p1a: ${p1Active[p1CurrentIndex].name}|${p1Active[p1CurrentIndex].species}, L${p1Active[p1CurrentIndex].level}|${p1HP[p1CurrentIndex]}/100`);
        }
      }

      while (p2HP[p2CurrentIndex] <= 0 && p2CurrentIndex < p2Active.length - 1) {
        p2CurrentIndex++;
        if (p2HP[p2CurrentIndex] > 0) {
          fullLog.push(`|switch|p2a: ${p2Active[p2CurrentIndex].name}|${p2Active[p2CurrentIndex].species}, L${p2Active[p2CurrentIndex].level}|${p2HP[p2CurrentIndex]}/100`);
        }
      }

      if (p1HP[p1CurrentIndex] <= 0 || p2HP[p2CurrentIndex] <= 0) {
        break;
      }

      const p1Pokemon = p1Active[p1CurrentIndex];
      const p2Pokemon = p2Active[p2CurrentIndex];

      // Determine move order (simplified speed check)
      const p1Speed = p1Pokemon.evs.spe + Math.random() * 50;
      const p2Speed = p2Pokemon.evs.spe + Math.random() * 50;

      const firstAttacker = p1Speed >= p2Speed ? 'p1' : 'p2';
      const secondAttacker = firstAttacker === 'p1' ? 'p2' : 'p1';

      // Execute moves
      for (const attacker of [firstAttacker, secondAttacker]) {
        if (attacker === 'p1' && p1HP[p1CurrentIndex] > 0 && p2HP[p2CurrentIndex] > 0) {
          const move = p1Pokemon.moves[Math.floor(Math.random() * p1Pokemon.moves.length)];
          fullLog.push(`|move|p1a: ${p1Pokemon.name}|${move}|p2a: ${p2Pokemon.name}`);

          // Calculate damage and effectiveness
          const { damage, effectiveness, critical } = this.calculateDamage(p1Pokemon, p2Pokemon, move);

          if (damage > 0) {
            p2HP[p2CurrentIndex] = Math.max(0, p2HP[p2CurrentIndex] - damage);
            fullLog.push(`|-damage|p2a: ${p2Pokemon.name}|${Math.round(p2HP[p2CurrentIndex])}/100`);

            if (effectiveness > 1.5) {
              fullLog.push('|-supereffective|p2a: ' + p2Pokemon.name);
            } else if (effectiveness < 0.7) {
              fullLog.push('|-resisted|p2a: ' + p2Pokemon.name);
            }

            if (critical) {
              fullLog.push('|-crit|p2a: ' + p2Pokemon.name);
            }

            if (p2HP[p2CurrentIndex] <= 0) {
              fullLog.push(`|faint|p2a: ${p2Pokemon.name}`);
              p2Fainted++;
            }
          }
        } else if (attacker === 'p2' && p2HP[p2CurrentIndex] > 0 && p1HP[p1CurrentIndex] > 0) {
          const move = p2Pokemon.moves[Math.floor(Math.random() * p2Pokemon.moves.length)];
          fullLog.push(`|move|p2a: ${p2Pokemon.name}|${move}|p1a: ${p1Pokemon.name}`);

          const { damage, effectiveness, critical } = this.calculateDamage(p2Pokemon, p1Pokemon, move);

          if (damage > 0) {
            p1HP[p1CurrentIndex] = Math.max(0, p1HP[p1CurrentIndex] - damage);
            fullLog.push(`|-damage|p1a: ${p1Pokemon.name}|${Math.round(p1HP[p1CurrentIndex])}/100`);

            if (effectiveness > 1.5) {
              fullLog.push('|-supereffective|p1a: ' + p1Pokemon.name);
            } else if (effectiveness < 0.7) {
              fullLog.push('|-resisted|p1a: ' + p1Pokemon.name);
            }

            if (critical) {
              fullLog.push('|-crit|p1a: ' + p1Pokemon.name);
            }

            if (p1HP[p1CurrentIndex] <= 0) {
              fullLog.push(`|faint|p1a: ${p1Pokemon.name}`);
              p1Fainted++;
            }
          }
        }
      }
    }

    // Determine winner
    const winner: 'p1' | 'p2' | 'tie' =
      p1Fainted < p2Fainted ? 'p1' :
      p2Fainted < p1Fainted ? 'p2' :
      'tie';

    fullLog.push(`|win|${winner === 'p1' ? 'Player 1' : winner === 'p2' ? 'Player 2' : 'Tie'}`);

    return {
      winner,
      turns: currentTurn,
      p1Fainted,
      p2Fainted,
      log: fullLog,
    };
  }

  private calculateDamage(
    attacker: PokemonSet,
    defender: PokemonSet,
    moveName: string
  ): { damage: number; effectiveness: number; critical: boolean } {
    // Get move data from Dex
    const move = Dex.moves.get(moveName);

    // Base damage calculation (simplified)
    let baseDamage = move.basePower || 40;

    // Type effectiveness
    const defenderTypes = [defender.species];
    const attackType = move.type;
    let effectiveness = 1.0;

    // Simplified type effectiveness (use Dex for real calculation)
    try {
      const species = Dex.species.get(defender.species);
      for (const type of species.types) {
        const eff = Dex.types.get(attackType)?.effectiveness?.[type];
        if (eff !== undefined) {
          effectiveness *= eff;
        }
      }
    } catch (e) {
      // Fallback to random effectiveness
      const rand = Math.random();
      effectiveness = rand > 0.7 ? 2.0 : rand < 0.3 ? 0.5 : 1.0;
    }

    // Critical hit (10% chance)
    const critical = Math.random() < 0.1;

    // Calculate final damage
    let damage = baseDamage * effectiveness * (critical ? 1.5 : 1.0);
    damage *= 0.85 + Math.random() * 0.3; // Add randomness (85%-115%)

    // Adjust based on stats (simplified)
    const attackStat = move.category === 'Physical' ? attacker.evs.atk : attacker.evs.spa;
    const defenseStat = move.category === 'Physical' ? defender.evs.def : defender.evs.spd;

    damage *= (1 + attackStat / 500);
    damage *= (1 - defenseStat / 1000);

    return {
      damage: Math.round(Math.max(5, Math.min(100, damage))),
      effectiveness,
      critical,
    };
  }

  async loadTeamFromDatabase(teamId: number): Promise<TeamData | null> {
    const team = this.db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as any;
    if (!team) return null;

    const members = this.db.prepare(`
      SELECT tm.*, ps.name as pokemon_name
      FROM team_members tm
      JOIN pokemon_species ps ON tm.pokemon_id = ps.id
      WHERE tm.team_id = ?
      ORDER BY tm.position
    `).all(teamId) as any[];

    const pokemon: PokemonSet[] = members.map(m => ({
      name: m.nickname || m.pokemon_name,
      species: m.pokemon_name,
      item: m.item || undefined,
      ability: m.ability,
      moves: [m.move1, m.move2, m.move3, m.move4],
      nature: m.nature,
      evs: {
        hp: m.hp_ev,
        atk: m.attack_ev,
        def: m.defense_ev,
        spa: m.sp_attack_ev,
        spd: m.sp_defense_ev,
        spe: m.speed_ev,
      },
      ivs: {
        hp: m.hp_iv,
        atk: m.attack_iv,
        def: m.defense_iv,
        spa: m.sp_attack_iv,
        spd: m.sp_defense_iv,
        spe: m.speed_iv,
      },
      level: m.level,
      gender: m.gender || undefined,
      teraType: m.tera_type,
    }));

    return {
      id: team.id,
      pokemon,
    };
  }

  async saveBattleResult(
    simulationId: number,
    team1Id: number,
    team2Id: number,
    result: BattleResult
  ): Promise<void> {
    const winnerTeamId = result.winner === 'p1' ? team1Id : result.winner === 'p2' ? team2Id : null;

    // Insert battle record
    const battleInsert = this.db.prepare(`
      INSERT INTO battles (
        simulation_id, team1_id, team2_id, winner_team_id,
        battle_format, turn_count, team1_pokemon_fainted, team2_pokemon_fainted,
        battle_data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      simulationId,
      team1Id,
      team2Id,
      winnerTeamId,
      'gen9vgc2024regg',
      result.turns,
      result.p1Fainted,
      result.p2Fainted,
      JSON.stringify({ logs: result.log })
    );

    const battleId = battleInsert.lastInsertRowid as number;

    // Parse and save battle logs
    await this.parseBattleLogs(battleId, result.log, team1Id, team2Id);
  }

  private async parseBattleLogs(
    battleId: number,
    logLines: string[],
    team1Id: number,
    team2Id: number
  ): Promise<void> {
    let currentTurn = 0;
    const pokemonMap: Map<string, { name: string; id: number }> = new Map();

    // Build Pokemon name map from teams
    const team1Members = this.db.prepare(`
      SELECT tm.*, ps.name as pokemon_name
      FROM team_members tm
      JOIN pokemon_species ps ON tm.pokemon_id = ps.id
      WHERE tm.team_id = ?
    `).all(team1Id) as any[];

    const team2Members = this.db.prepare(`
      SELECT tm.*, ps.name as pokemon_name
      FROM team_members tm
      JOIN pokemon_species ps ON tm.pokemon_id = ps.id
      WHERE tm.team_id = ?
    `).all(team2Id) as any[];

    // Parse log lines and extract battle events
    for (const line of logLines) {
      if (!line.startsWith('|')) continue;

      const parts = line.split('|').filter(p => p);
      const command = parts[0];

      if (command === 'turn') {
        currentTurn = parseInt(parts[1]);
      } else if (command === 'switch' || command === 'drag') {
        // Pokemon switch: |switch|POKEMON|DETAILS|HP STATUS
        const pokemon = this.cleanPokemonName(parts[1]);
        const species = parts[2]?.split(',')[0] || 'Unknown';

        this.saveBattleLog(battleId, currentTurn, 'switch', pokemon, null, null, 0, 1.0, false, true,
          `${pokemon} switched in`);
      } else if (command === 'move') {
        // Move used: |move|POKEMON|MOVE|TARGET
        const attacker = this.cleanPokemonName(parts[1]);
        const move = parts[2];
        const target = parts[3] ? this.cleanPokemonName(parts[3]) : null;

        this.saveBattleLog(battleId, currentTurn, 'move', attacker, target, move, 0, 1.0, false, true,
          `${attacker} used ${move}${target ? ' on ' + target : ''}`);
      } else if (command === '-damage') {
        // Damage dealt: |-damage|POKEMON|HP STATUS
        const pokemon = this.cleanPokemonName(parts[1]);
        const hpStatus = parts[2];

        // Try to extract damage amount (this is approximate)
        const damage = this.estimateDamage(hpStatus);

        // Look for the previous move log to update it
        const lastLog = this.db.prepare(`
          SELECT * FROM battle_logs
          WHERE battle_id = ? AND turn_number = ? AND action_type = 'move'
          ORDER BY id DESC LIMIT 1
        `).get(battleId, currentTurn) as any;

        if (lastLog) {
          this.db.prepare(`
            UPDATE battle_logs
            SET damage_dealt = ?, log_message = log_message || ' dealing ' || ? || ' damage'
            WHERE id = ?
          `).run(damage, damage, lastLog.id);
        }
      } else if (command === '-supereffective') {
        // Super effective hit
        const lastLog = this.db.prepare(`
          SELECT * FROM battle_logs
          WHERE battle_id = ? AND turn_number = ? AND action_type = 'move'
          ORDER BY id DESC LIMIT 1
        `).get(battleId, currentTurn) as any;

        if (lastLog) {
          this.db.prepare(`
            UPDATE battle_logs
            SET effectiveness = 2.0, log_message = log_message || ' (Super effective!)'
            WHERE id = ?
          `).run(lastLog.id);
        }
      } else if (command === '-resisted') {
        // Not very effective hit
        const lastLog = this.db.prepare(`
          SELECT * FROM battle_logs
          WHERE battle_id = ? AND turn_number = ? AND action_type = 'move'
          ORDER BY id DESC LIMIT 1
        `).get(battleId, currentTurn) as any;

        if (lastLog) {
          this.db.prepare(`
            UPDATE battle_logs
            SET effectiveness = 0.5, log_message = log_message || ' (Not very effective)'
            WHERE id = ?
          `).run(lastLog.id);
        }
      } else if (command === '-crit') {
        // Critical hit
        const lastLog = this.db.prepare(`
          SELECT * FROM battle_logs
          WHERE battle_id = ? AND turn_number = ? AND action_type = 'move'
          ORDER BY id DESC LIMIT 1
        `).get(battleId, currentTurn) as any;

        if (lastLog) {
          this.db.prepare(`
            UPDATE battle_logs
            SET critical_hit = 1, log_message = log_message || ' (Critical hit!)'
            WHERE id = ?
          `).run(lastLog.id);
        }
      } else if (command === 'faint') {
        // Pokemon fainted: |faint|POKEMON
        const pokemon = this.cleanPokemonName(parts[1]);

        this.saveBattleLog(battleId, currentTurn, 'faint', pokemon, null, null, 0, 1.0, false, true,
          `${pokemon} fainted`);
      } else if (command === '-status') {
        // Status condition: |-status|POKEMON|STATUS
        const pokemon = this.cleanPokemonName(parts[1]);
        const status = parts[2];

        this.saveBattleLog(battleId, currentTurn, 'status', pokemon, null, null, 0, 1.0, false, true,
          `${pokemon} was ${status}`);
      } else if (command === '-weather' || command === 'weather') {
        // Weather change
        const weather = parts[1];
        this.saveBattleLog(battleId, currentTurn, 'weather', 'Field', null, null, 0, 1.0, false, true,
          `Weather: ${weather}`);
      }
    }

    // Update move effectiveness table
    await this.updateMoveEffectiveness(battleId);
  }

  private saveBattleLog(
    battleId: number,
    turn: number,
    actionType: string,
    actor: string,
    target: string | null,
    move: string | null,
    damage: number,
    effectiveness: number,
    critical: boolean,
    success: boolean,
    message: string
  ): void {
    this.db.prepare(`
      INSERT INTO battle_logs (
        battle_id, turn_number, action_type, acting_pokemon, target_pokemon,
        move_used, damage_dealt, effectiveness, critical_hit, succeeded, log_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      battleId,
      turn,
      actionType,
      actor,
      target,
      move,
      damage,
      effectiveness,
      critical ? 1 : 0,
      success ? 1 : 0,
      message
    );
  }

  private cleanPokemonName(fullName: string): string {
    // Remove player prefix (p1a:, p2a:, etc) and extra info
    return fullName.replace(/^p[12][a-z]:\s*/i, '').split(',')[0].trim();
  }

  private estimateDamage(hpStatus: string): number {
    // Try to extract damage from HP status (this is approximate)
    // Format: "100/100" or "50/100 psn"
    const match = hpStatus.match(/(\d+)\/(\d+)/);
    if (match) {
      const current = parseInt(match[1]);
      const max = parseInt(match[2]);
      return max - current;
    }
    return 0;
  }

  private async updateMoveEffectiveness(battleId: number): Promise<void> {
    // Get all move logs from this battle
    const moveLogs = this.db.prepare(`
      SELECT * FROM battle_logs
      WHERE battle_id = ? AND action_type = 'move' AND move_used IS NOT NULL
    `).all(battleId) as any[];

    for (const log of moveLogs) {
      // Try to find Pokemon IDs (simplified - in production would need better Pokemon tracking)
      const attackerSpecies = this.db.prepare(`
        SELECT id FROM pokemon_species WHERE name LIKE ? LIMIT 1
      `).get(`%${log.acting_pokemon}%`) as any;

      const defenderSpecies = log.target_pokemon ? this.db.prepare(`
        SELECT id FROM pokemon_species WHERE name LIKE ? LIMIT 1
      `).get(`%${log.target_pokemon}%`) as any : null;

      if (!attackerSpecies || !defenderSpecies) continue;

      // Update or insert move effectiveness
      const existing = this.db.prepare(`
        SELECT * FROM move_effectiveness
        WHERE attacker_pokemon_id = ? AND defender_pokemon_id = ? AND move_name = ?
      `).get(attackerSpecies.id, defenderSpecies.id, log.move_used) as any;

      if (existing) {
        // Update existing record
        const newTotalUses = existing.total_uses + 1;
        const newSuccessfulUses = existing.successful_uses + (log.succeeded ? 1 : 0);
        const newTotalDamage = existing.total_damage + (log.damage_dealt || 0);
        const newAverageDamage = newTotalDamage / newTotalUses;
        const newKoCount = existing.ko_count; // Would need to track if this move caused a KO

        const effectivenessRating = this.calculateEffectivenessRating(
          newSuccessfulUses,
          newTotalUses,
          newAverageDamage,
          log.effectiveness || 1.0,
          newKoCount
        );

        this.db.prepare(`
          UPDATE move_effectiveness
          SET total_uses = ?,
              successful_uses = ?,
              total_damage = ?,
              average_damage = ?,
              critical_hits = critical_hits + ?,
              effectiveness_rating = ?,
              last_used = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          newTotalUses,
          newSuccessfulUses,
          newTotalDamage,
          newAverageDamage,
          log.critical_hit ? 1 : 0,
          effectivenessRating,
          existing.id
        );
      } else {
        // Insert new record
        const effectivenessRating = this.calculateEffectivenessRating(
          log.succeeded ? 1 : 0,
          1,
          log.damage_dealt || 0,
          log.effectiveness || 1.0,
          0
        );

        this.db.prepare(`
          INSERT INTO move_effectiveness (
            attacker_pokemon_id, defender_pokemon_id, move_name,
            total_uses, successful_uses, total_damage, average_damage,
            ko_count, critical_hits, effectiveness_rating, last_used
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(
          attackerSpecies.id,
          defenderSpecies.id,
          log.move_used,
          1,
          log.succeeded ? 1 : 0,
          log.damage_dealt || 0,
          log.damage_dealt || 0,
          0,
          log.critical_hit ? 1 : 0,
          effectivenessRating
        );
      }
    }
  }

  private calculateEffectivenessRating(
    successfulUses: number,
    totalUses: number,
    averageDamage: number,
    typeEffectiveness: number,
    koCount: number
  ): number {
    const successRate = totalUses > 0 ? successfulUses / totalUses : 0;
    const damageScore = Math.min(averageDamage / 100, 2); // Normalize to 0-2
    const koScore = koCount * 0.5;

    return (successRate * 1.5) + (damageScore * 2) + (typeEffectiveness * 2) + koScore;
  }
}
