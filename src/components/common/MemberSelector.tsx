import React, { useState, useCallback } from 'react';
import { Users, User, Check, X } from 'lucide-react';
import { OptimizedButton } from './OptimizedButton';

interface Member {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
}

interface MemberSelectorProps {
  members: Member[];
  selectedMemberIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  title?: string;
  placeholder?: string;
  maxSelection?: number;
  showSelectAll?: boolean;
  showSearch?: boolean;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  members,
  selectedMemberIds,
  onSelectionChange,
  title = "メンバー選択",
  placeholder = "メンバーを検索...",
  maxSelection,
  showSelectAll = true,
  showSearch = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = useCallback((memberId: string) => {
    const newSelection = selectedMemberIds.includes(memberId)
      ? selectedMemberIds.filter(id => id !== memberId)
      : [...selectedMemberIds, memberId];

    if (maxSelection && newSelection.length > maxSelection) {
      return; // 最大選択数を超える場合は何もしない
    }

    onSelectionChange(newSelection);
  }, [selectedMemberIds, onSelectionChange, maxSelection]);

  const handleSelectAll = useCallback(() => {
    const allMemberIds = filteredMembers.map(member => member.id);
    onSelectionChange(allMemberIds);
  }, [filteredMembers, onSelectionChange]);

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const selectedMembers = members.filter(member => selectedMemberIds.includes(member.id));

  return (
    <div className="relative">
      {/* 選択されたメンバー表示 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {title}
        </label>
        
        {/* 選択されたメンバーのタグ */}
        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-2 bg-sky-600 text-white px-3 py-1 rounded-full text-sm"
              >
                <span>{member.name}</span>
                <button
                  onClick={() => handleMemberToggle(member.id)}
                  className="hover:bg-sky-700 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 選択ボタン */}
        <div className="flex gap-2">
          <OptimizedButton
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
          >
            <Users className="w-4 h-4" />
            {selectedMembers.length > 0 
              ? `${selectedMembers.length}人選択中`
              : "メンバーを選択"
            }
          </OptimizedButton>

          {showSelectAll && (
            <>
              <OptimizedButton
                onClick={handleSelectAll}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                全選択
              </OptimizedButton>
              <OptimizedButton
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                クリア
              </OptimizedButton>
            </>
          )}
        </div>

        {/* 最大選択数制限の表示 */}
        {maxSelection && (
          <p className="text-xs text-slate-400 mt-1">
            {selectedMembers.length}/{maxSelection}人まで選択可能
          </p>
        )}
      </div>

      {/* ドロップダウン */}
      {showDropdown && (
        <div className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* 検索バー */}
          {showSearch && (
            <div className="p-3 border-b border-slate-600">
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {/* メンバーリスト */}
          <div className="p-2">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                メンバーが見つかりません
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => handleMemberToggle(member.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors ${
                    selectedMemberIds.includes(member.id) ? 'bg-sky-600' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {selectedMemberIds.includes(member.id) ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {member.name}
                    </div>
                    {member.email && (
                      <div className="text-sm text-slate-400 truncate">
                        {member.email}
                      </div>
                    )}
                  </div>

                  {member.role && (
                    <div className="flex-shrink-0">
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                        {member.role}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 