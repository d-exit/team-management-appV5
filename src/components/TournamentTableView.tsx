import React, { useState } from 'react';
import { TournamentBracket, BracketMatch, BracketTeam } from '../types';

interface TournamentTableViewProps {
  bracket: TournamentBracket;
  isEditing?: boolean;
  onMatchClick?: (bracketMatch: BracketMatch) => void;
  onUpdateCourt?: (bracketMatchId: string, newCourt: number) => void;
  onUpdateMatchTime?: (bracketMatchId: string, newTime: string) => void;
  managedTeamId?: string;
  onRecordScore?: (bracketMatchId: string) => void;
  onShareBracket?: (tournamentBracket: TournamentBracket) => void;
}

const TournamentTableView: React.FC<TournamentTableViewProps> = ({
  bracket,
  isEditing = false,
  onMatchClick,
  onUpdateCourt,
  onUpdateMatchTime,
  managedTeamId,
  onRecordScore,
  onShareBracket,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'bracket'>('table');

  if (!bracket || !bracket.rounds) {
    return <p className="text-slate-400">トーナメントデータがありません。</p>;
  }

  // 全試合をフラットな配列に変換
  const allMatches = bracket.rounds.flatMap((round, roundIndex) =>
    round.matches.map(match => ({
      ...match,
      roundName: round.name,
      roundIndex,
    }))
  );

  // チームの成績を計算
  const teamStats = new Map<string, { wins: number; losses: number; total: number }>();
  
  allMatches.forEach(match => {
    if (match.team1 && match.team2 && match.team1Score !== null && match.team2Score !== null) {
      const team1Id = match.team1.id;
      const team2Id = match.team2.id;
      
      if (!teamStats.has(team1Id)) {
        teamStats.set(team1Id, { wins: 0, losses: 0, total: 0 });
      }
      if (!teamStats.has(team2Id)) {
        teamStats.set(team2Id, { wins: 0, losses: 0, total: 0 });
      }
      
      const team1Stats = teamStats.get(team1Id)!;
      const team2Stats = teamStats.get(team2Id)!;
      
      team1Stats.total++;
      team2Stats.total++;
      
      if ((match.team1Score ?? 0) > (match.team2Score ?? 0)) {
        team1Stats.wins++;
        team2Stats.losses++;
      } else {
        team2Stats.wins++;
        team1Stats.losses++;
      }
    }
  });

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 sm:p-6 rounded-xl mt-4 border border-slate-600/30">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          {onShareBracket && (
            <button onClick={() => onShareBracket(bracket)} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              📤 トーナメント表を共有
            </button>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent text-center flex-1">
          🏆 {bracket.name}
        </h3>
        <div className="flex-1 text-right">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📊 表形式
            </button>
            <button
              onClick={() => setViewMode('bracket')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'bracket'
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🌳 ブラケット
            </button>
          </div>
        </div>
      </div>

      {/* トーナメント情報 */}
      <div className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 rounded-xl p-6 mb-8 border border-slate-600/50 shadow-inner">
        <h4 className="text-lg font-bold text-sky-300 mb-4 border-b border-slate-600 pb-3 flex items-center gap-2">
          📊 トーナメント情報
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <span className="text-2xl">👥</span>
            <div>
              <span className="text-slate-400 block text-xs">参加チーム</span>
              <span className="text-white font-bold text-lg">{bracket.teams?.length || 0}チーム</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <span className="text-2xl">🔄</span>
            <div>
              <span className="text-slate-400 block text-xs">ラウンド数</span>
              <span className="text-white font-bold text-lg">{bracket.rounds?.length || 0}ラウンド</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <span className="text-2xl">⚔️</span>
            <div>
              <span className="text-slate-400 block text-xs">試合形式</span>
              <span className="text-white font-bold text-lg">シングルエリミネーション</span>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* チーム成績表 */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-sky-300 mb-4 border-b border-slate-600 pb-3 flex items-center gap-2">
              📈 チーム成績表
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead className="border-b border-slate-600">
                  <tr>
                    <th className="p-3 text-center">#</th>
                    <th className="p-3">チーム名</th>
                    <th className="p-3 text-center">試合数</th>
                    <th className="p-3 text-center">勝利</th>
                    <th className="p-3 text-center">敗北</th>
                    <th className="p-3 text-center">勝率</th>
                    <th className="p-3 text-center">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(teamStats.entries())
                    .sort(([, a], [, b]) => b.wins - a.wins || a.total - b.total)
                    .map(([teamId, stats], index) => {
                      const team = bracket.teams?.find(t => t.id === teamId);
                      const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : '0.0';
                      const isEliminated = stats.losses > 0;
                      
                      return (
                        <tr key={teamId} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="p-3 font-bold text-center">
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                              index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-500 text-slate-800' :
                              index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100' :
                              'bg-gradient-to-r from-slate-500 to-slate-700 text-white'
                            } shadow-lg`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="p-3 flex items-center gap-2 text-sky-300 font-medium">
                            {team?.logoUrl && (
                              <img src={team.logoUrl} alt={team.name} className="w-5 h-5 rounded-full object-cover"/>
                            )}
                            <span className="truncate" title={team?.name || '不明'}>
                              {team?.name || '不明'}
                            </span>
                          </td>
                          <td className="p-3 text-center text-slate-300">{stats.total}</td>
                          <td className="p-3 text-center text-emerald-400 font-semibold">{stats.wins}</td>
                          <td className="p-3 text-center text-red-400 font-semibold">{stats.losses}</td>
                          <td className="p-3 text-center text-slate-300">{winRate}%</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isEliminated 
                                ? 'bg-red-900/30 text-red-400 border border-red-600/50' 
                                : 'bg-emerald-900/30 text-emerald-400 border border-emerald-600/50'
                            }`}>
                              {isEliminated ? '敗退' : '進行中'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 試合結果表 */}
          <div>
            <h4 className="text-lg font-bold text-sky-300 mb-4 border-b border-slate-600 pb-3 flex items-center gap-2">
              ⚽ 試合結果表
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead className="border-b border-slate-600">
                  <tr>
                    <th className="p-3 text-center">ラウンド</th>
                    <th className="p-3 text-center">試合</th>
                    <th className="p-3">チーム1</th>
                    <th className="p-3 text-center">スコア</th>
                    <th className="p-3">チーム2</th>
                    <th className="p-3 text-center">勝者</th>
                    <th className="p-3 text-center">コート</th>
                    <th className="p-3 text-center">時刻</th>
                  </tr>
                </thead>
                <tbody>
                  {allMatches.map((match, index) => (
                    <tr 
                      key={match.id} 
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => onMatchClick?.(match)}
                    >
                      <td className="p-3 text-center text-sky-300 font-medium">{match.roundName}</td>
                      <td className="p-3 text-center text-slate-400">#{index + 1}</td>
                      <td className="p-3 flex items-center gap-2">
                        {match.team1?.logoUrl && (
                          <img src={match.team1.logoUrl} alt={match.team1.name} className="w-5 h-5 rounded-full object-cover"/>
                        )}
                        <span className={`truncate ${match.winner?.id === match.team1?.id ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}>
                          {match.team1?.name || '未定'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-300 font-mono">
                        {match.team1Score !== null && match.team2Score !== null 
                          ? `${match.team1Score} - ${match.team2Score}`
                          : '-'
                        }
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        {match.team2?.logoUrl && (
                          <img src={match.team2.logoUrl} alt={match.team2.name} className="w-5 h-5 rounded-full object-cover"/>
                        )}
                        <span className={`truncate ${match.winner?.id === match.team2?.id ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}>
                          {match.team2?.name || '未定'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {match.winner ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-600/50">
                            {match.winner.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">未実施</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-slate-300">
                        {match.court ? `コート${match.court}` : '-'}
                      </td>
                      <td className="p-3 text-center text-slate-300">
                        {match.startTime || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-400 py-8">
          <p>ブラケット表示は別のコンポーネントで表示されます。</p>
          <p className="text-sm mt-2">「表形式」ボタンをクリックして表形式で表示してください。</p>
        </div>
      )}
    </div>
  );
};

export default TournamentTableView;
