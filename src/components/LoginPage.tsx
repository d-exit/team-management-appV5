import React, { useState } from 'react';
import { mockUserAccounts } from '@/data/mockData';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // モックデータからユーザーを検索
      const userAccount = mockUserAccounts.find(account => 
        account.email === email && account.password === password
      );
      
      if (userAccount) {
        await onLogin(email, password);
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    } catch (error) {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">チーム管理システム</h1>
          <p className="text-slate-400">ログインしてチーム管理を開始</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 mb-2 font-medium">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition-colors"
              required
              placeholder="example@teamapp.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition-colors"
              required
              placeholder="パスワード"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 mb-4">アカウントをお持ちでない方は</p>
          <button
            onClick={onNavigateToSignup}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            アカウント作成はこちら
          </button>
        </div>

        {/* テスト用アカウント情報 */}
        <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-3">テスト用アカウント</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div>
              <strong>管理者:</strong> admin@teamapp.com / admin123
            </div>
            <div>
              <strong>編集者:</strong> editor@teamapp.com / editor123
            </div>
            <div>
              <strong>メンバー:</strong> member1@teamapp.com / member123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 