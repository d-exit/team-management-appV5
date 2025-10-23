import React, { useState } from 'react';

interface SignupPageProps {
  selectedRole: 'admin' | 'editor' | 'member';
  onCreateAccount: (email: string, password: string, name: string, role: 'admin' | 'editor' | 'member') => void;
  onBack: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ selectedRole, onCreateAccount, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'チーム運営者';
      case 'editor':
        return 'チーム編集者';
      case 'member':
        return 'チームメンバー';
      default:
        return 'ユーザー';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    setIsLoading(true);

    try {
      await onCreateAccount(email, password, name, selectedRole);
    } catch (error) {
      setError('アカウント作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">アカウント作成</h1>
          <p className="text-slate-400">
            {getRoleDisplayName(selectedRole)}として登録します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 mb-2 font-medium">お名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition-colors"
              required
              placeholder="山田 太郎"
              disabled={isLoading}
            />
          </div>

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
              placeholder="6文字以上で入力"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 font-medium">パスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition-colors"
              required
              placeholder="パスワードを再入力"
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
            {isLoading ? '作成中...' : 'アカウント作成'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-300 font-medium transition-colors"
          >
            ← 役割選択に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 