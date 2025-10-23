import React from 'react';

interface SignupSelectionPageProps {
  onSelectRole: (role: 'admin' | 'editor' | 'member') => void;
  onBack: () => void;
}

const SignupSelectionPage: React.FC<SignupSelectionPageProps> = ({ onSelectRole, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">アカウント作成</h1>
          <p className="text-slate-400">あなたの役割を選択してください</p>
        </div>

        <div className="space-y-4">
          {/* チーム運営者 */}
          <div className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors cursor-pointer border-2 border-transparent hover:border-sky-500"
               onClick={() => onSelectRole('admin')}>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">チーム運営者</h3>
                <p className="text-sm text-slate-400">チームの管理者・コーチ</p>
              </div>
            </div>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• チームの作成・管理</li>
              <li>• メンバーの招待・管理</li>
              <li>• 試合・スケジュール管理</li>
              <li>• 全ての機能にアクセス</li>
            </ul>
          </div>

          {/* チームメンバー */}
          <div className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors cursor-pointer border-2 border-transparent hover:border-sky-500"
               onClick={() => onSelectRole('member')}>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">チームメンバー</h3>
                <p className="text-sm text-slate-400">チームの選手・メンバー</p>
              </div>
            </div>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• お知らせの閲覧</li>
              <li>• 出欠連絡</li>
              <li>• スケジュール確認</li>
              <li>• プロフィール管理</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-300 font-medium transition-colors"
          >
            ← ログイン画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupSelectionPage; 