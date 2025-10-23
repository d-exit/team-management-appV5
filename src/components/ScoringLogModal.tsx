import React, { useState, useEffect } from 'react';
import { MatchScoringEvent, Member, Match } from '@/types';
import { X, Plus, Clock, User, Target, Edit2 } from 'lucide-react';

interface ScoringLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  subMatchId?: string;
  members: Member[];
  onAddScoringEvent: (event: Omit<MatchScoringEvent, 'id'>) => void;
  onUpdateScoringEvent: (eventId: string, updates: Partial<MatchScoringEvent>) => void;
  onRemoveScoringEvent: (eventId: string) => void;
}

const ScoringLogModal: React.FC<ScoringLogModalProps> = ({
  isOpen,
  onClose,
  match,
  subMatchId,
  members,
  onAddScoringEvent,
  onUpdateScoringEvent,
  onRemoveScoringEvent
}) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    period: '前半' as '前半' | '後半',
    minute: '',
    scorerName: '',
    teamId: '',
    assistName: ''
  });
  const [editEvent, setEditEvent] = useState({
    period: '前半' as '前半' | '後半',
    minute: '',
    scorerName: '',
    teamId: '',
    assistName: ''
  });

  // 現在の試合の得点イベントを取得
  const currentScoringEvents = subMatchId 
    ? match.subMatches?.find(sm => sm.id === subMatchId)?.scoringEvents || []
    : match.scoringEvents || [];

  // チームIDを設定（現在のチームIDを使用）
  useEffect(() => {
    if (match.ourTeamId) {
      setNewEvent(prev => ({ ...prev, teamId: match.ourTeamId }));
      setEditEvent(prev => ({ ...prev, teamId: match.ourTeamId }));
    }
  }, [match.ourTeamId]);

  const handleAddEvent = () => {
    if (newEvent.scorerName && newEvent.teamId && newEvent.minute) {
      const minute = parseInt(newEvent.minute);
      if (minute > 0 && minute <= 90) {
        onAddScoringEvent({
          period: newEvent.period,
          minute,
          scorerName: newEvent.scorerName,
          teamId: newEvent.teamId,
          assistName: newEvent.assistName || undefined,
          subMatchId
        });
        
        // フォームをリセット
        setNewEvent({
          period: '前半',
          minute: '',
          scorerName: '',
          teamId: match.ourTeamId || '',
          assistName: ''
        });
        setIsAddingEvent(false);
      }
    }
  };

  const handleEditEvent = () => {
    if (editingEventId && editEvent.scorerName && editEvent.teamId && editEvent.minute) {
      const minute = parseInt(editEvent.minute);
      if (minute > 0 && minute <= 90) {
        onUpdateScoringEvent(editingEventId, {
          period: editEvent.period,
          minute,
          scorerName: editEvent.scorerName,
          teamId: editEvent.teamId,
          assistName: editEvent.assistName || undefined
        });
        
        setEditingEventId(null);
        setEditEvent({
          period: '前半',
          minute: '',
          scorerName: '',
          teamId: match.ourTeamId || '',
          assistName: ''
        });
      }
    }
  };

  const startEditing = (event: MatchScoringEvent) => {
    setEditingEventId(event.id);
    setEditEvent({
      period: event.period,
      minute: event.minute.toString(),
      scorerName: event.scorerName,
      teamId: event.teamId,
      assistName: event.assistName || ''
    });
  };

  const cancelEditing = () => {
    setEditingEventId(null);
    setEditEvent({
      period: '前半',
      minute: '',
      scorerName: '',
      teamId: match.ourTeamId || '',
      assistName: ''
    });
  };

  const formatTime = (minute: number) => {
    const half = minute > 45 ? '後半' : '前半';
    const time = minute > 45 ? minute - 45 : minute;
    return `${half} ${time}分`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">得点記録</h2>
            <p className="text-sm text-slate-400 mt-1">
              {match.opponentTeamName ? `${match.opponentTeamName}戦` : '練習試合'} - {match.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 得点イベント一覧 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                得点記録 ({currentScoringEvents.length}ゴール)
              </h3>
              <button
                onClick={() => setIsAddingEvent(true)}
                className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                得点追加
              </button>
            </div>

            <div className="space-y-3">
              {currentScoringEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  まだ得点記録がありません
                </div>
              ) : (
                currentScoringEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Clock className="h-4 w-4" />
                        {formatTime(event.minute)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-sky-400" />
                        <span className="font-medium text-white">{event.scorerName}</span>
                        {event.assistName && (
                          <span className="text-slate-400">(アシスト: {event.assistName})</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(event)}
                        className="p-2 text-sky-400 hover:bg-sky-900/20 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onRemoveScoringEvent(event.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Target className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 得点追加フォーム */}
          {isAddingEvent && (
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">得点追加</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">前半/後半</label>
                  <select
                    value={newEvent.period}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, period: e.target.value as '前半' | '後半' }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="前半">前半</option>
                    <option value="後半">後半</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">時間（分）</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newEvent.minute}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, minute: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
                    placeholder="1-90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">得点者</label>
                  <select
                    value={newEvent.scorerName}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, scorerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">アシスト（任意）</label>
                  <select
                    value={newEvent.assistName}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, assistName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
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
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddEvent}
                  className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  追加
                </button>
                <button
                  onClick={() => setIsAddingEvent(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* 編集フォーム */}
          {editingEventId && (
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">得点編集</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">前半/後半</label>
                  <select
                    value={editEvent.period}
                    onChange={(e) => setEditEvent(prev => ({ ...prev, period: e.target.value as '前半' | '後半' }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="前半">前半</option>
                    <option value="後半">後半</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">時間（分）</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={editEvent.minute}
                    onChange={(e) => setEditEvent(prev => ({ ...prev, minute: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
                    placeholder="1-90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">得点者</label>
                  <select
                    value={editEvent.scorerName}
                    onChange={(e) => setEditEvent(prev => ({ ...prev, scorerName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">アシスト（任意）</label>
                  <select
                    value={editEvent.assistName}
                    onChange={(e) => setEditEvent(prev => ({ ...prev, assistName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500"
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
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditEvent}
                  className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  更新
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoringLogModal;
