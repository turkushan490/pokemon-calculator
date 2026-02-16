import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TeamDetailsModal } from './TeamDetailsModal';
import { BattleLogViewer } from './BattleLogViewer';

interface TeamStats {
  id: number;
  name: string;
  total_battles: number;
  wins: number;
  losses: number;
  win_rate: number;
}

interface Simulation {
  id: number;
  name: string;
  format: string;
  status: string;
  total_battles_planned: number;
  battles_completed: number;
  started_at: string;
  completed_at?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ResultsDashboard: React.FC = () => {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [battles, setBattles] = useState<any[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedBattleId, setSelectedBattleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load team stats
      const statsResult = await window.electronAPI.getTeamStats();
      if (statsResult.success) {
        setTeamStats(statsResult.stats || []);
      }

      // Load simulations
      const simsResult = await window.electronAPI.getAllSimulations();
      if (simsResult.success) {
        setSimulations(simsResult.simulations || []);
        if (simsResult.simulations && simsResult.simulations.length > 0) {
          const firstSim = simsResult.simulations[0];
          setSelectedSimulation(firstSim.id);
          // Load battles for first simulation
          await loadBattles(firstSim.id);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const loadBattles = async (simulationId: number) => {
    try {
      const result = await window.electronAPI.getBattleResults(simulationId, 20);
      if (result.success) {
        setBattles(result.battles || []);
      }
    } catch (error) {
      console.error('Failed to load battles:', error);
    }
  };

  const topTeams = [...teamStats]
    .sort((a, b) => b.win_rate - a.win_rate)
    .slice(0, 10);

  const chartData = topTeams.map(team => ({
    name: team.name || `Team #${team.id}`,
    winRate: Math.round(team.win_rate * 100),
    battles: team.total_battles,
    wins: team.wins,
    losses: team.losses,
  }));

  const winLossData = topTeams.slice(0, 5).map(team => ({
    name: team.name || `Team #${team.id}`,
    wins: team.wins,
    losses: team.losses,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (teamStats.length === 0 && simulations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            Run some simulations first to see results and analytics here.
          </p>
          <div className="text-left max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Getting Started:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Create teams in the Team Builder</li>
              <li>Run simulations in the Run Battles section</li>
              <li>Come back here to view detailed analytics</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedTeamId && (
        <TeamDetailsModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
      {selectedBattleId && (
        <BattleLogViewer
          battleId={selectedBattleId}
          onClose={() => setSelectedBattleId(null)}
        />
      )}
      <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Teams</div>
          <div className="text-3xl font-bold text-blue-600">{teamStats.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Simulations</div>
          <div className="text-3xl font-bold text-green-600">{simulations.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Battles</div>
          <div className="text-3xl font-bold text-purple-600">
            {teamStats.reduce((sum, t) => sum + t.total_battles, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Win Rate</div>
          <div className="text-3xl font-bold text-orange-600">
            {teamStats.length > 0
              ? Math.round((teamStats.reduce((sum, t) => sum + t.win_rate, 0) / teamStats.length) * 100)
              : 0}%
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Win Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Top Teams by Win Rate</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="winRate" fill="#8884d8" name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>

        {/* Win/Loss Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Win/Loss Distribution (Top 5)</h3>
          {winLossData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={winLossData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" fill="#00C49F" name="Wins" />
                <Bar dataKey="losses" fill="#FF8042" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Team Rankings Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Team Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wins</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Losses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topTeams.map((team, index) => (
                <tr key={team.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTeamId(team.id)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                      {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                      {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                      <span className="font-medium">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-blue-600 hover:text-blue-800">
                        {team.name || `Team #${team.id}`}
                      </div>
                      <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{team.total_battles}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">{team.wins}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">{team.losses}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${team.win_rate * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{Math.round(team.win_rate * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Battles */}
      {battles.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">Recent Battles</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battle #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team 1 vs Team 2</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turns</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {battles.map((battle) => (
                  <tr key={battle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{battle.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Team {battle.team1_id} vs Team {battle.team2_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Team {battle.winner_team_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{battle.turn_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBattleId(battle.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Log →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulation History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Simulation History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {simulations.map((sim) => (
                <tr key={sim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">#{sim.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sim.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sim.format}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sim.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sim.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      sim.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(sim.battles_completed / sim.total_battles_planned) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {sim.battles_completed}/{sim.total_battles_planned}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(sim.started_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};
