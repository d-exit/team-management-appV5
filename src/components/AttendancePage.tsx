import React, { useState, useCallback } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, User, Send, Copy, Search } from 'lucide-react';
import { OptimizedButton } from './common/OptimizedButton';
import { MemberSelector } from './common/MemberSelector';
import { TagSelector } from './common/TagSelector';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  attendees: Attendee[];
  tagIds?: string[];
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceDays?: string[]; // 繰り返しの曜日
  recurrenceDates?: number[]; // 繰り返しの日付
  responseDeadline?: Date; // 回答期限を追加
}

interface Attendee {
  id: string;
  name: string;
  status: 'pending' | 'attending' | 'not_attending' | 'maybe';
  responseDate?: Date;
  notes?: string;
}

interface AttendancePageProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ onBack, isAdmin = false }) => {
  // タグデータ
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: '練習', color: 'bg-blue-500', createdAt: new Date() },
    { id: '2', name: '試合', color: 'bg-green-500', createdAt: new Date() },
    { id: '3', name: 'イベント', color: 'bg-purple-500', createdAt: new Date() },
    { id: '4', name: '緊急', color: 'bg-red-500', createdAt: new Date() },
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: '通常練習',
      description: '基本技術の練習を行います。ボールタッチ、パス練習、シュート練習を予定しています。',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24), // 明日
      location: 'グラウンドA',
      organizer: '田中コーチ',
      attendees: [
        { id: '1', name: '田中太郎', status: 'attending', responseDate: new Date() },
        { id: '2', name: '佐藤花子', status: 'attending', responseDate: new Date() },
        { id: '3', name: '鈴木三郎', status: 'attending', responseDate: new Date() },
        { id: '4', name: '高橋四郎', status: 'pending' },
        { id: '5', name: '渡辺五郎', status: 'maybe', responseDate: new Date() },
      ],
      tagIds: ['1'],
      isRecurring: false,
      responseDeadline: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12時間後
    },
    {
      id: '2',
      title: '対外試合',
      description: 'オーシャンズFCとの練習試合です。集合時間：8:30、試合開始：9:00',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3日後
      location: 'グラウンドB',
      organizer: '佐藤コーチ',
      attendees: [
        { id: '1', name: '田中太郎', status: 'attending', responseDate: new Date() },
        { id: '2', name: '佐藤花子', status: 'attending', responseDate: new Date() },
        { id: '3', name: '鈴木三郎', status: 'attending', responseDate: new Date() },
        { id: '4', name: '高橋四郎', status: 'attending', responseDate: new Date() },
        { id: '5', name: '渡辺五郎', status: 'attending', responseDate: new Date() },
      ],
      tagIds: ['2', '4'],
      isRecurring: false,
      responseDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2日後
    },
    {
      id: '3',
      title: '技術練習',
      description: 'ドリブルとフェイントの練習を行います。個人技術の向上を目指します。',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5日後
      location: '体育館',
      organizer: '高橋コーチ',
      attendees: [
        { id: '1', name: '田中太郎', status: 'pending' },
        { id: '2', name: '佐藤花子', status: 'attending', responseDate: new Date() },
        { id: '3', name: '鈴木三郎', status: 'maybe', responseDate: new Date() },
        { id: '4', name: '高橋四郎', status: 'pending' },
        { id: '5', name: '渡辺五郎', status: 'pending' },
      ],
      tagIds: ['1'],
      isRecurring: false,
      responseDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4日後
    },
    {
      id: '4',
      title: '週末練習',
      description: '週末の特別練習です。試合形式の練習を行い、実戦力を養います。',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1週間後
      location: 'グラウンドA',
      organizer: '田中コーチ',
      attendees: [
        { id: '1', name: '田中太郎', status: 'attending', responseDate: new Date() },
        { id: '2', name: '佐藤花子', status: 'pending' },
        { id: '3', name: '鈴木三郎', status: 'attending', responseDate: new Date() },
        { id: '4', name: '高橋四郎', status: 'maybe', responseDate: new Date() },
        { id: '5', name: '渡辺五郎', status: 'pending' },
      ],
      tagIds: ['1'],
      isRecurring: false,
      responseDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // 6日後
    },
  ]);

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const [createEventForm, setCreateEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    isRecurring: false,
    recurrencePattern: '',
    recurrenceDays: [] as string[],
    recurrenceDates: [] as number[],
    selectedMemberIds: [] as string[],
    tagIds: [] as string[],
  });

  const [responseForm, setResponseForm] = useState({
    status: 'pending' as 'pending' | 'attending' | 'not_attending' | 'maybe',
    notes: '',
  });

  // モックメンバーデータ
  const [members] = useState([
    { id: '1', name: '田中太郎', email: 'tanaka@example.com', role: 'メンバー' },
    { id: '2', name: '佐藤花子', email: 'sato@example.com', role: 'メンバー' },
    { id: '3', name: '鈴木三郎', email: 'suzuki@example.com', role: 'メンバー' },
    { id: '4', name: '高橋四郎', email: 'takahashi@example.com', role: 'メンバー' },
    { id: '5', name: '渡辺五郎', email: 'watanabe@example.com', role: 'メンバー' },
  ]);

  const handleCreateEvent = useCallback(() => {
    if (!createEventForm.title || !createEventForm.date) return;

    const eventDate = new Date(`${createEventForm.date}T${createEventForm.time || '00:00'}`);

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      title: createEventForm.title,
      description: createEventForm.description,
      date: eventDate,
      location: createEventForm.location,
      organizer: '現在のユーザー',
      attendees: [],
      tagIds: createEventForm.tagIds,
      isRecurring: createEventForm.isRecurring,
      recurrencePattern: createEventForm.recurrencePattern,
      recurrenceDays: createEventForm.recurrenceDays,
      recurrenceDates: createEventForm.recurrenceDates,
    };

    setEvents(prev => [...prev, newEvent]);
    setCreateEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      isRecurring: false,
      recurrencePattern: '',
      recurrenceDays: [],
      recurrenceDates: [],
      selectedMemberIds: [],
      tagIds: [],
    });
    setShowCreateEvent(false);
  }, [createEventForm]);

  const handleDuplicateEvent = useCallback((event: Event) => {
    setCreateEventForm({
      title: `${event.title} (コピー)`,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      time: event.date.toTimeString().slice(0, 5),
      location: event.location,
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern || '',
      recurrenceDays: event.recurrenceDays || [],
      recurrenceDates: event.recurrenceDates || [],
      selectedMemberIds: [],
      tagIds: event.tagIds || [],
    });
    setShowCreateEvent(true);
  }, []);

  const handleResponse = useCallback(() => {
    if (!selectedEvent) return;

    const currentUser = '現在のユーザー';
    const updatedAttendees = selectedEvent.attendees.map(attendee =>
      attendee.name === currentUser
        ? {
            ...attendee,
            status: responseForm.status,
            responseDate: new Date(),
            notes: responseForm.notes,
          }
        : attendee
    );

    // ユーザーがまだ参加者リストにいない場合は追加
    if (!updatedAttendees.find(a => a.name === currentUser)) {
      updatedAttendees.push({
        id: `attendee-${Date.now()}`,
        name: currentUser,
        status: responseForm.status,
        responseDate: new Date(),
        notes: responseForm.notes,
      });
    }

    setEvents(prev =>
      prev.map(event =>
        event.id === selectedEvent.id
          ? { ...event, attendees: updatedAttendees }
          : event
      )
    );

    setResponseForm({
      status: 'pending',
      notes: '',
    });
    setSelectedEvent(null);
    setShowResponseForm(false);
  }, [selectedEvent, responseForm]);

  const handleSendReminder = useCallback((eventId: string) => {
    // 実際の実装ではメール送信APIを呼び出す
    alert('出欠確認のリマインダーを送信しました。');
  }, []);

  const filteredEvents = events.filter(event => {
    const now = new Date();
    if (filter === 'upcoming') return event.date > now;
    if (filter === 'past') return event.date < now;

    // 検索フィルター
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // タグフィルター
    if (selectedTagIds.length > 0) {
      const eventTagIds = event.tagIds || [];
      if (!selectedTagIds.some(tagId => eventTagIds.includes(tagId))) {
        return false;
      }
    }

    // 日付フィルター
    if (selectedDateRange.start || selectedDateRange.end) {
      const eventDate = event.date;
      const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
      const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;

      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
    }

    return true;
  });

  const getStatusIcon = (status: Attendee['status']) => {
    switch (status) {
      case 'attending':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'not_attending':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maybe':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: Attendee['status']) => {
    switch (status) {
      case 'attending':
        return '参加';
      case 'not_attending':
        return '不参加';
      case 'maybe':
        return '未定';
      case 'pending':
        return '未回答';
    }
  };

  const getStatusCount = (event: Event, status: Attendee['status']) => {
    return event.attendees.filter(attendee => attendee.status === status).length;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTags = (tagIds: string[] = []) => {
    return tags.filter(tag => tagIds.includes(tag.id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-white">出欠連絡</h1>
        </div>
        {isAdmin && (
          <OptimizedButton
            onClick={() => setShowCreateEvent(true)}
            icon={<Calendar className="w-4 h-4" />}
          >
            イベント作成
          </OptimizedButton>
        )}
      </div>

      {/* フィルター */}
      <div className="space-y-4 mb-6">
        {/* ステータスフィルター */}
        <div className="flex space-x-2">
          <OptimizedButton
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            すべて
          </OptimizedButton>
          <OptimizedButton
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            今後の予定
          </OptimizedButton>
          <OptimizedButton
            variant={filter === 'past' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('past')}
          >
            過去の予定
          </OptimizedButton>
        </div>

        {/* 検索・フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="イベントを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* タグフィルター */}
          <TagSelector
            tags={tags}
            selectedTagIds={selectedTagIds}
            onSelectionChange={setSelectedTagIds}
            onTagsChange={setTags}
            title="タグで絞り込み"
            placeholder="タグを検索..."
            allowCreate={isAdmin}
            allowEdit={isAdmin}
            showSelectAll={false}
            showSearch={true}
          />

          {/* 日付フィルター */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">開始日</label>
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">終了日</label>
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* イベント一覧 */}
      <div className="space-y-4">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    {formatDate(event.date)}
                  </span>
                  {event.isRecurring && (
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                      定期
                    </span>
                  )}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateEvent(event);
                      }}
                      className="text-slate-400 hover:text-slate-300 ml-auto"
                      title="複製"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {event.title}
                </h3>
                
                <p className="text-slate-300 text-sm mb-3">
                  {event.description}
                </p>

                {/* タグ表示 */}
                {event.tagIds && event.tagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {getEventTags(event.tagIds).map(tag => (
                      <span
                        key={tag.id}
                        className={`inline-flex items-center gap-1 ${tag.color} text-white px-2 py-1 rounded-full text-xs`}
                      >
                        <span>{tag.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-slate-300 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{event.organizer}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* 参加状況 */}
                <div className="flex items-center space-x-4 text-sm mb-3">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400">参加: {getStatusCount(event, 'attending')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-400">不参加: {getStatusCount(event, 'not_attending')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-400">未定: {getStatusCount(event, 'maybe')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">未回答: {getStatusCount(event, 'pending')}</span>
                  </div>
                </div>

                {/* 参加者リスト */}
                <div className="bg-slate-700 rounded p-3 mb-3">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">参加者一覧</h4>
                  <div className="space-y-1">
                    {event.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(attendee.status)}
                          <span className="text-slate-300">{attendee.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">
                            {getStatusLabel(attendee.status)}
                          </span>
                          {attendee.responseDate && (
                            <span className="text-slate-500">
                              {attendee.responseDate.toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                {!isAdmin && (
                  <OptimizedButton
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowResponseForm(true);
                    }}
                  >
                    出欠回答
                  </OptimizedButton>
                )}
                {isAdmin && (
                  <OptimizedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReminder(event.id)}
                    icon={<Send className="w-4 h-4" />}
                  >
                    リマインダー
                  </OptimizedButton>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* イベント作成フォーム */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">イベント作成</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  イベント名
                </label>
                <input
                  type="text"
                  value={createEventForm.title}
                  onChange={(e) => setCreateEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="イベント名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  説明
                </label>
                <textarea
                  value={createEventForm.description}
                  onChange={(e) => setCreateEventForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="イベントの説明"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    日付
                  </label>
                  <input
                    type="date"
                    value={createEventForm.date}
                    onChange={(e) => setCreateEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    時間
                  </label>
                  <input
                    type="time"
                    value={createEventForm.time}
                    onChange={(e) => setCreateEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  場所
                </label>
                <input
                  type="text"
                  value={createEventForm.location}
                  onChange={(e) => setCreateEventForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="場所を入力"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={createEventForm.isRecurring}
                  onChange={(e) => setCreateEventForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="isRecurring" className="text-sm text-slate-300">
                  定期イベント
                </label>
              </div>

              {createEventForm.isRecurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      繰り返しパターン
                    </label>
                    <select
                      value={createEventForm.recurrencePattern}
                      onChange={(e) => setCreateEventForm(prev => ({ ...prev, recurrencePattern: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">パターンを選択</option>
                      <option value="weekly">毎週</option>
                      <option value="biweekly">隔週</option>
                      <option value="monthly">毎月</option>
                    </select>
                  </div>

                  {/* 曜日選択（毎週・隔週の場合） */}
                  {(createEventForm.recurrencePattern === 'weekly' || createEventForm.recurrencePattern === 'biweekly') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        繰り返し曜日
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const dayValue = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][index];
                              const isSelected = createEventForm.recurrenceDays.includes(dayValue);
                              setCreateEventForm(prev => ({
                                ...prev,
                                recurrenceDays: isSelected
                                  ? prev.recurrenceDays.filter(d => d !== dayValue)
                                  : [...prev.recurrenceDays, dayValue]
                              }));
                            }}
                            className={`p-2 rounded text-sm ${
                              createEventForm.recurrenceDays.includes(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][index])
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 日付選択（毎月の場合） */}
                  {createEventForm.recurrencePattern === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        繰り返し日付
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const isSelected = createEventForm.recurrenceDates.includes(day);
                              setCreateEventForm(prev => ({
                                ...prev,
                                recurrenceDates: isSelected
                                  ? prev.recurrenceDates.filter(d => d !== day)
                                  : [...prev.recurrenceDates, day]
                              }));
                            }}
                            className={`p-2 rounded text-sm ${
                              createEventForm.recurrenceDates.includes(day)
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* タグ選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  タグ
                </label>
                <TagSelector
                  tags={tags}
                  selectedTagIds={createEventForm.tagIds}
                  onSelectionChange={(selectedIds) => setCreateEventForm(prev => ({ ...prev, tagIds: selectedIds }))}
                  onTagsChange={setTags}
                  title="タグを選択"
                  placeholder="タグを検索..."
                  allowCreate={true}
                  allowEdit={true}
                  showSelectAll={false}
                  showSearch={true}
                />
              </div>

              {/* メンバー選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  対象メンバー
                </label>
                <MemberSelector
                  members={members}
                  selectedMemberIds={createEventForm.selectedMemberIds}
                  onSelectionChange={(selectedIds) => setCreateEventForm(prev => ({ ...prev, selectedMemberIds: selectedIds }))}
                  title="出欠確認対象メンバー"
                  placeholder="メンバーを検索..."
                  showSelectAll={true}
                  showSearch={true}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowCreateEvent(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleCreateEvent}
                disabled={!createEventForm.title || !createEventForm.date}
              >
                作成
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}

      {/* 出欠回答フォーム */}
      {showResponseForm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">出欠回答</h2>
            
            <div className="bg-slate-700 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-white mb-2">{selectedEvent.title}</h3>
              <p className="text-slate-300 text-sm mb-2">{selectedEvent.description}</p>
              <div className="text-sm text-slate-300">
                <div>日時: {formatDate(selectedEvent.date)}</div>
                <div>場所: {selectedEvent.location}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  出欠状況
                </label>
                <select
                  value={responseForm.status}
                  onChange={(e) => setResponseForm(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'pending' | 'attending' | 'not_attending' | 'maybe' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="attending">参加</option>
                  <option value="not_attending">不参加</option>
                  <option value="maybe">未定</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  備考
                </label>
                <textarea
                  value={responseForm.notes}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="備考があれば入力してください"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowResponseForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleResponse}
              >
                回答送信
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 