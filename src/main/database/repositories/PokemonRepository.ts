import Database from 'better-sqlite3';
import { PokemonSpecies } from '../schema';

export class PokemonRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  getAllPokemon(): PokemonSpecies[] {
    return this.db
      .prepare('SELECT * FROM pokemon_species ORDER BY national_dex_number')
      .all() as PokemonSpecies[];
  }

  getPokemonById(id: number): PokemonSpecies | null {
    return (this.db
      .prepare('SELECT * FROM pokemon_species WHERE id = ?')
      .get(id) as PokemonSpecies) || null;
  }

  getPokemonByName(name: string): PokemonSpecies | null {
    return (this.db
      .prepare('SELECT * FROM pokemon_species WHERE name = ?')
      .get(name) as PokemonSpecies) || null;
  }

  searchPokemon(query: string): PokemonSpecies[] {
    return this.db
      .prepare('SELECT * FROM pokemon_species WHERE name LIKE ? ORDER BY national_dex_number LIMIT 20')
      .all(`%${query}%`) as PokemonSpecies[];
  }
}
