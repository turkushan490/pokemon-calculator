import React, { useState, useEffect } from 'react';

interface Team {
  id: number;
  name: string;
  format: string;
  total_battles: number;
  wins: number;
  losses: number;
  win_rate: number;
}

interface SimulationProgress {
  simulationId: number;
  completed: number;
  total: number;
  percentage: number;
  status: 'running' | 'paused' | 'completed' | 'stopped';
}

export const SimulationRunner: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [simulationName, setSimulationName] = useState('');
  const [format, setFormat] = useState('gen9vgc2024regg');
  const [totalBattles, setTotalBattles] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [currentSimulationId, setCurrentSimulationId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    loadTeams();
    setupProgressListener();
  }, []);

  const loadTeams = async () => {
    try {
      const result: any = await window.electronAPI.getTeams();
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        setTeams(result.teams);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const setupProgressListener = () => {
    window.electronAPI.onSimulationProgress((prog: SimulationProgress) => {
      setProgress(prog);
      if (prog.status === 'completed' || prog.status === 'stopped') {
        setIsRunning(false);
        setIsPaused(false);
        setStatus(`Simulation ${prog.status}!`);
      }
    });
  };

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeamIds(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  const startSimulation = async () => {
    if (selectedTeamIds.length < 2) {
      alert('Please select at least 2 teams');
      return;
    }

    if (totalBattles < 1) {
      alert('Please set at least 1 battle');
      return;
    }

    setStatus('Starting simulation...');

    try {
      const config = {
        name: simulationName || `Simulation ${new Date().toLocaleString()}`,
        format,
        totalBattles,
        teamIds: selectedTeamIds,
        concurrentWorkers: 1,
      };

      const result = await window.electronAPI.startSimulation(config);
      if (result.success) {
        setCurrentSimulationId(result.simulationId);
        setIsRunning(true);
        setStatus('Simulation running...');
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus('Failed to start simulation');
      console.error('Start error:', error);
    }
  };

  const pauseSimulation = async () => {
    try {
      await window.electronAPI.pauseSimulation();
      setIsPaused(true);
      setStatus('Simulation paused');
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const resumeSimulation = async () => {
    try {
      await window.electronAPI.resumeSimulation();
      setIsPaused(false);
      setStatus('Simulation resumed');
    } catch (error) {
      console.error('Resume error:', error);
    }
  };

  const stopSimulation = async () => {
    try {
      await window.electronAPI.stopSimulation();
      setIsRunning(false);
      setIsPaused(false);
      setStatus('Simulation stopped');
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Configuration */}
      <div className="w-1/3 bg-white rounded-lg shadow p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Simulation Setup</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Simulation Name</label>
            <input
              type="text"
              value={simulationName}
              onChange={(e) => setSimulationName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={isRunning}
            >
              <option value="gen9vgc2024regg">VGC 2024 Reg G</option>
              <option value="gen9vgc2025regg">VGC 2025 Reg G</option>
              <option value="gen9doublesou">Doubles OU</option>
              <option value="gen9battlestadiumdoubles">Battle Stadium Doubles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Battles</label>
            <input
              type="number"
              value={totalBattles}
              onChange={(e) => setTotalBattles(parseInt(e.target.value) || 0)}
              className="w-full border rounded px-3 py-2"
              min="1"
              disabled={isRunning}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Select Teams ({selectedTeamIds.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeamIds(teams.map(t => t.id))}
                  disabled={isRunning}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedTeamIds([])}
                  disabled={isRunning}
                  className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="border rounded max-h-64 overflow-auto">
              {teams.length === 0 ? (
                <p className="p-4 text-gray-400 text-sm">No teams available. Create teams first!</p>
              ) : (
                teams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeamIds.includes(team.id)}
                      onChange={() => toggleTeamSelection(team.id)}
                      className="mr-3"
                      disabled={isRunning}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{team.name || `Team #${team.id}`}</div>
                      <div className="text-xs text-gray-500">
                        {team.format} • {team.total_battles} battles • {(team.win_rate * 100).toFixed(1)}% WR
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              disabled={selectedTeamIds.length < 2}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300"
            >
              Start Simulation
            </button>
          ) : (
            <div className="space-y-2">
              {!isPaused ? (
                <button
                  onClick={pauseSimulation}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeSimulation}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Resume
                </button>
              )}
              <button
                onClick={stopSimulation}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                Stop Simulation
              </button>
            </div>
          )}
        </div>

        {status && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
            {status}
          </div>
        )}
      </div>

      {/* Right Panel - Progress & Info */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Simulation Progress</h2>

        {!progress && !isRunning ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No simulation running</p>
            <p className="text-sm">Configure and start a simulation to see progress here</p>
          </div>
        ) : progress ? (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {progress.completed} / {progress.total} battles
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-2xl font-bold text-blue-600">
                {progress.percentage}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-lg font-semibold capitalize">{progress.status}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Simulation ID</div>
                <div className="text-lg font-semibold">#{progress.simulationId}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Battles Completed</div>
                <div className="text-lg font-semibold">{progress.completed}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Remaining</div>
                <div className="text-lg font-semibold">{progress.total - progress.completed}</div>
              </div>
            </div>

            {progress.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">Simulation Complete!</h3>
                <p className="text-sm text-green-800">
                  View the results in the Results Dashboard to see team performance and battle statistics.
                </p>
              </div>
            )}

            {progress.status === 'running' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">Simulation Running</h3>
                <p className="text-sm text-blue-800">
                  The simulation is currently running. You can pause or stop it at any time.
                </p>
              </div>
            )}

            {progress.status === 'paused' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2">Simulation Paused</h3>
                <p className="text-sm text-yellow-800">
                  The simulation is paused. Click Resume to continue.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initializing simulation...</p>
          </div>
        )}
      </div>
    </div>
  );
};
