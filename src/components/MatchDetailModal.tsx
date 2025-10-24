import React from 'react';
import { X, Calendar, MapPin, Users, Clock, Award, User, Phone, Mail } from 'lucide-react';

interface MatchmakingMatch {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  hostTeamId: string;
  hostTeamName: string;
  hostTeamLevel: string;
  matchType: 'training' | 'league' | 'tournament';
  courtCount: number;
  matchDuration: number;
  breakTime: number;
  description?: string;
  isRecruiting: boolean;
}

interface MatchDetailModalProps {
  match: MatchmakingMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (match: MatchmakingMatch) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, isOpen, onClose, onApply }) => {
  if (!isOpen || !match) return null;

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'training': return '練習試合';
      case 'league': return 'リーグ戦';
      case 'tournament': return 'トーナメント';
      default: return type;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return level;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-2xl border border-slate-600 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{match.name}</h2>
              <p className="text-slate-400">{match.hostTeamName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 募集中バッジ */}
        <div className="mb-6">
          <span className="bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            募集中
          </span>
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">開催日時</p>
                <p className="text-white font-medium">{match.date} {match.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">会場</p>
                <p className="text-white font-medium">{match.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">試合種別</p>
                <p className="text-white font-medium">{getMatchTypeLabel(match.matchType)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">主催チームレベル</p>
                <p className="text-white font-medium">{getLevelLabel(match.hostTeamLevel)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">試合時間</p>
                <p className="text-white font-medium">{match.matchDuration}分</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">コート数</p>
                <p className="text-white font-medium">{match.courtCount}コート</p>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">試合詳細</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">休憩時間:</span>
              <span className="text-white ml-2">{match.breakTime}分</span>
            </div>
            <div>
              <span className="text-slate-400">主催チーム:</span>
              <span className="text-white ml-2">{match.hostTeamName}</span>
            </div>
          </div>
        </div>

        {/* 説明 */}
        {match.description && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">試合説明</h3>
            <p className="text-slate-300 leading-relaxed">{match.description}</p>
          </div>
        )}

        {/* 主催チーム情報 */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">主催チーム情報</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <p className="text-white font-medium">{match.hostTeamName}</p>
              <p className="text-slate-400 text-sm">{getLevelLabel(match.hostTeamLevel)}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">連絡先: 090-1234-5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">メール: contact@{match.hostTeamName.toLowerCase().replace(/\s+/g, '')}.com</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={() => onApply(match)}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Users className="h-5 w-5" />
            この試合に応募する
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
