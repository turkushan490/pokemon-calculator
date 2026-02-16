import React, { useState, useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  national_dex_number: number;
  type1: string;
  type2?: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_sp_attack: number;
  base_sp_defense: number;
  base_speed: number;
  win_rate?: number;
  usage_count?: number;
  total_battles?: number;
  wins?: number;
  losses?: number;
}

interface PokemonStats {
  pokemon_id: number;
  pokemon_name: string;
  total_appearances: number;
  total_battles: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_damage_dealt: number;
  avg_damage_taken: number;
  ko_count: number;
  most_used_move?: string;
  most_effective_move?: string;
  common_ev_spread?: string;
  common_nature?: string;
}

export const PokemonAnalytics: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [stats, setStats] = useState<PokemonStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = pokemonList
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 100);
      setFilteredPokemon(filtered);
    } else {
      // Show all Pokemon - already sorted by win_rate from backend
      setFilteredPokemon(pokemonList);
    }
  }, [searchQuery, pokemonList]);

  const loadPokemonList = async () => {
    try {
      const result: any = await window.electronAPI.getPokemonWithRatings();
      if (result && result.success) {
        setPokemonList(result.pokemon);
      }
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
    }
  };

  const loadPokemonStats = async (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setLoading(true);
    setStats(null);

    try {
      const result = await window.electronAPI.getPokemonStats(pokemon.id);
      if (result.success) {
        setStats(result.stats);
      } else {
        // No stats yet
        setStats({
          pokemon_id: pokemon.id,
          pokemon_name: pokemon.name,
          total_appearances: 0,
          total_battles: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          avg_damage_dealt: 0,
          avg_damage_taken: 0,
          ko_count: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load Pokemon stats:', error);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Pokemon Search */}
      <div className="w-1/3 bg-white rounded-lg shadow p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Pokemon Analytics</h2>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded px-4 py-2"
            placeholder="Search Pokemon..."
          />
        </div>

        {loading && selectedPokemon && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading stats...</p>
          </div>
        )}

        {filteredPokemon.length > 0 ? (
          <div className="space-y-2">
            {filteredPokemon.map((pokemon, index) => {
              const rank = index + 1;
              const hasData = (pokemon.total_battles || 0) > 0;
              const winRate = pokemon.win_rate || 0;

              return (
                <div
                  key={pokemon.id}
                  className={`border rounded p-3 cursor-pointer transition flex items-center gap-3 ${
                    selectedPokemon?.id === pokemon.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => loadPokemonStats(pokemon)}
                >
                  {!searchQuery && hasData && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      rank === 2 ? 'bg-gray-300 text-gray-800' :
                      rank === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {rank}
                    </div>
                  )}
                  <img
                    src={`/sprites/animated/${pokemon.national_dex_number}.gif`}
                    alt={pokemon.name}
                    className="w-16 h-16"
                    onError={(e) => {
                      // Fallback to static sprite if animated not available
                      if (e.currentTarget.src.includes('/sprites/animated/')) {
                        e.currentTarget.src = `/sprites/static/${pokemon.national_dex_number}.png`;
                      } else if (e.currentTarget.src.includes('/sprites/static/')) {
                        // Final fallback to GitHub
                        e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.national_dex_number}.png`;
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold capitalize">
                      #{pokemon.national_dex_number} {pokemon.name}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {pokemon.type1}{pokemon.type2 ? ` / ${pokemon.type2}` : ''}
                    </div>
                    {hasData && (
                      <div className="text-xs text-gray-500 mt-1">
                        Win Rate: {(winRate * 100).toFixed(1)}% • {pokemon.total_battles} battles
                      </div>
                    )}
                  </div>
                  {hasData && (
                    <div className={`text-sm font-semibold ${
                      winRate >= 0.7 ? 'text-green-600' :
                      winRate >= 0.5 ? 'text-blue-600' :
                      winRate >= 0.3 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {(winRate * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No Pokemon found</p>
        )}
      </div>

      {/* Right Panel - Pokemon Statistics */}
      <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
        {!selectedPokemon ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">Select a Pokemon</p>
              <p className="text-sm mt-1">Search and click on a Pokemon to view its statistics</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pokemon Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
              <div className="flex justify-between items-start gap-4">
                <img
                  src={`/sprites/animated/${selectedPokemon.national_dex_number}.gif`}
                  alt={selectedPokemon.name}
                  className="w-24 h-24 bg-white bg-opacity-20 rounded-lg p-2"
                  onError={(e) => {
                    if (e.currentTarget.src.includes('/sprites/animated/')) {
                      e.currentTarget.src = `/sprites/static/${selectedPokemon.national_dex_number}.png`;
                    } else if (e.currentTarget.src.includes('/sprites/static/')) {
                      e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.national_dex_number}.png`;
                    }
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold capitalize">{selectedPokemon.name}</h2>
                  <p className="text-blue-100">National Dex #{selectedPokemon.national_dex_number}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm capitalize font-semibold">
                      {selectedPokemon.type1}
                    </span>
                    {selectedPokemon.type2 && (
                      <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm capitalize font-semibold">
                        {selectedPokemon.type2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">In Teams</div>
                  <div className="text-4xl font-bold">{stats?.total_appearances || 0}</div>
                  <div className="text-sm text-blue-100 mt-2">Total Battles</div>
                  <div className="text-2xl font-bold">{stats?.total_battles || 0}</div>
                </div>
              </div>
            </div>

            {stats && stats.total_battles > 0 ? (
              <>
                {/* Win/Loss Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 text-sm font-medium">Wins</div>
                    <div className="text-3xl font-bold text-green-700">{stats.wins}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm font-medium">Losses</div>
                    <div className="text-3xl font-bold text-red-700">{stats.losses}</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-600 text-sm font-medium">Win Rate</div>
                    <div className="text-3xl font-bold text-blue-700">
                      {(stats.win_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Battle Performance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Battle Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Average Damage Dealt</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(stats.avg_damage_dealt || 0)} HP
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Average Damage Taken</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(stats.avg_damage_taken || 0)} HP
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total KOs</div>
                      <div className="text-2xl font-bold text-red-600">{stats.ko_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">KO Rate</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.total_battles > 0
                          ? ((stats.ko_count / stats.total_battles) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Used Data */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Most Used Configuration</h3>
                  <div className="space-y-3">
                    {stats.most_used_move && (
                      <div>
                        <div className="text-sm text-gray-600">Most Used Move</div>
                        <div className="text-lg font-semibold text-blue-600">{stats.most_used_move}</div>
                      </div>
                    )}
                    {stats.most_effective_move && (
                      <div>
                        <div className="text-sm text-gray-600">Most Effective Move</div>
                        <div className="text-lg font-semibold text-green-600">{stats.most_effective_move}</div>
                      </div>
                    )}
                    {stats.common_nature && (
                      <div>
                        <div className="text-sm text-gray-600">Common Nature</div>
                        <div className="text-lg font-semibold">{stats.common_nature}</div>
                      </div>
                    )}
                    {stats.common_ev_spread && (
                      <div>
                        <div className="text-sm text-gray-600">Common EV Spread</div>
                        <div className="text-sm font-mono bg-white p-2 rounded">
                          {stats.common_ev_spread}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Base Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Base Stats</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'HP', value: selectedPokemon.base_hp, color: 'bg-red-500' },
                      { name: 'Attack', value: selectedPokemon.base_attack, color: 'bg-orange-500' },
                      { name: 'Defense', value: selectedPokemon.base_defense, color: 'bg-yellow-500' },
                      { name: 'Sp. Atk', value: selectedPokemon.base_sp_attack, color: 'bg-blue-500' },
                      { name: 'Sp. Def', value: selectedPokemon.base_sp_defense, color: 'bg-green-500' },
                      { name: 'Speed', value: selectedPokemon.base_speed, color: 'bg-purple-500' },
                    ].map((stat) => (
                      <div key={stat.name} className="flex items-center gap-3">
                        <div className="w-20 text-sm text-gray-600">{stat.name}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div
                            className={`${stat.color} h-4 rounded-full transition-all`}
                            style={{ width: `${(stat.value / 255) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right font-semibold">{stat.value}</div>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Base Stat Total</span>
                        <span className="font-bold">
                          {selectedPokemon.base_hp +
                            selectedPokemon.base_attack +
                            selectedPokemon.base_defense +
                            selectedPokemon.base_sp_attack +
                            selectedPokemon.base_sp_defense +
                            selectedPokemon.base_speed}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No Battle Data Yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  This Pokemon hasn't been used in any simulations yet.
                </p>
                <p className="text-gray-400 text-sm">
                  Create teams with {selectedPokemon.name} and run simulations to see statistics!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
