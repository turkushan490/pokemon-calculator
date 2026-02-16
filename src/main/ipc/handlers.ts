import { ipcMain, BrowserWindow } from 'electron';
import { TeamRepository } from '../database/repositories/TeamRepository';
import { PokemonRepository } from '../database/repositories/PokemonRepository';
import { DataSync } from '../data/DataSync';
import { SimulationManager } from '../simulation/SimulationManager';
import { Dex } from '@pkmn/dex';

export function setupIPCHandlers(
  teamRepo: TeamRepository,
  pokemonRepo: PokemonRepository,
  dataSync: DataSync,
  simulationManager: SimulationManager
): void {
  // Team operations
  ipcMain.handle('db:createTeam', async (_event, teamData) => {
    try {
      const team = teamRepo.createTeam(
        teamData.name,
        teamData.format,
        teamData.members
      );
      return { success: true, team };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('db:getTeams', async () => {
    try {
      const teams = teamRepo.getAllTeams();
      return { success: true, teams };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('db:getTeam', async (_event, id: number) => {
    try {
      const result = teamRepo.getTeamWithMembers(id);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('db:generateRandomTeam', async (_event, format: string = 'VGC 2025 Reg G') => {
    try {
      const allPokemon = pokemonRepo.getAllPokemon();

      if (allPokemon.length === 0) {
        return { success: false, error: 'No Pokemon data available. Please sync data first.' };
      }

      // Get 6 random Pokemon
      const shuffled = [...allPokemon].sort(() => Math.random() - 0.5);
      const selectedPokemon = shuffled.slice(0, 6);

      // Common natures for competitive play
      const competitiveNatures = [
        'Adamant', 'Jolly', 'Modest', 'Timid', 'Bold', 'Calm',
        'Careful', 'Impish', 'Brave', 'Quiet', 'Relaxed', 'Sassy'
      ];

      // Common competitive items
      const commonItems = [
        'Focus Sash', 'Life Orb', 'Choice Scarf', 'Choice Band',
        'Choice Specs', 'Assault Vest', 'Leftovers', 'Sitrus Berry',
        'Safety Goggles', 'Rocky Helmet', 'Mental Herb', 'Covert Cloak'
      ];

      // Get actual learnable moves from @pkmn/dex
      const getLearnableMoves = (pokemonName: string): string[] => {
        try {
          const species = Dex.species.get(pokemonName);
          const learnset = Dex.learnsets.get(species.id);

          if (!learnset?.learnset) {
            // Fallback to safe moves if learnset not found
            return ['Tackle', 'Take Down', 'Body Slam', 'Protect'];
          }

          // Get all moves this Pokemon can learn
          const allMoves = Object.keys(learnset.learnset);

          // Filter for useful competitive moves (exclude very weak or situational moves)
          const usefulMoves = allMoves.filter(moveId => {
            const move = Dex.moves.get(moveId);
            // Include damaging moves with power >= 50, or useful status moves
            return (
              (move.category !== 'Status' && (move.basePower || 0) >= 50) ||
              ['Protect', 'Detect', 'Tailwind', 'Trick Room', 'Will-O-Wisp',
               'Thunder Wave', 'Toxic', 'Stealth Rock', 'Spikes'].includes(move.name)
            );
          }).map(moveId => Dex.moves.get(moveId).name);

          return usefulMoves.length > 0 ? usefulMoves : ['Tackle', 'Take Down', 'Body Slam', 'Protect'];
        } catch (error) {
          console.error(`Error getting moves for ${pokemonName}:`, error);
          return ['Tackle', 'Take Down', 'Body Slam', 'Protect'];
        }
      };

      // Common EV spreads
      const evSpreads = [
        { hp: 252, attack: 252, defense: 0, sp_attack: 0, sp_defense: 4, speed: 0 }, // Physical Attacker
        { hp: 252, attack: 0, defense: 0, sp_attack: 252, sp_defense: 4, speed: 0 }, // Special Attacker
        { hp: 252, attack: 0, defense: 252, sp_attack: 0, sp_defense: 4, speed: 0 }, // Physical Wall
        { hp: 252, attack: 0, defense: 4, sp_attack: 0, sp_defense: 252, speed: 0 }, // Special Wall
        { hp: 4, attack: 252, defense: 0, sp_attack: 0, sp_defense: 0, speed: 252 }, // Fast Physical
        { hp: 4, attack: 0, defense: 0, sp_attack: 252, sp_defense: 0, speed: 252 }, // Fast Special
        { hp: 252, attack: 0, defense: 124, sp_attack: 0, sp_defense: 132, speed: 0 }, // Bulky Support
        { hp: 244, attack: 0, defense: 0, sp_attack: 0, sp_defense: 12, speed: 252 }, // Fast Support
      ];

      const members = selectedPokemon.map((pokemon, index) => {
        const evSpread = evSpreads[Math.floor(Math.random() * evSpreads.length)];
        const nature = competitiveNatures[Math.floor(Math.random() * competitiveNatures.length)];
        const item = commonItems[Math.floor(Math.random() * commonItems.length)];

        // Get moves this Pokemon can actually learn
        const learnableMoves = getLearnableMoves(pokemon.name);

        // Select 4 random moves from learnable moves
        const shuffledMoves = [...learnableMoves].sort(() => Math.random() - 0.5);
        const selectedMoves = shuffledMoves.slice(0, 4);

        // Always include Protect for doubles format if the Pokemon can learn it
        if (format.toLowerCase().includes('vgc') || format.toLowerCase().includes('doubles')) {
          const protectMoves = ['Protect', 'Detect', 'Baneful Bunker', 'King\'s Shield', 'Spiky Shield'];
          const hasProtect = selectedMoves.some(m => protectMoves.includes(m));

          if (!hasProtect) {
            // Find a protect move this Pokemon can learn
            const learnableProtect = protectMoves.find(pm => learnableMoves.includes(pm));
            if (learnableProtect) {
              selectedMoves[0] = learnableProtect;
            }
          }
        }

        // Ensure we have 4 moves (pad if necessary)
        while (selectedMoves.length < 4) {
          const randomMove = learnableMoves[Math.floor(Math.random() * learnableMoves.length)];
          if (!selectedMoves.includes(randomMove)) {
            selectedMoves.push(randomMove);
          }
        }

        return {
          position: index + 1,
          pokemon_id: pokemon.id,
          level: 50,
          nature,
          ability: pokemon.ability1,
          item,
          tera_type: pokemon.type1,
          hp_iv: 31,
          attack_iv: 31,
          defense_iv: 31,
          sp_attack_iv: 31,
          sp_defense_iv: 31,
          speed_iv: 31,
          hp_ev: evSpread.hp,
          attack_ev: evSpread.attack,
          defense_ev: evSpread.defense,
          sp_attack_ev: evSpread.sp_attack,
          sp_defense_ev: evSpread.sp_defense,
          speed_ev: evSpread.speed,
          move1: selectedMoves[0],
          move2: selectedMoves[1],
          move3: selectedMoves[2],
          move4: selectedMoves[3],
        };
      });

      return {
        success: true,
        members,
        pokemon: selectedPokemon
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  // Pokemon data operations
  ipcMain.handle('data:getPokemon', async () => {
    try {
      const pokemon = pokemonRepo.getAllPokemon();
      return { success: true, pokemon };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('data:searchPokemon', async (_event, query: string) => {
    try {
      const pokemon = pokemonRepo.searchPokemon(query);
      return { success: true, pokemon };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  // Data sync
  ipcMain.handle('data:sync', async () => {
    try {
      const report = await dataSync.syncAllData();
      return { success: true, report };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('data:needsSync', async () => {
    try {
      const needs = await dataSync.needsUpdate();
      return { success: true, needsSync: needs };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  // Simulation operations
  ipcMain.handle('simulation:start', async (_event, config) => {
    try {
      const simulationId = await simulationManager.startSimulation(config);
      return { success: true, simulationId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:pause', async () => {
    try {
      simulationManager.pause();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:resume', async () => {
    try {
      simulationManager.resume();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:stop', async () => {
    try {
      simulationManager.stop();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:getStatus', async (_event, simulationId: number) => {
    try {
      const status = simulationManager.getSimulationStatus(simulationId);
      return { success: true, status };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:getAll', async () => {
    try {
      const simulations = simulationManager.getAllSimulations();
      return { success: true, simulations };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:getBattleResults', async (_event, simulationId: number, limit?: number) => {
    try {
      const battles = simulationManager.getBattleResults(simulationId, limit);
      return { success: true, battles };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:getTeamStats', async (_event, teamId?: number) => {
    try {
      const stats = teamId
        ? simulationManager.getTeamStats(teamId)
        : simulationManager.getAllTeamStats();
      return { success: true, stats };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('simulation:getBattleLogs', async (_event, battleId: number) => {
    try {
      const db = (simulationManager as any).db;
      const battle = db.prepare('SELECT * FROM battles WHERE id = ?').get(battleId);
      const logs = db.prepare('SELECT * FROM battle_logs WHERE battle_id = ? ORDER BY turn_number, id').all(battleId);
      return { success: true, battle, logs };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('pokemon:getAllWithRatings', async () => {
    try {
      const db = (simulationManager as any).db;

      // Get all Pokemon with their win rates
      const pokemonWithRatings = db.prepare(`
        SELECT
          ps.*,
          COUNT(DISTINCT tm.team_id) as usage_count,
          COALESCE(SUM(t.total_battles), 0) as total_battles,
          COALESCE(SUM(t.wins), 0) as wins,
          COALESCE(SUM(t.losses), 0) as losses,
          CASE
            WHEN SUM(t.total_battles) > 0 THEN CAST(SUM(t.wins) AS REAL) / SUM(t.total_battles)
            ELSE 0
          END as win_rate
        FROM pokemon_species ps
        LEFT JOIN team_members tm ON ps.id = tm.pokemon_id
        LEFT JOIN teams t ON tm.team_id = t.id
        GROUP BY ps.id
        ORDER BY win_rate DESC, usage_count DESC, ps.national_dex_number ASC
      `).all();

      return { success: true, pokemon: pokemonWithRatings };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('pokemon:getStats', async (_event, pokemonId: number) => {
    try {
      const db = (simulationManager as any).db;

      // Get Pokemon name first
      const pokemonInfo = db.prepare(`
        SELECT name FROM pokemon_species WHERE id = ?
      `).get(pokemonId);

      if (!pokemonInfo) {
        return { success: false, error: 'Pokemon not found' };
      }

      // Get total teams using this Pokemon
      const teamCount = db.prepare(`
        SELECT COUNT(DISTINCT team_id) as count
        FROM team_members
        WHERE pokemon_id = ?
      `).get(pokemonId);

      // Get aggregated wins/losses from teams using this Pokemon
      const battleStats = db.prepare(`
        SELECT
          SUM(t.total_battles) as total_battles,
          SUM(t.wins) as total_wins,
          SUM(t.losses) as total_losses
        FROM teams t
        WHERE t.id IN (
          SELECT DISTINCT team_id
          FROM team_members
          WHERE pokemon_id = ?
        )
      `).get(pokemonId);

      const totalBattles = battleStats?.total_battles || 0;
      const totalWins = battleStats?.total_wins || 0;
      const totalLosses = battleStats?.total_losses || 0;
      const winRate = totalBattles > 0 ? totalWins / totalBattles : 0;

      // Get most used move
      const mostUsedMove = db.prepare(`
        SELECT move1 as move, COUNT(*) as count FROM team_members WHERE pokemon_id = ? GROUP BY move1
        UNION ALL
        SELECT move2, COUNT(*) FROM team_members WHERE pokemon_id = ? GROUP BY move2
        UNION ALL
        SELECT move3, COUNT(*) FROM team_members WHERE pokemon_id = ? GROUP BY move3
        UNION ALL
        SELECT move4, COUNT(*) FROM team_members WHERE pokemon_id = ? GROUP BY move4
        ORDER BY count DESC LIMIT 1
      `).get(pokemonId, pokemonId, pokemonId, pokemonId);

      // Get common nature
      const commonNature = db.prepare(`
        SELECT nature, COUNT(*) as count
        FROM team_members
        WHERE pokemon_id = ?
        GROUP BY nature
        ORDER BY count DESC
        LIMIT 1
      `).get(pokemonId);

      // Get common EV spread
      const commonEVSpread = db.prepare(`
        SELECT
          hp_ev, attack_ev, defense_ev, sp_attack_ev, sp_defense_ev, speed_ev,
          COUNT(*) as count
        FROM team_members
        WHERE pokemon_id = ?
        GROUP BY hp_ev, attack_ev, defense_ev, sp_attack_ev, sp_defense_ev, speed_ev
        ORDER BY count DESC
        LIMIT 1
      `).get(pokemonId);

      const stats = {
        pokemon_id: pokemonId,
        pokemon_name: pokemonInfo.name,
        total_appearances: teamCount?.count || 0,
        total_battles: totalBattles,
        wins: totalWins,
        losses: totalLosses,
        win_rate: winRate,
        avg_damage_dealt: 0, // Placeholder - needs battle log data
        avg_damage_taken: 0, // Placeholder - needs battle log data
        ko_count: 0, // Placeholder - needs battle log data
        most_used_move: mostUsedMove?.move,
        common_nature: commonNature?.nature,
        common_ev_spread: commonEVSpread ?
          `${commonEVSpread.hp_ev} HP / ${commonEVSpread.attack_ev} Atk / ${commonEVSpread.defense_ev} Def / ${commonEVSpread.sp_attack_ev} SpA / ${commonEVSpread.sp_defense_ev} SpD / ${commonEVSpread.speed_ev} Spe` :
          undefined
      };

      return { success: true, stats };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  // Data reset
  ipcMain.handle('data:resetAllData', async () => {
    try {
      const db = (simulationManager as any).db;

      // Delete all battle-related data
      db.prepare('DELETE FROM battle_logs').run();
      db.prepare('DELETE FROM battles').run();
      db.prepare('DELETE FROM simulations').run();

      // Reset team statistics
      db.prepare(`
        UPDATE teams
        SET total_battles = 0, wins = 0, losses = 0, draws = 0
      `).run();

      return { success: true, message: 'All battle data has been reset' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  });

  // Setup progress listener
  simulationManager.on('progress', (progress) => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send('simulation:progress', progress);
    });
  });
}
