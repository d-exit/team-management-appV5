import React, { useState } from 'react';

interface AccountOnboardingProps {
  onCreateAccount: (email: string, password: string, name: string) => void;
  onLogin: (email: string, password: string) => void;
}

const AccountOnboarding: React.FC<AccountOnboardingProps> = ({ onCreateAccount, onLogin }) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      onCreateAccount(email, password, name);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6 gap-4">
          <button
            className={`py-2 px-6 rounded-lg font-bold text-white transition ${mode === 'signup' ? 'bg-sky-500' : 'bg-slate-700 hover:bg-sky-600'}`}
            onClick={() => setMode('signup')}
          >
            アカウント作成
          </button>
          <button
            className={`py-2 px-6 rounded-lg font-bold text-white transition ${mode === 'login' ? 'bg-sky-500' : 'bg-slate-700 hover:bg-sky-600'}`}
            onClick={() => setMode('login')}
          >
            ログイン
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 mb-1">名前</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600"
                required
                placeholder="お名前"
              />
            </div>
          )}
          <div>
            <label className="block text-slate-300 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600"
              required
              placeholder="メールアドレス"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-slate-700 text-white border border-slate-600"
              required
              placeholder="パスワード"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg mt-4"
          >
            {mode === 'signup' ? 'アカウント作成' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountOnboarding;
