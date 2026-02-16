import React, { useState, useEffect } from 'react';

interface BattleLog {
  id: number;
  turn_number: number;
  action_type: 'switch' | 'move' | 'faint' | 'status' | 'weather' | 'field';
  acting_pokemon: string;
  target_pokemon?: string;
  move_used?: string;
  damage_dealt?: number;
  effectiveness?: number;
  critical_hit: number;
  succeeded: number;
  log_message: string;
}

interface Battle {
  id: number;
  team1_id: number;
  team2_id: number;
  winner_team_id: number;
  turn_count: number;
  team1_pokemon_fainted: number;
  team2_pokemon_fainted: number;
  battle_data_json: string;
  created_at: string;
}

interface BattleLogViewerProps {
  battleId: number;
  onClose: () => void;
}

export const BattleLogViewer: React.FC<BattleLogViewerProps> = ({ battleId, onClose }) => {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurn, setSelectedTurn] = useState<number | null>(null);

  useEffect(() => {
    loadBattleLogs();
  }, [battleId]);

  const loadBattleLogs = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getBattleLogs(battleId);
      if (result.success) {
        setBattle(result.battle);
        setLogs(result.logs || []);
      }
    } catch (error) {
      console.error('Failed to load battle logs:', error);
    }
    setLoading(false);
  };

  const getEffectivenessColor = (effectiveness?: number) => {
    if (!effectiveness) return 'text-gray-600';
    if (effectiveness > 1.5) return 'text-green-600 font-bold';
    if (effectiveness > 1) return 'text-green-500';
    if (effectiveness < 0.5) return 'text-red-600';
    if (effectiveness < 1) return 'text-orange-500';
    return 'text-gray-600';
  };

  const getEffectivenessText = (effectiveness?: number) => {
    if (!effectiveness || effectiveness === 1) return '';
    if (effectiveness > 2) return ' (Super effective!)';
    if (effectiveness > 1) return ' (Effective)';
    if (effectiveness < 0.5) return ' (Not very effective...)';
    if (effectiveness < 1) return ' (Resisted)';
    return '';
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'move':
        return '⚔️';
      case 'switch':
        return '🔄';
      case 'faint':
        return '💀';
      case 'status':
        return '😵';
      case 'weather':
        return '🌦️';
      case 'field':
        return '🏟️';
      default:
        return '•';
    }
  };

  const turns = Array.from(new Set(logs.map(log => log.turn_number))).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading battle log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Battle Log #{battleId}</h2>
            {battle && (
              <p className="text-indigo-100 text-sm mt-1">
                {battle.turn_count} turns • Team {battle.winner_team_id} won
              </p>
            )}
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
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-semibold text-gray-700 mb-2">Battle Logging Coming Soon!</p>
              <p className="text-gray-600 mb-4">Detailed turn-by-turn logs are not yet implemented.</p>
              <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900 font-semibold mb-2">What you'll see in the future:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>⚔️ Every move used</li>
                  <li>💥 Damage dealt and effectiveness</li>
                  <li>⚡ Critical hits</li>
                  <li>💀 When Pokemon faint</li>
                  <li>🔄 Switches and substitutions</li>
                  <li>📊 Turn-by-turn breakdown</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Current implementation uses simplified battle simulation.<br/>
                Full @pkmn/sim integration will enable detailed logging.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Turn Navigator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Jump to Turn:</h3>
                <div className="flex flex-wrap gap-2">
                  {turns.map(turn => (
                    <button
                      key={turn}
                      onClick={() => {
                        setSelectedTurn(turn);
                        document.getElementById(`turn-${turn}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-3 py-1 rounded ${
                        selectedTurn === turn
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-300 hover:border-indigo-600'
                      }`}
                    >
                      Turn {turn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs by Turn */}
              {turns.map(turn => {
                const turnLogs = logs.filter(log => log.turn_number === turn);

                return (
                  <div key={turn} id={`turn-${turn}`} className="border rounded-lg overflow-hidden">
                    <div className="bg-indigo-600 text-white px-4 py-2 font-bold">
                      Turn {turn}
                    </div>
                    <div className="divide-y">
                      {turnLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={`p-4 ${
                            log.action_type === 'faint' ? 'bg-red-50' :
                            log.action_type === 'move' && log.critical_hit ? 'bg-yellow-50' :
                            'bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getActionIcon(log.action_type)}</span>
                            <div className="flex-1">
                              <div className="font-medium capitalize">
                                <span className="text-blue-600">{log.acting_pokemon}</span>
                                {log.target_pokemon && (
                                  <>
                                    {' → '}
                                    <span className="text-purple-600">{log.target_pokemon}</span>
                                  </>
                                )}
                              </div>

                              <div className="mt-1 text-gray-700">{log.log_message}</div>

                              {log.move_used && (
                                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    <strong>Move:</strong> {log.move_used}
                                  </span>
                                  {log.damage_dealt !== undefined && log.damage_dealt > 0 && (
                                    <span className="bg-orange-100 px-2 py-1 rounded">
                                      <strong>Damage:</strong> {log.damage_dealt} HP
                                    </span>
                                  )}
                                  {log.effectiveness && log.effectiveness !== 1 && (
                                    <span className={`px-2 py-1 rounded ${
                                      log.effectiveness > 1 ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                      <strong className={getEffectivenessColor(log.effectiveness)}>
                                        {log.effectiveness}x{getEffectivenessText(log.effectiveness)}
                                      </strong>
                                    </span>
                                  )}
                                  {log.critical_hit === 1 && (
                                    <span className="bg-yellow-100 px-2 py-1 rounded text-yellow-800 font-bold">
                                      ⚡ CRITICAL HIT!
                                    </span>
                                  )}
                                  {log.succeeded === 0 && (
                                    <span className="bg-gray-200 px-2 py-1 rounded text-gray-600">
                                      ❌ Failed
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {logs.length} actions recorded
          </div>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
