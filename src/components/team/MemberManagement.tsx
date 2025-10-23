import React, { useState } from 'react';
import { Member } from '@/types';
import { Position, POSITIONS } from '@/types/index';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { usePermission } from '@/components/common/PermissionGuard';
import { UserPlus, UserMinus, Mail, Edit, Trash2, Plus, X } from 'lucide-react';

interface MemberManagementProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (memberId: string, updates: Partial<Member>) => void;
  onRemoveMember: (memberId: string) => void;
  onInviteMember: (email: string) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onInviteMember
}) => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Partial<Member>>({});
  
  const [newMember, setNewMember] = useState({
    name: '',
    jerseyNumber: '', // 文字列として管理
    position: '',
    positions: [] as string[],
    email: ''
  });
  
  const [inviteEmail, setInviteEmail] = useState('');

  const canInvite = usePermission('member.invite');
  const canManage = usePermission('member.manage');

  // 日本語ポジション名を英語キーに変換する関数
  const getPositionKey = (position: string): Position | null => {
    const positionMap: { [key: string]: Position } = {
      'フォワード': 'FW',
      'FW': 'FW',
      'ミッドフィールダー': 'MF',
      'MF': 'MF',
      'ディフェンダー': 'DF',
      'DF': 'DF',
      'ゴールキーパー': 'GK',
      'GK': 'GK'
    };
    return positionMap[position] || null;
  };

  // ポジションの色とラベルを取得する関数
  const getPositionStyle = (position: string) => {
    const key = getPositionKey(position);
    if (key && POSITIONS[key]) {
      return {
        color: POSITIONS[key].color,
        label: POSITIONS[key].label
      };
    }
    return {
      color: 'bg-gray-500',
      label: position
    };
  };

  const handleAddMember = () => {
    const jerseyNumber = parseInt(newMember.jerseyNumber) || 0;
    if (newMember.name && jerseyNumber >= 1) {
      const memberData: Omit<Member, 'id'> = {
        name: newMember.name,
        jerseyNumber: jerseyNumber,
        position: newMember.position,
        positions: newMember.positions,
        email: newMember.email
      };
      onAddMember(memberData);
      setNewMember({ name: '', jerseyNumber: '', position: '', positions: [], email: '' });
      setIsAddingMember(false);
    }
  };

  const handleUpdateMember = () => {
    if (editingMemberId && editingMember.name) {
      onUpdateMember(editingMemberId, editingMember);
      setEditingMemberId(null);
      setEditingMember({});
    }
  };

  const handleInviteMember = () => {
    if (inviteEmail) {
      onInviteMember(inviteEmail);
      setInviteEmail('');
      setIsInviting(false);
    }
  };

  const togglePosition = (position: Position, isEditing = false) => {
    if (isEditing) {
      const currentPositions = editingMember.positions || [];
      setEditingMember(prev => ({
        ...prev,
        positions: currentPositions.includes(position)
          ? currentPositions.filter((p: string) => p !== position)
          : [...currentPositions, position]
      }));
    } else {
      setNewMember(prev => ({
        ...prev,
        positions: prev.positions.includes(position)
          ? prev.positions.filter(p => p !== position)
          : [...prev.positions, position]
      }));
    }
  };

  const startEditing = (member: Member) => {
    setEditingMemberId(member.id);
    setEditingMember({
      name: member.name,
      jerseyNumber: member.jerseyNumber,
      position: member.position,
      positions: member.positions,
      email: member.email
    });
  };

  const cancelEditing = () => {
    setEditingMemberId(null);
    setEditingMember({});
  };

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-sky-400">
          登録選手一覧 ({members.length}名)
        </h3>
        <div className="flex gap-2">
          {/* デバッグ用：権限に関係なくボタンを表示 */}
          <button
            onClick={() => setIsInviting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Mail className="h-4 w-4" />
            メール招待
          </button>
          <button
            onClick={() => setIsAddingMember(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            選手追加
          </button>
        </div>
      </div>

      {/* 選手一覧 */}
      <div className="space-y-3">
        {members.length > 0 ? (
          members.map((member) => (
            <div key={member.id} className="bg-slate-700 rounded-lg p-3">
              {editingMemberId === member.id ? (
                // 編集モード
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">氏名</label>
                      <input
                        type="text"
                        value={editingMember.name || ''}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">背番号</label>
                      <input
                        type="number"
                        value={editingMember.jerseyNumber || 0}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, jerseyNumber: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">ポジション</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(POSITIONS).map(([key, position]) => (
                        <button
                          key={key}
                          onClick={() => togglePosition(key as Position, true)}
                          className={`p-3 rounded-lg border transition-colors font-medium ${
                            (editingMember.positions || []).includes(key)
                              ? `${position.color} text-white`
                              : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          {position.label}
                        </button>
                      ))}
                    </div>
                                         {/* 現在選択されているポジションの表示 */}
                     {(editingMember.positions || []).length > 0 && (
                       <div className="mt-2">
                         <label className="block text-sm font-medium text-slate-300 mb-2">選択中のポジション</label>
                         <div className="flex gap-1">
                           {(editingMember.positions || []).map((position) => {
                             const style = getPositionStyle(position);
                             return (
                               <span
                                 key={position}
                                 className={`px-2 py-1 text-xs rounded-full text-white font-medium ${style.color}`}
                               >
                                 {style.label}
                               </span>
                             );
                           })}
                         </div>
                       </div>
                     )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateMember}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-base">
                      {member.jerseyNumber}
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-base">
                        {member.name}
                      </h4>
                      <div className="flex gap-1 mt-1">
                        {member.positions && member.positions.length > 0 ? (
                          member.positions.map((position) => {
                            const style = getPositionStyle(position);
                            return (
                              <span
                                key={position}
                                className={`px-2 py-1 text-xs rounded-full text-white font-medium ${style.color}`}
                              >
                                {style.label}
                              </span>
                            );
                          })
                        ) : member.position ? (
                          (() => {
                            const style = getPositionStyle(member.position);
                            return (
                              <span
                                className={`px-2 py-1 text-xs rounded-full text-white font-medium ${style.color}`}
                              >
                                {style.label}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-slate-400 text-xs">ポジション未設定</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* デバッグ用：権限に関係なくボタンを表示 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(member)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-4">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <p className="text-lg">まだ選手が登録されていません</p>
              <p className="text-sm mt-2">選手追加ボタンから選手を登録してください</p>
            </div>
            {/* デバッグ用：権限に関係なくボタンを表示 */}
            <button
              onClick={() => setIsAddingMember(true)}
              className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors mx-auto"
            >
              <Plus className="h-5 w-5" />
              最初の選手を追加
            </button>
          </div>
        )}
      </div>

      {/* 選手追加モーダル */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">選手追加</h3>
              <button
                onClick={() => setIsAddingMember(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">氏名</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="選手の氏名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">背番号</label>
                <input
                  type="number"
                  value={newMember.jerseyNumber}
                  onChange={(e) => setNewMember(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="背番号を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">ポジション</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(POSITIONS).map(([key, position]) => (
                    <button
                      key={key}
                      onClick={() => togglePosition(key as Position)}
                      className={`p-3 rounded-lg border transition-colors font-medium ${
                        newMember.positions.includes(key)
                          ? `${position.color} text-white`
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {position.label}
                    </button>
                  ))}
                </div>
                                 {/* 現在選択されているポジションの表示 */}
                 {newMember.positions.length > 0 && (
                   <div className="mt-2">
                     <label className="block text-sm font-medium text-slate-300 mb-2">選択中のポジション</label>
                     <div className="flex gap-1">
                       {newMember.positions.map((position) => {
                         const style = getPositionStyle(position);
                         return (
                           <span
                             key={position}
                             className={`px-2 py-1 text-xs rounded-full text-white font-medium ${style.color}`}
                           >
                             {style.label}
                           </span>
                         );
                       })}
                     </div>
                   </div>
                 )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">メールアドレス（任意）</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="example@email.com"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddMember}
                className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newMember.name || parseInt(newMember.jerseyNumber) < 1}
              >
                追加
              </button>
              <button
                onClick={() => setIsAddingMember(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メール招待モーダル */}
      {isInviting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">メンバー招待</h3>
              <button
                onClick={() => setIsInviting(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
                <p className="text-sm text-blue-300">
                  招待メールが送信され、相手が承認するとチームに参加できます。
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleInviteMember}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                disabled={!inviteEmail}
              >
                招待送信
              </button>
              <button
                onClick={() => setIsInviting(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
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