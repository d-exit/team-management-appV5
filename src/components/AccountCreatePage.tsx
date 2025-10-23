import React, { useState } from 'react';

interface AccountCreatePageProps {
  onAccountCreated: (user: { id: string; name: string; email: string }) => void;
}

const AccountCreatePage: React.FC<AccountCreatePageProps> = ({ onAccountCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('全ての項目を入力してください');
      return;
    }
    // 仮のユーザーID生成
    const user = { id: 'user-' + Date.now(), name, email };
    onAccountCreated(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-sky-300 mb-4 text-center">アカウント作成</h2>
        <div>
          <label className="block text-slate-300 mb-1">名前</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white" required />
        </div>
        <div>
          <label className="block text-slate-300 mb-1">メールアドレス</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white" required />
        </div>
        <div>
          <label className="block text-slate-300 mb-1">パスワード</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white" required />
        </div>
        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg mt-4">作成</button>
      </form>
    </div>
  );
};

export default AccountCreatePage;
