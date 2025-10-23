import React, { useState } from 'react';
import { Match, MatchType, MatchStatus, Team } from '@/types';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermission } from '@/components/common/PermissionGuard';
import { Calendar, Clock, Users, MapPin, Trophy, Target, Users2 } from 'lucide-react';

interface MatchCreationProps {
  teams: Team[];
  followedTeams: Team[];
  onCreateMatch: (match: Omit<Match, 'id'>) => void;
}

export const MatchCreation: React.FC<MatchCreationProps> = ({
  teams,
  followedTeams,
  onCreateMatch
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [matchType, setMatchType] = useState<MatchType>(MatchType.TRAINING);
  const [newMatch, setNewMatch] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    selectedTeams: [] as string[],
    description: ''
  });

  const canCreateMatch = usePermission('match.create');

  const handleCreateMatch = () => {
    if (newMatch.name && newMatch.date && newMatch.startTime && newMatch.selectedTeams.length > 0) {
      const match: Omit<Match, 'id'> = {
        type: matchType,
        status: MatchStatus.READY,
        ourTeamId: newMatch.selectedTeams[0] || '',
        opponentTeamId: newMatch.selectedTeams[1] || undefined,
        opponentTeamName: newMatch.selectedTeams[1] ? teams.find(t => t.id === newMatch.selectedTeams[1])?.name : undefined,
        date: newMatch.date,
        time: newMatch.startTime,
        location: newMatch.venue,
        notes: newMatch.description,
        scoringEvents: []
      };

      onCreateMatch(match);
      setNewMatch({
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        venue: '',
        selectedTeams: [],
        description: ''
      });
      setIsCreating(false);
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    setNewMatch(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter(id => id !== teamId)
        : [...prev.selectedTeams, teamId]
    }));
  };

  const getMatchTypeInfo = (type: MatchType) => {
    switch (type) {
      case MatchType.TRAINING:
        return { label: 'トレーニングマッチ', icon: Target, color: 'bg-blue-500' };
      case MatchType.LEAGUE:
        return { label: 'リーグ戦', icon: Trophy, color: 'bg-green-500' };
      case MatchType.TOURNAMENT:
        return { label: 'トーナメント戦', icon: Trophy, color: 'bg-purple-500' };
      default:
        return { label: 'その他', icon: Target, color: 'bg-gray-500' };
    }
  };

  return (
    <div className="space-y-6">
      <PermissionGuard requiredPermission="match.create">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              試合作成
            </h3>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              <Target className="h-4 w-4" />
              新規作成
            </button>
          </div>
        </div>
      </PermissionGuard>

      {/* 試合作成モーダル */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-6">試合作成</h3>
            
            <div className="space-y-6">
              {/* 試合種別選択 */}
              <div>
                <label className="block text-sm font-medium mb-3">試合種別</label>
                <div className="grid grid-cols-3 gap-3">
                  {[MatchType.TRAINING, MatchType.LEAGUE, MatchType.TOURNAMENT].map((type) => {
                    const info = getMatchTypeInfo(type);
                    const Icon = info.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setMatchType(type)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          matchType === type
                            ? `${info.color} text-white border-transparent`
                            : 'border-gray-300 dark:border-slate-600 hover:border-sky-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{info.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">試合・大会名</label>
                  <input
                    type="text"
                    value={newMatch.name}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                    placeholder="例: 春季リーグ戦"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">開催日</label>
                  <input
                    type="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">開始時間</label>
                  <input
                    type="time"
                    value={newMatch.startTime}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">終了時間</label>
                  <input
                    type="time"
                    value={newMatch.endTime}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">会場</label>
                <input
                  type="text"
                  value={newMatch.venue}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="例: 〇〇サッカー場"
                />
              </div>

              {/* 対戦相手選択 */}
              <div>
                <label className="block text-sm font-medium mb-3">対戦相手選択</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {followedTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => toggleTeamSelection(team.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                        newMatch.selectedTeams.includes(team.id)
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                          : 'border-gray-300 dark:border-slate-600 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            レベル: {team.level} | レーティング: {team.rating}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">備考</label>
                <textarea
                  value={newMatch.description}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="試合に関する追加情報があれば入力してください"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateMatch}
                className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                作成
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 