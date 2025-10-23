import React, { useState } from 'react';
import { Team, TournamentBracket, LeagueTable } from '../types';
import { generateTournamentBracket } from '../utils/bracketGenerator';
import { generateLeagueTable } from '../utils/leagueGenerator';
import { downloadTableAsPdf, downloadTableAsPdfWithPrint } from '../utils/downloadHtmlAsPdf';
import BracketView from './BracketView';
import LeagueTableView from './LeagueTableView';
import { Trophy, Users, Calendar, Clock, MapPin, Download, Share2, ArrowLeft, Printer, Info } from 'lucide-react';

interface TableCreationPageProps {
  teams: Team[];
  onBack: () => void;
}

type TableType = 'tournament' | 'league';
type CreationStep = 'type' | 'teams' | 'settings' | 'preview';

interface CreationState {
  isOpen: boolean;
  currentStep: CreationStep;
  tableType: TableType | null;
  selectedTeams: Team[];
  settings: {
    numGroups: number;
    numberOfCourts: number;
    eventStartTime: string;
    matchDurationInMinutes: number;
    restTimeInMinutes: number;
    seedTeamIds: string[];
    // リーグ戦用の追加設定
    advanceTeamsPerGroup: number;
    hasFinalRound: boolean;
    finalRoundType: 'league' | 'tournament';
  };
  generatedTable: TournamentBracket | LeagueTable | null;
}

const TableCreationPage: React.FC<TableCreationPageProps> = ({ teams, onBack }) => {
  console.log('TableCreationPage rendered with teams:', teams.length);
  
  const [creationState, setCreationState] = useState<CreationState>({
    isOpen: true,
    currentStep: 'type',
    tableType: null,
    selectedTeams: [],
    settings: {
      numGroups: 1,
      numberOfCourts: 1,
      eventStartTime: '10:00',
      matchDurationInMinutes: 10,
      restTimeInMinutes: 5,
      seedTeamIds: [],
      // リーグ戦用の追加設定
      advanceTeamsPerGroup: 2,
      hasFinalRound: false,
      finalRoundType: 'tournament',
    },
    generatedTable: null,
  });

  // 初期状態をログ出力
  console.log('初期状態:', creationState);
  
  // 現在の状態をログ出力
  console.log('現在のcreationState:', creationState);

  const handleSelectTableType = (type: TableType) => {
    console.log('試合形式選択:', type);
    console.log('選択前の状態:', creationState);
    
    setCreationState(prev => {
      const newState = {
        ...prev,
        tableType: type,
        currentStep: 'teams' as CreationStep,
        // リーグ戦の場合はグループ数を自動調整
        settings: {
          ...prev.settings,
          numGroups: type === 'league' ? Math.min(4, Math.ceil(teams.length / 4)) : 1,
        }
      };
      console.log('新しい状態:', newState);
      return newState;
    });
    
    // 状態更新後の確認
    setTimeout(() => {
      console.log('状態更新後の確認:', creationState);
    }, 0);
  };

  // 設定ステップに入ったときに自動的に表を生成
  React.useEffect(() => {
    if (creationState.currentStep === 'settings' && creationState.selectedTeams.length >= 2) {
      generateTable();
    }
  }, [creationState.currentStep, creationState.selectedTeams.length]);

  // 状態の変化を監視
  React.useEffect(() => {
    console.log('creationStateが変更されました:', creationState);
    console.log('現在のステップ:', creationState.currentStep);
    console.log('現在の試合形式:', creationState.tableType);
    console.log('選択されたチーム数:', creationState.selectedTeams.length);
  }, [creationState]);

  const handleTeamSelection = (team: Team, selected: boolean) => {
    console.log('チーム選択:', team.name, selected);
    setCreationState(prev => {
      const newSelectedTeams = selected
        ? [...prev.selectedTeams, team]
        : prev.selectedTeams.filter(t => t.id !== team.id);
      
      const newState = {
        ...prev,
        selectedTeams: newSelectedTeams,
      };
      console.log('選択されたチーム:', newSelectedTeams.map(t => t.name));
      console.log('新しい状態:', newState);
      return newState;
    });
  };

  const handleNextStep = () => {
    console.log('次のステップに進もうとしています。現在の状態:', creationState);
    
    if (creationState.currentStep === 'teams') {
      if (creationState.selectedTeams.length < 2) {
        alert('少なくとも2チームを選択してください');
        return;
      }
      console.log('チーム選択から設定ステップに進みます');
      setCreationState(prev => ({ ...prev, currentStep: 'settings' }));
    } else if (creationState.currentStep === 'settings') {
      // リーグ戦の場合の追加バリデーション
      if (creationState.tableType === 'league') {
        const { selectedTeams, settings } = creationState;
        
        console.log('リーグ戦バリデーション:', {
          selectedTeams: selectedTeams.length,
          numGroups: settings.numGroups,
          teams: selectedTeams.map(t => t.name)
        });
        
        if (selectedTeams.length < 2) {
          alert('リーグ戦には少なくとも2チームが必要です');
          return;
        }
        
        if (settings.numGroups > selectedTeams.length) {
          alert('グループ数は参加チーム数以下にしてください');
          return;
        }
        
        if (settings.numGroups < 1) {
          alert('グループ数は1以上にしてください');
          return;
        }
        
        // 各グループに最低1チームずつ配置できるかチェック
        const teamsPerGroup = Math.ceil(selectedTeams.length / settings.numGroups);
        if (teamsPerGroup < 2) {
          alert('グループ数が多すぎます。各グループに最低2チーム必要です。');
          return;
        }
      }
      
      console.log('次のステップに進みます: preview');
      setCreationState(prev => ({ ...prev, currentStep: 'preview' }));
      generateTable();
    }
  };

  const handlePreviousStep = () => {
    if (creationState.currentStep === 'teams') {
      setCreationState(prev => ({ ...prev, currentStep: 'type' }));
    } else if (creationState.currentStep === 'settings') {
      setCreationState(prev => ({ ...prev, currentStep: 'teams' }));
    } else if (creationState.currentStep === 'preview') {
      setCreationState(prev => ({ ...prev, currentStep: 'settings' }));
    }
  };

  const generateTable = () => {
    const { tableType, selectedTeams, settings } = creationState;

    console.log('表生成開始 (更新済み):', { tableType, selectedTeams: selectedTeams.length, settings });

    try {
      if (tableType === 'tournament') {
        console.log('トーナメント表生成中...');
        const bracket = generateTournamentBracket(
          selectedTeams,
          settings.seedTeamIds,
          settings.numberOfCourts,
          settings.eventStartTime,
          settings.matchDurationInMinutes,
          settings.restTimeInMinutes
        );
        console.log('トーナメント表生成結果:', bracket);
        if (bracket) {
          setCreationState(prev => ({ ...prev, generatedTable: bracket }));
        } else {
          alert('トーナメント表の生成に失敗しました。設定を確認してください。');
        }
      } else if (tableType === 'league') {
        console.log('リーグ表生成中...', {
          teams: selectedTeams.length,
          numGroups: settings.numGroups,
          numberOfCourts: settings.numberOfCourts,
          eventStartTime: settings.eventStartTime,
          matchDurationInMinutes: settings.matchDurationInMinutes,
          restTimeInMinutes: settings.restTimeInMinutes
        });
        
        // バリデーションチェック
        if (selectedTeams.length < 2) {
          alert('リーグ戦には少なくとも2チームが必要です。');
          return;
        }
        
        if (settings.numGroups > selectedTeams.length) {
          alert('グループ数は参加チーム数以下にしてください。');
          return;
        }
        
        const league = generateLeagueTable(
          selectedTeams,
          settings.numGroups,
          settings.numberOfCourts,
          settings.eventStartTime,
          settings.matchDurationInMinutes,
          settings.restTimeInMinutes,
          settings.advanceTeamsPerGroup,
          settings.hasFinalRound,
          settings.finalRoundType
        );
        console.log('リーグ表生成結果:', league);
        
        if (league) {
          setCreationState(prev => ({ ...prev, generatedTable: league }));
        } else {
          alert('リーグ表の生成に失敗しました。設定を確認してください。\n\n詳細:\n- 参加チーム数: ' + selectedTeams.length + '\n- グループ数: ' + settings.numGroups);
        }
      }
    } catch (error) {
      console.error('表生成エラー:', error);
      alert('表の生成中にエラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    }
  };

  const handleDownload = () => {
    if (creationState.generatedTable) {
      const tableType = creationState.tableType === 'tournament' ? 'トーナメント' : 'リーグ';
      const filename = `${tableType}表_${new Date().toISOString().split('T')[0]}.html`;
      downloadTableAsPdf(creationState.generatedTable, { filename });
    }
  };

  const handlePrint = () => {
    if (creationState.generatedTable) {
      downloadTableAsPdfWithPrint(creationState.generatedTable);
    }
  };

  const handleShare = () => {
    // 共有機能を実装
    alert('共有機能は実装予定です');
  };

  const resetCreation = () => {
    setCreationState({
      isOpen: true,
      currentStep: 'type',
      tableType: null,
      selectedTeams: [],
      settings: {
        numGroups: 1,
        numberOfCourts: 1,
        eventStartTime: '10:00',
        matchDurationInMinutes: 10,
        restTimeInMinutes: 5,
        seedTeamIds: [],
        // リーグ戦用の追加設定
        advanceTeamsPerGroup: 2,
        hasFinalRound: false,
        finalRoundType: 'tournament',
      },
      generatedTable: null,
    });
  };

  // 設定情報を表示するコンポーネント
  const SettingsInfo = () => (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 mb-8 border border-slate-600/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
          <Info className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">設定情報</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">🏆</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">試合形式</span>
            <span className="text-white font-bold text-lg">
              {creationState.tableType === 'tournament' ? 'トーナメント戦' : 'リーグ戦'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">👥</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">参加チーム</span>
            <span className="text-white font-bold text-lg">{creationState.selectedTeams.length}チーム</span>
          </div>
        </div>
        
        {creationState.tableType === 'league' && (
          <>
            <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🔀</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">グループ数</span>
                <span className="text-white font-bold text-lg">{creationState.settings.numGroups}グループ</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🏆</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">決勝ラウンド</span>
                <span className="text-white font-bold text-lg">
                  {creationState.settings.hasFinalRound ? 'あり' : 'なし'}
                </span>
              </div>
            </div>
            
            {creationState.settings.hasFinalRound && (
              <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⚔️</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">決勝形式</span>
                  <span className="text-white font-bold text-lg">
                    {creationState.settings.finalRoundType === 'league' ? 'リーグ戦' : 'トーナメント戦'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        
        {creationState.tableType === 'tournament' && (
          <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">⭐</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">シードチーム</span>
              <span className="text-white font-bold text-lg">{creationState.settings.seedTeamIds.length}チーム</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">🏟️</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">コート数</span>
            <span className="text-white font-bold text-lg">{creationState.settings.numberOfCourts}コート</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">🕐</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">開始時間</span>
            <span className="text-white font-bold text-lg">{creationState.settings.eventStartTime}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">⚽</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">試合時間</span>
            <span className="text-white font-bold text-lg">{creationState.settings.matchDurationInMinutes}分</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">☕</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">休憩時間</span>
            <span className="text-white font-bold text-lg">{creationState.settings.restTimeInMinutes}分</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          戻る
        </button>
        <h1 className="text-2xl font-bold">表作成</h1>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto">
        {/* ステップインジケーター */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['type', 'teams', 'settings', 'preview'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  creationState.currentStep === step 
                    ? 'bg-sky-500 text-white' 
                    : index < ['type', 'teams', 'settings', 'preview'].indexOf(creationState.currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < ['type', 'teams', 'settings', 'preview'].indexOf(creationState.currentStep)
                      ? 'bg-green-500'
                      : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ステップ内容 */}
        {creationState.currentStep === 'type' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-8">表の種類を選択してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleSelectTableType('tournament')}
                className="p-8 border-2 border-slate-600 rounded-xl hover:border-sky-500 transition-colors text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Trophy className="h-12 w-12 text-yellow-500 group-hover:text-yellow-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">トーナメント表</h3>
                    <p className="text-slate-400">勝ち抜き戦形式の表を作成</p>
                  </div>
                </div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• シングルエリミネーション</li>
                  <li>• シードチーム設定可能</li>
                  <li>• 自動スケジュール機能</li>
                </ul>
              </button>

              <button
                onClick={() => handleSelectTableType('league')}
                className="p-8 border-2 border-slate-600 rounded-xl hover:border-sky-500 transition-colors text-left group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Users className="h-12 w-12 text-blue-500 group-hover:text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">リーグ表</h3>
                    <p className="text-slate-400">総当たり戦形式の表を作成</p>
                  </div>
                </div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• グループ分け可能</li>
                  <li>• 順位表自動生成</li>
                  <li>• 試合スケジュール自動生成</li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {creationState.currentStep === 'teams' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-8">参加チームを選択してください</h2>
            
            {/* デバッグ情報 */}
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
              <div className="text-sm text-yellow-300">
                <p>現在の状態:</p>
                <p>• 試合形式: {creationState.tableType || '未選択'}</p>
                <p>• 選択されたチーム: {creationState.selectedTeams.length}チーム</p>
                {creationState.selectedTeams.length > 0 && (
                  <p>• チーム名: {creationState.selectedTeams.map(t => t.name).join(', ')}</p>
                )}
              </div>
            </div>
            
            {/* 説明文 */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                <span className="text-sm font-medium text-sky-300">
                  {creationState.tableType === 'tournament' ? 'トーナメント戦' : 'リーグ戦'}の参加チームを選択
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {creationState.tableType === 'tournament' 
                  ? 'シードチームは次のステップで設定できます。'
                  : '選択したチームは自動的にグループに振り分けられます。'
                }
              </p>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => {
                  const isSelected = creationState.selectedTeams.some(t => t.id === team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelection(team, !isSelected)}
                      className={`p-4 border-2 rounded-lg transition-colors text-left ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <h4 className="font-semibold text-white mb-1">{team.name}</h4>
                      <p className="text-sm text-slate-400">{team.prefecture} {team.city}</p>
                      <p className="text-xs text-slate-500 mt-1">{team.members?.length || 0}名</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-slate-400">
                  選択済み: {creationState.selectedTeams.length}チーム
                </p>
                {creationState.selectedTeams.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    最小2チーム必要
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {creationState.currentStep === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-8">設定を入力してください</h2>
            
            {/* デバッグ情報 */}
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
              <div className="text-sm text-red-300">
                <p><strong>デバッグ情報 (設定ステップ):</strong></p>
                <p>• 現在のステップ: {creationState.currentStep}</p>
                <p>• 試合形式: {creationState.tableType || 'null (未選択)'}</p>
                <p>• 選択されたチーム: {creationState.selectedTeams.length}チーム</p>
                {creationState.selectedTeams.length > 0 && (
                  <p>• チーム名: {creationState.selectedTeams.map(t => t.name).join(', ')}</p>
                )}
                <p>• グループ数: {creationState.settings.numGroups}</p>
                <p>• コート数: {creationState.settings.numberOfCourts}</p>
                <p>• 試合時間: {creationState.settings.matchDurationInMinutes}分</p>
                <p>• 休憩時間: {creationState.settings.restTimeInMinutes}分</p>
              </div>
            </div>
            
            {/* 設定情報の表示 */}
            <SettingsInfo />
            
            {/* リーグ戦の説明 */}
            {creationState.tableType === 'league' && (
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-300">リーグ戦の設定</span>
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>• 選択した{creationState.selectedTeams.length}チームが自動的にグループに振り分けられます</p>
                  <p>• 各グループ内で総当たり戦を行います</p>
                  <p>• 順位表と試合スケジュールが自動生成されます</p>
                </div>
              </div>
            )}
            
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creationState.tableType === 'league' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">グループ数</label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCreationState(prev => ({
                              ...prev,
                              settings: { 
                                ...prev.settings, 
                                numGroups: Math.max(1, prev.settings.numGroups - 1)
                              }
                            }))}
                            disabled={creationState.settings.numGroups <= 1}
                            className="w-10 h-10 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="text-2xl font-bold text-sky-400 w-16 text-center">
                            {creationState.settings.numGroups}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCreationState(prev => ({
                              ...prev,
                              settings: { 
                                ...prev.settings, 
                                numGroups: Math.min(creationState.selectedTeams.length, prev.settings.numGroups + 1)
                              }
                            }))}
                            disabled={creationState.settings.numGroups >= creationState.selectedTeams.length}
                            className="w-10 h-10 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-xl font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* 詳細情報表示 */}
                        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-400">推奨グループ数:</span>
                              <span className="text-sky-300 font-medium ml-2">
                                {Math.min(4, Math.ceil(creationState.selectedTeams.length / 4))}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">1グループあたり:</span>
                              <span className="text-emerald-300 font-medium ml-2">
                                {Math.ceil(creationState.selectedTeams.length / creationState.settings.numGroups)}チーム
                              </span>
                            </div>
                          </div>
                          
                          {/* グループ配分の可視化 */}
                          {creationState.settings.numGroups > 1 && (
                            <div className="mt-3 pt-3 border-t border-slate-600/50">
                              <span className="text-slate-400 text-xs">グループ配分:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Array.from({ length: creationState.settings.numGroups }, (_, i) => {
                                  const teamsInGroup = Math.ceil(creationState.selectedTeams.length / creationState.settings.numGroups);
                                  const isLastGroup = i === creationState.settings.numGroups - 1;
                                  const actualTeamsInGroup = isLastGroup 
                                    ? creationState.selectedTeams.length - (teamsInGroup * (creationState.settings.numGroups - 1))
                                    : teamsInGroup;
                                  
                                  return (
                                    <div
                                      key={i}
                                      className="px-2 py-1 bg-slate-600 rounded text-xs text-white font-medium"
                                      title={`グループ${i + 1}: ${actualTeamsInGroup}チーム`}
                                    >
                                      G{i + 1}: {actualTeamsInGroup}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* バリデーション警告 */}
                        {creationState.settings.numGroups > 1 && 
                         Math.ceil(creationState.selectedTeams.length / creationState.settings.numGroups) < 2 && (
                          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-2">
                            <p className="text-xs text-red-300">
                              ⚠️ グループ数が多すぎます。各グループに最低2チーム必要です。
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">グループ突破チーム数</label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          min="1"
                          max={Math.min(4, Math.ceil(creationState.selectedTeams.length / creationState.settings.numGroups))}
                          value={creationState.settings.advanceTeamsPerGroup}
                          onChange={(e) => setCreationState(prev => ({
                            ...prev,
                            settings: { ...prev.settings, advanceTeamsPerGroup: parseInt(e.target.value) || 1 }
                          }))}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                        <p className="text-xs text-slate-400">
                          各グループから何チームが決勝ラウンドに進出するか
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">決勝ラウンドの設定</label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={creationState.settings.hasFinalRound}
                              onChange={(e) => setCreationState(prev => ({
                                ...prev,
                                settings: { ...prev.settings, hasFinalRound: e.target.checked }
                              }))}
                              className="w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300">決勝ラウンドを開催する</span>
                          </label>
                        </div>
                        
                        {creationState.settings.hasFinalRound && (
                          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                            <label className="block text-sm font-medium text-slate-300 mb-3">決勝ラウンドの形式</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="finalRoundType"
                                  value="league"
                                  checked={creationState.settings.finalRoundType === 'league'}
                                  onChange={(e) => setCreationState(prev => ({
                                    ...prev,
                                    settings: { ...prev.settings, finalRoundType: e.target.value as 'league' | 'tournament' }
                                  }))}
                                  className="w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 focus:ring-sky-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-300">リーグ戦</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="finalRoundType"
                                  value="tournament"
                                  checked={creationState.settings.finalRoundType === 'tournament'}
                                  onChange={(e) => setCreationState(prev => ({
                                    ...prev,
                                    settings: { ...prev.settings, finalRoundType: e.target.value as 'league' | 'tournament' }
                                  }))}
                                  className="w-4 h-4 text-sky-500 bg-slate-700 border-slate-600 focus:ring-sky-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-300">トーナメント戦</span>
                              </label>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              予選リーグ突破後、{creationState.settings.advanceTeamsPerGroup * creationState.settings.numGroups}チームで決勝ラウンドを開催
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {creationState.tableType === 'tournament' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">シードチーム選択</label>
                    <div className="bg-slate-700 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {creationState.selectedTeams.map((team, index) => {
                          const isSeed = creationState.settings.seedTeamIds.includes(team.id);
                          return (
                            <button
                              key={team.id}
                              onClick={() => {
                                const newSeedIds = isSeed
                                  ? creationState.settings.seedTeamIds.filter(id => id !== team.id)
                                  : [...creationState.settings.seedTeamIds, team.id];
                                setCreationState(prev => ({
                                  ...prev,
                                  settings: { ...prev.settings, seedTeamIds: newSeedIds }
                                }));
                              }}
                              className={`p-2 border-2 rounded-lg transition-colors text-left text-sm ${
                                isSeed
                                  ? 'border-yellow-500 bg-yellow-500/20'
                                  : 'border-slate-600 hover:border-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                  isSeed ? 'bg-yellow-500 text-white' : 'bg-slate-600'
                                }`}>
                                  {isSeed ? '✓' : index + 1}
                                </span>
                                <span className="font-medium">{team.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      シードチーム数: {creationState.settings.seedTeamIds.length}チーム
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">コート数</label>
                  <input
                    type="number"
                    min="1"
                    value={creationState.settings.numberOfCourts}
                    onChange={(e) => setCreationState(prev => ({
                      ...prev,
                      settings: { ...prev.settings, numberOfCourts: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">開始時間</label>
                  <input
                    type="time"
                    value={creationState.settings.eventStartTime}
                    onChange={(e) => setCreationState(prev => ({
                      ...prev,
                      settings: { ...prev.settings, eventStartTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">試合時間（分）</label>
                  <input
                    type="number"
                    min="30"
                    max="120"
                    value={creationState.settings.matchDurationInMinutes}
                    onChange={(e) => setCreationState(prev => ({
                      ...prev,
                      settings: { ...prev.settings, matchDurationInMinutes: parseInt(e.target.value) || 90 }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">休憩時間（分）</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={creationState.settings.restTimeInMinutes}
                    onChange={(e) => setCreationState(prev => ({
                      ...prev,
                      settings: { ...prev.settings, restTimeInMinutes: parseInt(e.target.value) || 15 }
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
            
            {/* 対戦表のプレビュー */}
            {creationState.generatedTable && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-sky-300">対戦表プレビュー</h3>
                <div className="bg-slate-800 rounded-lg p-6">
                  {creationState.tableType === 'tournament' && creationState.generatedTable && 'rounds' in creationState.generatedTable && (
                    <BracketView 
                      bracket={creationState.generatedTable as TournamentBracket}
                      isEditing={false}
                      firstTeamToSwapId={null}
                      onSelectTeamForSwap={() => {}}
                    />
                  )}
                  {creationState.tableType === 'league' && creationState.generatedTable && 'groups' in creationState.generatedTable && (
                    <LeagueTableView 
                      leagueTable={creationState.generatedTable as LeagueTable}
                      isEditing={false}
                    />
                  )}
                </div>
              </div>
            )}
            
            {/* 対戦表生成ボタン */}
            <div className="flex justify-center">
              <button
                onClick={generateTable}
                className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium"
              >
                対戦表を再生成
              </button>
            </div>
          </div>
        )}

        {creationState.currentStep === 'preview' && creationState.generatedTable && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-8">作成された表</h2>
            
            {/* 設定情報の表示 */}
            <SettingsInfo />
            
            {/* アクションボタン */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                HTMLダウンロード
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Printer className="h-5 w-5" />
                印刷
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Share2 className="h-5 w-5" />
                共有
              </button>
            </div>

            {/* 表の表示 */}
            <div className="bg-slate-800 rounded-lg p-6">
              {creationState.tableType === 'tournament' && creationState.generatedTable && 'rounds' in creationState.generatedTable && (
                <BracketView 
                  bracket={creationState.generatedTable as TournamentBracket}
                  isEditing={false}
                  firstTeamToSwapId={null}
                  onSelectTeamForSwap={() => {}}
                />
              )}
              {creationState.tableType === 'league' && creationState.generatedTable && 'groups' in creationState.generatedTable && (
                <LeagueTableView 
                  leagueTable={creationState.generatedTable as LeagueTable}
                  isEditing={false}
                />
              )}
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousStep}
            disabled={creationState.currentStep === 'type'}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
          >
            戻る
          </button>
          <div className="flex gap-4">
            {creationState.currentStep === 'preview' && (
              <button
                onClick={resetCreation}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                新規作成
              </button>
            )}
            {creationState.currentStep !== 'preview' && (
              <button
                onClick={handleNextStep}
                disabled={creationState.currentStep === 'teams' && creationState.selectedTeams.length < 2}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCreationPage; 