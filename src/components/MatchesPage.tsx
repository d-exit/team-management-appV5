// src/components/MatchesPage.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Team, Match, MatchStatus, MatchType, View, FollowedTeam, ChatThread, ChatMessage, ParticipantStatus } from '../types';
import { generateTournamentBracket } from '../utils/bracketGenerator';
import { generateLeagueTable } from '../utils/leagueGenerator';
import { downloadTableAsPdf, downloadTableAsPdfWithPrint } from '../utils/downloadHtmlAsPdf';
import { Calendar, Clock, MapPin, Users, Trophy, FileText, MessageSquare, Mail, Save, Edit, ArrowLeft, ArrowRight, CheckCircle, Circle, Plus } from 'lucide-react';

interface MatchesPageProps {
  matches: Match[];
  teams: Team[]; 
  onUpdateMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  managedTeam: Team; 
  followedTeams: FollowedTeam[];
  chatThreads: ChatThread[];
  onAddChatThread: (newThread: ChatThread, initialMessage?: ChatMessage, shouldNavigate?: boolean) => void;
  onSendMessage: (threadId: string, message: ChatMessage) => void;
  onUpdateTeams: (updater: React.SetStateAction<Team[]>) => void;
  onEditGuideline: (matchId: string) => void;
}

// 新しい試合作成ステップ
type MatchCreationStep = 'basic' | 'details' | 'output' | 'records';

interface MatchCreationState {
  isOpen: boolean;
  currentStep: MatchCreationStep;
  matchId: string | null;
  basicInfo: {
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    opponentTeamIds: string[]; // 複数選択に対応
    location: string;
    // 自動機能の選択制
    sendInviteEmail: boolean;
    createGroupChat: boolean;
    addToSchedule: boolean;
  };
  details: {
    matchType: 'training' | 'league' | 'tournament';
    courtCount: number;
    matchDuration: number;
    hasHalfTime: boolean;
    halfTimeDuration: number;
    breakTime: number;
    trainingMatchCount?: number;
    leagueGroupCount?: number; // リーグ戦のグループ数
  };
  output: {
    createGuidelines: boolean;
    createBracket: boolean;
    mergeToPdf: boolean;
    sendToChat: boolean;
    sendToEmail: boolean;
    emailAddresses: string[];
  };
  records: {
    results: Array<{
      matchId: string;
      ourScore: number;
      opponentScore: number;
      winner: 'our' | 'opponent' | 'draw';
      goals?: Array<{
        id: string;
        scorerName: string;
        period: '前半' | '後半';
        minute?: number;
        assistName?: string;
      }>;
    }>;
    additionalTrainingMatches: number;
  };
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode; className?: string }> = ({ label, value, children, className }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-slate-400 text-sm mb-1">{label}</span>
    {children || <span className="text-white font-medium">{value || '-'}</span>}
      </div>
);

// ステップ1: 基本設定コンポーネント
const BasicInfoStep: React.FC<{
  data: MatchCreationState['basicInfo'];
  onChange: (data: MatchCreationState['basicInfo']) => void;
  teams: Team[];
  followedTeams: FollowedTeam[];
  managedTeam: Team;
  onSave: () => void;
  onNext: () => void;
  onSendInviteEmail: () => void;
  onCreateGroupChat: () => void;
  onAddToSchedule: () => void;
}> = ({ data, onChange, teams, followedTeams, managedTeam, onSave, onNext, onSendInviteEmail, onCreateGroupChat, onAddToSchedule }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleChange = (field: keyof typeof data, value: string | string[] | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const canProceed = data.name && data.date && data.startTime && data.opponentTeamIds.length > 0 && data.location;

  // 利用可能なチーム（自チームは除外）
  const availableTeams = teams.filter(team => team.id !== managedTeam.id);
  
  // 検索フィルター（チーム名のみ）
  const filteredTeams = availableTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="h-5 w-5 text-sky-500" />
        <h3 className="text-xl font-semibold">ステップ1: 試合基本設定</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">試合名 *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="例: 春季リーグ戦"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">開催日 *</label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">開始時間 *</label>
          <input
            type="time"
            value={data.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">終了時間</label>
          <input
            type="time"
            value={data.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">対戦相手 *</label>
          <div className="space-y-4">
            {/* 検索機能 */}
        <div>
          <input
            type="text"
                placeholder="チーム名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
      </div>

            {/* 選択されたチーム表示 */}
            <div className="space-y-2">
              {data.opponentTeamIds.map(teamId => {
                const team = teams.find(t => t.id === teamId);
                return team ? (
                  <div key={teamId} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
          <div>
                      <div className="font-medium text-white">{team.name}</div>
                      <div className="text-sm text-slate-400">{team.prefecture} {team.city}</div>
            </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTeamIds = data.opponentTeamIds.filter(id => id !== teamId);
                        handleChange('opponentTeamIds', newTeamIds);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      削除
                    </button>
                  </div>
                ) : null;
              })}
          </div>
          
            {/* チーム選択リスト */}
            <div className="max-h-40 overflow-y-auto border border-slate-600 rounded-lg">
              {filteredTeams
                .filter(team => !data.opponentTeamIds.includes(team.id))
                .map(team => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      const newTeamIds = [...data.opponentTeamIds, team.id];
                      console.log('Adding team to opponents:', team.name, 'New team IDs:', newTeamIds);
                      handleChange('opponentTeamIds', newTeamIds);
                    }}
                    className="w-full p-3 text-left hover:bg-slate-600 border-b border-slate-600 last:border-b-0"
                  >
                    <div className="font-medium text-white">{team.name}</div>
                    <div className="text-sm text-slate-400">{team.prefecture} {team.city}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>

          <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">会場 *</label>
            <input
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="例: 〇〇体育館"
            />
        </div>
          </div>
          
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-sky-300 mb-2">自動機能</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">試合用のグループチャットを作成</span>
            <button
              onClick={onCreateGroupChat}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
            >
              実施
            </button>
          </div>
          {data.createGroupChat && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300">対戦相手への招待メールを送信</span>
              <button
                onClick={onSendInviteEmail}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
              >
                実施
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-300">スケジュールに自動反映</span>
            <button
              onClick={onAddToSchedule}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
            >
              実施
            </button>
          </div>
          </div>
        </div>

      <div className="flex justify-between">
            <button
          onClick={onSave}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          保存
            </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          次へ
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ステップ2: 詳細設定コンポーネント
const DetailsStep: React.FC<{
  data: MatchCreationState['details'];
  onChange: (data: MatchCreationState['details']) => void;
  onSave: () => void;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ data, onChange, onSave, onNext, onPrevious }) => {
  const handleChange = (field: keyof typeof data, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="h-5 w-5 text-sky-500" />
        <h3 className="text-xl font-semibold">ステップ2: 詳細情報設定</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">試合形式 *</label>
                    <select
            value={data.matchType}
            onChange={(e) => handleChange('matchType', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="training">トレーニングマッチ</option>
            <option value="league">リーグ戦</option>
            <option value="tournament">トーナメント戦</option>
                    </select>
                  </div>

                  <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">コート数</label>
                    <input
            type="number"
            min="1"
            value={data.courtCount}
            onChange={(e) => handleChange('courtCount', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">試合時間（分）</label>
                    <input
            type="number"
            min="5"
            max="120"
            value={data.matchDuration}
            onChange={(e) => handleChange('matchDuration', parseInt(e.target.value) || 10)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">ハーフタイム</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                checked={data.hasHalfTime}
                onChange={(e) => handleChange('hasHalfTime', e.target.checked)}
                className="rounded border-slate-600 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-300">あり</span>
                  </label>
            {data.hasHalfTime && (
              <input
                type="number"
                min="1"
                max="30"
                value={data.halfTimeDuration}
                onChange={(e) => handleChange('halfTimeDuration', parseInt(e.target.value) || 5)}
                className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded text-sm"
                placeholder="分"
              />
            )}
              </div>
            </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">試合間休憩時間（分）</label>
                    <input
            type="number"
            min="0"
            max="60"
            value={data.breakTime}
            onChange={(e) => handleChange('breakTime', parseInt(e.target.value) || 5)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
                </div>

        {data.matchType === 'training' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">試合数</label>
                    <input
              type="number"
              min="1"
              max="10"
              value={data.trainingMatchCount || 1}
              onChange={(e) => handleChange('trainingMatchCount', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
              </div>
            )}

        {data.matchType === 'league' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">リーググループ数</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('leagueGroupCount', Math.max(1, (data.leagueGroupCount || 2) - 1))}
                  disabled={(data.leagueGroupCount || 2) <= 1}
                  className="w-10 h-10 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-sky-400 min-w-[3rem] text-center">
                  {data.leagueGroupCount || 2}
                </span>
                <button
                  type="button"
                  onClick={() => handleChange('leagueGroupCount', (data.leagueGroupCount || 2) + 1)}
                  className="w-10 h-10 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <div className="text-sm text-slate-400 bg-slate-800 p-3 rounded-lg">
                <p>• 各グループ内でリーグ戦を行い、上位チームが決勝トーナメントに進出</p>
                <p>• グループ数: {data.leagueGroupCount || 2}、総試合数: 約{Math.ceil((data.leagueGroupCount || 2) * 3.5)}試合</p>
              </div>
            </div>
          </div>
        )}
          </div>

      <div className="flex justify-between">
            <button
          onClick={onPrevious}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
          <ArrowLeft className="h-4 w-4" />
          戻る
            </button>
        <div className="flex gap-4">
        <button
            onClick={onSave}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
          保存
        </button>
              <button
            onClick={onNext}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
            次へ
            <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
  );
};

// 要項作成ウィザード
const GuidelinesWizard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  basicInfo: MatchCreationState['basicInfo'];
  details: MatchCreationState['details'];
  teams: Team[];
}> = ({ isOpen, onClose, basicInfo, details, teams }) => {
  const [guidelinesData, setGuidelinesData] = useState({
    // 基本情報
    eventName: basicInfo.name,
    organizerName: '',
    organizerContact: '',
    participatingTeams: basicInfo.opponentTeamIds.map(id => {
      const team = teams.find(t => t.id === id);
      return team?.name || id;
    }).join(', '),
    
    // 会場情報
    venueName: basicInfo.location,
    venueAddress: '',
    courtSize: '',
    courtCount: details.courtCount.toString(),
    
    // 開催情報
    eventDate: basicInfo.date,
    startTime: basicInfo.startTime,
    endTime: basicInfo.endTime,
    entryTime: '',
    
    // 競技情報
    matchDuration: details.matchDuration.toString(),
    halftime: details.hasHalfTime ? details.halfTimeDuration.toString() : '',
    breakTime: details.breakTime.toString(),
    coolingBreak: '',
    
    // 参加資格
    eligibility: '',
    
    // 競技規則
    refereeFormat: '',
    ballType: '',
    competitionRules: '',
    playersPerTeam: '',
    goalSpecs: '',
    
    // 式典情報
    openingCeremony: '',
    closingCeremony: '',
    
    // 勝ち点・順位
    pointSystem: '',
    rankingMethod: '',
    leagueFormat: '',
    
    // 賞品
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
    individualAwards: '',
    
    // 参加費
    participationFee: '',
    paymentMethod: '',
    paymentNotes: '',
    
    // 会場情報
    parkingInfo: '',
    spectatorArea: '',
    
    // キャンセル規定
    cancellationPolicy: '',
    
    // 緊急連絡先
    emergencyContact: '',
    emergencyPhone: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [manuallyChangedFields, setManuallyChangedFields] = useState<Set<string>>(new Set());

  // ステップ1・2の情報が変更された時に要項データを自動更新（手動変更された項目は除く）
  useEffect(() => {
    setGuidelinesData(prev => {
      const updates: any = {};
      
      // 基本情報の自動更新（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('eventName')) {
        updates.eventName = basicInfo.name;
      }
      if (!manuallyChangedFields.has('participatingTeams')) {
        updates.participatingTeams = basicInfo.opponentTeamIds.map(id => {
          const team = teams.find(t => t.id === id);
          return team?.name || id;
        }).join(', ');
      }
      
      // 会場情報の自動更新（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('venueName')) {
        updates.venueName = basicInfo.location;
      }
      if (!manuallyChangedFields.has('courtCount')) {
        updates.courtCount = details.courtCount.toString();
      }
      
      // 開催情報の自動更新（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('eventDate')) {
        updates.eventDate = basicInfo.date;
      }
      if (!manuallyChangedFields.has('startTime')) {
        updates.startTime = basicInfo.startTime;
      }
      if (!manuallyChangedFields.has('endTime')) {
        updates.endTime = basicInfo.endTime;
      }
      
      // 競技情報の自動更新（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('matchDuration')) {
        updates.matchDuration = details.matchDuration.toString();
      }
      if (!manuallyChangedFields.has('halftime')) {
        updates.halftime = details.hasHalfTime ? details.halfTimeDuration.toString() : '';
      }
      if (!manuallyChangedFields.has('breakTime')) {
        updates.breakTime = details.breakTime.toString();
      }
      
      // 試合タイプに応じた自動設定（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('leagueFormat')) {
        updates.leagueFormat = details.matchType === 'league' ? 'リーグ戦' : 
                               details.matchType === 'tournament' ? 'トーナメント戦' : '練習試合';
      }
      
      // 試合時間に応じた自動設定（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('entryTime')) {
        updates.entryTime = basicInfo.startTime ? 
          (() => {
            const [hours, minutes] = basicInfo.startTime.split(':').map(Number);
            const entryTime = new Date();
            entryTime.setHours(hours - 1, minutes, 0, 0);
            return entryTime.toTimeString().slice(0, 5);
          })() : '';
      }
      
      // コート数に応じた自動設定（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('courtSize')) {
        updates.courtSize = details.courtCount > 1 ? '複数コート' : '単一コート';
      }
      
      // 試合時間に応じた自動設定（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('playersPerTeam')) {
        updates.playersPerTeam = details.matchDuration >= 60 ? '11人制' : 
                                 details.matchDuration >= 40 ? '8人制' : '5人制';
      }
      
      // 休憩時間に応じた自動設定（手動変更されていない場合のみ）
      if (!manuallyChangedFields.has('coolingBreak')) {
        updates.coolingBreak = details.breakTime >= 10 ? 'あり' : 'なし';
      }
      
      return { ...prev, ...updates };
    });
  }, [basicInfo, details, teams, manuallyChangedFields]);

  const handleInputChange = (field: string, value: string) => {
    setGuidelinesData(prev => ({ ...prev, [field]: value }));
    // 手動で変更された項目を記録
    setManuallyChangedFields(prev => new Set(prev).add(field));
  };

  const generateHtmlContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${guidelinesData.eventName} 要項</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            @page { size: A4; margin: 15mm; }
          }
          body { 
            font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; 
            margin: 20px; 
            line-height: 1.3; 
            color: #333;
            background: white;
            font-size: 10px;
          }
          h1 { 
            color: #1e3a8a; 
            border-bottom: 2px solid #1e3a8a; 
            padding-bottom: 5px; 
            font-size: 16px;
            margin-bottom: 15px;
            margin-top: 0;
          }
          h2 { 
            color: #1e40af; 
            margin-top: 12px; 
            margin-bottom: 8px; 
            font-size: 12px;
            border-left: 3px solid #1e40af;
            padding-left: 6px;
          }
          .section { margin-bottom: 12px; }
          .item { margin-bottom: 4px; }
          .label { 
            font-weight: bold; 
            color: #374151; 
            display: inline-block;
            width: 140px;
            vertical-align: top;
            font-size: 9px;
          }
          .value { 
            margin-left: 8px; 
            display: inline-block;
            width: calc(100% - 160px);
            font-size: 9px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #1e40af;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          .print-button:hover {
            background: #1e3a8a;
          }
          .grid-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .grid-section {
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">印刷</button>
        <h1>${guidelinesData.eventName} 要項</h1>
        
        <div class="grid-container">
          <div class="grid-section">
            <div class="section">
              <h2>基本情報</h2>
              <div class="item"><span class="label">試合・大会名:</span><span class="value">${guidelinesData.eventName}</span></div>
              <div class="item"><span class="label">主催団体名:</span><span class="value">${guidelinesData.organizerName}</span></div>
              <div class="item"><span class="label">主催担当者名:</span><span class="value">${guidelinesData.organizerContact}</span></div>
              <div class="item"><span class="label">参加チーム:</span><span class="value">${guidelinesData.participatingTeams}</span></div>
            </div>
            
            <div class="section">
              <h2>会場情報</h2>
              <div class="item"><span class="label">施設名:</span><span class="value">${guidelinesData.venueName}</span></div>
              <div class="item"><span class="label">住所:</span><span class="value">${guidelinesData.venueAddress}</span></div>
              <div class="item"><span class="label">コートサイズ:</span><span class="value">${guidelinesData.courtSize}</span></div>
              <div class="item"><span class="label">コート面数:</span><span class="value">${guidelinesData.courtCount}</span></div>
            </div>
            
            <div class="section">
              <h2>開催情報</h2>
              <div class="item"><span class="label">開催日:</span><span class="value">${guidelinesData.eventDate}</span></div>
              <div class="item"><span class="label">開始時刻:</span><span class="value">${guidelinesData.startTime}</span></div>
              <div class="item"><span class="label">終了時刻:</span><span class="value">${guidelinesData.endTime}</span></div>
              <div class="item"><span class="label">入場・受付時刻:</span><span class="value">${guidelinesData.entryTime}</span></div>
            </div>
            
            <div class="section">
              <h2>競技情報</h2>
              <div class="item"><span class="label">試合時間:</span><span class="value">${guidelinesData.matchDuration}分</span></div>
              <div class="item"><span class="label">ハーフタイム:</span><span class="value">${guidelinesData.halftime ? guidelinesData.halftime + '分' : 'なし'}</span></div>
              <div class="item"><span class="label">休憩時間:</span><span class="value">${guidelinesData.breakTime}分</span></div>
              <div class="item"><span class="label">飲水タイム:</span><span class="value">${guidelinesData.coolingBreak}</span></div>
            </div>
            
            <div class="section">
              <h2>参加資格</h2>
              <div class="item"><span class="label">参加資格:</span><span class="value">${guidelinesData.eligibility}</span></div>
            </div>
            
            <div class="section">
              <h2>競技規則</h2>
              <div class="item"><span class="label">審判形式:</span><span class="value">${guidelinesData.refereeFormat}</span></div>
              <div class="item"><span class="label">使用ボール:</span><span class="value">${guidelinesData.ballType}</span></div>
              <div class="item"><span class="label">競技規則:</span><span class="value">${guidelinesData.competitionRules}</span></div>
              <div class="item"><span class="label">試合人数:</span><span class="value">${guidelinesData.playersPerTeam}</span></div>
              <div class="item"><span class="label">ゴール規格:</span><span class="value">${guidelinesData.goalSpecs}</span></div>
            </div>
          </div>
          
          <div class="grid-section">
            <div class="section">
              <h2>式典情報</h2>
              <div class="item"><span class="label">開会式・閉会式:</span><span class="value">${guidelinesData.openingCeremony} / ${guidelinesData.closingCeremony}</span></div>
            </div>
            
            <div class="section">
              <h2>勝ち点・順位</h2>
              <div class="item"><span class="label">勝ち点ルール:</span><span class="value">${guidelinesData.pointSystem}</span></div>
              <div class="item"><span class="label">順位決定方法:</span><span class="value">${guidelinesData.rankingMethod}</span></div>
              <div class="item"><span class="label">リーグ方式詳細:</span><span class="value">${guidelinesData.leagueFormat}</span></div>
            </div>
            
            <div class="section">
              <h2>賞品</h2>
              <div class="item"><span class="label">優勝賞品:</span><span class="value">${guidelinesData.firstPrize}</span></div>
              <div class="item"><span class="label">準優勝賞品:</span><span class="value">${guidelinesData.secondPrize}</span></div>
              <div class="item"><span class="label">3位賞品:</span><span class="value">${guidelinesData.thirdPrize}</span></div>
              <div class="item"><span class="label">個人賞:</span><span class="value">${guidelinesData.individualAwards}</span></div>
            </div>
            
            <div class="section">
              <h2>参加費</h2>
              <div class="item"><span class="label">参加費:</span><span class="value">${guidelinesData.participationFee}</span></div>
              <div class="item"><span class="label">支払方法:</span><span class="value">${guidelinesData.paymentMethod}</span></div>
              <div class="item"><span class="label">支払に関する備考:</span><span class="value">${guidelinesData.paymentNotes}</span></div>
            </div>
            
            <div class="section">
              <h2>会場情報</h2>
              <div class="item"><span class="label">駐車場情報:</span><span class="value">${guidelinesData.parkingInfo}</span></div>
              <div class="item"><span class="label">観戦エリア情報:</span><span class="value">${guidelinesData.spectatorArea}</span></div>
            </div>
            
            <div class="section">
              <h2>キャンセル規定</h2>
              <div class="item"><span class="label">キャンセル規定:</span><span class="value">${guidelinesData.cancellationPolicy}</span></div>
            </div>
            
            <div class="section">
              <h2>緊急連絡先</h2>
              <div class="item"><span class="label">緊急連絡先担当者:</span><span class="value">${guidelinesData.emergencyContact}</span></div>
              <div class="item"><span class="label">緊急連絡先電話番号:</span><span class="value">${guidelinesData.emergencyPhone}</span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleCreateGuidelines = () => {
    const htmlContent = generateHtmlContent();
    
    // HTMLをPDFとしてダウンロード
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guidelinesData.eventName}_要項.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('要項をPDF形式で作成しました');
    onClose();
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  if (!isOpen) return null;

        return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-lg p-6 w-full max-w-6xl border border-slate-600 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">要項作成</h2>
            <button onClick={onClose} className="text-slate-400 text-2xl">&times;</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">基本情報</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  試合・大会名
                </label>
          <input
                  type="text"
                  value={guidelinesData.eventName}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">主催団体名</label>
          <input
                  type="text"
                  value={guidelinesData.organizerName}
                  onChange={(e) => handleInputChange('organizerName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">主催担当者名</label>
          <input
                  type="text"
                  value={guidelinesData.organizerContact}
                  onChange={(e) => handleInputChange('organizerContact', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  参加チーム
                </label>
          <input
            type="text"
                  value={guidelinesData.participatingTeams}
                  onChange={(e) => handleInputChange('participatingTeams', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
            </div>

            {/* 会場情報 */}
          <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">会場情報</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  施設名
                </label>
                <input
                  type="text"
                  value={guidelinesData.venueName}
                  onChange={(e) => handleInputChange('venueName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                      </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">住所</label>
                <input
                  type="text"
                  value={guidelinesData.venueAddress}
                  onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                  </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">コートサイズ</label>
                <input
                  type="text"
                  value={guidelinesData.courtSize}
                  onChange={(e) => handleInputChange('courtSize', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  コート面数
                </label>
                <input
                  type="text"
                  value={guidelinesData.courtCount}
                  onChange={(e) => handleInputChange('courtCount', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                </div>
          </div>

            {/* 開催情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">開催情報</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  開催日
                </label>
                <input
                  type="date"
                  value={guidelinesData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                    </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  開始時刻
                </label>
                <input
                  type="time"
                  value={guidelinesData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                    </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  終了時刻
                </label>
                <input
                  type="time"
                  value={guidelinesData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                    </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  入場・受付時刻
                </label>
                <input
                  type="time"
                  value={guidelinesData.entryTime}
                  onChange={(e) => handleInputChange('entryTime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                    </div>
            </div>

            {/* 競技情報 */}
              <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">競技情報</h3>
                      <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  試合時間（分）
                </label>
                <input
                  type="number"
                  value={guidelinesData.matchDuration}
                  onChange={(e) => handleInputChange('matchDuration', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ハーフタイム（分）
                </label>
                <input
                  type="number"
                  value={guidelinesData.halftime}
                  onChange={(e) => handleInputChange('halftime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  休憩時間（分）
                </label>
                <input
                  type="number"
                  value={guidelinesData.breakTime}
                  onChange={(e) => handleInputChange('breakTime', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  飲水タイム（クーリングブレイク）
                </label>
                        <input
                          type="text"
                  value={guidelinesData.coolingBreak}
                  onChange={(e) => handleInputChange('coolingBreak', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
            </div>

            {/* 参加資格 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">参加資格</h3>
                      <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">参加資格（学年、年齢制限）</label>
                <textarea
                  value={guidelinesData.eligibility}
                  onChange={(e) => handleInputChange('eligibility', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                      </div>
                      </div>

            {/* 競技規則 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">競技規則</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">審判形式</label>
                <input
                  type="text"
                  value={guidelinesData.refereeFormat}
                  onChange={(e) => handleInputChange('refereeFormat', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                    </div>
                    <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">使用ボール</label>
                <input
                  type="text"
                  value={guidelinesData.ballType}
                  onChange={(e) => handleInputChange('ballType', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                    </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">競技規則</label>
                <textarea
                  value={guidelinesData.competitionRules}
                  onChange={(e) => handleInputChange('competitionRules', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
                  </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">試合人数</label>
                <input
                  type="text"
                  value={guidelinesData.playersPerTeam}
                  onChange={(e) => handleInputChange('playersPerTeam', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">ゴール規格</label>
                <input
                  type="text"
                  value={guidelinesData.goalSpecs}
                  onChange={(e) => handleInputChange('goalSpecs', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
            </div>
            </div>

            {/* 式典情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">式典情報</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">開会式・閉会式情報</label>
                <textarea
                  value={`開会式: ${guidelinesData.openingCeremony}\n閉会式: ${guidelinesData.closingCeremony}`}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    handleInputChange('openingCeremony', lines[0]?.replace('開会式: ', '') || '');
                    handleInputChange('closingCeremony', lines[1]?.replace('閉会式: ', '') || '');
                  }}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
          </div>

            {/* 勝ち点・順位 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">勝ち点・順位</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">勝ち点ルール</label>
                <input
                  type="text"
                  value={guidelinesData.pointSystem}
                  onChange={(e) => handleInputChange('pointSystem', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
            </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">順位決定方法</label>
                <input
                  type="text"
                  value={guidelinesData.rankingMethod}
                  onChange={(e) => handleInputChange('rankingMethod', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
            </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">リーグ方式詳細</label>
                <textarea
                  value={guidelinesData.leagueFormat}
                  onChange={(e) => handleInputChange('leagueFormat', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
          </div>
    </div>

            {/* 賞品 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">賞品</h3>
        <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">優勝賞品</label>
          <input
                  type="text"
                  value={guidelinesData.firstPrize}
                  onChange={(e) => handleInputChange('firstPrize', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
          />
        </div>
        <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">準優勝賞品</label>
          <input
                  type="text"
                  value={guidelinesData.secondPrize}
                  onChange={(e) => handleInputChange('secondPrize', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
          />
        </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">3位賞品</label>
                <input
                  type="text"
                  value={guidelinesData.thirdPrize}
                  onChange={(e) => handleInputChange('thirdPrize', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
      </div>
        <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">個人賞</label>
                <input
                  type="text"
                  value={guidelinesData.individualAwards}
                  onChange={(e) => handleInputChange('individualAwards', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
        </div>
      </div>

            {/* 参加費 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">参加費</h3>
      <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">参加費</label>
            <input
                  type="text"
                  value={guidelinesData.participationFee}
                  onChange={(e) => handleInputChange('participationFee', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">支払方法</label>
            <input
                  type="text"
                  value={guidelinesData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">支払に関する備考</label>
                <textarea
                  value={guidelinesData.paymentNotes}
                  onChange={(e) => handleInputChange('paymentNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
        </div>
      </div>

            {/* 会場情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">会場情報</h3>
        <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">駐車場情報</label>
                <textarea
                  value={guidelinesData.parkingInfo}
                  onChange={(e) => handleInputChange('parkingInfo', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">観戦エリア情報</label>
                <textarea
                  value={guidelinesData.spectatorArea}
                  onChange={(e) => handleInputChange('spectatorArea', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
            </div>

            {/* キャンセル規定 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">キャンセル規定</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">キャンセル規定</label>
                <textarea
                  value={guidelinesData.cancellationPolicy}
                  onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
            </div>

            {/* 緊急連絡先 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">緊急連絡先</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">緊急連絡先担当者</label>
          <input
                  type="text"
                  value={guidelinesData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
          />
        </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">緊急連絡先電話番号</label>
                <input
                  type="text"
                  value={guidelinesData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-600">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // 途中保存機能（ローカルストレージに保存）
                  localStorage.setItem('guidelinesDraft', JSON.stringify(guidelinesData));
                  alert('途中保存しました');
                }}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                途中保存
              </button>
              <button
                onClick={handlePreview}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                PDFプレビュー
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDFプレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">PDFプレビュー</h3>
      <div className="flex gap-2">
        <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
                  印刷
        </button>
        <button
                  onClick={handleClosePreview}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
                  閉じる
        </button>
      </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div 
                className="bg-white"
                dangerouslySetInnerHTML={{ __html: generateHtmlContent() }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 対戦表作成ウィザード
const BracketWizard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  basicInfo: MatchCreationState['basicInfo'];
  details: MatchCreationState['details'];
  teams: Team[];
  managedTeam: Team;
}> = ({ isOpen, onClose, basicInfo, details, teams, managedTeam }) => {
  const [bracketData, setBracketData] = useState({
    bracketType: details.matchType === 'league' ? 'league' : details.matchType === 'tournament' ? 'single' : 'training',
    selectedTeams: [managedTeam.id, ...basicInfo.opponentTeamIds.filter(id => id !== managedTeam.id)], // 自チームを最初に追加
    courtCount: details.courtCount,
    matchDuration: details.matchDuration,
    breakTime: details.breakTime,
    startTime: basicInfo.startTime || '10:00',
    matches: [] as Array<{
      id: string;
      team1: string;
      team2: string;
      court: number;
      startTime: string;
      order: number;
    }>,
  });

  const [editingMatch, setEditingMatch] = useState<string | null>(null);

  // propsの変更を監視してbracketDataを更新
  useEffect(() => {
    setBracketData(prev => ({
      ...prev,
      bracketType: details.matchType === 'league' ? 'league' : details.matchType === 'tournament' ? 'single' : 'training',
      selectedTeams: [managedTeam.id, ...basicInfo.opponentTeamIds.filter(id => id !== managedTeam.id)], // 自チームを最初に追加
      courtCount: details.courtCount,
      matchDuration: details.matchDuration,
      breakTime: details.breakTime,
      startTime: basicInfo.startTime || '10:00',
    }));
  }, [basicInfo, details, managedTeam.id]);

  // 自動生成された対戦表を初期化
  useEffect(() => {
    if (bracketData.selectedTeams.length > 0) {
      generateMatches();
    }
  }, [bracketData.selectedTeams, bracketData.bracketType, bracketData.courtCount, bracketData.matchDuration, bracketData.breakTime, bracketData.startTime, details.leagueGroupCount]);

  const generateMatches = () => {
    const selectedTeamNames = bracketData.selectedTeams.map(id => {
      const team = teams.find(t => t.id === id);
      return team?.name || id;
    });
    
    // 自チームを最初に表示するように並び替え
    const managedTeamName = teams.find(t => t.id === managedTeam.id)?.name || managedTeam.name;
    const sortedTeamNames = [managedTeamName, ...selectedTeamNames.filter(name => name !== managedTeamName)];

    let matches: Array<{
      id: string;
      team1: string;
      team2: string;
      court: number;
      startTime: string;
      order: number;
    }> = [];

    if (bracketData.bracketType === 'league') {
      // リーグ戦の場合、generateLeagueTableを使用
      console.log('=== BracketWizard リーグ戦生成開始 ===');
      console.log('selectedTeams:', bracketData.selectedTeams);
      console.log('courtCount:', bracketData.courtCount);
      
      const selectedTeams = bracketData.selectedTeams.map(id => teams.find(t => t.id === id)).filter(Boolean) as Team[];
      console.log('selectedTeams objects:', selectedTeams);

      const groupCount = details.leagueGroupCount || 2;
      
      const leagueTable = generateLeagueTable(
        selectedTeams,
        groupCount,
        bracketData.courtCount,
        bracketData.startTime,
        bracketData.matchDuration,
        bracketData.breakTime,
        2, // advanceTeamsPerGroup
        false, // hasFinalRound
        'tournament' // finalRoundType
      );
      
      console.log('リーグ戦生成結果:', leagueTable);
      
      if (leagueTable) {
        let matchOrder = 1;
        
        // 各グループの試合を収集
        leagueTable.groups.forEach((group, groupIndex) => {
          console.log(`グループ ${groupIndex + 1} の試合数:`, group.matches.length);
          
          group.matches.forEach(match => {
            const team1 = teams.find(t => t.id === match.team1Id);
            const team2 = teams.find(t => t.id === match.team2Id);
            
            if (team1 && team2) {
              matches.push({
                id: `match_${matchOrder}`,
                team1: team1.name,
                team2: team2.name,
                court: match.court || ((matchOrder - 1) % bracketData.courtCount) + 1,
                startTime: match.startTime || calculateStartTime(matchOrder),
                order: matchOrder,
              });
              matchOrder++;
            }
          });
        });
        
        console.log('生成された試合数:', matches.length);
        console.log('=== BracketWizard リーグ戦生成完了 ===');
      }
    } else if (bracketData.bracketType === 'single') {
      // トーナメント戦の場合、自チームを最初に表示してからランダムにペアリング
      const managedTeamName = teams.find(t => t.id === managedTeam.id)?.name || managedTeam.name;
      const otherTeams = sortedTeamNames.filter(name => name !== managedTeamName);
      const shuffledOtherTeams = [...otherTeams].sort(() => Math.random() - 0.5);
      const finalTeamOrder = [managedTeamName, ...shuffledOtherTeams];
      
      let matchOrder = 1;
      for (let i = 0; i < finalTeamOrder.length; i += 2) {
        if (i + 1 < finalTeamOrder.length) {
          matches.push({
            id: `match_${matchOrder}`,
            team1: finalTeamOrder[i],
            team2: finalTeamOrder[i + 1],
            court: ((matchOrder - 1) % bracketData.courtCount) + 1,
            startTime: calculateStartTime(matchOrder),
            order: matchOrder,
          });
          matchOrder++;
        }
      }
    } else {
      // トレーニングマッチの場合、自チームを最初に表示してから2チームずつペアリング
      let matchOrder = 1;
      for (let i = 0; i < sortedTeamNames.length; i += 2) {
        if (i + 1 < sortedTeamNames.length) {
          matches.push({
            id: `match_${matchOrder}`,
            team1: sortedTeamNames[i],
            team2: sortedTeamNames[i + 1],
            court: ((matchOrder - 1) % bracketData.courtCount) + 1,
            startTime: calculateStartTime(matchOrder),
            order: matchOrder,
          });
          matchOrder++;
        }
      }
    }

    setBracketData(prev => ({ ...prev, matches }));
  };

  const calculateStartTime = (matchOrder: number) => {
    const baseTime = new Date(`2000-01-01T${bracketData.startTime}`);
    const totalMinutes = (matchOrder - 1) * (bracketData.matchDuration + bracketData.breakTime);
    const newTime = new Date(baseTime.getTime() + totalMinutes * 60000);
    return newTime.toTimeString().slice(0, 5);
  };

  const handleMatchEdit = (matchId: string) => {
    setEditingMatch(matchId);
  };

  const handleMatchUpdate = (matchId: string, field: string, value: string | number) => {
    setBracketData(prev => ({
      ...prev, 
      matches: prev.matches.map(match =>
        match.id === matchId ? { ...match, [field]: value } : match
      )
    }));
    setEditingMatch(null);
  };

  const handleTeamSwap = (matchId: string) => {
    setBracketData(prev => ({
      ...prev,
      matches: prev.matches.map(match =>
        match.id === matchId ? { ...match, team1: match.team2, team2: match.team1 } : match
      )
    }));
  };

  const handleMatchReorder = (matchId: string, direction: 'up' | 'down') => {
    setBracketData(prev => {
      const matches = [...prev.matches];
      const currentIndex = matches.findIndex(m => m.id === matchId);
      if (direction === 'up' && currentIndex > 0) {
        [matches[currentIndex], matches[currentIndex - 1]] = [matches[currentIndex - 1], matches[currentIndex]];
      } else if (direction === 'down' && currentIndex < matches.length - 1) {
        [matches[currentIndex], matches[currentIndex + 1]] = [matches[currentIndex + 1], matches[currentIndex]];
      }
      return { ...prev, matches };
    });
  };

  const generateBracketHtml = () => {
    const isLeague = bracketData.bracketType === 'league';
    const isTournament = bracketData.bracketType === 'single';
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${basicInfo.name} 対戦表</title>
        <style>
          body {
            font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
            margin: 20px;
            background-color: white;
          }
          h1 {
            color: #1e3a8a;
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
          }
          h2 {
            color: #1e3a8a;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 14px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 5px;
          }
          .tournament-info {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .tournament-info div {
            margin-bottom: 8px;
          }
          .match-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          .match-table th,
          .match-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
          }
          .match-table th {
            background-color: #1e3a8a;
            color: white;
            font-weight: bold;
          }
          .match-table tr:nth-child(even) {
            background-color: #f0f8ff;
          }
          .court-number {
            font-weight: bold;
            color: #1e40af;
          }
          .team-name {
            font-weight: bold;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #1e40af;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          .print-button:hover {
            background: #1e3a8a;
          }
          .league-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .league-table th,
          .league-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
            font-size: 11px;
          }
          .league-table th {
            background-color: #1e3a8a;
            color: white;
            font-weight: bold;
          }
          .league-table tr:nth-child(even) {
            background-color: #f0f8ff;
          }
          .tournament-bracket {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 15px;
          }
          .round {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            background-color: #f8f9fa;
          }
          .round-title {
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 10px;
            text-align: center;
            font-size: 12px;
          }
          .match-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin: 5px 0;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .team {
            flex: 1;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
          }
          .vs {
            margin: 0 10px;
            color: #666;
            font-weight: bold;
            font-size: 10px;
          }
          .match-info {
            font-size: 9px;
            color: #666;
            text-align: right;
            min-width: 80px;
          }
          @media print {
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">印刷</button>
        <h1>${basicInfo.name} 対戦表</h1>
        
        <div class="tournament-info">
          <div><strong>試合形式:</strong> ${bracketData.bracketType === 'league' ? 'リーグ戦' : bracketData.bracketType === 'single' ? 'トーナメント戦' : 'トレーニングマッチ'}</div>
          <div><strong>コート数:</strong> ${bracketData.courtCount}面</div>
          <div><strong>試合時間:</strong> ${bracketData.matchDuration}分</div>
          <div><strong>休憩時間:</strong> ${bracketData.breakTime}分</div>
          <div><strong>開始時刻:</strong> ${bracketData.startTime}</div>
        </div>
    `;

    if (isLeague) {
      // リーグ戦の場合はグループ分けされたリーグ表を表示
      const teamNames = bracketData.selectedTeams.map(id => {
        const team = teams.find(t => t.id === id);
        return team?.name || id;
      });
      
      // 自チームを最初に表示するように並び替え
      const managedTeamName = teams.find(t => t.id === managedTeam.id)?.name || managedTeam.name;
      const sortedTeamNames = [managedTeamName, ...teamNames.filter(name => name !== managedTeamName)];
      
      const groupCount = details.leagueGroupCount || 2;
      const teamsPerGroup = Math.ceil(sortedTeamNames.length / groupCount);
      
      htmlContent += `
        <h2>リーグ戦 - ${groupCount}グループ制</h2>
        <div class="tournament-info">
          <div><strong>グループ数:</strong> ${groupCount}</div>
          <div><strong>1グループあたりのチーム数:</strong> ${teamsPerGroup}</div>
          <div><strong>総試合数:</strong> ${bracketData.matches.length}試合</div>
        </div>
      `;
      
      // 各グループのリーグ表を表示（自チームを最初のグループに配置）
      for (let group = 0; group < groupCount; group++) {
        let groupTeams: string[];
        if (group === 0) {
          // 最初のグループには自チームを必ず含める
          const firstGroupSize = Math.min(teamsPerGroup, sortedTeamNames.length);
          groupTeams = sortedTeamNames.slice(0, firstGroupSize);
        } else {
          // 残りのグループは通常の計算
          const startIdx = group * teamsPerGroup;
          const endIdx = Math.min(startIdx + teamsPerGroup, sortedTeamNames.length);
          groupTeams = sortedTeamNames.slice(startIdx, endIdx);
        }
        
        htmlContent += `
          <h3>グループ${group + 1}</h3>
          <table class="league-table">
            <thead>
              <tr>
                <th>順位</th>
                <th>チーム名</th>
                <th>試合数</th>
                <th>勝数</th>
                <th>負数</th>
                <th>勝率</th>
              </tr>
            </thead>
            <tbody>
              ${groupTeams.map((teamName, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="team-name">${teamName}</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0.000</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      
      // 対戦表を表示
      htmlContent += `
        <h2>対戦表</h2>
        <table class="match-table">
          <thead>
            <tr>
              <th>試合順</th>
              <th>コート</th>
              <th>開始時刻</th>
              <th>チーム1</th>
              <th>vs</th>
              <th>チーム2</th>
            </tr>
          </thead>
          <tbody>
            ${bracketData.matches.map(match => `
              <tr>
                <td>${match.order}</td>
                <td class="court-number">${match.court}</td>
                <td>${match.startTime}</td>
                <td class="team-name">${match.team1}</td>
                <td class="vs">vs</td>
                <td class="team-name">${match.team2}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (isTournament) {
      // トーナメント戦の場合はトーナメント表を表示
      const rounds = generateTournamentRounds();
      
      htmlContent += `
        <h2>トーナメント表</h2>
        <div class="tournament-bracket">
      `;
      
      rounds.forEach((round, roundIndex) => {
        htmlContent += `
          <div class="round">
            <div class="round-title">${round.name}</div>
        `;
        
        round.matches.forEach((match, matchIndex) => {
          htmlContent += `
            <div class="match-item">
              <div class="team">${match.team1 || '未定'}</div>
              <div class="vs">vs</div>
              <div class="team">${match.team2 || '未定'}</div>
              <div class="match-info">
                ${match.court ? `コート${match.court}` : ''}<br>
                ${match.startTime || ''}
              </div>
            </div>
          `;
        });
        
        htmlContent += `</div>`;
      });
      
      htmlContent += `</div>`;
      
      // 試合日程表も追加
      htmlContent += `
        <h2>試合日程</h2>
        <table class="match-table">
          <thead>
            <tr>
              <th>順番</th>
              <th>コート</th>
              <th>開始時刻</th>
              <th>対戦チーム</th>
            </tr>
          </thead>
          <tbody>
            ${bracketData.matches.map(match => `
              <tr>
                <td>${match.order}</td>
                <td class="court-number">${match.court}番コート</td>
                <td>${match.startTime}</td>
                <td><span class="team-name">${match.team1}</span> vs <span class="team-name">${match.team2}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      // トレーニングマッチの場合は通常の試合表を表示
      htmlContent += `
        <h2>試合日程</h2>
        <table class="match-table">
          <thead>
            <tr>
              <th>順番</th>
              <th>コート</th>
              <th>開始時刻</th>
              <th>対戦チーム</th>
            </tr>
          </thead>
          <tbody>
            ${bracketData.matches.map(match => `
              <tr>
                <td>${match.order}</td>
                <td class="court-number">${match.court}番コート</td>
                <td>${match.startTime}</td>
                <td><span class="team-name">${match.team1}</span> vs <span class="team-name">${match.team2}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  // トーナメント戦のラウンド生成
  const generateTournamentRounds = () => {
    const teamCount = bracketData.selectedTeams.length;
    const rounds = [];
    
    if (teamCount <= 2) {
      // 決勝のみ
      rounds.push({
        name: '決勝',
        matches: [{
          team1: bracketData.matches[0]?.team1 || '未定',
          team2: bracketData.matches[0]?.team2 || '未定',
          court: bracketData.matches[0]?.court,
          startTime: bracketData.matches[0]?.startTime
        }]
      });
    } else if (teamCount <= 4) {
      // 準決勝 → 決勝
      const semifinalMatches = bracketData.matches.slice(0, 2);
      const finalMatch = bracketData.matches.slice(-1)[0];
      
      rounds.push({
        name: '準決勝',
        matches: semifinalMatches.map(match => ({
          team1: match.team1,
          team2: match.team2,
          court: match.court,
          startTime: match.startTime
        }))
      });
      
      if (finalMatch) {
        rounds.push({
          name: '決勝',
          matches: [{
            team1: finalMatch.team1,
            team2: finalMatch.team2,
            court: finalMatch.court,
            startTime: finalMatch.startTime
          }]
        });
      }
    } else if (teamCount <= 8) {
      // 1回戦 → 準決勝 → 決勝
      const firstRoundMatches = bracketData.matches.slice(0, 4);
      const semifinalMatches = bracketData.matches.slice(4, 6);
      const finalMatch = bracketData.matches.slice(-1)[0];
      
      rounds.push({
        name: '1回戦',
        matches: firstRoundMatches.map(match => ({
          team1: match.team1,
          team2: match.team2,
          court: match.court,
          startTime: match.startTime
        }))
      });
      
      if (semifinalMatches.length > 0) {
        rounds.push({
          name: '準決勝',
          matches: semifinalMatches.map(match => ({
            team1: match.team1,
            team2: match.team2,
            court: match.court,
            startTime: match.startTime
          }))
        });
      }
      
      if (finalMatch) {
        rounds.push({
          name: '決勝',
          matches: [{
            team1: finalMatch.team1,
            team2: finalMatch.team2,
            court: finalMatch.court,
            startTime: finalMatch.startTime
          }]
        });
      }
    } else {
      // より多くのチームの場合は適応的に生成
      const matchCount = bracketData.matches.length;
      const roundCount = Math.ceil(Math.log2(teamCount));
      
      for (let i = 0; i < roundCount; i++) {
        const roundName = i === 0 ? '1回戦' : 
                         i === roundCount - 1 ? '決勝' : 
                         `${roundCount - i - 1}回戦`;
        
        const startIndex = i === 0 ? 0 : Math.pow(2, i);
        const endIndex = Math.min(startIndex + Math.pow(2, i), matchCount);
        const roundMatches = bracketData.matches.slice(startIndex, endIndex);
        
        if (roundMatches.length > 0) {
          rounds.push({
            name: roundName,
            matches: roundMatches.map(match => ({
              team1: match.team1,
              team2: match.team2,
              court: match.court,
              startTime: match.startTime
            }))
          });
        }
      }
    }
    
    return rounds;
  };

  const handleCreateBracket = () => {
    const htmlContent = generateBracketHtml();
    
    // HTMLをPDFとしてダウンロード
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${basicInfo.name}_対戦表.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('対戦表をPDF形式で作成しました');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-6xl border border-slate-600 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">対戦表作成</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 設定パネル */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2">設定</h3>
            
            {/* 設定情報の表示 */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-300">設定情報</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">試合形式:</span>
                  <span className="text-white font-medium">
                    {bracketData.bracketType === 'league' ? 'リーグ戦' : 
                     bracketData.bracketType === 'single' ? 'トーナメント戦' : 'トレーニングマッチ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">参加チーム:</span>
                  <span className="text-white font-medium">{bracketData.selectedTeams.length}チーム</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">コート数:</span>
                  <span className="text-white font-medium">{bracketData.courtCount}コート</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">試合時間:</span>
                  <span className="text-white font-medium">{bracketData.matchDuration}分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">休憩時間:</span>
                  <span className="text-white font-medium">{bracketData.breakTime}分</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">開始時刻:</span>
                  <span className="text-white font-medium">{bracketData.startTime || '--:--'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">試合形式</label>
              <select
                value={bracketData.bracketType}
                onChange={(e) => setBracketData(prev => ({ ...prev, bracketType: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
              >
                <option value="league">リーグ戦</option>
                <option value="single">トーナメント戦</option>
                <option value="training">トレーニングマッチ</option>
              </select>
            </div>

          <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">参加チーム</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teams.filter(team => basicInfo.opponentTeamIds.includes(team.id)).map(team => (
                  <label key={team.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bracketData.selectedTeams.includes(team.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBracketData(prev => ({
                            ...prev,
                            selectedTeams: [...prev.selectedTeams, team.id]
                          }));
                        } else {
                          setBracketData(prev => ({
                            ...prev,
                            selectedTeams: prev.selectedTeams.filter(id => id !== team.id)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-slate-300">{team.name}</span>
                  </label>
                ))}
          </div>
        </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">コート数</label>
              <input
                type="number"
                value={bracketData.courtCount}
                onChange={(e) => setBracketData(prev => ({ ...prev, courtCount: parseInt(e.target.value) }))}
                min="1"
                max="10"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">試合時間（分）</label>
              <input
                type="number"
                value={bracketData.matchDuration}
                onChange={(e) => setBracketData(prev => ({ ...prev, matchDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">休憩時間（分）</label>
              <input
                type="number"
                value={bracketData.breakTime}
                onChange={(e) => setBracketData(prev => ({ ...prev, breakTime: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">開始時刻</label>
              <input
                type="time"
                value={bracketData.startTime}
                onChange={(e) => setBracketData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
              />
            </div>

              <button
              onClick={generateMatches}
              className="w-full px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg"
              >
              対戦表を再生成
              </button>
        </div>

          {/* 対戦表 */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-sky-300 border-b border-sky-500 pb-2 mb-4">対戦表</h3>
            
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left p-2 text-slate-300">順番</th>
                      <th className="text-left p-2 text-slate-300">コート</th>
                      <th className="text-left p-2 text-slate-300">開始時刻</th>
                      <th className="text-left p-2 text-slate-300">対戦チーム</th>
                      <th className="text-left p-2 text-slate-300">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bracketData.matches.map((match, index) => (
                      <tr key={match.id} className="border-b border-slate-700">
                        <td className="p-2 text-slate-300">{match.order}</td>
                        <td className="p-2 text-sky-400 font-bold">{match.court}番コート</td>
                        <td className="p-2 text-slate-300">{match.startTime}</td>
                        <td className="p-2">
                          {editingMatch === match.id ? (
                            <div className="flex gap-2">
                              <select
                                value={match.team1}
                                onChange={(e) => handleMatchUpdate(match.id, 'team1', e.target.value)}
                                className="px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded text-xs"
                              >
                                {teams.filter(team => basicInfo.opponentTeamIds.includes(team.id)).map(team => (
                                  <option key={team.id} value={team.name}>{team.name}</option>
                                ))}
                              </select>
                              <span className="text-slate-400">vs</span>
                              <select
                                value={match.team2}
                                onChange={(e) => handleMatchUpdate(match.id, 'team2', e.target.value)}
                                className="px-2 py-1 bg-slate-700 border border-slate-600 text-white rounded text-xs"
                              >
                                {teams.filter(team => basicInfo.opponentTeamIds.includes(team.id)).map(team => (
                                  <option key={team.id} value={team.name}>{team.name}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                  <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{match.team1}</span>
                              <span className="text-slate-400">vs</span>
                              <span className="text-white font-medium">{match.team2}</span>
                    </div>
                  )}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            {editingMatch === match.id ? (
                              <>
                  <button
                                  onClick={() => setEditingMatch(null)}
                                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                  >
                                  保存
                  </button>
                  <button
                                  onClick={() => setEditingMatch(null)}
                                  className="px-2 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs"
                  >
                                  キャンセル
                  </button>
                              </>
                            ) : (
                              <>
                    <button
                                  onClick={() => handleMatchEdit(match.id)}
                                  className="px-2 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs"
                    >
                      編集
                    </button>
                    <button
                                  onClick={() => handleTeamSwap(match.id)}
                                  className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs"
                    >
                                  入れ替え
                    </button>
                    <button
                                  onClick={() => handleMatchReorder(match.id, 'up')}
                                  disabled={index === 0}
                                  className="px-2 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs disabled:opacity-50"
                    >
                                  ↑
                    </button>
                    <button
                                  onClick={() => handleMatchReorder(match.id, 'down')}
                                  disabled={index === bracketData.matches.length - 1}
                                  className="px-2 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs disabled:opacity-50"
                    >
                                  ↓
                    </button>
                              </>
                )}
              </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
        </div>
          </div>
          </div>
      </div>

        {/* アクションボタン */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-600">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleCreateBracket}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            対戦表作成
          </button>
        </div>
      </div>
    </div>
  );
};

// ステップ3: アウトプット作成コンポーネント
const OutputStep: React.FC<{
  data: MatchCreationState['output'];
  onChange: (data: MatchCreationState['output']) => void;
  onSave: () => void;
  onNext: () => void;
  onPrevious: () => void;
  basicInfo: MatchCreationState['basicInfo'];
  details: MatchCreationState['details'];
  teams: Team[];
  showGuidelinesWizard: boolean;
  setShowGuidelinesWizard: (show: boolean) => void;
  showBracketWizard: boolean;
  setShowBracketWizard: (show: boolean) => void;
}> = ({ data, onChange, onSave, onNext, onPrevious, basicInfo, details, teams, showGuidelinesWizard, setShowGuidelinesWizard, showBracketWizard, setShowBracketWizard }) => {
  const handleChange = (field: keyof typeof data, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...data.emailAddresses];
    newEmails[index] = value;
    onChange({ ...data, emailAddresses: newEmails });
  };

  const addEmail = () => {
    onChange({ ...data, emailAddresses: [...data.emailAddresses, ''] });
  };

  const removeEmail = (index: number) => {
    const newEmails = data.emailAddresses.filter((_, i) => i !== index);
    onChange({ ...data, emailAddresses: newEmails });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="h-5 w-5 text-sky-500" />
        <h3 className="text-xl font-semibold">ステップ3: アウトプット作成</h3>
            </div>

      <div className="space-y-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4">作成するファイル</h4>
              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">要項作成</span>
              </div>
                  <button
                onClick={() => setShowGuidelinesWizard(true)}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
                  >
                作成
                  </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">対戦表作成</span>
              </div>
                  <button
                onClick={() => setShowBracketWizard(true)}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
                  >
                作成
                  </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">要項と対戦表をマージしてPDF作成</span>
              </div>
                  <button
                onClick={() => alert('PDFマージ機能は実装予定です')}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
                  >
                作成
                  </button>
                </div>
              </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4">送付方法</h4>
              <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">チャットに送付</span>
                  </div>
              <button
                onClick={() => alert('チャット送付機能は実装予定です')}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
              >
                送付
              </button>
                  </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">メールに送付</span>
                  </div>
              <button
                onClick={() => alert('メール送付機能は実装予定です')}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-sm"
              >
                送付
              </button>
                  </div>
            
            <div className="ml-8 space-y-2">
              <label className="block text-sm font-medium text-slate-300">メールアドレス</label>
              {data.emailAddresses.map((email, index) => (
                <div key={index} className="flex gap-2">
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="example@team.com"
                  />
                      <button
                    type="button"
                    onClick={() => removeEmail(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    削除
                      </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addEmail}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm"
              >
                メールアドレスを追加
              </button>
                  </div>
                </div>
              </div>
                  </div>

      <div className="flex justify-between">
              <button
          onClick={onPrevious}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
          <ArrowLeft className="h-4 w-4" />
                戻る
              </button>
        <div className="flex gap-4">
              <button
            onClick={onSave}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
            <Save className="h-4 w-4" />
            保存
              </button>
              <button
            onClick={onNext}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
            次へ
            <ArrowRight className="h-4 w-4" />
              </button>
            </div>
              </div>
    </div>
  );
};

// ステップ4: 試合記録コンポーネント
const RecordsStep: React.FC<{
  data: MatchCreationState['records'];
  onChange: (data: MatchCreationState['records']) => void;
  onSave: () => void;
  onFinish: () => void;
  onPrevious: () => void;
  matchType: string;
  basicInfo: MatchCreationState['basicInfo'];
  details: MatchCreationState['details'];
  teams: Team[];
}> = ({ data, onChange, onSave, onFinish, onPrevious, matchType, basicInfo, details, teams }) => {
  const handleChange = (field: keyof typeof data, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // 試合の対戦カードを生成
  const generateMatchFixtures = () => {
    const fixtures: Array<{
      id: string;
      team1: string;
      team2: string;
      team1Id: string;
      team2Id: string;
    }> = [];

    if (matchType === 'training') {
      // 練習試合の場合
      const managedTeamName = '自チーム'; // 実際のチーム名を取得する場合は、teams配列から取得
      const opponentTeams = basicInfo.opponentTeamIds.filter(id => id !== 'team-1'); // 自チームIDを除外
      
      for (let i = 0; i < (details.trainingMatchCount || 1); i++) {
        const opponentId = opponentTeams[i % opponentTeams.length];
        const opponentTeam = teams.find(t => t.id === opponentId);
        fixtures.push({
          id: `training_${i + 1}`,
          team1: managedTeamName,
          team2: opponentTeam?.name || `チーム${i + 1}`,
          team1Id: 'team-1',
          team2Id: opponentId,
        });
      }
    } else if (matchType === 'league') {
      // リーグ戦の場合
      const allTeamIds = basicInfo.opponentTeamIds;
      const groupCount = details.leagueGroupCount || 2;
      const teamsPerGroup = Math.ceil(allTeamIds.length / groupCount);
      
      let fixtureId = 1;
      
      // 各グループ内で総当たり戦を生成
      for (let group = 0; group < groupCount; group++) {
        const startIdx = group * teamsPerGroup;
        const endIdx = Math.min(startIdx + teamsPerGroup, allTeamIds.length);
        const groupTeamIds = allTeamIds.slice(startIdx, endIdx);
        
        for (let i = 0; i < groupTeamIds.length; i++) {
          for (let j = i + 1; j < groupTeamIds.length; j++) {
            const team1 = teams.find(t => t.id === groupTeamIds[i]);
            const team2 = teams.find(t => t.id === groupTeamIds[j]);
            
            fixtures.push({
              id: `league_${fixtureId}`,
              team1: team1?.name || `チーム${i + 1}`,
              team2: team2?.name || `チーム${j + 1}`,
              team1Id: groupTeamIds[i],
              team2Id: groupTeamIds[j],
            });
            fixtureId++;
          }
        }
      }
    } else if (matchType === 'tournament') {
      // トーナメントの場合（簡易版）
      const allTeamIds = basicInfo.opponentTeamIds;
      
      for (let i = 0; i < allTeamIds.length - 1; i++) {
        const team1 = teams.find(t => t.id === allTeamIds[i]);
        const team2 = teams.find(t => t.id === allTeamIds[i + 1]);
        
        fixtures.push({
          id: `tournament_${i + 1}`,
          team1: team1?.name || `チーム${i + 1}`,
          team2: team2?.name || `チーム${i + 2}`,
          team1Id: allTeamIds[i],
          team2Id: allTeamIds[i + 1],
        });
      }
    }

    return fixtures;
  };

  const matchFixtures = generateMatchFixtures();
  const matchCount = matchFixtures.length;

  // 自チームのメンバーリストを取得
  const getTeamMembers = () => {
    const managedTeam = teams.find(t => t.id === 'team-1'); // 自チームID
    return managedTeam?.members || [];
  };

  const teamMembers = getTeamMembers();

  // 結果配列を初期化または調整
  const initializeResults = () => {
    if (data.results.length !== matchCount) {
      const newResults = Array(matchCount).fill(null).map((_, index) => ({
        ...(data.results[index] || {}),
        ourScore: data.results[index]?.ourScore || 0,
        opponentScore: data.results[index]?.opponentScore || 0,
        winner: data.results[index]?.winner || 'our' as 'our' | 'opponent' | 'draw',
        goals: data.results[index]?.goals || [],
      }));
      handleChange('results', newResults);
    }
  };

  // コンポーネントマウント時とmatchCount変更時に結果を初期化
  React.useEffect(() => {
    initializeResults();
  }, [matchCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="h-5 w-5 text-sky-500" />
        <h3 className="text-xl font-semibold">ステップ4: 試合記録</h3>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">結果入力</h4>
        <div className="space-y-4">
          {data.results.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              試合数が計算されていません。前のステップで試合設定を完了してください。
            </div>
          ) : (
            data.results.map((result, index) => {
              const fixture = matchFixtures[index];
              if (!fixture) return null;
              
              return (
                <div key={index} className="p-4 bg-slate-700 rounded-lg">
                  {/* 試合情報ヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 font-medium">試合 {index + 1}</span>
                      <span className="text-slate-400 text-sm">
                        {matchType === 'league' ? 'リーグ戦' : matchType === 'tournament' ? 'トーナメント' : '練習試合'}
                      </span>
                    </div>
                  </div>
                  
                  {/* 対戦チーム表示 */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-white font-medium">{fixture.team1}</div>
                      <div className="text-slate-400 text-sm">チーム1</div>
                    </div>
                    <div className="text-slate-400 text-xl font-bold">VS</div>
                    <div className="text-center">
                      <div className="text-white font-medium">{fixture.team2}</div>
                      <div className="text-slate-400 text-sm">チーム2</div>
                    </div>
                  </div>
                  
                  {/* スコア入力 */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 text-sm w-20 text-right">{fixture.team1}</span>
                      <input
                        type="number"
                        min="0"
                        value={result.ourScore}
                        onChange={(e) => {
                          const newResults = [...data.results];
                          newResults[index] = { ...result, ourScore: parseInt(e.target.value) || 0 };
                          handleChange('results', newResults);
                        }}
                        className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded text-center"
                        placeholder="0"
                      />
                    </div>
                    
                    <span className="text-slate-300 text-lg font-bold">-</span>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={result.opponentScore}
                        onChange={(e) => {
                          const newResults = [...data.results];
                          newResults[index] = { ...result, opponentScore: parseInt(e.target.value) || 0 };
                          handleChange('results', newResults);
                        }}
                        className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 text-white rounded text-center"
                        placeholder="0"
                      />
                      <span className="text-slate-300 text-sm w-20">{fixture.team2}</span>
                    </div>
                  </div>
                  
                  {/* 勝敗選択 */}
                  <div className="flex justify-center mt-4">
                    <select
                      value={result.winner}
                      onChange={(e) => {
                        const newResults = [...data.results];
                        newResults[index] = { ...result, winner: e.target.value as 'our' | 'opponent' | 'draw' };
                        handleChange('results', newResults);
                      }}
                      className="px-4 py-2 bg-slate-600 border border-slate-500 text-white rounded"
                    >
                      <option value="our">{fixture.team1} の勝ち</option>
                      <option value="opponent">{fixture.team2} の勝ち</option>
                      <option value="draw">引き分け</option>
                    </select>
                  </div>

                  {/* 得点記録セクション */}
                  {result.ourScore > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-600">
                      <h5 className="text-white font-medium mb-3">得点記録</h5>
                      <div className="space-y-3">
                        {result.goals?.map((goal, goalIndex) => (
                          <div key={goal.id} className="flex items-center gap-3 p-3 bg-slate-600 rounded-lg">
                            <span className="text-slate-300 text-sm">得点 {goalIndex + 1}</span>
                            
                            {/* 得点者 */}
                            <select
                              value={goal.scorerName}
                              onChange={(e) => {
                                const newResults = [...data.results];
                                const newGoals = [...(newResults[index].goals || [])];
                                newGoals[goalIndex] = { ...goal, scorerName: e.target.value };
                                newResults[index] = { ...result, goals: newGoals };
                                handleChange('results', newResults);
                              }}
                              className="px-2 py-1 bg-slate-500 border border-slate-400 text-white rounded text-sm"
                            >
                              <option value="">得点者を選択</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.name}>{member.name}</option>
                              ))}
                            </select>

                            {/* 前半/後半 */}
                            <select
                              value={goal.period}
                              onChange={(e) => {
                                const newResults = [...data.results];
                                const newGoals = [...(newResults[index].goals || [])];
                                newGoals[goalIndex] = { ...goal, period: e.target.value as '前半' | '後半' };
                                newResults[index] = { ...result, goals: newGoals };
                                handleChange('results', newResults);
                              }}
                              className="px-2 py-1 bg-slate-500 border border-slate-400 text-white rounded text-sm"
                            >
                              <option value="前半">前半</option>
                              <option value="後半">後半</option>
                            </select>

                            {/* 時間 */}
                            <input
                              type="number"
                              min="1"
                              max="45"
                              value={goal.minute || ''}
                              onChange={(e) => {
                                const newResults = [...data.results];
                                const newGoals = [...(newResults[index].goals || [])];
                                newGoals[goalIndex] = { ...goal, minute: parseInt(e.target.value) || undefined };
                                newResults[index] = { ...result, goals: newGoals };
                                handleChange('results', newResults);
                              }}
                              placeholder="分"
                              className="w-16 px-2 py-1 bg-slate-500 border border-slate-400 text-white rounded text-sm text-center"
                            />

                            {/* アシスト */}
                            <select
                              value={goal.assistName || ''}
                              onChange={(e) => {
                                const newResults = [...data.results];
                                const newGoals = [...(newResults[index].goals || [])];
                                newGoals[goalIndex] = { ...goal, assistName: e.target.value || undefined };
                                newResults[index] = { ...result, goals: newGoals };
                                handleChange('results', newResults);
                              }}
                              className="px-2 py-1 bg-slate-500 border border-slate-400 text-white rounded text-sm"
                            >
                              <option value="">アシストなし</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.name}>{member.name}</option>
                              ))}
                            </select>

                            {/* 削除ボタン */}
                            <button
                              onClick={() => {
                                const newResults = [...data.results];
                                const newGoals = [...(newResults[index].goals || [])];
                                newGoals.splice(goalIndex, 1);
                                newResults[index] = { ...result, goals: newGoals };
                                handleChange('results', newResults);
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                              削除
                            </button>
                          </div>
                        ))}

                        {/* 得点追加ボタン */}
                        <button
                          onClick={() => {
                            const newResults = [...data.results];
                            const newGoals = [...(newResults[index].goals || [])];
                            newGoals.push({
                              id: `goal_${Date.now()}`,
                              scorerName: '',
                              period: '前半',
                              minute: undefined,
                              assistName: undefined,
                            });
                            newResults[index] = { ...result, goals: newGoals };
                            handleChange('results', newResults);
                          }}
                          className="w-full px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm"
                        >
                          + 得点を追加
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
                  </div>
            </div>
            
      {matchType === 'training' && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4">追加試合</h4>
          <div className="flex items-center gap-4">
            <label className="text-slate-300">追加試合数:</label>
            <input
              type="number"
              min="0"
              max="10"
              value={data.additionalTrainingMatches || 0}
              onChange={(e) => handleChange('additionalTrainingMatches', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
              <button
          onClick={onPrevious}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
          <ArrowLeft className="h-4 w-4" />
          戻る
              </button>
        <div className="flex gap-4">
                <button
            onClick={onSave}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
            <Save className="h-4 w-4" />
            保存
                </button>
                <button
            onClick={onFinish}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
            完了
            <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
  );
};

// メインの試合作成モーダル
const MatchCreationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  followedTeams: FollowedTeam[];
  managedTeam: Team;
  onSave: (match: Match) => void;
  editingMatch?: Match | null; // 編集中の試合
  chatThreads: ChatThread[];
  onAddChatThread: (newThread: ChatThread, initialMessage?: ChatMessage, shouldNavigate?: boolean) => void;
  onSendMessage: (threadId: string, message: ChatMessage) => void;
}> = ({ isOpen, onClose, teams, followedTeams, managedTeam, onSave, editingMatch, chatThreads, onAddChatThread, onSendMessage }) => {
  const [showGuidelinesWizard, setShowGuidelinesWizard] = useState(false);
  const [showBracketWizard, setShowBracketWizard] = useState(false);
  
  const [creationState, setCreationState] = useState<MatchCreationState>({
    isOpen: true,
    currentStep: 'basic',
    matchId: null,
    basicInfo: {
      name: '',
      date: '',
      startTime: '',
      endTime: '',
      opponentTeamIds: [managedTeam.id], // 自チームを自動選択
      location: '',
      sendInviteEmail: true,
      createGroupChat: true,
      addToSchedule: true,
    },
    details: {
      matchType: 'training',
      courtCount: 1,
      matchDuration: 10, // 10分に変更
      hasHalfTime: false, // なしに変更
      halfTimeDuration: 5, // 5分に変更
      breakTime: 5, // 5分に変更
      trainingMatchCount: 1,
      leagueGroupCount: 2, // リーグ戦のデフォルトグループ数
    },
    output: {
      createGuidelines: true,
      createBracket: false,
      mergeToPdf: true,
      sendToChat: true,
      sendToEmail: false,
      emailAddresses: [''],
    },
    records: {
      results: [],
      additionalTrainingMatches: 0,
    },
  });

  // 編集モードの場合は既存のデータを読み込む、新規作成時は初期状態にリセット
  useEffect(() => {
    if (editingMatch) {
      // 編集モード：既存のデータを読み込む
      setCreationState({
        isOpen: true,
        currentStep: 'basic',
        matchId: editingMatch.id,
        basicInfo: {
          name: editingMatch.location,
          date: editingMatch.date,
          startTime: editingMatch.time,
          endTime: '',
          opponentTeamIds: editingMatch.opponentTeamIds || (editingMatch.opponentTeamId ? [managedTeam.id, editingMatch.opponentTeamId] : [managedTeam.id]),
          location: editingMatch.location,
          sendInviteEmail: true,
          createGroupChat: true,
          addToSchedule: true,
        },
        details: {
          matchType: editingMatch.type === MatchType.TRAINING ? 'training' : editingMatch.type === MatchType.LEAGUE ? 'league' : 'tournament',
          courtCount: editingMatch.numberOfCourts || 1,
          matchDuration: editingMatch.matchDurationInMinutes || 10,
          hasHalfTime: editingMatch.halftimeInMinutes ? true : false,
          halfTimeDuration: editingMatch.halftimeInMinutes || 5,
          breakTime: editingMatch.restTimeInMinutes || 5,
          trainingMatchCount: 1,
          leagueGroupCount: 2,
        },
        output: {
          createGuidelines: true,
          createBracket: false,
          mergeToPdf: true,
          sendToChat: true,
          sendToEmail: false,
          emailAddresses: [''],
        },
        records: {
          results: editingMatch.records?.results || [],
          additionalTrainingMatches: editingMatch.records?.additionalTrainingMatches || 0,
        },
      });
    } else {
      // 新規作成モード：初期状態にリセット
      setCreationState({
        isOpen: true,
        currentStep: 'basic',
        matchId: null,
        basicInfo: {
          name: '',
          date: '',
          startTime: '',
          endTime: '',
          opponentTeamIds: [managedTeam.id], // 自チームを自動選択
          location: '',
          sendInviteEmail: true,
          createGroupChat: true,
          addToSchedule: true,
        },
        details: {
          matchType: 'training',
          courtCount: 1,
          matchDuration: 10,
          hasHalfTime: false,
          halfTimeDuration: 5,
          breakTime: 5,
          trainingMatchCount: 1,
          leagueGroupCount: 2,
        },
        output: {
          createGuidelines: true,
          createBracket: false,
          mergeToPdf: true,
          sendToChat: true,
          sendToEmail: false,
          emailAddresses: [''],
        },
        records: {
          results: [],
          additionalTrainingMatches: 0,
        },
      });
    }
  }, [editingMatch, managedTeam.id]);

  const handleSave = () => {
    // 現在のステップのデータを保存して試合を登録
    console.log('Saving current step data:', creationState);
    
    // 基本情報が入力されている場合は試合を登録
    if (creationState.basicInfo.name && creationState.basicInfo.date && 
        creationState.basicInfo.startTime && creationState.basicInfo.opponentTeamIds.length > 0 && 
        creationState.basicInfo.location) {
      
      // recordsステップの情報を取得
      const recordsData = creationState.records;
      const totalOurScore = recordsData.results.reduce((sum, result) => sum + result.ourScore, 0);
      const totalOpponentScore = recordsData.results.reduce((sum, result) => sum + result.opponentScore, 0);
      
      console.log('Selected opponent team IDs:', creationState.basicInfo.opponentTeamIds);
      console.log('Selected opponent team names:', creationState.basicInfo.opponentTeamIds.map(id => teams.find(t => t.id === id)?.name));
      
      const newMatch: Match = {
        id: editingMatch ? editingMatch.id : `match-${Date.now()}`, // 編集モードの場合は既存のIDを使用
        date: creationState.basicInfo.date,
        time: creationState.basicInfo.startTime,
        location: creationState.basicInfo.name,
        status: editingMatch ? editingMatch.status : MatchStatus.PREPARATION,
        type: creationState.details.matchType as MatchType,
        ourTeamId: managedTeam.id,
        opponentTeamId: creationState.basicInfo.opponentTeamIds.find(id => id !== managedTeam.id) || '',
        opponentTeamIds: creationState.basicInfo.opponentTeamIds, // 複数の対戦相手を保存
        opponentTeamName: teams.find(t => t.id === creationState.basicInfo.opponentTeamIds.find(id => id !== managedTeam.id))?.name || '',
        ourScore: editingMatch ? editingMatch.ourScore : totalOurScore,
        opponentScore: editingMatch ? editingMatch.opponentScore : totalOpponentScore,
        participants: editingMatch?.participants || [],
        hostTeamId: managedTeam.id, // 主催チームIDを設定
        isInvitation: false, // 主催の試合なので招待ではない
        numberOfCourts: creationState.details.courtCount,
        matchDurationInMinutes: creationState.details.matchDuration,
        halftimeInMinutes: creationState.details.hasHalfTime ? creationState.details.halfTimeDuration : undefined,
        restTimeInMinutes: creationState.details.breakTime,
        // recordsの情報を追加
        records: recordsData,
      };
      
      console.log('Saving match with records:', newMatch);
      onSave(newMatch);
      alert(editingMatch ? '試合が更新されました！' : '試合が登録されました！');
      onClose();
    } else {
      alert('基本情報を入力してください。');
    }
  };

  const handleNext = () => {
    const steps: MatchCreationStep[] = ['basic', 'details', 'output', 'records'];
    const currentIndex = steps.indexOf(creationState.currentStep);
    if (currentIndex < steps.length - 1) {
      setCreationState(prev => ({
        ...prev,
        currentStep: steps[currentIndex + 1]
      }));
    }
  };

  const handlePrevious = () => {
    const steps: MatchCreationStep[] = ['basic', 'details', 'output', 'records'];
    const currentIndex = steps.indexOf(creationState.currentStep);
    if (currentIndex > 0) {
      setCreationState(prev => ({
        ...prev,
        currentStep: steps[currentIndex - 1]
      }));
    }
  };

  const handleFinish = () => {
    // ステップ4の完了時も保存と同じ動作
    handleSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-4xl border border-slate-600 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">試合作成</h2>
              <button
            onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-slate-400 text-2xl">&times;</span>
              </button>
            </div>
            
        {/* ステップインジケーター */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['basic', 'details', 'output', 'records'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  creationState.currentStep === step 
                    ? 'bg-sky-500 text-white' 
                    : index < ['basic', 'details', 'output', 'records'].indexOf(creationState.currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {index + 1}
          </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < ['basic', 'details', 'output', 'records'].indexOf(creationState.currentStep)
                      ? 'bg-green-500'
                      : 'bg-slate-600'
                  }`} />
                )}
        </div>
            ))}
          </div>
        </div>

        {/* ステップコンテンツ */}
        {creationState.currentStep === 'basic' && (
          <BasicInfoStep
            data={creationState.basicInfo}
            onChange={(data) => setCreationState(prev => ({ ...prev, basicInfo: data }))}
            teams={teams}
            followedTeams={followedTeams}
            managedTeam={managedTeam}
            onSave={handleSave}
            onNext={handleNext}
            onSendInviteEmail={() => {
              // 対戦相手への招待メールを送信（グループチャットに投稿）
              const matchName = creationState.basicInfo.name || '試合';
              const matchDate = creationState.basicInfo.date || '未定';
              
              // まずグループチャットの存在をチェック
              const groupChatName = `${matchName} - ${matchDate}`;
              const groupThread = chatThreads.find(t => 
                t.isGroupChat && t.groupName === groupChatName
              );
              
              if (!groupThread) {
                alert('グループチャットが見つかりません。先にグループチャットを作成してください。');
                return;
              }
              
              const opponentTeamIds = creationState.basicInfo.opponentTeamIds.filter(id => id !== managedTeam.id);
              
              if (opponentTeamIds.length === 0) {
                alert('対戦相手が選択されていません');
                return;
              }
              
              const matchTime = creationState.basicInfo.startTime || '未定';
              const matchLocation = creationState.basicInfo.location || '未定';
              
              // グループチャットに招待メッセージを投稿
              const invitationMessage: ChatMessage = {
                id: `msg-${Date.now()}-${Math.random()}`,
                threadId: groupThread.id,
                senderId: managedTeam.id,
                senderName: managedTeam.name,
                text: `【試合招待】\n${matchName}\n日時: ${matchDate} ${matchTime}\n会場: ${matchLocation}\n\n試合への参加をお願いします。`,
                timestamp: new Date(),
                isRead: false
              };
              
              onSendMessage(groupThread.id, invitationMessage);
              
              // 対戦相手のチームにも招待された試合を作成
              opponentTeamIds.forEach(opponentId => {
                const opponent = teams.find(t => t.id === opponentId);
                if (opponent) {
                  const invitedMatch: Match = {
                    id: `invited-match-${Date.now()}-${opponentId}`,
                    type: creationState.details.matchType === 'league' ? MatchType.LEAGUE : 
                          creationState.details.matchType === 'tournament' ? MatchType.TOURNAMENT : MatchType.TRAINING,
                    status: MatchStatus.PREPARATION,
                    ourTeamId: opponentId, // 対戦相手のチームID
                    opponentTeamId: managedTeam.id, // 招待元のチームID
                    opponentTeamName: managedTeam.name, // 招待元のチーム名
                    date: matchDate,
                    time: matchTime,
                    location: matchLocation,
                    numberOfCourts: creationState.details.courtCount,
                    matchDurationInMinutes: creationState.details.matchDuration,
                    halftimeInMinutes: creationState.details.hasHalfTime ? creationState.details.halfTimeDuration : undefined,
                    restTimeInMinutes: creationState.details.breakTime,
                    hostTeamId: managedTeam.id, // 主催チームID
                    isInvitation: true, // 招待の試合
                    invitationStatus: 'pending', // 招待状態
                    participants: [
                      { teamId: opponentId, status: 'pending' as ParticipantStatus },
                      { teamId: managedTeam.id, status: 'accepted' as ParticipantStatus }
                    ],
                    ourScore: 0,
                    opponentScore: 0
                  };
                  
                  // 対戦相手のチームの試合一覧に追加
                  onSave(invitedMatch);
                }
              });
              
              alert(`招待メールをグループチャットに投稿し、対戦相手に試合を招待しました`);
            }}
            onCreateGroupChat={() => {
              // 試合用のグループチャットを作成
              const opponentTeamIds = creationState.basicInfo.opponentTeamIds.filter(id => id !== managedTeam.id);
              
              if (opponentTeamIds.length === 0) {
                alert('対戦相手が選択されていません');
                return;
              }
              
              const participants = [
                { id: managedTeam.id, name: managedTeam.name, logoUrl: managedTeam.logoUrl },
                ...opponentTeamIds.map(id => {
                  const team = teams.find(t => t.id === id);
                  return team ? { id: team.id, name: team.name, logoUrl: team.logoUrl } : null;
                }).filter(p => p !== null) as { id: string; name: string; logoUrl: string; }[]
              ];
              
              const matchName = creationState.basicInfo.name || '試合';
              const matchDate = creationState.basicInfo.date || '未定';
              const chatName = `${matchName} - ${matchDate}`;
              const newThreadId = `thread-match-${Date.now()}`;
              
              const initialMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                threadId: newThreadId,
                senderId: managedTeam.id,
                senderName: managedTeam.name,
                text: `${managedTeam.name}が試合用のグループチャット「${chatName}」を作成しました。`,
                timestamp: new Date(),
                isRead: false
              };
              
              const newThread: ChatThread = {
                id: newThreadId,
                participants,
                lastMessage: initialMessage,
                unreadCount: 1,
                isGroupChat: true,
                groupName: chatName
              };
              
              onAddChatThread(newThread, initialMessage, false);
              
              // グループチャット作成フラグを設定
              setCreationState(prev => ({
                ...prev,
                basicInfo: {
                  ...prev.basicInfo,
                  createGroupChat: true
                }
              }));
              
              alert('グループチャットを作成しました。次に招待メールを送信できます。');
            }}
            onAddToSchedule={() => alert('スケジュールに追加しました')}
          />
        )}

        {creationState.currentStep === 'details' && (
          <DetailsStep
            data={creationState.details}
            onChange={(data) => setCreationState(prev => ({ ...prev, details: data }))}
            onSave={handleSave}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {creationState.currentStep === 'output' && (
          <OutputStep
            data={creationState.output}
            onChange={(data) => setCreationState(prev => ({ ...prev, output: data }))}
            onSave={handleSave}
            onNext={handleNext}
            onPrevious={handlePrevious}
            basicInfo={creationState.basicInfo}
            details={creationState.details}
            teams={teams}
            showGuidelinesWizard={showGuidelinesWizard}
            setShowGuidelinesWizard={setShowGuidelinesWizard}
            showBracketWizard={showBracketWizard}
            setShowBracketWizard={setShowBracketWizard}
          />
        )}

        {creationState.currentStep === 'records' && (
          <RecordsStep
            data={creationState.records}
            onChange={(data) => setCreationState(prev => ({ ...prev, records: data }))}
            onSave={handleSave}
            onFinish={handleFinish}
            onPrevious={handlePrevious}
            matchType={creationState.details.matchType}
            basicInfo={creationState.basicInfo}
            details={creationState.details}
            teams={teams}
          />
        )}

        {/* ウィザードコンポーネント */}
        <GuidelinesWizard
          isOpen={showGuidelinesWizard}
          onClose={() => setShowGuidelinesWizard(false)}
          basicInfo={creationState.basicInfo}
          details={creationState.details}
          teams={teams}
        />
        
        <BracketWizard
          isOpen={showBracketWizard}
          onClose={() => setShowBracketWizard(false)}
          basicInfo={creationState.basicInfo}
          details={creationState.details}
          teams={teams}
          managedTeam={managedTeam}
        />
      </div>
    </div>
  );
};

// メインのMatchesPageコンポーネント
const MatchesPage: React.FC<MatchesPageProps> = ({ 
  matches, 
  teams, 
  onUpdateMatches, 
  managedTeam, 
  followedTeams, 
  chatThreads, 
  onAddChatThread, 
  onSendMessage, 
  onUpdateTeams, 
  onEditGuideline 
}) => {
  const [isMatchCreationModalOpen, setIsMatchCreationModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const handleCreateMatch = (newMatch: Match) => {
    if (editingMatch) {
      // 編集モードの場合は既存の試合を更新
      onUpdateMatches(prev => prev.map(m => m.id === editingMatch.id ? newMatch : m));
    } else {
      // 新規作成の場合は追加
      onUpdateMatches(prev => [newMatch, ...prev]);
    }
    setEditingMatch(null);
  };

  const handleEditMatch = (match: Match) => {
    // 既存の試合データを編集モードで開く
    setEditingMatch(match);
    setIsMatchCreationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMatchCreationModalOpen(false);
    setEditingMatch(null);
  };

  const handleAcceptInvitation = (matchId: string) => {
    onUpdateMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, invitationStatus: 'accepted' as const }
        : match
    ));
  };

  const handleDeclineInvitation = (matchId: string) => {
    onUpdateMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, invitationStatus: 'declined' as const }
        : match
    ));
  };

  // 主催の試合と招待の試合を分ける
  const hostedMatches = matches.filter(match => 
    match.hostTeamId === managedTeam.id || !match.isInvitation
  );
  const invitedMatches = matches.filter(match => 
    match.isInvitation && match.hostTeamId !== managedTeam.id
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">試合管理</h1>
            <p className="text-slate-400">新しい4ステップ形式で試合を作成・管理します</p>
          </div>
          <button
            onClick={() => {
              setEditingMatch(null); // 編集モードをリセット
              setIsMatchCreationModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-semibold"
          >
            <Plus className="h-5 w-5" />
            新規試合作成
          </button>
        </div>

        {/* 招待された試合 */}
        {invitedMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">招待された試合</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitedMatches.map(match => (
                <div key={match.id} className="bg-gradient-to-br from-amber-900/30 to-slate-800 border-2 border-amber-500/50 rounded-xl p-6 shadow-2xl hover:shadow-3xl transition-shadow">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">招待</span>
                      {match.invitationStatus === 'accepted' && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">承諾済み</span>
                      )}
                      {match.invitationStatus === 'declined' && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">辞退済み</span>
                      )}
                      {match.invitationStatus === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-xs font-bold rounded-full">保留中</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-lg">{match.location}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock className="h-4 w-4" />
                      <span>{match.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Users className="h-4 w-4" />
                      <span>vs {match.opponentTeamName}</span>
                    </div>
                    {match.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="h-4 w-4" />
                        <span>{match.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 承諾・拒否ボタン（保留中のみ表示） */}
                  {match.invitationStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvitation(match.id)}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        承諾
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(match.id)}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-semibold"
                      >
                        辞退
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
            
        {/* 主催の試合一覧 */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-sky-400 mb-4">主催の試合</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostedMatches.map(match => (
            <div key={match.id} className="bg-slate-800 rounded-xl p-6 shadow-2xl hover:shadow-3xl transition-shadow">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full">主催</span>
                </div>
                <h3 className="font-semibold text-white text-lg">{match.location}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>{match.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{match.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>vs {match.opponentTeamName}</span>
                </div>
                {match.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{match.location}</span>
                  </div>
                )}
              </div>
              
              {/* 編集ボタン */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMatch(match)}
                  className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  編集
                </button>
              </div>
          </div>
          ))}
        </div>

        {/* 試合が見つからない場合 */}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">試合が見つかりません</h3>
            <p className="text-slate-400">新しい試合を作成してください</p>
          </div>
        )}
      </div>

      {/* 試合作成モーダル */}
      <MatchCreationModal
        isOpen={isMatchCreationModalOpen}
        onClose={handleCloseModal}
        teams={teams}
        followedTeams={followedTeams}
        managedTeam={managedTeam}
        onSave={handleCreateMatch}
        editingMatch={editingMatch}
        chatThreads={chatThreads}
        onAddChatThread={onAddChatThread}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default MatchesPage;