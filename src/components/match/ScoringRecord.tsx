import React, { useState } from 'react';
import { MatchScoringEvent, Member } from '@/types';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermission } from '@/components/common/PermissionGuard';
import { Plus, Clock, User, Target } from 'lucide-react';

interface ScoringRecordProps {
  matchId: string;
  scoringEvents: MatchScoringEvent[];
  members: Member[];
  onAddScoringEvent: (event: MatchScoringEvent) => void;
  onUpdateScoringEvent: (eventId: string, updates: Partial<MatchScoringEvent>) => void;
  onRemoveScoringEvent: (eventId: string) => void;
}

export const ScoringRecord: React.FC<ScoringRecordProps> = ({
  matchId,
  scoringEvents,
  members,
  onAddScoringEvent,
  onUpdateScoringEvent,
  onRemoveScoringEvent
}) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    period: '前半' as '前半' | '後半',
    minute: 0,
    scorerName: '',
    teamId: '',
    assistName: ''
  });

  const canScore = usePermission('match.score');

  const handleAddEvent = () => {
    if (newEvent.scorerName && newEvent.teamId && newEvent.minute > 0) {
      onAddScoringEvent({
        ...newEvent,
        id: `event-${Date.now()}`
      });
      setNewEvent({
        period: '前半',
        minute: 0,
        scorerName: '',
        teamId: '',
        assistName: ''
      });
      setIsAddingEvent(false);
    }
  };

  const formatTime = (minute: number) => {
    const half = minute > 45 ? '後半' : '前半';
    const time = minute > 45 ? minute - 45 : minute;
    return `${half} ${time}分`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            得点記録 ({scoringEvents.length}ゴール)
          </h3>
          <PermissionGuard requiredPermission="match.score">
            <button
              onClick={() => setIsAddingEvent(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              得点追加
            </button>
          </PermissionGuard>
        </div>

        <div className="space-y-3">
          {scoringEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  {formatTime(event.minute)}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{event.scorerName}</span>
                  {event.assistName && (
                    <>
                      <span className="text-gray-400">(アシスト: {event.assistName})</span>
                    </>
                  )}
                </div>
              </div>
              
              <PermissionGuard requiredPermission="match.score">
                <button
                  onClick={() => onRemoveScoringEvent(event.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Target className="h-4 w-4" />
                </button>
              </PermissionGuard>
            </div>
          ))}
        </div>
      </div>

      {/* 得点追加モーダル */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">得点追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">前半/後半</label>
                <select
                  value={newEvent.period}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, period: e.target.value as '前半' | '後半' }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="前半">前半</option>
                  <option value="後半">後半</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">時間（分）</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newEvent.minute}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">得点者</label>
                <select
                  value={newEvent.scorerName}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, scorerName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">選択してください</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.jerseyNumber}番)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">アシスト（任意）</label>
                <select
                  value={newEvent.assistName}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, assistName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">なし</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.jerseyNumber}番)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => setIsAddingEvent(false)}
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