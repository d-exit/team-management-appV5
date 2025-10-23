// components/TeamSelectionPage.tsx
// ...ver4の正しい内容をここに挿入...

// src/components/TeamSelectionPage.tsx
import React, { useState } from 'react';
import { Team } from '../types';


interface TeamSelectionPageProps {
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  onCreateTeam: (teamName: string, coachName: string) => void;
  onDeleteTeam: (teamId: string) => void;
  currentUserEmail: string; // 現在ログイン中のユーザーのメールアドレス
  onBack?: () => void;
}

const TeamSelectionPage: React.FC<TeamSelectionPageProps> = ({ teams, onSelectTeam, onCreateTeam, onDeleteTeam, currentUserEmail, onBack }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newCoachName, setNewCoachName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim() && newCoachName.trim()) {
      onCreateTeam(newTeamName.trim(), newCoachName.trim());
      setIsCreateModalOpen(false);
      setNewTeamName('');
      setNewCoachName('');
    } else {
      alert('チーム名とコーチ名は必須です。');
    }
  };


  // 管理者チーム: 管理者アカウントの場合はFCスカイウィングスのみ表示
  const userId = (window as any).currentUserId || currentUserEmail;
  let adminTeams = teams.filter(team => team.ownerId && (team.ownerId === userId || team.ownerId === currentUserEmail));
  
  // 管理者アカウントの場合はFCスカイウィングスのみ表示
  if (currentUserEmail === 'admin@teamapp.com' || currentUserEmail === 'admin2@teamapp.com') {
    const fcSkywings = teams.find(team => team.name === 'FCスカイウィングス');
    if (fcSkywings) {
      adminTeams = [fcSkywings];
    }
  }
  // 編集者チーム: staffMembersに自分のidまたはemailがありapproved=true
  let editorTeams = teams.filter(team =>
    (!team.ownerId || (team.ownerId !== userId && team.ownerId !== currentUserEmail)) &&
    Array.isArray((team as any).staffMembers) &&
    (team as any).staffMembers.some((m: any) => (m.id === userId || m.email === currentUserEmail) && m.approved)
  );
  
  // 編集者アカウントの場合はFCスカイウィングスのみ表示
  if (currentUserEmail === 'editor@teamapp.com' || currentUserEmail === 'editor2@teamapp.com' || currentUserEmail === 'editor3@teamapp.com') {
    const fcSkywings = teams.find(team => team.name === 'FCスカイウィングス');
    if (fcSkywings) {
      editorTeams = [fcSkywings];
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white p-4 sm:p-8 flex flex-col">
      <header className="mb-8 text-center relative">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400">
          チーム管理システム
        </h1>
        <p className="text-slate-400 mt-2 text-lg sm:text-xl">チームを選択してください</p>
        {onBack && (
          <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-sky-300 font-semibold py-2 px-4 rounded-lg transition text-sm">&larr; 戻る</button>
        )}
      </header>

      <main className="container mx-auto max-w-4xl flex-grow">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition"
          >
            新規チーム作成
          </button>
        </div>

        {/* 管理者チーム */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-sky-300 mb-2">管理者チーム</h2>
          {adminTeams.length > 0 ? (
            adminTeams.map(team => (
              <div key={team.id} className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex items-center justify-between flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-4">
                  <img src={team.logoUrl} alt={`${team.name} ロゴ`} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-sky-500" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-sky-400">{team.name}</h2>
                    <p className="text-sm text-slate-400">コーチ: {team.coachName}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onDeleteTeam(team.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm transition"
                  >
                    削除
                  </button>
                  <button
                    onClick={() => onSelectTeam(team.id)}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-md text-sm transition"
                  >
                    選択
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">管理者として管理しているチームはありません。</div>
          )}
        </div>

        {/* 編集者チーム */}
        <div>
          <h2 className="text-lg font-bold text-cyan-300 mb-2">編集者チーム</h2>
          {editorTeams.length > 0 ? (
            editorTeams.map(team => (
              <div key={team.id} className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex items-center justify-between flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-4">
                  <img src={team.logoUrl} alt={`${team.name} ロゴ`} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-cyan-400" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-cyan-300">{team.name}</h2>
                    <p className="text-sm text-slate-400">コーチ: {team.coachName}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onSelectTeam(team.id)}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-md text-sm transition"
                  >
                    選択
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">編集者として参加しているチームはありません。</div>
          )}
        </div>
      </main>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
            <h3 className="text-2xl font-semibold text-sky-400">新しいチームを作成</h3>
            <div>
              <label htmlFor="newTeamName" className="block text-sm font-medium text-slate-300 mb-1">チーム名</label>
              <input
                type="text"
                id="newTeamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500"
                placeholder="（例）FCスカイウィングス"
              />
            </div>
            <div>
              <label htmlFor="newCoachName" className="block text-sm font-medium text-slate-300 mb-1">コーチ名</label>
              <input
                type="text"
                id="newCoachName"
                value={newCoachName}
                onChange={(e) => setNewCoachName(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500"
                placeholder="（例）山田 太郎"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="text-center mt-10 py-5 border-t border-slate-700">
        <p className="text-slate-500 text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} チーム管理システム. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default TeamSelectionPage;
