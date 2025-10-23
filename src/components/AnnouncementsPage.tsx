import React, { useState, useCallback } from 'react';
import { Send, Image, File, Users, User, Globe, Eye, EyeOff, Trash2, Edit, Copy, Search, Calendar } from 'lucide-react';
import { OptimizedButton } from './common/OptimizedButton';
import { LoadingSpinner } from './common/LoadingSpinner';
import { MemberSelector } from './common/MemberSelector';
import { TagSelector } from './common/TagSelector';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetType: 'individual' | 'group' | 'all';
  targetIds?: string[];
  attachments?: Attachment[];
  tagIds?: string[];
  createdAt: Date;
  createdBy: string;
  isRead?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  size: number;
}

interface AnnouncementsPageProps {
  onBack: () => void;
  isAdmin?: boolean;
  currentUser?: any;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onBack, isAdmin = false, currentUser }) => {
  // タグデータ
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: '重要', color: 'bg-red-500', createdAt: new Date() },
    { id: '2', name: '練習', color: 'bg-blue-500', createdAt: new Date() },
    { id: '3', name: '試合', color: 'bg-green-500', createdAt: new Date() },
    { id: '4', name: 'イベント', color: 'bg-purple-500', createdAt: new Date() },
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: '明日の練習について',
      content: '明日の練習は雨天のため室内で行います。体育館の使用時間は18:00-20:00です。室内用のシューズをお持ちください。',
      targetType: 'all',
      tagIds: ['2'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdBy: '田中コーチ',
      isRead: true,
    },
    {
      id: '2',
      title: '試合の集合時間変更',
      content: '来週の試合の集合時間が30分早くなりました。集合時間：8:30、集合場所：グラウンド入口',
      targetType: 'group',
      targetIds: ['group-1'],
      tagIds: ['1', '3'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      createdBy: '佐藤コーチ',
      isRead: false,
    },
    {
      id: '3',
      title: '新入部員歓迎会のお知らせ',
      content: '4月15日に新入部員歓迎会を開催します。場所：部室、時間：19:00-21:00。参加希望の方は事前に連絡してください。',
      targetType: 'all',
      tagIds: ['4'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      createdBy: '高橋コーチ',
      isRead: false,
    },
    {
      id: '4',
      title: 'ユニフォームの配布について',
      content: '新しいユニフォームが届きました。来週の練習時に配布します。サイズの確認をお願いします。',
      targetType: 'all',
      tagIds: ['2'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      createdBy: '田中コーチ',
      isRead: true,
    },
    {
      id: '5',
      title: '遠征試合の詳細',
      content: '5月の遠征試合の詳細が決まりました。参加費：15,000円、宿泊：2泊3日。詳細は別途配布します。',
      targetType: 'group',
      targetIds: ['group-1'],
      tagIds: ['3', '1'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
      createdBy: '佐藤コーチ',
      isRead: false,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all' as 'individual' | 'group' | 'all',
    targetIds: [] as string[],
    tagIds: [] as string[],
    attachments: [] as Attachment[],
  });

  // モックメンバーデータ
  const [members] = useState([
    { id: '1', name: '田中太郎', email: 'tanaka@example.com', role: 'メンバー' },
    { id: '2', name: '佐藤花子', email: 'sato@example.com', role: 'メンバー' },
    { id: '3', name: '鈴木三郎', email: 'suzuki@example.com', role: 'メンバー' },
    { id: '4', name: '高橋四郎', email: 'takahashi@example.com', role: 'メンバー' },
    { id: '5', name: '渡辺五郎', email: 'watanabe@example.com', role: 'メンバー' },
  ]);

  const handleCreateAnnouncement = useCallback(() => {
    if (!formData.title || !formData.content) return;

    const newAnnouncement: Announcement = {
      id: `announcement-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      targetType: formData.targetType,
      targetIds: formData.targetIds,
      tagIds: formData.tagIds,
      attachments: formData.attachments,
      createdAt: new Date(),
      createdBy: currentUser?.name || '不明なユーザー',
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setFormData({
      title: '',
      content: '',
      targetType: 'all',
      targetIds: [],
      tagIds: [],
      attachments: [],
    });
    setShowCreateForm(false);
  }, [formData]);

  const handleDuplicateAnnouncement = useCallback((announcement: Announcement) => {
    setFormData({
      title: `${announcement.title} (コピー)`,
      content: announcement.content,
      targetType: announcement.targetType,
      targetIds: announcement.targetIds || [],
      tagIds: announcement.tagIds || [],
      attachments: announcement.attachments || [],
    });
    setShowCreateForm(true);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: `attachment-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        size: file.size,
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment],
      }));
    });
  }, []);

  const handleMarkAsRead = useCallback((announcementId: string) => {
    setAnnouncements(prev =>
      prev.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  }, []);

  const filteredAnnouncements = announcements.filter(announcement => {
    // 管理者・編集者以外は未読/既読フィルターを適用
    if (!isAdmin) {
      if (filter === 'unread') return !announcement.isRead;
      if (filter === 'read') return announcement.isRead;
    }

    // 検索フィルター
    if (searchTerm && !announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !announcement.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // タグフィルター
    if (selectedTagIds.length > 0) {
      const announcementTagIds = announcement.tagIds || [];
      if (!selectedTagIds.some(tagId => announcementTagIds.includes(tagId))) {
        return false;
      }
    }

    // 日付フィルター
    if (selectedDateRange.start || selectedDateRange.end) {
      const announcementDate = announcement.createdAt;
      const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
      const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;

      if (startDate && announcementDate < startDate) return false;
      if (endDate && announcementDate > endDate) return false;
    }

    return true;
  });

  const getTargetTypeIcon = (type: 'individual' | 'group' | 'all') => {
    switch (type) {
      case 'individual':
        return <User className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'all':
        return <Globe className="w-4 h-4" />;
    }
  };

  const getTargetTypeLabel = (type: 'individual' | 'group' | 'all') => {
    switch (type) {
      case 'individual':
        return '個人';
      case 'group':
        return 'グループ';
      case 'all':
        return '全体';
    }
  };

  const getAnnouncementTags = (tagIds: string[] = []) => {
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
          <h1 className="text-2xl font-bold text-white">お知らせ</h1>
        </div>
        {isAdmin && (
          <OptimizedButton
            onClick={() => setShowCreateForm(true)}
            icon={<Send className="w-4 h-4" />}
          >
            新規作成
          </OptimizedButton>
        )}
      </div>

      {/* フィルター */}
      <div className="space-y-4 mb-6">
        {/* 管理者・編集者以外のみ未読/既読フィルターを表示 */}
        {!isAdmin && (
          <div className="flex space-x-2">
            <OptimizedButton
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              すべて
            </OptimizedButton>
            <OptimizedButton
              variant={filter === 'unread' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              未読
            </OptimizedButton>
            <OptimizedButton
              variant={filter === 'read' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              既読
            </OptimizedButton>
          </div>
        )}

        {/* 検索・フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="お知らせを検索..."
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

      {/* お知らせ一覧 */}
      <div className="space-y-4">
        {filteredAnnouncements.map(announcement => (
          <div
            key={announcement.id}
            className={`bg-slate-800 rounded-lg p-4 border-l-4 ${
              announcement.isRead ? 'border-slate-600' : 'border-sky-500'
            }`}
            onClick={() => {
              setSelectedAnnouncement(announcement);
              if (!announcement.isRead) {
                handleMarkAsRead(announcement.id);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getTargetTypeIcon(announcement.targetType)}
                  <span className="text-xs text-slate-400">
                    {getTargetTypeLabel(announcement.targetType)}
                  </span>
                  {!announcement.isRead && (
                    <span className="bg-sky-500 text-white text-xs px-2 py-1 rounded-full">
                      新着
                    </span>
                  )}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateAnnouncement(announcement);
                      }}
                      className="text-slate-400 hover:text-slate-300 ml-auto"
                      title="複製"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {announcement.title}
                </h3>
                <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                  {announcement.content}
                </p>
                
                {/* タグ表示 */}
                {announcement.tagIds && announcement.tagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {getAnnouncementTags(announcement.tagIds).map(tag => (
                      <span
                        key={tag.id}
                        className={`inline-flex items-center gap-1 ${tag.color} text-white px-2 py-1 rounded-full text-xs`}
                      >
                        <span>{tag.name}</span>
                      </span>
                    ))}
                  </div>
                )}
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="flex items-center space-x-2 mb-3">
                    <File className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      {announcement.attachments.length}個の添付ファイル
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{announcement.createdBy}</span>
                  <span>{announcement.createdAt.toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新規作成フォーム */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">お知らせ作成</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="お知らせのタイトル"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  内容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="お知らせの内容"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  送付対象
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    targetType: e.target.value as 'individual' | 'group' | 'all',
                    targetIds: e.target.value === 'all' ? [] : prev.targetIds
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">全体</option>
                  <option value="group">グループ</option>
                  <option value="individual">個人</option>
                </select>
              </div>

              {/* 個人選択の場合のメンバー選択 */}
              {formData.targetType === 'individual' && (
                <MemberSelector
                  members={members}
                  selectedMemberIds={formData.targetIds}
                  onSelectionChange={(selectedIds) => setFormData(prev => ({ ...prev, targetIds: selectedIds }))}
                  title="対象メンバー選択"
                  placeholder="メンバーを検索..."
                  showSelectAll={true}
                  showSearch={true}
                />
              )}

              {/* グループ選択の場合のメンバー選択 */}
              {formData.targetType === 'group' && (
                <MemberSelector
                  members={members}
                  selectedMemberIds={formData.targetIds}
                  onSelectionChange={(selectedIds) => setFormData(prev => ({ ...prev, targetIds: selectedIds }))}
                  title="対象グループ選択"
                  placeholder="グループメンバーを検索..."
                  showSelectAll={true}
                  showSearch={true}
                />
              )}

              {/* タグ選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  タグ
                </label>
                <TagSelector
                  tags={tags}
                  selectedTagIds={formData.tagIds}
                  onSelectionChange={(selectedIds) => setFormData(prev => ({ ...prev, tagIds: selectedIds }))}
                  onTagsChange={setTags}
                  title="タグを選択"
                  placeholder="タグを検索..."
                  allowCreate={true}
                  allowEdit={true}
                  showSelectAll={false}
                  showSearch={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  添付ファイル
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {formData.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    添付ファイル一覧
                  </label>
                  <div className="space-y-2">
                    {formData.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                        <span className="text-sm text-slate-300">{attachment.name}</span>
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter(a => a.id !== attachment.id)
                          }))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleCreateAnnouncement}
                disabled={!formData.title || !formData.content}
              >
                送信
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}

      {/* 詳細表示モーダル */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedAnnouncement.title}</h2>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getTargetTypeIcon(selectedAnnouncement.targetType)}
                <span className="text-sm text-slate-400">
                  {getTargetTypeLabel(selectedAnnouncement.targetType)}
                </span>
              </div>
              
              {/* タグ表示 */}
              {selectedAnnouncement.tagIds && selectedAnnouncement.tagIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getAnnouncementTags(selectedAnnouncement.tagIds).map(tag => (
                    <span
                      key={tag.id}
                      className={`inline-flex items-center gap-1 ${tag.color} text-white px-3 py-1 rounded-full text-sm`}
                    >
                      <span>{tag.name}</span>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-300 whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>

              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">添付ファイル</h3>
                  <div className="space-y-2">
                    {selectedAnnouncement.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center space-x-2 bg-slate-700 p-2 rounded">
                        <File className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{attachment.name}</span>
                        <span className="text-xs text-slate-400">
                          ({(attachment.size / 1024).toFixed(1)}KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-600">
                <span>{selectedAnnouncement.createdBy}</span>
                <span>{selectedAnnouncement.createdAt.toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 