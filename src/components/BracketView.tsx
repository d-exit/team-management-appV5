// components/BracketView.tsx
import React from 'react';
import { TournamentBracket, BracketMatch, BracketTeam } from '../types';

interface BracketViewProps {
  bracket: TournamentBracket;
  isEditing: boolean;
  firstTeamToSwapId: string | null;
  onSelectTeamForSwap: (matchId: string, teamSlot: 'team1' | 'team2', team: BracketTeam) => void;
  onMatchClick?: (bracketMatch: BracketMatch) => void;
  onUpdateCourt?: (bracketMatchId: string, newCourt: number) => void;
  onUpdateMatchTime?: (bracketMatchId: string, newTime: string) => void;
  managedTeamId?: string;
  onRecordScore?: (bracketMatchId: string) => void;
  onToggleLayoutEdit?: () => void;
  onShareBracket?: (tournamentBracket: TournamentBracket) => void;
  onSelectTeamForMobileSwap?: (subMatchId: string, team: BracketTeam) => void;
  mobileSwappingTeam?: { match: any; subMatchId: string; team: BracketTeam; } | null;
}

const TeamDisplayInBracket: React.FC<{
  team: BracketTeam | null | undefined;
  placeholderText?: string;
  score?: number | null;
  isWinner?: boolean;
  isEditing?: boolean;
  isSelectedForSwap?: boolean;
  isMobileSwapping?: boolean;
  matchId?: string;
  teamSlot?: 'team1' | 'team2';
  roundIndex?: number;
  onSelect?: (matchId: string, teamSlot: 'team1' | 'team2', team: BracketTeam) => void;
  onMobileSelect?: (matchId: string, team: BracketTeam) => void;
}> = ({ team, placeholderText, score, isWinner, isEditing, isSelectedForSwap, isMobileSwapping, matchId, teamSlot, roundIndex, onSelect, onMobileSelect }) => {
  const baseClasses = "flex justify-between items-center text-xs sm:text-sm p-2 truncate flex-grow rounded-md transition-all duration-200";
  const winnerClasses = isWinner ? 'font-bold text-emerald-300 bg-emerald-900/30 border border-emerald-500/50' : 'text-slate-200 bg-slate-700/50 border border-slate-600/50';
  const byeClasses = "text-xs text-slate-500 italic p-2 flex-grow bg-slate-800/30 border border-slate-600/30 rounded-md";
  const placeholderClasses = "text-xs text-slate-500 italic p-2 flex-grow bg-slate-800/30 border border-slate-600/30 rounded-md";
  
  const isDraggable = !!(isEditing && roundIndex === 0 && team && !team.isBye && matchId && teamSlot && onSelect);

  const handleClick = () => {
    if (isDraggable && team && matchId && teamSlot && onSelect) {
      onSelect(matchId, teamSlot, team);
    }
  };

  let teamContainerClasses = `${baseClasses} ${winnerClasses}`;

  if (isSelectedForSwap || isMobileSwapping) {
    teamContainerClasses += ' ring-2 ring-yellow-400 ring-opacity-75 shadow-lg shadow-yellow-400/25'; 
  }
  if (isDraggable) {
    teamContainerClasses += ' cursor-pointer hover:bg-sky-700/70 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-400/25';
  }

  if (!team) return <div className={placeholderClasses}>{placeholderText || '未定'}</div>;
  if (team.isBye) return <div className={byeClasses}>BYE</div>;

  return (
    <div className="flex items-center gap-1">
      <div className={teamContainerClasses} onClick={handleClick} title={team.name}>
        <span className="truncate">{team.name}</span>
        <span className={`font-semibold ${isWinner ? 'text-emerald-400' : 'text-slate-300'}`}>{score ?? ''}</span>
      </div>
      {isEditing && onMobileSelect && roundIndex === 0 && (
        <button onClick={() => onMobileSelect(matchId!, team)} className="sm:hidden bg-sky-700 hover:bg-sky-600 text-white text-xs px-1.5 py-0.5 rounded transition-colors">入替</button>
      )}
    </div>
  );
};

const BracketView: React.FC<BracketViewProps> = ({ 
    bracket, 
    isEditing, 
    firstTeamToSwapId, 
    onSelectTeamForSwap,
    onMatchClick,
    onUpdateCourt,
    onUpdateMatchTime,
    managedTeamId,
    onRecordScore,
    onToggleLayoutEdit,
    onShareBracket,
    onSelectTeamForMobileSwap,
    mobileSwappingTeam,
}) => {
  if (!bracket || !bracket.rounds) {
    return <p className="text-slate-400">ブラケットデータがありません。</p>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 sm:p-6 rounded-xl mt-4 border border-slate-600/30">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          {onShareBracket && (
            <button onClick={() => onShareBracket(bracket)} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              📤 対戦表を共有
            </button>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-transparent text-center flex-1">
          🏆 {bracket.name}
        </h3>
        <div className="flex-1 text-right">
          {onToggleLayoutEdit && (
            <button onClick={onToggleLayoutEdit} className="text-sm bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              {isEditing ? '✏️ 編集終了' : '⚙️ レイアウト編集'}
            </button>
          )}
        </div>
      </div>
      
      {isEditing && (
        <div className="text-center text-sm text-yellow-300 -mt-2 mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          💡 PCではドラッグ＆ドロップ(1回戦のみ)、スマホでは「入替」ボタンで編集できます。
        </div>
      )}
      
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
      
      <div className="overflow-x-auto">
        <div className="flex space-x-4 sm:space-x-8 min-w-max relative">
          {/* 接続線の描画 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {bracket.rounds.slice(0, -1).map((round, roundIndex) => 
              round.matches.map((match, matchIndex) => {
                if (match.nextMatchId) {
                  const nextRound = bracket.rounds[roundIndex + 1];
                  const nextMatch = nextRound?.matches.find(m => m.id === match.nextMatchId);
                  if (nextMatch) {
                    const currentX = (roundIndex * 200) + 180;
                    const currentY = (matchIndex * 120) + 60;
                    const nextX = ((roundIndex + 1) * 200) + 20;
                    const nextY = (nextMatch.team1?.id === match.winner?.id ? 
                      nextMatch.team1?.id === match.team1?.id ? 0 : 1 : 
                      nextMatch.team2?.id === match.winner?.id ? 0 : 1) * 120 + 60;
                    
                    return (
                      <g key={`line-${match.id}`}>
                        <path
                          d={`M ${currentX} ${currentY} Q ${(currentX + nextX) / 2} ${currentY} ${nextX} ${nextY}`}
                          stroke={match.winner ? "#10b981" : "#64748b"}
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={match.winner ? "0" : "5,5"}
                          opacity={match.winner ? 1 : 0.5}
                        />
                        {match.winner && (
                          <circle
                            cx={nextX}
                            cy={nextY}
                            r="4"
                            fill="#10b981"
                            className="animate-pulse"
                          />
                        )}
                      </g>
                    );
                  }
                }
                return null;
              })
            )}
          </svg>
          
          {bracket.rounds.map((round, roundIndex) => (
            <div key={`round-${roundIndex}`} className="flex flex-col space-y-6 items-center min-w-[160px] sm:min-w-[200px] relative" style={{ zIndex: 1 }}>
              <div className="bg-gradient-to-r from-sky-600/80 to-cyan-600/80 px-4 py-2 rounded-full border border-sky-500/50 shadow-lg">
                <h4 className="text-sm sm:text-md font-bold text-white whitespace-nowrap">{round.name}</h4>
              </div>
              <div className="space-y-8 sm:space-y-10 w-full">
                {round.matches.map((match: BracketMatch) => {
                  const isMatchClickable = !isEditing && match.isPlayable && !match.isDecided && onMatchClick;
                  const isOurMatch = managedTeamId && (match.team1?.id === managedTeamId || match.team2?.id === managedTeamId);
                  const isFinal = roundIndex === bracket.rounds.length - 1;
                  
                  return (
                    <div 
                      key={match.id} 
                      className={`bg-gradient-to-br from-slate-700/80 to-slate-800/80 p-3 sm:p-4 rounded-xl shadow-lg w-full relative pt-6 border border-slate-600/50 transition-all duration-300 hover:shadow-xl ${
                        isMatchClickable ? 'cursor-pointer hover:from-slate-600/80 hover:to-slate-700/80 hover:border-slate-500/50' : ''
                      } ${
                        isFinal ? 'ring-2 ring-amber-500/50 shadow-amber-500/25' : ''
                      }`}
                      onClick={() => { if (isMatchClickable) onMatchClick(match); }}
                      title={isMatchClickable ? 'クリックしてスコアを入力' : ''}
                    >
                      {/* 結果入力ボタン: 決勝トーナメント用 */}
                      {!isEditing && onMatchClick && (
                        <button
                          onClick={e => { e.stopPropagation(); onMatchClick(match); }}
                          className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-1 px-3 rounded-lg text-xs z-10 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          title="結果入力"
                        >
                          📝 結果入力
                        </button>
                      )}
                      
                      {isOurMatch && !isEditing && onRecordScore && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRecordScore(match.id); }}
                          className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-1 px-2 rounded-lg text-xs z-10 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          title="得点を記録"
                        >
                          🎯 得点記録
                        </button>
                      )}
                      
                      {/* コート情報 */}
                      { (match.court || isEditing) &&
                        <div className="absolute -top-3 right-2 flex items-center gap-1 text-xs bg-slate-800/90 px-2 py-1 rounded-full border border-slate-500/50">
                           <span className="text-slate-400">🏟️</span>
                           {isEditing && onUpdateCourt ? (
                              <input 
                                  type="number" 
                                  value={match.court || ''}
                                  onChange={(e) => onUpdateCourt(match.id, parseInt(e.target.value) || 1)}
                                  className="w-8 h-5 text-center bg-slate-700/80 border border-slate-500 rounded text-sky-300 text-xs"
                                  onClick={(e) => e.stopPropagation()}
                              />
                           ) : (
                              <span className="text-sky-300 font-bold">{match.court}</span>
                           )}
                        </div>
                      }
                      
                      {/* 開始時刻 */}
                      {(match.startTime || isEditing) && (
                        <div className="absolute -top-3 left-2 flex items-center gap-1 text-xs bg-slate-800/90 px-2 py-1 rounded-full border border-slate-500/50">
                            <span className="text-amber-400">🕐</span>
                            {isEditing && onUpdateMatchTime ? (
                                <input 
                                    type="time" 
                                    value={match.startTime || ''}
                                    onChange={(e) => onUpdateMatchTime(match.id, e.target.value)}
                                    className="w-16 h-5 text-center bg-slate-700/80 border border-slate-500 rounded text-amber-300 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span className="text-amber-300 font-bold">{match.startTime}</span>
                            )}
                        </div>
                      )}
                      
                      <div className="flex flex-col items-stretch space-y-2 mt-2">
                        <TeamDisplayInBracket
                          team={match.team1}
                          placeholderText={match.placeholderTeam1Text}
                          score={match.team1Score}
                          isWinner={match.winner?.id === match.team1?.id}
                          isEditing={isEditing}
                          isSelectedForSwap={match.team1?.id === firstTeamToSwapId}
                          isMobileSwapping={mobileSwappingTeam?.team.id === match.team1?.id}
                          matchId={match.id}
                          teamSlot="team1"
                          roundIndex={roundIndex}
                          onSelect={onSelectTeamForSwap}
                          onMobileSelect={onSelectTeamForMobileSwap}
                        />
                        <TeamDisplayInBracket
                          team={match.team2}
                          placeholderText={match.placeholderTeam2Text}
                          score={match.team2Score}
                          isWinner={match.winner?.id === match.team2?.id}
                          isEditing={isEditing}
                          isSelectedForSwap={match.team2?.id === firstTeamToSwapId}
                          isMobileSwapping={mobileSwappingTeam?.team.id === match.team2?.id}
                          matchId={match.id}
                          teamSlot="team2"
                          roundIndex={roundIndex}
                          onSelect={onSelectTeamForSwap}
                          onMobileSelect={onSelectTeamForMobileSwap}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BracketView;