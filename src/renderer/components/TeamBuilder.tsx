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
  ability1: string;
  ability2?: string;
  hidden_ability?: string;
}

interface TeamMember {
  position: number;
  pokemon_id: number;
  pokemon?: Pokemon;
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

const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
  'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const COMMON_MOVES = [
  'Tackle', 'Protect', 'Fake Out', 'Quick Attack', 'Earthquake',
  'Ice Beam', 'Thunderbolt', 'Flamethrower', 'Surf', 'Energy Ball',
  'Shadow Ball', 'Sludge Bomb', 'Stone Edge', 'Iron Head', 'Play Rough',
  'Close Combat', 'U-turn', 'Volt Switch', 'Trick Room', 'Tailwind'
];

export const TeamBuilder: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [format, setFormat] = useState('VGC 2025 Reg G');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = pokemonList.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 100);
      setFilteredPokemon(filtered);
    } else {
      // Show all Pokemon sorted by dex number
      const sorted = [...pokemonList].sort((a, b) => a.national_dex_number - b.national_dex_number);
      setFilteredPokemon(sorted);
    }
  }, [searchQuery, pokemonList]);

  const loadPokemonList = async () => {
    setLoading(true);
    try {
      const result: any = await window.electronAPI.getPokemon();
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        setPokemonList(result.pokemon);
      }
    } catch (error) {
      console.error('Failed to load Pokemon:', error);
    }
    setLoading(false);
  };

  const createDefaultMember = (pokemon: Pokemon, position: number): TeamMember => {
    return {
      position,
      pokemon_id: pokemon.id,
      pokemon,
      level: 50,
      nature: 'Hardy',
      ability: pokemon.ability1,
      tera_type: pokemon.type1,
      hp_iv: 31,
      attack_iv: 31,
      defense_iv: 31,
      sp_attack_iv: 31,
      sp_defense_iv: 31,
      speed_iv: 31,
      hp_ev: 0,
      attack_ev: 0,
      defense_ev: 0,
      sp_attack_ev: 0,
      sp_defense_ev: 0,
      speed_ev: 0,
      move1: 'Tackle',
      move2: 'Protect',
      move3: 'Quick Attack',
      move4: 'Rest'
    };
  };

  const addPokemonToTeam = (pokemon: Pokemon) => {
    if (teamMembers.length >= 6) {
      alert('Team is full! (Max 6 Pokemon)');
      return;
    }

    const position = teamMembers.length + 1;
    const newMember = createDefaultMember(pokemon, position);
    setTeamMembers([...teamMembers, newMember]);
    // Keep the list visible - don't clear search
  };

  const removePokemonFromTeam = (position: number) => {
    const updated = teamMembers
      .filter(m => m.position !== position)
      .map((m, idx) => ({ ...m, position: idx + 1 }));
    setTeamMembers(updated);
    if (selectedPosition === position) {
      setSelectedPosition(null);
      setSelectedPokemon(null);
    }
  };

  const updateTeamMember = (position: number, updates: Partial<TeamMember>) => {
    setTeamMembers(members =>
      members.map(m => m.position === position ? { ...m, ...updates } : m)
    );
  };

  const selectMemberForEdit = (member: TeamMember) => {
    setSelectedPosition(member.position);
    setSelectedPokemon(member.pokemon || null);
  };

  const getTotalEVs = (member: TeamMember): number => {
    return member.hp_ev + member.attack_ev + member.defense_ev +
           member.sp_attack_ev + member.sp_defense_ev + member.speed_ev;
  };

  const generateRandomTeam = async () => {
    if (teamMembers.length > 0) {
      if (!confirm('This will replace your current team. Continue?')) {
        return;
      }
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.generateRandomTeam(format);
      if (result.success) {
        const membersWithPokemon = result.members.map((member: any, index: number) => ({
          ...member,
          pokemon: result.pokemon[index]
        }));
        setTeamMembers(membersWithPokemon);
        setSaveStatus('Random team generated! Review and save when ready.');
        setTimeout(() => setSaveStatus(''), 5000);
      } else {
        alert(`Failed to generate team: ${result.error}`);
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('Failed to generate random team');
    }
    setLoading(false);
  };

  const saveTeam = async () => {
    if (!teamName) {
      alert('Please enter a team name');
      return;
    }
    if (teamMembers.length === 0) {
      alert('Please add at least one Pokemon');
      return;
    }

    setSaveStatus('Saving...');
    try {
      const teamData = {
        name: teamName,
        format,
        members: teamMembers.map(m => {
          const { pokemon, ...memberData } = m;
          return memberData;
        })
      };

      const result = await window.electronAPI.createTeam(teamData);
      if (result.success) {
        setSaveStatus('Team saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setSaveStatus('Failed to save team');
      console.error('Save error:', error);
    }
  };

  const selectedMember = teamMembers.find(m => m.position === selectedPosition);

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Team Overview */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Team Setup</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="My Awesome Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option>VGC 2025 Reg G</option>
                <option>Smogon Doubles OU</option>
                <option>Battle Stadium Doubles</option>
                <option>Custom Singles</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex-1 overflow-auto">
          <h3 className="font-bold mb-3">Current Team ({teamMembers.length}/6)</h3>
          {teamMembers.length === 0 ? (
            <p className="text-gray-400 text-sm">No Pokemon added yet</p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.position}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                    selectedPosition === member.position ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => selectMemberForEdit(member)}
                >
                  {member.pokemon && (
                    <img
                      src={`poke://sprites/animated/${member.pokemon.national_dex_number}.gif`}
                      alt={member.pokemon.name}
                      className="w-12 h-12"
                      onError={(e) => {
                        if (e.currentTarget.src.includes('animated/')) {
                          e.currentTarget.src = `poke://sprites/static/${member.pokemon.national_dex_number}.png`;
                        } else if (e.currentTarget.src.includes('static/')) {
                          e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.pokemon.national_dex_number}.png`;
                        }
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold capitalize">
                      {member.nickname || member.pokemon?.name || `#${member.pokemon_id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {member.level} • {member.nature}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePokemonFromTeam(member.position);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={generateRandomTeam}
          disabled={loading}
          className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300"
        >
          {loading ? 'Generating...' : 'Generate Random Team'}
        </button>

        <button
          onClick={saveTeam}
          disabled={!teamName || teamMembers.length === 0}
          className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300"
        >
          Save Team
        </button>
        {saveStatus && (
          <div className={`text-center text-sm ${saveStatus.includes('Error') || saveStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {saveStatus}
          </div>
        )}
      </div>

      {/* Middle Panel - Pokemon Search or Editor */}
      <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-auto">
        {!selectedMember ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Add Pokemon to Team</h2>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded px-4 py-2"
                placeholder="Search Pokemon..."
              />
            </div>
            {loading ? (
              <p className="text-gray-500">Loading Pokemon...</p>
            ) : filteredPokemon.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredPokemon.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="border rounded p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => addPokemonToTeam(pokemon)}
                  >
                    <img
                      src={`poke://sprites/animated/${pokemon.national_dex_number}.gif`}
                      alt={pokemon.name}
                      className="w-16 h-16"
                      onError={(e) => {
                        if (e.currentTarget.src.includes('animated/')) {
                          e.currentTarget.src = `poke://sprites/static/${pokemon.national_dex_number}.png`;
                        } else if (e.currentTarget.src.includes('static/')) {
                          e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.national_dex_number}.png`;
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold capitalize">#{pokemon.national_dex_number} {pokemon.name}</div>
                      <div className="text-sm text-gray-600">
                        <span className="capitalize">{pokemon.type1}</span>
                        {pokemon.type2 && <span> / {pokemon.type2}</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        HP: {pokemon.base_hp} | Atk: {pokemon.base_attack} | Def: {pokemon.base_defense}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No Pokemon found</p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold capitalize">
                Edit {selectedMember.pokemon?.name || 'Pokemon'}
              </h2>
              <button
                onClick={() => {
                  setSelectedPosition(null);
                  setSelectedPokemon(null);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Back to Search
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nickname</label>
                  <input
                    type="text"
                    value={selectedMember.nickname || ''}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { nickname: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <input
                    type="number"
                    value={selectedMember.level}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { level: parseInt(e.target.value) || 50 })}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nature</label>
                  <select
                    value={selectedMember.nature}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { nature: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={selectedMember.gender || ''}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { gender: e.target.value as 'M' | 'F' | undefined })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Genderless</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ability</label>
                  <select
                    value={selectedMember.ability}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { ability: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value={selectedPokemon?.ability1 || ''}>{selectedPokemon?.ability1}</option>
                    {selectedPokemon?.ability2 && <option value={selectedPokemon.ability2}>{selectedPokemon.ability2}</option>}
                    {selectedPokemon?.hidden_ability && <option value={selectedPokemon.hidden_ability}>{selectedPokemon.hidden_ability} (HA)</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Item</label>
                  <input
                    type="text"
                    value={selectedMember.item || ''}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { item: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Focus Sash"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tera Type</label>
                  <select
                    value={selectedMember.tera_type}
                    onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { tera_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* IVs */}
              <div>
                <h3 className="font-semibold mb-2">IVs (Individual Values)</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'].map((stat) => (
                    <div key={stat}>
                      <label className="block text-xs mb-1 capitalize">{stat.replace('_', ' ')}</label>
                      <input
                        type="number"
                        value={selectedMember[`${stat}_iv` as keyof TeamMember] as number}
                        onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { [`${stat}_iv`]: Math.min(31, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full border rounded px-2 py-1 text-sm"
                        min="0"
                        max="31"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* EVs */}
              <div>
                <h3 className="font-semibold mb-2">
                  EVs (Effort Values) - Total: {getTotalEVs(selectedMember)}/510
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'].map((stat) => (
                    <div key={stat}>
                      <label className="block text-xs mb-1 capitalize">{stat.replace('_', ' ')}</label>
                      <input
                        type="number"
                        value={selectedMember[`${stat}_ev` as keyof TeamMember] as number}
                        onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { [`${stat}_ev`]: Math.min(252, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full border rounded px-2 py-1 text-sm"
                        min="0"
                        max="252"
                        step="4"
                      />
                    </div>
                  ))}
                </div>
                {getTotalEVs(selectedMember) > 510 && (
                  <p className="text-red-600 text-sm mt-1">Total EVs cannot exceed 510!</p>
                )}
              </div>

              {/* Moves */}
              <div>
                <h3 className="font-semibold mb-2">Moves</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['move1', 'move2', 'move3', 'move4'].map((moveSlot, idx) => (
                    <div key={moveSlot}>
                      <label className="block text-xs mb-1">Move {idx + 1}</label>
                      <input
                        type="text"
                        value={selectedMember[moveSlot as keyof TeamMember] as string}
                        onChange={(e) => selectedPosition && updateTeamMember(selectedPosition, { [moveSlot]: e.target.value })}
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="e.g., Earthquake"
                        list={`moves-${idx}`}
                      />
                      <datalist id={`moves-${idx}`}>
                        {COMMON_MOVES.map(m => <option key={m} value={m} />)}
                      </datalist>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
