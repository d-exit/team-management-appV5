// components/SchedulePage.tsx
// This component will manage and display team schedules, including a calendar view.
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { Match } from '@/types';

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'practice' | 'match' | 'meeting' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  isPublic: boolean;
  participants?: string[];
}

interface SchedulePageProps {
  onBack: () => void;
  isAdmin?: boolean;
  matches?: Match[];
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ onBack, isAdmin = false, matches = [] }) => {
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: '練習',
      type: 'practice',
      date: '2024-01-15',
      startTime: '18:00',
      endTime: '20:00',
      location: 'サッカー場A',
      description: '通常練習',
      isPublic: true,
    },
    {
      id: '2',
      title: '試合 vs チームB',
      type: 'match',
      date: '2024-01-20',
      startTime: '14:00',
      endTime: '16:00',
      location: 'サッカー場B',
      description: 'リーグ戦',
      isPublic: true,
    },
  ]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // 既存の試合データを取得（App.tsxから渡される）
  const [existingMatches, setExistingMatches] = useState<ScheduleEvent[]>([]);

  // 月の移動
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // 月の名前を取得
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  // 既存の試合をイベントとして追加
  useEffect(() => {
    // App.tsxから渡された試合データをScheduleEvent形式に変換
    const convertedMatches: ScheduleEvent[] = matches.map(match => ({
      id: `match-${match.id}`,
      title: `${match.type} vs ${match.opponentTeamName || '対戦相手'}`,
      type: 'match',
      date: match.date,
      startTime: match.time || '00:00',
      endTime: match.time ? (() => {
        // 試合時間を推定（デフォルト2時間）
        const [h, m] = match.time.split(':').map(Number);
        const endTime = new Date(2024, 0, 1, h + 2, m);
        return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      })() : '02:00',
      location: match.location || '未定',
      description: match.notes || '',
      isPublic: true,
    }));
    setExistingMatches(convertedMatches);
  }, [matches]);

  // すべてのイベント（既存のイベント + 既存の試合）
  const allEvents = useMemo(() => {
    return [...events, ...existingMatches];
  }, [events, existingMatches]);

  const eventTypes = {
    practice: { label: '練習', icon: Users, color: 'bg-blue-500' },
    match: { label: '試合', icon: BookOpen, color: 'bg-green-500' },
    meeting: { label: 'ミーティング', icon: Users, color: 'bg-yellow-500' },
    other: { label: 'その他', icon: Calendar, color: 'bg-purple-500' },
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: string) => {
    return allEvents.filter(event => event.date === date);
  };

  const handleAddEvent = (event: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    setEvents(prev => [...prev, newEvent]);
    setShowAddModal(false);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = (updatedEvent: ScheduleEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setShowEditModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('このイベントを削除しますか？')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;

      days.push(
        <div
          key={day}
          className={`p-2 border border-slate-600 min-h-[100px] cursor-pointer hover:bg-slate-700 transition-colors ${
            isToday ? 'bg-sky-500/20 border-sky-400' : ''
          } ${isSelected ? 'bg-sky-600/30 border-sky-500' : ''}`}
          onClick={() => setSelectedDate(dateString)}
        >
          <div className="text-sm font-medium mb-1">{day}</div>
          <div className="space-y-1">
                                    {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded ${
                              eventTypes[event.type].color
                            } text-white truncate cursor-pointer hover:opacity-80 transition-opacity`}
                            title={event.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
        {/* 月の表示とナビゲーション */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-700"
          >
            ← 前月
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{getMonthName(currentMonth)}</h2>
            <button
              onClick={goToCurrentMonth}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              今月に戻る
            </button>
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-700"
          >
            翌月 →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-slate-300">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const renderEventList = () => {
    // 今日から1週間分のイベントを表示
    const today = new Date();
    const weekEvents = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = getEventsForDate(dateString);
      
      if (dayEvents.length > 0) {
        weekEvents.push({
          date: dateString,
          dateLabel: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' }),
          events: dayEvents
        });
      }
    }

    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">
          今週のスケジュール
        </h3>
        {weekEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p>今週のイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weekEvents.map(({ date, dateLabel, events }) => (
              <div key={date} className="border-b border-slate-700 pb-4 last:border-b-0">
                <h4 className="text-lg font-medium text-white mb-3">{dateLabel}</h4>
                <div className="space-y-3">
                  {events.map(event => (
                    <div key={event.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1 rounded ${eventTypes[event.type].color}`}>
                              {React.createElement(eventTypes[event.type].icon, { className: 'h-4 w-4 text-white' })}
                            </div>
                            <h5 className="font-medium text-white">{event.title}</h5>
                            {event.isPublic ? (
                              <Eye className="h-4 w-4 text-green-400" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.startTime} - {event.endTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-slate-400 mt-2">{event.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // イベント詳細モーダル
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ScheduleEvent | null>(null);

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEventDetail(event);
    setShowEventDetail(true);
  };

  const renderEventDetailModal = () => {
    if (!selectedEventDetail) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-600">
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded ${eventTypes[selectedEventDetail.type].color}`}>
              {React.createElement(eventTypes[selectedEventDetail.type].icon, { className: 'h-6 w-6 text-white' })}
            </div>
            <h3 className="text-lg font-semibold text-white">{selectedEventDetail.title}</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4" />
              <span>{selectedEventDetail.date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4" />
              <span>{selectedEventDetail.startTime} - {selectedEventDetail.endTime}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4" />
              <span>{selectedEventDetail.location}</span>
            </div>
            {selectedEventDetail.description && (
              <div className="text-slate-300">
                <p className="text-sm">{selectedEventDetail.description}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-300">
              {selectedEventDetail.isPublic ? (
                <>
                  <Eye className="h-4 w-4 text-green-400" />
                  <span>公開イベント</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-slate-400" />
                  <span>非公開イベント</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowEventDetail(false);
                setSelectedEventDetail(null);
                handleEditEvent(selectedEventDetail);
              }}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              編集
            </button>
            <button
              onClick={() => setShowEventDetail(false)}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">スケジュール管理</h1>
            <p className="text-slate-400">練習、試合、ミーティングなどのスケジュールを管理できます</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              {viewMode === 'calendar' ? 'リスト表示' : 'カレンダー表示'}
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                イベント追加
              </button>
            )}
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              戻る
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* カレンダー */}
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? renderCalendar() : renderEventList()}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">


            {/* イベントタイプ凡例 */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-sky-400 mb-4">イベントタイプ</h3>
              <div className="space-y-2">
                {Object.entries(eventTypes).map(([key, { label, icon: Icon, color }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`p-1 rounded ${color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 統計 */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-sky-400 mb-4">統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">総イベント数</span>
                  <span className="font-medium">{allEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">公開イベント</span>
                  <span className="font-medium">{allEvents.filter(e => e.isPublic).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">非公開イベント</span>
                  <span className="font-medium">{allEvents.filter(e => !e.isPublic).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* イベント追加モーダル */}
      {showAddModal && (
        <EventModal
          onSave={handleAddEvent}
          onCancel={() => setShowAddModal(false)}
          eventTypes={eventTypes}
        />
      )}

      {/* イベント編集モーダル */}
      {showEditModal && editingEvent && (
        <EventModal
          event={editingEvent}
          onSave={handleUpdateEvent}
          onCancel={() => {
            setShowEditModal(false);
            setEditingEvent(null);
          }}
          eventTypes={eventTypes}
        />
      )}

      {/* イベント詳細モーダル */}
      {showEventDetail && renderEventDetailModal()}
    </div>
  );
};

// イベントモーダルコンポーネント
interface EventModalProps {
  event?: ScheduleEvent;
  onSave: (event: ScheduleEvent) => void;
  onCancel: () => void;
  eventTypes: Record<string, { label: string }>;
}

const EventModal: React.FC<EventModalProps> = ({ event, onSave, onCancel, eventTypes }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    type: event?.type || 'practice',
    date: event?.date || new Date().toISOString().split('T')[0],
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    location: event?.location || '',
    description: event?.description || '',
    isPublic: event?.isPublic ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToSave: ScheduleEvent = {
      id: event?.id || `event-${Date.now()}`,
      ...formData,
      participants: event?.participants || []
    };
    onSave(eventToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">
          {event ? 'イベント編集' : 'イベント追加'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">タイトル</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">タイプ</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {Object.entries(eventTypes).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">日付</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">場所</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">開始時刻</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">終了時刻</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">説明</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500"
            />
            <label htmlFor="isPublic" className="text-sm text-slate-300">
              公開設定（すべてのメンバーに表示）
            </label>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              {event ? '更新' : '追加'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};