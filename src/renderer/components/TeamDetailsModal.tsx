import React, { useState, useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  national_dex_number: number;
  type1: string;
  type2?: string;
}

interface TeamMember {
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

interface Team {
  id: number;
  name: string;
  format: string;
}

interface TeamDetailsModalProps {
  teamId: number;
  onClose: () => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ teamId, onClose }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pokemonData, setPokemonData] = useState<Map<number, Pokemon>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamDetails();
  }, [teamId]);

  const loadTeamDetails = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getTeam(teamId);
      if (result.success && result.data) {
        setTeam(result.data.team);
        setMembers(result.data.members);

        // Load Pokemon data for each member
        const pokemonResult: any = await window.electronAPI.getPokemon();
        if (pokemonResult.success) {
          const pokemonMap = new Map<number, Pokemon>();
          pokemonResult.pokemon.forEach((p: Pokemon) => {
            pokemonMap.set(p.id, p);
          });
          setPokemonData(pokemonMap);
        }
      }
    } catch (error) {
      console.error('Failed to load team details:', error);
    }
    setLoading(false);
  };

  const getTotalEVs = (member: TeamMember): number => {
    return member.hp_ev + member.attack_ev + member.defense_ev +
           member.sp_attack_ev + member.sp_defense_ev + member.speed_ev;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{team?.name || `Team #${teamId}`}</h2>
            <p className="text-blue-100 text-sm mt-1">{team?.format}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {members.map((member) => {
              const pokemon = pokemonData.get(member.pokemon_id);
              const totalEVs = getTotalEVs(member);

              return (
                <div key={member.id} className="border rounded-lg shadow-sm hover:shadow-md transition">
                  {/* Pokemon Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                    <div className="flex justify-between items-start gap-3">
                      {pokemon && (
                        <img
                          src={`/sprites/animated/${pokemon.national_dex_number}.gif`}
                          alt={pokemon.name}
                          className="w-20 h-20"
                          onError={(e) => {
                            if (e.currentTarget.src.includes('/sprites/animated/')) {
                              e.currentTarget.src = `/sprites/static/${pokemon.national_dex_number}.png`;
                            } else if (e.currentTarget.src.includes('/sprites/static/')) {
                              e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.national_dex_number}.png`;
                            }
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold capitalize">
                          {member.nickname || pokemon?.name || `Pokemon #${member.pokemon_id}`}
                        </h3>
                        {member.nickname && (
                          <p className="text-sm text-gray-600 capitalize">({pokemon?.name})</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {pokemon?.type1 && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 capitalize">
                              {pokemon.type1}
                            </span>
                          )}
                          {pokemon?.type2 && (
                            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 capitalize">
                              {pokemon.type2}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold">Lv. {member.level}</div>
                        {member.gender && <div className="text-gray-500">{member.gender}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Pokemon Details */}
                  <div className="p-4 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Nature:</span>
                        <span className="ml-2 font-semibold">{member.nature}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ability:</span>
                        <span className="ml-2 font-semibold">{member.ability}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Item:</span>
                        <span className="ml-2 font-semibold">{member.item || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tera Type:</span>
                        <span className="ml-2 font-semibold capitalize">{member.tera_type}</span>
                      </div>
                    </div>

                    {/* IVs */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        IVs (Individual Values)
                        <span className="ml-2 text-xs text-gray-500">Max: 31</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-red-50 p-2 rounded">
                          <div className="text-gray-600">HP</div>
                          <div className="font-bold text-red-600">{member.hp_iv}</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-gray-600">Attack</div>
                          <div className="font-bold text-orange-600">{member.attack_iv}</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="text-gray-600">Defense</div>
                          <div className="font-bold text-yellow-600">{member.defense_iv}</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-gray-600">Sp. Atk</div>
                          <div className="font-bold text-blue-600">{member.sp_attack_iv}</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-gray-600">Sp. Def</div>
                          <div className="font-bold text-green-600">{member.sp_defense_iv}</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="text-gray-600">Speed</div>
                          <div className="font-bold text-purple-600">{member.speed_iv}</div>
                        </div>
                      </div>
                    </div>

                    {/* EVs */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center justify-between">
                        <span>EVs (Effort Values)</span>
                        <span className={`text-xs ${totalEVs > 510 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          Total: {totalEVs}/510
                        </span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-red-50 p-2 rounded">
                          <div className="text-gray-600">HP</div>
                          <div className="font-bold text-red-600">{member.hp_ev}</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-gray-600">Attack</div>
                          <div className="font-bold text-orange-600">{member.attack_ev}</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="text-gray-600">Defense</div>
                          <div className="font-bold text-yellow-600">{member.defense_ev}</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-gray-600">Sp. Atk</div>
                          <div className="font-bold text-blue-600">{member.sp_attack_ev}</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-gray-600">Sp. Def</div>
                          <div className="font-bold text-green-600">{member.sp_defense_ev}</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="text-gray-600">Speed</div>
                          <div className="font-bold text-purple-600">{member.speed_ev}</div>
                        </div>
                      </div>
                    </div>

                    {/* Moves */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Moves</h4>
                      <div className="space-y-1">
                        {[member.move1, member.move2, member.move3, member.move4]
                          .filter(Boolean)
                          .map((move, idx) => (
                            <div key={idx} className="bg-gray-50 px-3 py-2 rounded text-sm font-medium">
                              • {move}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {members.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No Pokemon in this team</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
