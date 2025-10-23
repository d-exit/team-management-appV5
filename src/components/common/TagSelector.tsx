import React, { useState, useCallback, useEffect } from 'react';
import { Tag, Plus, X, Edit } from 'lucide-react';
import { OptimizedButton } from './OptimizedButton';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onTagsChange?: (tags: Tag[]) => void;
  title?: string;
  placeholder?: string;
  allowCreate?: boolean;
  allowEdit?: boolean;
  maxSelection?: number;
  showSelectAll?: boolean;
  showSearch?: boolean;
}

const TAG_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onSelectionChange,
  onTagsChange,
  title = "タグ選択",
  placeholder = "タグを検索...",
  allowCreate = true,
  allowEdit = true,
  maxSelection,
  showSelectAll = true,
  showSearch = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagToggle = useCallback((tagId: string) => {
    const newSelection = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];

    if (maxSelection && newSelection.length > maxSelection) {
      return;
    }

    onSelectionChange(newSelection);
  }, [selectedTagIds, onSelectionChange, maxSelection]);

  const handleSelectAll = useCallback(() => {
    const allTagIds = filteredTags.map(tag => tag.id);
    onSelectionChange(allTagIds);
  }, [filteredTags, onSelectionChange]);

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleCreateTag = useCallback(() => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: selectedColor,
      createdAt: new Date(),
    };

    const updatedTags = [...tags, newTag];
    onTagsChange?.(updatedTags);
    setNewTagName('');
    setSelectedColor(TAG_COLORS[0]);
    setShowCreateForm(false);
  }, [newTagName, selectedColor, tags, onTagsChange]);

  const handleEditTag = useCallback(() => {
    if (!editingTag || !newTagName.trim()) return;

    const updatedTags = tags.map(tag =>
      tag.id === editingTag.id
        ? { ...tag, name: newTagName.trim(), color: selectedColor }
        : tag
    );

    onTagsChange?.(updatedTags);
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor(TAG_COLORS[0]);
  }, [editingTag, newTagName, selectedColor, tags, onTagsChange]);

  const handleDeleteTag = useCallback((tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    onTagsChange?.(updatedTags);
    
    // 削除されたタグが選択されていた場合は選択からも削除
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter(id => id !== tagId));
    }
  }, [tags, onTagsChange, selectedTagIds, onSelectionChange]);

  const startEditTag = useCallback((tag: Tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
    setShowCreateForm(true);
  }, []);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  return (
    <div className="relative">
      {/* 選択されたタグ表示 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {title}
        </label>
        
        {/* 選択されたタグの表示 */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map(tag => (
              <div
                key={tag.id}
                className={`flex items-center gap-2 ${tag.color} text-white px-3 py-1 rounded-full text-sm`}
              >
                <Tag className="w-3 h-3" />
                <span>{tag.name}</span>
                <button
                  onClick={() => handleTagToggle(tag.id)}
                  className="hover:bg-black hover:bg-opacity-20 rounded-full p-1"
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
            <Tag className="w-4 h-4" />
            {selectedTags.length > 0 
              ? `${selectedTags.length}個選択中`
              : "タグを選択"
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

          {allowCreate && (
            <OptimizedButton
              onClick={() => {
                setShowCreateForm(true);
                setEditingTag(null);
                setNewTagName('');
                setSelectedColor(TAG_COLORS[0]);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              新規作成
            </OptimizedButton>
          )}
        </div>

        {/* 最大選択数制限の表示 */}
        {maxSelection && (
          <p className="text-xs text-slate-400 mt-1">
            {selectedTags.length}/{maxSelection}個まで選択可能
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

          {/* タグリスト */}
          <div className="p-2">
            {filteredTags.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                タグが見つかりません
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <div className={`w-4 h-4 rounded-full ${tag.color}`} />
                    <span className={`text-sm ${selectedTagIds.includes(tag.id) ? 'text-white font-medium' : 'text-slate-300'}`}>
                      {tag.name}
                    </span>
                  </div>
                  
                  {allowEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditTag(tag)}
                        className="p-1 text-slate-400 hover:text-slate-300"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* タグ作成・編集フォーム */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingTag ? 'タグ編集' : 'タグ作成'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  タグ名
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="タグ名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  色
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${color} border-2 ${
                        selectedColor === color ? 'border-white' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTag(null);
                  setNewTagName('');
                }}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={editingTag ? handleEditTag : handleCreateTag}
                disabled={!newTagName.trim()}
              >
                {editingTag ? '更新' : '作成'}
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 