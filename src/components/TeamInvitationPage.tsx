import React from 'react';

interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  invitedUserId: string;
  invitedUserEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

interface TeamInvitationPageProps {
  invitations: TeamInvitation[];
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  onBack: () => void;
}

export const TeamInvitationPage: React.FC<TeamInvitationPageProps> = ({
  invitations,
  onAccept,
  onDecline,
  onBack
}) => {
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted');
  const declinedInvitations = invitations.filter(inv => inv.status === 'declined');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-sky-400">チーム招待管理</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded-lg transition-colors"
        >
          戻る
        </button>
      </div>

      {/* 保留中の招待 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">保留中の招待</h2>
        {pendingInvitations.length === 0 ? (
          <p className="text-slate-400">保留中の招待はありません</p>
        ) : (
          <div className="space-y-4">
            {pendingInvitations.map(invitation => (
              <div key={invitation.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{invitation.teamName}</h3>
                    <p className="text-slate-400">招待者: {invitation.inviterName}</p>
                    <p className="text-slate-400 text-sm">
                      {invitation.createdAt.toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onAccept(invitation.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      承諾
                    </button>
                    <button
                      onClick={() => onDecline(invitation.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      辞退
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 承諾した招待 */}
      {acceptedInvitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">参加中のチーム</h2>
          <div className="space-y-4">
            {acceptedInvitations.map(invitation => (
              <div key={invitation.id} className="bg-slate-800 rounded-lg p-4 border border-green-600">
                <h3 className="text-lg font-medium text-white">{invitation.teamName}</h3>
                <p className="text-green-400">参加中</p>
                <p className="text-slate-400 text-sm">
                  参加日: {invitation.createdAt.toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 辞退した招待 */}
      {declinedInvitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">辞退した招待</h2>
          <div className="space-y-4">
            {declinedInvitations.map(invitation => (
              <div key={invitation.id} className="bg-slate-800 rounded-lg p-4 border border-red-600">
                <h3 className="text-lg font-medium text-white">{invitation.teamName}</h3>
                <p className="text-red-400">辞退済み</p>
                <p className="text-slate-400 text-sm">
                  辞退日: {invitation.createdAt.toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};









