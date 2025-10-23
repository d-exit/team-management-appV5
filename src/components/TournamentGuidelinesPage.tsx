import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Award, CreditCard, Phone, Mail, Download, Eye, Save, Edit } from 'lucide-react';

interface GuidelineField {
  id: string;
  title: string;
  value: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'time';
  options?: string[];
  required?: boolean;
  category: 'basic' | 'venue' | 'rules' | 'awards' | 'payment' | 'contact' | 'custom';
}

interface TournamentGuidelinesPageProps {
  onBack: () => void;
}

export const TournamentGuidelinesPage: React.FC<TournamentGuidelinesPageProps> = ({ onBack }) => {
  const [guidelines, setGuidelines] = useState<GuidelineField[]>([
    // 基本情報
    { id: 'tournament_name', title: '試合・大会名', value: '', type: 'text', required: true, category: 'basic' },
    { id: 'organizer_name', title: '主催団体名', value: '', type: 'text', required: true, category: 'basic' },
    { id: 'organizer_person', title: '主催担当者名', value: '', type: 'text', required: true, category: 'basic' },
    { id: 'participating_teams', title: '参加チーム', value: '', type: 'textarea', required: true, category: 'basic' },
    
    // 会場情報
    { id: 'venue_name', title: '施設名', value: '', type: 'text', required: true, category: 'venue' },
    { id: 'venue_address', title: '住所', value: '', type: 'textarea', required: true, category: 'venue' },
    { id: 'court_size', title: 'コートサイズ', value: '', type: 'text', category: 'venue' },
    { id: 'court_count', title: 'コート面数', value: '', type: 'number', category: 'venue' },
    
    // 開催情報
    { id: 'event_date', title: '開催日', value: '', type: 'date', required: true, category: 'basic' },
    { id: 'start_time', title: '開始時刻', value: '', type: 'time', required: true, category: 'basic' },
    { id: 'end_time', title: '終了時刻', value: '', type: 'time', required: true, category: 'basic' },
    { id: 'entry_time', title: '入場・受付時刻', value: '', type: 'time', category: 'basic' },
    { id: 'match_duration', title: '試合時間', value: '', type: 'text', category: 'rules' },
    { id: 'halftime', title: 'ハーフタイム', value: '', type: 'text', category: 'rules' },
    { id: 'break_time', title: '休憩時間', value: '', type: 'text', category: 'rules' },
    { id: 'cooling_break', title: '飲水タイム（クーリングブレイク）', value: '', type: 'text', category: 'rules' },
    
    // 参加資格
    { id: 'eligibility_grade', title: '参加資格（学年）', value: '', type: 'text', category: 'rules' },
    { id: 'age_limit', title: '年齢制限', value: '', type: 'text', category: 'rules' },
    
    // 競技規則
    { id: 'referee_format', title: '審判形式', value: '', type: 'text', category: 'rules' },
    { id: 'ball_type', title: '使用ボール', value: '', type: 'text', category: 'rules' },
    { id: 'competition_rules', title: '競技規則', value: '', type: 'textarea', category: 'rules' },
    { id: 'players_per_team', title: '試合人数', value: '', type: 'text', category: 'rules' },
    { id: 'goal_specs', title: 'ゴール規格', value: '', type: 'text', category: 'rules' },
    
    // 式典情報
    { id: 'opening_ceremony', title: '開会式情報', value: '', type: 'textarea', category: 'basic' },
    { id: 'closing_ceremony', title: '閉会式情報', value: '', type: 'textarea', category: 'basic' },
    
    // 勝ち点・順位
    { id: 'point_system', title: '勝ち点ルール', value: '', type: 'textarea', category: 'rules' },
    { id: 'ranking_method', title: '順位決定方法', value: '', type: 'textarea', category: 'rules' },
    { id: 'league_format', title: 'リーグ方式詳細', value: '', type: 'textarea', category: 'rules' },
    
    // 賞品
    { id: 'first_prize', title: '優勝賞品', value: '', type: 'textarea', category: 'awards' },
    { id: 'second_prize', title: '準優勝賞品', value: '', type: 'textarea', category: 'awards' },
    { id: 'third_prize', title: '３位賞品', value: '', type: 'textarea', category: 'awards' },
    { id: 'individual_awards', title: '個人賞', value: '', type: 'textarea', category: 'awards' },
    
    // 参加費
    { id: 'participation_fee', title: '参加費', value: '', type: 'text', category: 'payment' },
    { id: 'payment_method', title: '支払方法', value: '', type: 'select', options: ['現金', '銀行振込', 'クレジットカード', 'その他'], category: 'payment' },
    { id: 'payment_notes', title: '支払に関する備考', value: '', type: 'textarea', category: 'payment' },
    
    // 会場情報
    { id: 'parking_info', title: '駐車場情報', value: '', type: 'textarea', category: 'venue' },
    { id: 'spectator_area', title: '観戦エリア情報', value: '', type: 'textarea', category: 'venue' },
    
    // キャンセル規定
    { id: 'cancellation_policy', title: 'キャンセル規定', value: '', type: 'textarea', category: 'rules' },
    
    // 緊急連絡先
    { id: 'emergency_contact', title: '緊急連絡先担当者', value: '', type: 'text', required: true, category: 'contact' },
    { id: 'emergency_phone', title: '緊急連絡先電話番号', value: '', type: 'text', required: true, category: 'contact' },
  ]);

  const [status, setStatus] = useState<'preparing' | 'completed'>('preparing');
  const [showPreview, setShowPreview] = useState(false);
  const [customFields, setCustomFields] = useState<GuidelineField[]>([]);

  const categories = {
    basic: { label: '基本情報', icon: Calendar, color: 'bg-blue-500' },
    venue: { label: '会場情報', icon: MapPin, color: 'bg-green-500' },
    rules: { label: '競技規則', icon: Users, color: 'bg-yellow-500' },
    awards: { label: '賞品', icon: Award, color: 'bg-purple-500' },
    payment: { label: '支払い', icon: CreditCard, color: 'bg-red-500' },
    contact: { label: '連絡先', icon: Phone, color: 'bg-indigo-500' },
    custom: { label: 'カスタム', icon: Edit, color: 'bg-gray-500' },
  };

  const handleFieldChange = (id: string, value: string) => {
    setGuidelines(prev => prev.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };

  const addCustomField = () => {
    const newField: GuidelineField = {
      id: `custom_${Date.now()}`,
      title: '',
      value: '',
      type: 'text',
      category: 'custom',
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<GuidelineField>) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleSave = () => {
    setStatus('completed');
    alert('要項が保存されました。ステータスが「準備完了」に変更されました。');
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownload = () => {
    // PDFダウンロード機能（実装予定）
    alert('PDFダウンロード機能は実装予定です。');
  };

  const handleShare = () => {
    // 共有機能（実装予定）
    alert('共有機能は実装予定です。');
  };

  const renderField = (field: GuidelineField) => {
    const baseClasses = "w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`${baseClasses} min-h-[100px]`}
            placeholder={`${field.title}を入力`}
          />
        );
      case 'select':
        return (
          <select
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
          >
            <option value="">選択してください</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
            placeholder={`${field.title}を入力`}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
          />
        );
      case 'time':
        return (
          <input
            type="time"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
            placeholder={`${field.title}を入力`}
          />
        );
    }
  };

  const groupedFields = Object.entries(categories).map(([key, category]) => ({
    ...category,
    key,
    fields: [...guidelines.filter(f => f.category === key), ...customFields.filter(f => f.category === key)]
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">要項作成</h1>
            <p className="text-slate-400">試合・大会の詳細要項を作成できます</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              PDFプレビュー
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              ダウンロード
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4" />
              共有
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              保存
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              戻る
            </button>
          </div>
        </div>

        {/* ステータス表示 */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            <span className="font-medium">
              {status === 'completed' ? '準備完了' : '準備中'}
            </span>
          </div>
        </div>

        {/* フォーム */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {groupedFields.map(({ key, label, icon: Icon, color, fields }) => (
              <div key={key} className="bg-slate-800 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-sky-400">{label}</h2>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {field.title}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                {key === 'custom' && (
                  <button
                    onClick={addCustomField}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    項目を追加
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* プレビュー */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-sky-400 mb-4">プレビュー</h3>
              <div className="bg-white text-black p-6 rounded-lg max-h-[600px] overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4 text-center">
                  {guidelines.find(f => f.id === 'tournament_name')?.value || '試合・大会名'}
                </h1>
                
                {groupedFields.map(({ key, label, fields }) => {
                  const filledFields = fields.filter(f => f.value.trim());
                  if (filledFields.length === 0) return null;
                  
                  return (
                    <div key={key} className="mb-6">
                      <h2 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-1">
                        {label}
                      </h2>
                      <div className="space-y-2">
                        {filledFields.map(field => (
                          <div key={field.id}>
                            <strong className="text-sm">{field.title}:</strong>
                            <p className="text-sm ml-2">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDFプレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">PDFプレビュー</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose max-w-none">
              {/* PDFプレビュー内容 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                  {guidelines.find(f => f.id === 'tournament_name')?.value || '試合・大会名'}
                </h1>
              </div>
              
              {groupedFields.map(({ key, label, fields }) => {
                const filledFields = fields.filter(f => f.value.trim());
                if (filledFields.length === 0) return null;
                
                return (
                  <div key={key} className="mb-8">
                    <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2">
                      {label}
                    </h2>
                    <div className="space-y-3">
                      {filledFields.map(field => (
                        <div key={field.id}>
                          <strong className="text-base">{field.title}:</strong>
                          <p className="ml-2">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
