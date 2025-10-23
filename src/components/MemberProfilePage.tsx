import React, { useState, useEffect } from 'react';
import { useAuthStore, User } from '@/stores/authStore';
import { mockUserAccounts } from '@/data/mockData';
import toast from 'react-hot-toast';

interface MemberProfileFormData {
  // 登録者情報
  registrantName: string;
  
  // 子ども情報
  childName: string;
  childFurigana: string;
  childBirthDate: string;
  childGrade: string;
  
  // 連絡先情報
  email: string;
  
  // メール設定
  emailSettings: {
    announcements: boolean;
    attendance: boolean;
    payments: boolean;
    chat: boolean;
    schedule: boolean;
  };
  
  // パスワード設定
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MemberProfilePageProps {
  onBack: () => void;
}

const MemberProfilePage: React.FC<MemberProfilePageProps> = ({ onBack }) => {
  const { user, updateUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'email-settings' | 'password'>('profile');
  const [formData, setFormData] = useState<MemberProfileFormData>({
    registrantName: '',
    childName: '',
    childFurigana: '',
    childBirthDate: '',
    childGrade: '',
    email: '',
    emailSettings: {
      announcements: true,
      attendance: true,
      payments: true,
      chat: false,
      schedule: true,
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 学年を計算する関数
  const calculateGrade = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const currentYear = today.getFullYear();
    const birthYear = birth.getFullYear();
    const birthMonth = birth.getMonth() + 1;
    
    // 日本の学年計算（4月1日が学年の開始）
    let grade = currentYear - birthYear;
    if (birthMonth >= 4) {
      grade += 1;
    }
    
    if (grade < 1) return '未就学';
    if (grade > 6) return '卒業済み';
    
    return `${grade}年生`;
  };

  // 初期データの読み込み
  useEffect(() => {
    if (user) {
      // モックデータからユーザー情報を取得
      const userAccount = mockUserAccounts.find(account => account.email === user.email);
      
      setFormData({
        registrantName: userAccount?.registrantName || '',
        childName: userAccount?.childName || '',
        childFurigana: userAccount?.childFurigana || '',
        childBirthDate: userAccount?.childBirthDate || '',
        childGrade: userAccount?.childGrade || '',
        email: user.email || '',
        emailSettings: {
          announcements: userAccount?.emailSettings?.announcements ?? true,
          attendance: userAccount?.emailSettings?.attendance ?? true,
          payments: userAccount?.emailSettings?.payments ?? true,
          chat: userAccount?.emailSettings?.chat ?? false,
          schedule: userAccount?.emailSettings?.schedule ?? true,
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // 生年月日が変更されたときに学年を自動更新
  useEffect(() => {
    if (formData.childBirthDate) {
      const grade = calculateGrade(formData.childBirthDate);
      setFormData(prev => ({
        ...prev,
        childGrade: grade,
      }));
    }
  }, [formData.childBirthDate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof MemberProfileFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
      ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // モックAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ユーザー情報を更新
      if (user) {
        await updateUserProfile({
          name: formData.registrantName,
          email: formData.email,
        });
      }

      toast.success('プロフィールが更新されました');
    setIsEditing(false);
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('新しいパスワードが一致しません');
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.error('パスワードは6文字以上で入力してください');
        return;
      }

      // モックAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('パスワードが更新されました');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error('パスワードの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // フォームデータを元に戻す
    if (user) {
      const userAccount = mockUserAccounts.find(account => account.email === user.email);
      setFormData({
        registrantName: userAccount?.registrantName || '',
        childName: userAccount?.childName || '',
        childFurigana: userAccount?.childFurigana || '',
        childBirthDate: userAccount?.childBirthDate || '',
        childGrade: userAccount?.childGrade || '',
        email: user.email || '',
        emailSettings: {
          announcements: userAccount?.emailSettings?.announcements ?? true,
          attendance: userAccount?.emailSettings?.attendance ?? true,
          payments: userAccount?.emailSettings?.payments ?? true,
          chat: userAccount?.emailSettings?.chat ?? false,
          schedule: userAccount?.emailSettings?.schedule ?? true,
        },
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <p className="text-slate-400">ログインが必要です</p>
      </div>
    </div>
  );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
          className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
          >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
          </button>
        <h1 className="text-2xl font-bold text-white">メンバープロフィール</h1>
        <div className="w-20"></div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-sky-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          基本情報
        </button>
        <button
          onClick={() => setActiveTab('email-settings')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'email-settings'
              ? 'bg-sky-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          メール設定
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'password'
              ? 'bg-sky-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          パスワード
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-xl p-6">
        {/* 基本情報タブ */}
        {activeTab === 'profile' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">基本情報</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  編集
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 登録者情報 */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4">登録者情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      登録者名 *
                    </label>
                    <input
                      type="text"
                      value={formData.registrantName}
                      onChange={(e) => handleInputChange('registrantName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      メールアドレス *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 子ども情報 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">子ども情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      子ども氏名 *
                    </label>
                    <input
                      type="text"
                      value={formData.childName}
                      onChange={(e) => handleInputChange('childName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      子どもフリガナ *
                    </label>
                    <input
                      type="text"
                      value={formData.childFurigana}
                      onChange={(e) => handleInputChange('childFurigana', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                      required
                      placeholder="ヤマダ タロウ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      子ども生年月日 *
                    </label>
                    <input
                      type="date"
                      value={formData.childBirthDate}
                      onChange={(e) => handleInputChange('childBirthDate', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      子ども学年
                    </label>
                    <input
                      type="text"
                      value={formData.childGrade}
                      disabled
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white opacity-50"
                      placeholder="生年月日から自動計算"
                    />
                  </div>
                </div>
              </div>

              {/* 編集ボタン */}
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? '保存中...' : '保存'}
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {/* メール設定タブ */}
        {activeTab === 'email-settings' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">メール設定</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  編集
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">お知らせ</h4>
                    <p className="text-sm text-slate-400">チームからのお知らせ</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailSettings.announcements}
                      onChange={(e) => handleInputChange('emailSettings.announcements', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">出欠連絡</h4>
                    <p className="text-sm text-slate-400">出欠連絡の確認</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailSettings.attendance}
                      onChange={(e) => handleInputChange('emailSettings.attendance', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">活動費</h4>
                    <p className="text-sm text-slate-400">活動費の請求・支払い状況</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailSettings.payments}
                      onChange={(e) => handleInputChange('emailSettings.payments', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">チャット</h4>
                    <p className="text-sm text-slate-400">チームチャットの通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailSettings.chat}
                      onChange={(e) => handleInputChange('emailSettings.chat', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">スケジュール</h4>
                    <p className="text-sm text-slate-400">練習・試合のスケジュール</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailSettings.schedule}
                      onChange={(e) => handleInputChange('emailSettings.schedule', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>
              </div>

              {/* 編集ボタン */}
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? '保存中...' : '保存'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* パスワード設定タブ */}
        {activeTab === 'password' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">パスワード設定</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                  placeholder="6文字以上で入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                  placeholder="パスワードを再入力"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? '更新中...' : 'パスワード更新'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}; 

export default MemberProfilePage; 