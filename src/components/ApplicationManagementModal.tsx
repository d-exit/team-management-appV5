import React, { useState } from 'react';
import { X, Users, MapPin, Award, Calendar, MessageSquare, CheckCircle, XCircle, User, Phone, Mail } from 'lucide-react';
import { MatchApplication, Team } from '../types';

interface ApplicationManagementModalProps {
  matchId: string;
  matchName: string;
  applications: MatchApplication[];
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onAcceptApplication: (applicationId: string) => void;
  onDeclineApplication: (applicationId: string, message: string) => void;
}

export const ApplicationManagementModal: React.FC<ApplicationManagementModalProps> = ({
  matchId,
  matchName,
  applications,
  teams,
  isOpen,
  onClose,
  onAcceptApplication,
  onDeclineApplication
}) => {
  const [selectedApplication, setSelectedApplication] = useState<MatchApplication | null>(null);
  const [declineMessage, setDeclineMessage] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  if (!isOpen) return null;

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const declinedApplications = applications.filter(app => app.status === 'declined');

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return level;
    }
  };

  const handleAccept = (applicationId: string) => {
    onAcceptApplication(applicationId);
    setSelectedApplication(null);
  };

  const handleDecline = () => {
    if (selectedApplication) {
      onDeclineApplication(selectedApplication.id, declineMessage);
      setSelectedApplication(null);
      setDeclineMessage('');
      setShowDeclineForm(false);
    }
  };

  const getTeamInfo = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-4xl border border-slate-600 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{matchName}</h2>
            <p className="text-slate-400">応募管理</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 応募一覧 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sky-400 mb-4">応募一覧</h3>
            
            {/* 保留中の応募 */}
            {pendingApplications.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-yellow-400 mb-3">保留中 ({pendingApplications.length})</h4>
                <div className="space-y-3">
                  {pendingApplications.map(application => (
                    <div
                      key={application.id}
                      onClick={() => setSelectedApplication(application)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedApplication?.id === application.id
                          ? 'border-sky-500 bg-sky-900/20'
                          : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-white">{application.applicantTeamName}</h5>
                          <p className="text-sm text-slate-400">{getLevelLabel(application.applicantTeamLevel)}</p>
                          <p className="text-sm text-slate-400">{application.applicantTeamPrefecture}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-500 text-slate-900 text-xs font-bold rounded-full">
                          保留中
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 承諾済みの応募 */}
            {acceptedApplications.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-green-400 mb-3">承諾済み ({acceptedApplications.length})</h4>
                <div className="space-y-3">
                  {acceptedApplications.map(application => (
                    <div
                      key={application.id}
                      className="p-4 rounded-lg border border-green-500 bg-green-900/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-white">{application.applicantTeamName}</h5>
                          <p className="text-sm text-slate-400">{getLevelLabel(application.applicantTeamLevel)}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          承諾済み
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 辞退済みの応募 */}
            {declinedApplications.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-red-400 mb-3">辞退済み ({declinedApplications.length})</h4>
                <div className="space-y-3">
                  {declinedApplications.map(application => (
                    <div
                      key={application.id}
                      className="p-4 rounded-lg border border-red-500 bg-red-900/20"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-white">{application.applicantTeamName}</h5>
                          <p className="text-sm text-slate-400">{getLevelLabel(application.applicantTeamLevel)}</p>
                        </div>
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          辞退済み
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">まだ応募がありません</p>
              </div>
            )}
          </div>

          {/* 応募詳細 */}
          <div className="space-y-4">
            {selectedApplication ? (
              <>
                <h3 className="text-lg font-semibold text-sky-400 mb-4">応募詳細</h3>
                
                {/* チーム基本情報 */}
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{selectedApplication.applicantTeamName}</h4>
                      <p className="text-slate-400">{getLevelLabel(selectedApplication.applicantTeamLevel)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{selectedApplication.applicantTeamPrefecture}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">レーティング: {selectedApplication.applicantTeamRating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">メンバー数: {selectedApplication.applicantTeamMemberCount}名</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">応募日: {selectedApplication.applicationDate}</span>
                    </div>
                  </div>

                  {selectedApplication.applicantTeamDescription && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-slate-300 mb-2">チーム紹介</h5>
                      <p className="text-sm text-slate-400 leading-relaxed">{selectedApplication.applicantTeamDescription}</p>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                {selectedApplication.status === 'pending' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAccept(selectedApplication.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      マッチング成立
                    </button>
                    
                    <button
                      onClick={() => setShowDeclineForm(true)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      お断り
                    </button>
                  </div>
                )}

                {/* お断りフォーム */}
                {showDeclineForm && (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-slate-300 mb-3">お断りメッセージ</h5>
                    <textarea
                      value={declineMessage}
                      onChange={(e) => setDeclineMessage(e.target.value)}
                      placeholder="お断りの理由を入力してください（任意）"
                      className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleDecline}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        送信
                      </button>
                      <button
                        onClick={() => {
                          setShowDeclineForm(false);
                          setDeclineMessage('');
                        }}
                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">応募を選択してください</h3>
                <p className="text-slate-400">左側の応募一覧から詳細を確認したい応募をクリックしてください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
