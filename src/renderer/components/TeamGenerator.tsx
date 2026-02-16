import React, { useState, useEffect } from 'react';

interface GenerationOptions {
  format: string;
  count: number;
  namePrefix: string;
  strategy: 'random' | 'balanced' | 'offensive' | 'defensive';
  autoSave: boolean;
}

interface GeneratedTeam {
  name: string;
  format: string;
  members: any[];
  pokemon: any[];
}

export const TeamGenerator: React.FC = () => {
  const [options, setOptions] = useState<GenerationOptions>({
    format: 'VGC 2025 Reg G',
    count: 1,
    namePrefix: 'Random Team',
    strategy: 'random',
    autoSave: true,
  });

  const [generating, setGenerating] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[]>([]);
  const [status, setStatus] = useState<string>('');
  const [pokemonCount, setPokemonCount] = useState(0);

  useEffect(() => {
    loadPokemonCount();
  }, []);

  const loadPokemonCount = async () => {
    try {
      const result: any = await window.electronAPI.getPokemon();
      if (result && result.success) {
        setPokemonCount(result.pokemon.length);
      }
    } catch (error) {
      console.error('Failed to load Pokemon count:', error);
    }
  };

  const generateTeamName = (index: number): string => {
    const adjectives = [
      'Legendary', 'Epic', 'Ultimate', 'Supreme', 'Elite',
      'Thunder', 'Storm', 'Blaze', 'Frost', 'Shadow',
      'Mighty', 'Swift', 'Iron', 'Diamond', 'Golden',
      'Cosmic', 'Mystic', 'Royal', 'Savage', 'Wild'
    ];

    const nouns = [
      'Warriors', 'Champions', 'Legends', 'Masters', 'Squad',
      'Brigade', 'Alliance', 'Force', 'Team', 'Crew',
      'Guardians', 'Strikers', 'Defenders', 'Slayers', 'Hunters',
      'Dragons', 'Phoenixes', 'Titans', 'Giants', 'Heroes'
    ];

    if (options.namePrefix && options.namePrefix !== 'Random Team') {
      return `${options.namePrefix} ${index + 1}`;
    }

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  };

  const generateSingleTeam = async (index: number): Promise<GeneratedTeam | null> => {
    try {
      const result = await window.electronAPI.generateRandomTeam(options.format);
      if (result.success) {
        return {
          name: generateTeamName(index),
          format: options.format,
          members: result.members,
          pokemon: result.pokemon,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to generate team:', error);
      return null;
    }
  };

  const generateTeams = async () => {
    if (options.count < 1 || options.count > 50) {
      alert('Please enter a number between 1 and 50');
      return;
    }

    setGenerating(true);
    setStatus(`Generating ${options.count} team(s)...`);
    setGeneratedTeams([]);

    const teams: GeneratedTeam[] = [];

    for (let i = 0; i < options.count; i++) {
      setStatus(`Generating team ${i + 1}/${options.count}...`);
      const team = await generateSingleTeam(i);

      if (team) {
        teams.push(team);

        // Auto-save if enabled
        if (options.autoSave) {
          try {
            const teamData = {
              name: team.name,
              format: team.format,
              members: team.members,
            };
            await window.electronAPI.createTeam(teamData);
            setStatus(`Saved: ${team.name} (${i + 1}/${options.count})`);
          } catch (error) {
            console.error('Failed to save team:', error);
          }
        }
      }

      // Small delay to prevent overwhelming the system
      if (i < options.count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setGeneratedTeams(teams);

    if (options.autoSave) {
      setStatus(`✅ Successfully generated and saved ${teams.length} team(s)!`);
    } else {
      setStatus(`✅ Generated ${teams.length} team(s). Click "Save All" to save them.`);
    }

    setGenerating(false);
  };

  const saveAllTeams = async () => {
    setStatus('Saving all teams...');
    let saved = 0;

    for (const team of generatedTeams) {
      try {
        const teamData = {
          name: team.name,
          format: team.format,
          members: team.members,
        };
        await window.electronAPI.createTeam(teamData);
        saved++;
      } catch (error) {
        console.error('Failed to save team:', error);
      }
    }

    setStatus(`✅ Saved ${saved}/${generatedTeams.length} teams!`);
  };

  const clearGenerated = () => {
    setGeneratedTeams([]);
    setStatus('');
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Options */}
      <div className="w-1/3 bg-white rounded-lg shadow p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Team Generator</h2>

        <div className="space-y-4">
          {/* Pokemon Count */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Pokemon Available:</strong> {pokemonCount}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {pokemonCount === 0 ? 'Sync data in Settings first!' : 'Ready to generate teams'}
            </div>
          </div>

          {/* Number of Teams */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Teams to Generate
            </label>
            <input
              type="number"
              value={options.count}
              onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) || 1 })}
              className="w-full border rounded px-3 py-2"
              min="1"
              max="50"
              disabled={generating}
            />
            <p className="text-xs text-gray-500 mt-1">Max: 50 teams at once</p>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium mb-2">Battle Format</label>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value })}
              className="w-full border rounded px-3 py-2"
              disabled={generating}
            >
              <option>VGC 2025 Reg G</option>
              <option>VGC 2024 Reg G</option>
              <option>Smogon Doubles OU</option>
              <option>Battle Stadium Doubles</option>
              <option>Custom Singles</option>
            </select>
          </div>

          {/* Name Prefix */}
          <div>
            <label className="block text-sm font-medium mb-2">Team Name Prefix</label>
            <input
              type="text"
              value={options.namePrefix}
              onChange={(e) => setOptions({ ...options, namePrefix: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Tournament Team, My Squad"
              disabled={generating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave as "Random Team" for creative names, or use custom prefix
            </p>
          </div>

          {/* Generation Strategy */}
          <div>
            <label className="block text-sm font-medium mb-2">Generation Strategy</label>
            <select
              value={options.strategy}
              onChange={(e) => setOptions({ ...options, strategy: e.target.value as any })}
              className="w-full border rounded px-3 py-2"
              disabled={generating}
            >
              <option value="random">Random - Complete random selection</option>
              <option value="balanced">Balanced - Mix of roles (Coming Soon)</option>
              <option value="offensive">Offensive - Attack-focused (Coming Soon)</option>
              <option value="defensive">Defensive - Tank-focused (Coming Soon)</option>
            </select>
          </div>

          {/* Auto-Save */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSave"
              checked={options.autoSave}
              onChange={(e) => setOptions({ ...options, autoSave: e.target.checked })}
              className="mr-3 w-4 h-4"
              disabled={generating}
            />
            <label htmlFor="autoSave" className="text-sm font-medium">
              Auto-save teams after generation
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTeams}
            disabled={generating || pokemonCount === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 transition-all"
          >
            {generating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              `Generate ${options.count} Team${options.count > 1 ? 's' : ''}`
            )}
          </button>

          {/* Status */}
          {status && (
            <div className={`p-3 rounded-lg text-sm ${
              status.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
              status.includes('Error') ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Generated Teams */}
      <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Generated Teams ({generatedTeams.length})
          </h3>
          {generatedTeams.length > 0 && !options.autoSave && (
            <div className="space-x-2">
              <button
                onClick={saveAllTeams}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Save All
              </button>
              <button
                onClick={clearGenerated}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {generatedTeams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium">No teams generated yet</p>
            <p className="text-sm mt-1">Configure options and click Generate to create teams</p>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedTeams.map((team, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{team.name}</h4>
                    <p className="text-sm text-gray-600">{team.format}</p>
                  </div>
                  {options.autoSave && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      ✓ Saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {team.pokemon.map((pokemon: any, pIdx: number) => (
                    <div key={pIdx} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="font-medium capitalize truncate">
                        {pokemon.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {pokemon.type1}{pokemon.type2 ? ` / ${pokemon.type2}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
