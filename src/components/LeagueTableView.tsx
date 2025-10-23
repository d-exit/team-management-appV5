import React, { useState } from 'react';
import { LeagueTable, LeagueGroup, LeagueTeamStats, LeagueMatch } from '../types';

interface LeagueTableViewProps {
  leagueTable: LeagueTable;
  isEditing?: boolean;
  onMoveTeam?: (teamId: string, sourceGroupName: string, targetGroupName: string) => void;
  onResultClick?: (groupName: string, match: LeagueMatch) => void;
  onUpdateCourt?: (groupName: string, matchId: string, newCourt: number) => void;
  onUpdateMatchTime?: (groupName: string, matchId: string, newTime: string) => void;
  onReorderMatches?: (groupName: string, fromIndex: number, toIndex: number) => void;
  managedTeamId?: string;
  onRecordScore?: (matchId: string) => void;
  onShareLeague?: (leagueTable: LeagueTable) => void;
}

const findTeamName = (teamStats: LeagueTeamStats[], teamId: string) => {
  return teamStats.find(s => s.team.id === teamId)?.team.name || '不明なチーム';
};
const findTeamLogo = (teamStats: LeagueTeamStats[], teamId: string) => {
  return teamStats.find(s => s.team.id === teamId)?.team.logoUrl || '';
};

// 順位に応じた色を取得
const getRankColor = (rank: number, totalTeams: number) => {
  if (rank === 1) return 'from-yellow-400 to-yellow-600 text-yellow-900';
  if (rank === 2) return 'from-slate-300 to-slate-500 text-slate-800';
  if (rank === 3) return 'from-amber-600 to-amber-800 text-amber-100';
  if (rank <= Math.ceil(totalTeams * 0.5)) return 'from-emerald-500 to-emerald-700 text-white';
  if (rank <= Math.ceil(totalTeams * 0.8)) return 'from-blue-500 to-blue-700 text-white';
  return 'from-slate-500 to-slate-700 text-white';
};

// 勝率バーコンポーネント
const WinRateBar: React.FC<{ wins: number; draws: number; losses: number; total: number }> = ({ wins, draws, losses, total }) => {
  if (total === 0) return null;
  
  const winRate = (wins / total) * 100;
  const drawRate = (draws / total) * 100;
  const lossRate = (losses / total) * 100;
  
  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div 
        className="bg-emerald-500 h-full transition-all duration-500 ease-out"
        style={{ width: `${winRate}%` }}
        title={`勝利: ${wins}試合 (${winRate.toFixed(1)}%)`}
      />
      <div 
        className="bg-blue-500 h-full transition-all duration-500 ease-out"
        style={{ width: `${drawRate}%` }}
        title={`引分: ${draws}試合 (${drawRate.toFixed(1)}%)`}
      />
      <div 
        className="bg-red-500 h-full transition-all duration-500 ease-out"
        style={{ width: `${lossRate}%` }}
        title={`敗北: ${losses}試合 (${lossRate.toFixed(1)}%)`}
      />
    </div>
  );
};

const LeagueTableView: React.FC<LeagueTableViewProps> = ({
  leagueTable,
  isEditing = false,
  onMoveTeam,
  onResultClick,
  onUpdateCourt,
  onUpdateMatchTime,
  onReorderMatches,
  managedTeamId,
  onRecordScore,
  onShareLeague
}) => {
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'team' | 'match', groupName: string, id: string, index?: number } | null>(null);
  const [movingTeam, setMovingTeam] = useState<{ teamId: string; sourceGroupName: string; teamName: string; } | null>(null);

  if (!leagueTable) {
    return <p className="text-slate-400">リーグ表データがありません。</p>;
  }
  const safeGroups = Array.isArray(leagueTable.groups) ? leagueTable.groups.filter(Boolean) : [];

  const handleTeamDragStart = (e: React.DragEvent<HTMLTableRowElement>, teamId: string, sourceGroupName: string) => {
    if (!isEditing || !onMoveTeam) return;
    setDraggedItem({ type: 'team', id: teamId, groupName: sourceGroupName });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGroupDragOver = (e: React.DragEvent<HTMLDivElement>, groupName: string) => {
    e.preventDefault();
    if (isEditing && draggedItem?.type === 'team') {
      setDragOverGroup(groupName);
    }
  };

  const handleGroupDrop = (e: React.DragEvent<HTMLDivElement>, targetGroupName: string) => {
    e.preventDefault();
    if (isEditing && onMoveTeam && draggedItem?.type === 'team') {
      const { id: teamId, groupName: sourceGroupName } = draggedItem;
      if (teamId && sourceGroupName && sourceGroupName !== targetGroupName) {
        onMoveTeam(teamId, sourceGroupName, targetGroupName);
      }
    }
    setDragOverGroup(null);
    setDraggedItem(null);
  };

  const handleMatchDragStart = (e: React.DragEvent<HTMLDivElement>, groupName: string, index: number) => {
    if (!isEditing || !onReorderMatches) return;
    setDraggedItem({ type: 'match', groupName, id: `match-${index}`, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleMatchDrop = (e: React.DragEvent<HTMLDivElement>, groupName: string, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing && onReorderMatches && draggedItem?.type === 'match' && draggedItem.groupName === groupName && typeof draggedItem.index === 'number') {
      onReorderMatches(groupName, draggedItem.index, toIndex);
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverGroup(null);
  };

  const handleMobileMoveClick = (teamId: string, teamName: string, sourceGroupName: string) => {
    setMovingTeam({ teamId, teamName, sourceGroupName });
  };

  const executeMobileMove = (targetGroupName: string) => {
    if (movingTeam && onMoveTeam) {
      onMoveTeam(movingTeam.teamId, movingTeam.sourceGroupName, targetGroupName);
    }
    setMovingTeam(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 sm:p-6 rounded-xl mt-4 space-y-8 border border-slate-600/30">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          {onShareLeague && (
            <button onClick={() => onShareLeague(leagueTable)} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              📤 リーグ表を共有
            </button>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent text-center flex-1">
          🏆 {leagueTable.name}
        </h3>
        <div className="flex-1"></div>
      </div>
      
      {isEditing && (
        <div className="text-center text-sm text-yellow-300 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          💡 PCではドラッグ＆ドロップ、スマホでは「移動」ボタンで編集できます。
        </div>
      )}

      {movingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl w-full max-w-sm border border-slate-600/50 shadow-2xl">
            <h4 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
              🚚 「{movingTeam.teamName}」を移動
            </h4>
            <p className="text-sm text-slate-300 mb-4">移動先のグループを選択してください。</p>
            <div className="space-y-2">
              {safeGroups.filter(g => g.name !== movingTeam.sourceGroupName).map(group => (
                <button 
                  key={group.name} 
                  onClick={() => executeMobileMove(group.name)} 
                  className="w-full text-left p-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50"
                >
                  {group.name}
                </button>
              ))}
            </div>
            <button onClick={() => setMovingTeam(null)} className="w-full mt-4 bg-slate-500 hover:bg-slate-600 py-2 rounded-lg transition-colors">キャンセル</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {safeGroups.map((group: LeagueGroup) => {
          const safeTeams = Array.isArray(group.teams) ? group.teams : [];
          const safeMatches = Array.isArray(group.matches) ? group.matches : [];

          return (
            <div
              key={group.name}
              className={`bg-gradient-to-br from-slate-800/70 to-slate-700/70 p-4 sm:p-6 rounded-xl shadow-xl transition-all duration-300 border border-slate-600/50 ${
                isEditing && dragOverGroup === group.name && draggedItem?.type === 'team' ? 'ring-2 ring-yellow-400 ring-opacity-75 scale-105 shadow-2xl shadow-yellow-400/25' : ''
              }`}
              onDragOver={(e) => handleGroupDragOver(e, group.name)}
              onDrop={(e) => handleGroupDrop(e, group.name)}
              onDragLeave={() => setDragOverGroup(null)}
            >
              <h4 className="text-lg sm:text-xl font-bold text-sky-300 mb-6 text-center bg-gradient-to-r from-sky-600/80 to-cyan-600/80 px-4 py-2 rounded-full border border-sky-500/50 shadow-lg">
                {group.name}
              </h4>

              {/* 順位表 */}
              <div className="overflow-x-auto mb-8">
                <h5 className="text-lg font-bold text-sky-300 mb-4 border-b border-slate-600 pb-3 flex items-center gap-2">
                  📊 順位表
                </h5>
                <table className="w-full min-w-max text-left text-sm">
                  <thead className="border-b border-slate-600">
                    <tr className="bg-slate-700/50">
                      <th className="p-3 w-8 text-center">#</th>
                      <th className="p-3">チーム</th>
                      <th className="p-3 text-center" title="試合数">試</th>
                      <th className="p-3 text-center" title="勝利">勝</th>
                      <th className="p-3 text-center" title="引分">分</th>
                      <th className="p-3 text-center" title="敗北">敗</th>
                      <th className="p-3 text-center" title="得失点差">差</th>
                      <th className="p-3 text-center" title="勝ち点">点</th>
                      <th className="p-3 text-center" title="勝率">勝率</th>
                      {isEditing && safeGroups.length > 1 && <th className="p-3 sm:hidden"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {safeTeams
                      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
                      .map((stats, index) => {
                        const rank = index + 1;
                        const rankColor = getRankColor(rank, safeTeams.length);
                        return (
                          <tr
                            key={stats.team.id}
                            draggable={!!(isEditing && onMoveTeam && safeTeams.length > 1)}
                            onDragStart={(e) => handleTeamDragStart(e, stats.team.id, group.name)}
                            onDragEnd={handleDragEnd}
                            className={`border-b border-slate-700/50 transition-all duration-200 ${
                              isEditing && onMoveTeam && safeTeams.length > 1 ? 'cursor-move hover:bg-slate-700/30' : ''
                            } ${draggedItem?.type === 'team' && draggedItem.id === stats.team.id ? 'opacity-50' : ''}`}
                          >
                            <td className="p-3 font-bold text-center">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${rankColor} shadow-lg`}>
                                {rank}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-3 text-sky-300 font-medium">
                                <img src={stats.team.logoUrl} alt={stats.team.name} className="w-8 h-8 rounded-full object-cover border-2 border-slate-600/50 shadow-lg" />
                                <span className="truncate font-semibold" title={stats.team.name}>{stats.team.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center text-slate-300 font-semibold">{stats.played}</td>
                            <td className="p-3 text-center text-emerald-400 font-bold">{stats.wins}</td>
                            <td className="p-3 text-center text-blue-400 font-bold">{stats.draws}</td>
                            <td className="p-3 text-center text-red-400 font-bold">{stats.losses}</td>
                            <td className="p-3 text-center font-bold">
                              <span className={stats.goalDifference > 0 ? 'text-emerald-400' : stats.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}>
                                {stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-bold text-2xl text-white bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                {stats.points}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <WinRateBar wins={stats.wins} draws={stats.draws} losses={stats.losses} total={stats.played} />
                            </td>
                            {isEditing && safeGroups.length > 1 && (
                              <td className="p-3 sm:hidden">
                                <button 
                                  onClick={() => handleMobileMoveClick(stats.team.id, stats.team.name, group.name)} 
                                  className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                  🚚 移動
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {safeTeams.length === 0 && (
                  <div className="py-12 text-center text-slate-400 bg-slate-800/30 rounded-lg border border-slate-600/30">
                    <span className="text-4xl mb-2 block">👥</span>
                    <p>このグループにはまだチームがいません。</p>
                  </div>
                )}
              </div>

              {/* 試合日程 */}
              {safeMatches.length > 0 && (
                <div>
                  <h5 className="text-lg font-bold text-sky-400 mb-4 border-t border-slate-700 pt-6 flex items-center gap-2">
                    📅 試合日程
                  </h5>
                  <div className="space-y-4">
                    {safeMatches.map((match, index) => {
                      const isOurMatch = managedTeamId && (match.team1Id === managedTeamId || match.team2Id === managedTeamId);
                      return (
                        <div
                          key={match.id}
                          draggable={!!(isEditing && onReorderMatches)}
                          onDragStart={(e) => handleMatchDragStart(e, group.name, index)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleMatchDrop(e, group.name, index)}
                          className={`grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_auto_1fr_auto] gap-x-3 sm:gap-x-4 items-center bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 rounded-xl transition-all duration-300 border border-slate-600/50 shadow-lg hover:shadow-xl ${
                            isEditing && onReorderMatches ? 'cursor-move hover:from-slate-600/50 hover:to-slate-700/50' : ''
                          } ${draggedItem?.type === 'match' && draggedItem.id === `match-${index}` && draggedItem.groupName === group.name ? 'opacity-30' : 'opacity-100'}`}
                        >
                          <div className="flex items-center gap-3 justify-end text-right text-slate-200 truncate pr-2">
                            <span className="font-semibold">{findTeamName(safeTeams, match.team1Id)}</span>
                            <img src={findTeamLogo(safeTeams, match.team1Id)} alt="" className="w-6 h-6 rounded-full hidden sm:inline border border-slate-600/50 shadow-md" />
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            {isEditing && onUpdateMatchTime ? (
                              <input
                                type="time"
                                value={match.startTime || ''}
                                onChange={e => onUpdateMatchTime(group.name, match.id, e.target.value)}
                                className="bg-slate-800/80 border border-slate-500 rounded-lg text-sky-300 font-bold text-sm text-center w-28 mb-2 p-1"
                              />
                            ) : (
                              match.startTime && (
                                <div className="text-sm text-amber-300 font-bold mb-2 bg-amber-900/20 px-2 py-1 rounded-full border border-amber-600/30">
                                  🕐 {match.startTime}
                                </div>
                              )
                            )}
                            <div className="flex items-center justify-center gap-2 font-bold text-xl">
                              {match.played ? (
                                <>
                                  <span className="text-white bg-emerald-600/20 px-3 py-1 rounded-lg border border-emerald-500/50">{match.team1Score}</span>
                                  <span className="text-slate-400 text-lg">-</span>
                                  <span className="text-white bg-emerald-600/20 px-3 py-1 rounded-lg border border-emerald-500/50">{match.team2Score}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600/50">VS</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-left text-slate-200 truncate pl-2">
                            <img src={findTeamLogo(safeTeams, match.team2Id)} alt="" className="w-6 h-6 rounded-full hidden sm:inline border border-slate-600/50 shadow-md" />
                            <span className="font-semibold">{findTeamName(safeTeams, match.team2Id)}</span>
                          </div>

                          <div className="col-span-3 md:col-span-1 flex justify-center items-center gap-3 mt-3 md:mt-0">
                            {isEditing && onUpdateCourt ? (
                              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-600/50">
                                <label htmlFor={`court-${match.id}`} className="text-xs text-slate-400">🏟️</label>
                                <input 
                                  id={`court-${match.id}`} 
                                  type="number" 
                                  title="コート番号" 
                                  value={match.court || ''} 
                                  onChange={e => onUpdateCourt(group.name, match.id, parseInt(e.target.value) || 1)} 
                                  className="w-12 h-8 text-center bg-slate-700/80 border border-slate-500 rounded text-sky-300 text-sm font-bold" 
                                />
                              </div>
                            ) : (
                              match.court && (
                                <span className="text-xs text-cyan-400 font-bold bg-cyan-900/20 px-2 py-1 rounded-full border border-cyan-600/30">
                                  🏟️ コート{match.court}
                                </span>
                              )
                            )}

                            {isOurMatch && !isEditing && onRecordScore && (
                              <button
                                onClick={() => onRecordScore(match.id)}
                                className="text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                🎯 得点記録
                              </button>
                            )}
                            
                            {onResultClick && !isEditing ? (
                              <button
                                onClick={() => onResultClick(group.name, match)}
                                className={`text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                  match.played 
                                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-emerald-200 hover:from-emerald-800 hover:to-emerald-900' 
                                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                }`}
                              >
                                {match.played ? '✏️ 結果修正' : '📝 結果入力'}
                              </button>
                            ) : (
                              match.played && !isEditing && (
                                <span className="text-xs text-emerald-400 font-bold bg-emerald-900/20 px-3 py-2 rounded-full border border-emerald-600/30">
                                  ✅ 完了
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 決勝ラウンドの表示 */}
      {(leagueTable as any).hasFinalRound && (leagueTable as any).finalRound && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-600/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">🏆</span>
              </div>
              <h2 className="text-xl font-bold text-amber-300">決勝ラウンド</h2>
            </div>
            <div className="text-amber-200 mb-4">
              <p className="text-sm">
                予選リーグ突破チーム: {(leagueTable as any).finalRound.teams.length}チーム
              </p>
              <p className="text-sm">
                形式: {(leagueTable as any).finalRound.type === 'league' ? 'リーグ戦' : 'トーナメント戦'}
              </p>
            </div>
            
            {(leagueTable as any).finalRound.type === 'league' && (leagueTable as any).finalRound.leagueTable && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                <h3 className="text-lg font-semibold text-amber-200 mb-3">決勝リーグ戦</h3>
                <LeagueTableView 
                  leagueTable={(leagueTable as any).finalRound.leagueTable}
                  isEditing={false}
                />
              </div>
            )}
            
            {(leagueTable as any).finalRound.type === 'tournament' && (leagueTable as any).finalRound.tournamentBracket && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                <h3 className="text-lg font-semibold text-amber-200 mb-3">決勝トーナメント戦</h3>
                <div className="text-amber-200 text-sm">
                  <p>参加チーム数: {(leagueTable as any).finalRound.tournamentBracket.teams?.length || 0}チーム</p>
                  <p>ラウンド数: {(leagueTable as any).finalRound.tournamentBracket.rounds.length}ラウンド</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueTableView;