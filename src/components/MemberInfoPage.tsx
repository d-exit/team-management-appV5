import React, { useState, useCallback } from 'react';
import { User, Mail, Lock, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { OptimizedButton } from './common/OptimizedButton';

interface Member {
  id: string;
  name: string;
  childName: string;
  email: string;
  role: 'parent' | 'child';
  isActive: boolean;
  invitedBy?: string;
  invitedAt?: Date;
}

interface MemberInfoPageProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export const MemberInfoPage: React.FC<MemberInfoPageProps> = ({ onBack, isAdmin = false }) => {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: '田中太郎',
      childName: '田中一郎',
      email: 'tanaka@example.com',
      role: 'parent',
      isActive: true,
    },
    {
      id: '2',
      name: '佐藤花子',
      childName: '佐藤次郎',
      email: 'sato@example.com',
      role: 'parent',
      isActive: true,
    },
    {
      id: '3',
      name: '鈴木三郎',
      childName: '鈴木三郎',
      email: 'suzuki@example.com',
      role: 'child',
      isActive: true,
    },
  ]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [inviteForm, setInviteForm] = useState({
    name: '',
    childName: '',
    email: '',
    role: 'parent' as 'parent' | 'child',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    childName: '',
    email: '',
    role: 'parent' as 'parent' | 'child',
  });

  const handleInviteMember = useCallback(() => {
    if (!inviteForm.name || !inviteForm.email) return;

    const newMember: Member = {
      id: `member-${Date.now()}`,
      name: inviteForm.name,
      childName: inviteForm.childName,
      email: inviteForm.email,
      role: inviteForm.role,
      isActive: false,
      invitedBy: '現在のユーザー',
      invitedAt: new Date(),
    };

    setMembers(prev => [...prev, newMember]);
    setInviteForm({
      name: '',
      childName: '',
      email: '',
      role: 'parent',
    });
    setShowInviteForm(false);
  }, [inviteForm]);

  const handleEditMember = useCallback(() => {
    if (!editingMember || !editForm.name || !editForm.email) return;

    setMembers(prev =>
      prev.map(member =>
        member.id === editingMember.id
          ? {
              ...member,
              name: editForm.name,
              childName: editForm.childName,
              email: editForm.email,
              role: editForm.role,
            }
          : member
      )
    );

    setEditForm({
      name: '',
      childName: '',
      email: '',
      role: 'parent',
    });
    setEditingMember(null);
    setShowEditForm(false);
  }, [editingMember, editForm]);

  const handleDeleteMember = useCallback((memberId: string) => {
    if (window.confirm('このメンバーを削除しますか？')) {
      setMembers(prev => prev.filter(member => member.id !== memberId));
    }
  }, []);

  const handleToggleActive = useCallback((memberId: string) => {
    setMembers(prev =>
      prev.map(member =>
        member.id === memberId
          ? { ...member, isActive: !member.isActive }
          : member
      )
    );
  }, []);

  const startEdit = useCallback((member: Member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      childName: member.childName,
      email: member.email,
      role: member.role,
    });
    setShowEditForm(true);
  }, []);

  const filteredMembers = members.filter(member => {
    if (filter === 'active') return member.isActive;
    if (filter === 'inactive') return !member.isActive;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-white">会員情報</h1>
        </div>
        {isAdmin && (
          <OptimizedButton
            onClick={() => setShowInviteForm(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            招待
          </OptimizedButton>
        )}
      </div>

      {/* フィルター */}
      <div className="flex space-x-2 mb-6">
        <OptimizedButton
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          すべて
        </OptimizedButton>
        <OptimizedButton
          variant={filter === 'active' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          アクティブ
        </OptimizedButton>
        <OptimizedButton
          variant={filter === 'inactive' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('inactive')}
        >
          非アクティブ
        </OptimizedButton>
      </div>

      {/* メンバー一覧 */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700 text-sm font-medium text-slate-300">
          <div className="col-span-3">氏名</div>
          <div className="col-span-3">子どもの氏名</div>
          <div className="col-span-3">メールアドレス</div>
          <div className="col-span-1">役割</div>
          <div className="col-span-1">状態</div>
          {isAdmin && <div className="col-span-1">操作</div>}
        </div>

        <div className="divide-y divide-slate-700">
          {filteredMembers.map(member => (
            <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-white">{member.name}</span>
                </div>
              </div>
              <div className="col-span-3 text-slate-300">{member.childName}</div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{member.email}</span>
                </div>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  member.role === 'parent' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {member.role === 'parent' ? '保護者' : '子ども'}
                </span>
              </div>
              <div className="col-span-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  member.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}>
                  {member.isActive ? 'アクティブ' : '招待中'}
                </span>
              </div>
              {isAdmin && (
                <div className="col-span-1 flex space-x-2">
                  <button
                    onClick={() => startEdit(member)}
                    className="p-1 text-sky-400 hover:text-sky-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(member.id)}
                    className="p-1 text-yellow-400 hover:text-yellow-300"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 招待フォーム */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">メンバー招待</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  氏名
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="氏名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  子どもの氏名
                </label>
                <input
                  type="text"
                  value={inviteForm.childName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, childName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="子どもの氏名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="メールアドレスを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  役割
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ 
                    ...prev, 
                    role: e.target.value as 'parent' | 'child' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="parent">保護者</option>
                  <option value="child">子ども</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowInviteForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleInviteMember}
                disabled={!inviteForm.name || !inviteForm.email}
              >
                招待送信
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}

      {/* 編集フォーム */}
      {showEditForm && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">メンバー編集</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  氏名
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="氏名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  子どもの氏名
                </label>
                <input
                  type="text"
                  value={editForm.childName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, childName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="子どもの氏名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="メールアドレスを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  役割
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    role: e.target.value as 'parent' | 'child' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="parent">保護者</option>
                  <option value="child">子ども</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowEditForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleEditMember}
                disabled={!editForm.name || !editForm.email}
              >
                保存
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 