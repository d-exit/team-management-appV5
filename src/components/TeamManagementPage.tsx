
import React, { useState, useCallback, useMemo } from 'react';
import { Team, Member, TeamLevel, PastMatchResult, Match, LeagueMatch, BracketMatch, MatchScoringEvent, FollowedTeam } from '../types';
import { deepClone } from '../utils/deepClone';
import { MemberManagement } from './team/MemberManagement';
import FollowedTeamsPage from './FollowedTeamsPage';
import { AGE_CATEGORIES } from '@/types/index';

interface TeamManagementPageProps {
  team: Team; // The team to manage/edit
  onUpdateTeam: (updatedTeam: Team) => void;
  pastMatchResults: PastMatchResult[];
  allTeams: Team[];
  matches: Match[]; // To display scoring log
  followedTeams: FollowedTeam[];
  onSelectTeam: (team: Team) => void;
  onToggleFavorite: (teamId: string) => void;
  onUnfollow: (team: Team) => void;
}

// ver4 InputField: ラベル付きinput/select/textareaの共通コンポーネント
const InputField: React.FC<{
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
}> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  readOnly = false,
  options
}) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    {type === 'select' && options ? (
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500"
        disabled={readOnly}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500"
        readOnly={readOnly}
      ></textarea>
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={`w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500 ${readOnly ? 'text-slate-400 cursor-not-allowed' : ''}`}
      />
    )}
  </div>
);

const RankItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
  <div className={`flex justify-between items-baseline mb-2 ${className}`}>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-lg font-bold text-sky-300">{value}</p>
  </div>
);

const TeamManagementPage: React.FC<TeamManagementPageProps> = ({ team, onUpdateTeam, pastMatchResults, allTeams, matches, followedTeams, onSelectTeam, onToggleFavorite, onUnfollow }) => {
  // 管理者チームの制限: admin1@example.comの場合はサンプルチーム６のみ表示
  // このロジックは本来App.tsxやTeamSelectionPage.tsxで管理されるべきですが、
  // TeamManagementPage.tsxで直接制限する場合は以下のようにフィルタリング可能
  // ただし、propsで渡されるteamが既にフィルタ済みであることが望ましい
  // ここでは念のため表示制限の例を記載
  // 例: admin1@example.com でログインしている場合のみ team.id !== 'sample-team-6' なら return null
  // ただし、propsで渡されるteamが 'サンプルチーム６' であることを前提とする
  // 何も表示しない場合は return null
  //
  // もし team.ownerEmail === 'admin1@example.com' かつ team.name !== 'サンプルチーム６' なら return null
  if (team && team.ownerEmail === 'admin1@example.com' && team.name !== 'サンプルチーム６') {
    return null;
  }
  const [editableTeam, setEditableTeam] = useState<Team>(() => deepClone(team));
  const [logoPreview, setLogoPreview] = useState<string | null>(team.logoUrl);
  const [editMode, setEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // 管理・編集メンバー（アカウント保有者）
  const [staffMembers, setStaffMembers] = useState<Member[]>([...(team.staffMembers || [])]);

  const { prefectureRank, ageCategoryRank, overallRank } = useMemo(() => {
    const calculateRank = (teamsToRank: Team[], currentTeamId: string) => {
        const sorted = [...teamsToRank].sort((a, b) => b.rating - a.rating);
        const rank = sorted.findIndex(t => t.id === currentTeamId) + 1;
        return rank > 0 ? `${rank}位 / ${sorted.length}チーム中` : 'ランク外';
    };

    const overall = calculateRank(allTeams, team.id);
    
    const prefectureTeams = team.prefecture ? allTeams.filter(t => t.prefecture === team.prefecture) : [];
    const prefecture = team.prefecture ? calculateRank(prefectureTeams, team.id) : '未設定';

    const ageCategoryTeams = team.ageCategory ? allTeams.filter(t => t.ageCategory === team.ageCategory) : [];
    const ageCategory = team.ageCategory ? calculateRank(ageCategoryTeams, team.id) : '未設定';

    return {
        prefectureRank: prefecture,
        ageCategoryRank: ageCategory,
        overallRank: overall,
    };
  }, [allTeams, team]);

  const scoringLog = useMemo(() => {
    const allEvents: Array<{
      match: Match,
      subMatch?: LeagueMatch | BracketMatch,
      event: MatchScoringEvent & { opponentName?: string }
    }> = [];

    if (!matches) return [];

    matches.forEach(match => {
      // Only check matches our team is in
      const isParticipant = match.ourTeamId === team.id || 
                            match.opponentTeamId === team.id ||
                            match.bracketData?.teams.some(t => t.id === team.id) ||
                            match.leagueCompetitionData?.preliminaryRound.groups.some(g => g.teams.some(ts => ts.team.id === team.id));

      if (!isParticipant) return;

      const getOpponentName = (subMatch?: LeagueMatch | BracketMatch): string => {
        if (!subMatch) { // Training match case
          const opponentId = match.ourTeamId === team.id ? match.opponentTeamId : match.ourTeamId;
          return match.opponentTeamName || allTeams.find(t => t.id === opponentId)?.name || '不明';
        }
        if ('team1Id' in subMatch) { // LeagueMatch
          const opponentId = subMatch.team1Id === team.id ? subMatch.team2Id : subMatch.team1Id;
          return allTeams.find(t => t.id === opponentId)?.name || '不明';
        }
        if ('team1' in subMatch) { // BracketMatch
          if (!subMatch.team1 || !subMatch.team2) return '未定';
          const opponent = subMatch.team1.id === team.id ? subMatch.team2 : subMatch.team1;
          return opponent.name || '不明';
        }
        return '不明';
      };

      (match.scoringEvents || []).forEach(event => {
        // Only show events for our team
        if (event.teamId === team.id) {
          let subMatch: LeagueMatch | BracketMatch | undefined;
          if (event.subMatchId) {
            if (match.leagueCompetitionData) {
              subMatch = match.leagueCompetitionData.preliminaryRound.groups.flatMap(g => g.matches).find(m => m.id === event.subMatchId)
                      || match.leagueCompetitionData.finalRoundLeague?.groups.flatMap(g => g.matches).find(m => m.id === event.subMatchId);
            }
            if (!subMatch && (match.bracketData || match.leagueCompetitionData?.finalRoundTournament)) {
              const bracket = match.bracketData || match.leagueCompetitionData!.finalRoundTournament;
              subMatch = bracket?.rounds.flatMap(r => r.matches).find(m => m.id === event.subMatchId);
            }
          }

          allEvents.push({
            match,
            subMatch,
            event: {
              ...event,
              opponentName: getOpponentName(subMatch)
            }
          });
        }
      });

      // 新しい試合作成システムのrecords.goalsからも得点記録を抽出
      if (match.records?.results) {
        match.records.results.forEach(result => {
          if (result.goals) {
            result.goals.forEach(goal => {
              // 自チームの得点のみ表示
              if (match.ourTeamId === team.id) {
                allEvents.push({
                  match,
                  event: {
                    id: goal.id,
                    teamId: team.id,
                    scorerName: goal.scorerName,
                    period: goal.period,
                    minute: goal.minute || 0,
                    assistName: goal.assistName,
                    opponentName: match.opponentTeamName || allTeams.find(t => t.id === match.opponentTeamId)?.name || '不明'
                  }
                });
              }
            });
          }
        });
      }
    });

    return allEvents.sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime());
  }, [matches, team.id, allTeams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableTeam(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setLogoPreview(result);
            setEditableTeam(prev => ({ ...prev, logoUrl: result }));
        };
        reader.readAsDataURL(file);
    } else {
        alert('画像ファイルを選択してください。');
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
          setIsDragging(true);
      } else if (e.type === 'dragleave') {
          setIsDragging(false);
      }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileChange(e.dataTransfer.files[0]);
      }
  };

  // メンバー管理のハンドラー
  const handleAddMember = useCallback((member: Omit<Member, 'id'>) => {
    setEditableTeam(prev => ({
      ...prev,
      members: [...prev.members, { ...member, id: `member-${Date.now()}` }]
    }));
  }, []);

  const handleUpdateMember = useCallback((memberId: string, updates: Partial<Member>) => {
    setEditableTeam(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === memberId ? { ...member, ...updates } : member
      )
    }));
  }, []);

  const handleRemoveMember = useCallback((memberId: string) => {
    setEditableTeam(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  }, []);

  const handleInviteMember = useCallback((email: string) => {
    // メール招待の処理
    console.log('メール招待:', email);
    alert(`${email} に招待メールを送信しました。`);
  }, []);

  // スタッフ（管理・編集メンバー）招待
  // スタッフ（管理・編集メンバー）招待: メールアドレスのみ
  const addStaffMember = useCallback(() => {
    setStaffMembers(prev => ([...prev, { 
      id: `staff-${Date.now()}`, 
      name: '', 
      jerseyNumber: 0, 
      position: '', 
      positions: [], 
      email: '', 
      invited: false, 
      approved: false 
    }]));
  }, []);
  const removeStaffMember = useCallback((index: number) => {
    setStaffMembers(prev => prev.filter((_, i) => i !== index));
  }, []);
  const handleStaffEmailChange = useCallback((index: number, value: string) => {
    setStaffMembers(prev => {
      const newStaff = [...prev];
      newStaff[index].email = value;
      return newStaff;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // スタッフ情報をeditableTeamに反映
    const updatedTeam = { ...editableTeam, staffMembers };
    onUpdateTeam(updatedTeam);
    setEditMode(false);
    alert('チーム情報が更新されました。');
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditableTeam(deepClone(team));
    setLogoPreview(team.logoUrl);
  };
  
  const teamLevelOptions = Object.values(TeamLevel).map(level => ({ value: level, label: level }));
  
  // 年齢カテゴリのオプションを修正
  const ageCategoryOptions: { value: string; label: string }[] = [
    { value: '', label: '未設定' },
    ...Object.entries(AGE_CATEGORIES).map(([key, value]) => ({
      value: key,
      label: value.label
    }))
  ];

  // 都道府県リスト
  const prefectureOptions: { value: string; label: string }[] = [
    { value: '', label: '未設定' },
    { value: '北海道', label: '北海道' },
    { value: '青森県', label: '青森県' },
    { value: '岩手県', label: '岩手県' },
    { value: '宮城県', label: '宮城県' },
    { value: '秋田県', label: '秋田県' },
    { value: '山形県', label: '山形県' },
    { value: '福島県', label: '福島県' },
    { value: '茨城県', label: '茨城県' },
    { value: '栃木県', label: '栃木県' },
    { value: '群馬県', label: '群馬県' },
    { value: '埼玉県', label: '埼玉県' },
    { value: '千葉県', label: '千葉県' },
    { value: '東京都', label: '東京都' },
    { value: '神奈川県', label: '神奈川県' },
    { value: '新潟県', label: '新潟県' },
    { value: '富山県', label: '富山県' },
    { value: '石川県', label: '石川県' },
    { value: '福井県', label: '福井県' },
    { value: '山梨県', label: '山梨県' },
    { value: '長野県', label: '長野県' },
    { value: '岐阜県', label: '岐阜県' },
    { value: '静岡県', label: '静岡県' },
    { value: '愛知県', label: '愛知県' },
    { value: '三重県', label: '三重県' },
    { value: '滋賀県', label: '滋賀県' },
    { value: '京都府', label: '京都府' },
    { value: '大阪府', label: '大阪府' },
    { value: '兵庫県', label: '兵庫県' },
    { value: '奈良県', label: '奈良県' },
    { value: '和歌山県', label: '和歌山県' },
    { value: '鳥取県', label: '鳥取県' },
    { value: '島根県', label: '島根県' },
    { value: '岡山県', label: '岡山県' },
    { value: '広島県', label: '広島県' },
    { value: '山口県', label: '山口県' },
    { value: '徳島県', label: '徳島県' },
    { value: '香川県', label: '香川県' },
    { value: '愛媛県', label: '愛媛県' },
    { value: '高知県', label: '高知県' },
    { value: '福岡県', label: '福岡県' },
    { value: '佐賀県', label: '佐賀県' },
    { value: '長崎県', label: '長崎県' },
    { value: '熊本県', label: '熊本県' },
    { value: '大分県', label: '大分県' },
    { value: '宮崎県', label: '宮崎県' },
    { value: '鹿児島県', label: '鹿児島県' },
    { value: '沖縄県', label: '沖縄県' },
  ];

  // 市区町村データ（例: 東京都・大阪府のみ。必要に応じて拡張してください）
  const cityMap: { [pref: string]: { value: string; label: string }[] } = {
    '東京都': [
      { value: '', label: '未設定' },
      { value: '千代田区', label: '千代田区' },
      { value: '中央区', label: '中央区' },
      { value: '港区', label: '港区' },
      { value: '新宿区', label: '新宿区' },
      { value: '文京区', label: '文京区' },
      { value: '台東区', label: '台東区' },
      { value: '墨田区', label: '墨田区' },
      { value: '江東区', label: '江東区' },
      { value: '品川区', label: '品川区' },
      { value: '目黒区', label: '目黒区' },
      { value: '大田区', label: '大田区' },
      { value: '世田谷区', label: '世田谷区' },
      { value: '渋谷区', label: '渋谷区' },
      { value: '中野区', label: '中野区' },
      { value: '杉並区', label: '杉並区' },
      { value: '豊島区', label: '豊島区' },
      { value: '北区', label: '北区' },
      { value: '荒川区', label: '荒川区' },
      { value: '板橋区', label: '板橋区' },
      { value: '練馬区', label: '練馬区' },
      { value: '足立区', label: '足立区' },
      { value: '葛飾区', label: '葛飾区' },
      { value: '江戸川区', label: '江戸川区' },
      // ... 必要に応じて追加
    ],
    '大阪府': [
      { value: '', label: '未設定' },
      { value: '大阪市', label: '大阪市' },
      { value: '堺市', label: '堺市' },
      { value: '東大阪市', label: '東大阪市' },
      { value: '枚方市', label: '枚方市' },
      { value: '豊中市', label: '豊中市' },
      { value: '吹田市', label: '吹田市' },
      { value: '高槻市', label: '高槻市' },
      { value: '茨木市', label: '茨木市' },
      { value: '八尾市', label: '八尾市' },
      { value: '寝屋川市', label: '寝屋川市' },
      // ... 必要に応じて追加
    ],
    // 他の都道府県も必要に応じて追加
  };

  // 市区町村選択肢（都道府県が複数選択の場合も対応）
  const getCityOptions = (pref: string) => {
    if (!pref || !cityMap[pref]) {
      return [{ value: '', label: '未設定' }];
    }
    return cityMap[pref];
  };

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h2 className="text-3xl font-semibold text-sky-300">自チーム管理</h2>
      </div>
      {!editMode && (
        <div className="flex justify-start mb-4">
          <button
            onClick={() => { setEditableTeam(deepClone(team)); setLogoPreview(team.logoUrl); setEditMode(true); }}
            className="px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-md font-medium transition-colors bg-sky-500 hover:bg-sky-600 text-white shadow-lg"
          >
            <span className="inline-block align-middle mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.5 1.5 1.5-4.5 12.362-12.726z" />
              </svg>
            </span>
            プロフィール編集
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">基本情報</h3>
            <InputField label="チーム名" name="name" value={editableTeam.name} onChange={handleChange} required readOnly={!editMode} />
            <InputField label="コーチ名" name="coachName" value={editableTeam.coachName} onChange={handleChange} required readOnly={!editMode} />
            <InputField label="HP URL" name="websiteUrl" value={editableTeam.websiteUrl} onChange={handleChange} type="url" placeholder="https://example.com" readOnly={!editMode} />
            <InputField label="レベル" name="level" value={editableTeam.level} onChange={handleChange} type="select" options={teamLevelOptions} required readOnly={!editMode}/>
            <InputField label="年齢カテゴリ" name="ageCategory" value={editableTeam.ageCategory} onChange={handleChange} type="select" options={ageCategoryOptions} readOnly={!editMode} />
            {/* 都道府県: プルダウン選択式に戻す */}
            <InputField
              label="都道府県"
              name="prefecture"
              value={typeof editableTeam.prefecture === 'string' ? editableTeam.prefecture : (Array.isArray(editableTeam.prefecture) ? editableTeam.prefecture[0] || '' : '')}
              onChange={e => {
                const value = e.target.value;
                setEditableTeam(prev => {
                  // 都道府県変更時、市区町村もリセット
                  return { ...prev, prefecture: value, city: '' };
                });
              }}
              type="select"
              options={prefectureOptions}
              readOnly={!editMode}
            />
            {/* 市区町村: 都道府県が選択されている場合のみプルダウン表示 */}
            {(() => {
              const pref = typeof editableTeam.prefecture === 'string' ? editableTeam.prefecture : (Array.isArray(editableTeam.prefecture) ? editableTeam.prefecture[0] || '' : '');
              if (!pref || pref === '') return null;
              const cityOptions = getCityOptions(pref);
              return (
                <InputField
                  label={`市区町村（${pref}）`}
                  name="city"
                  value={typeof editableTeam.city === 'string' ? editableTeam.city : ''}
                  onChange={e => {
                    const value = e.target.value;
                    setEditableTeam(prev => ({ ...prev, city: value }));
                  }}
                  type="select"
                  options={cityOptions}
                  readOnly={!editMode}
                />
              );
            })()}
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">ロゴ</h3>
            {editMode ? (
              <div
                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors ${isDragging ? 'border-sky-400' : 'border-slate-600'}`}
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                onDrop={handleDrop}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="ロゴプレビュー" className="object-contain h-full w-full rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <svg className="w-8 h-8 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">クリック</span>またはドラッグ&ドロップ</p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF</p>
                  </div>
                )}
                {/* カメラボタン */}
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="absolute bottom-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg flex items-center justify-center border border-slate-300"
                  style={{ width: 40, height: 40 }}
                  tabIndex={-1}
                  aria-label="ロゴ画像を変更"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#0ea5e9" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0 0 13.5 4.5h-3A2.25 2.25 0 0 0 8.25 6.75v3.75m-3 0h13.5m-13.5 0A2.25 2.25 0 0 0 3 12.75v6A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75v-6a2.25 2.25 0 0 0-2.25-2.25m-13.5 0L7.5 6.75m9 0l2.25 3.75" />
                  </svg>
                </button>
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)}
                />
              </div>
            ) : (
              <div className="w-full h-40 flex items-center justify-center">
                <img src={team.logoUrl} alt={`${team.name} ロゴ`} className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <h3 className="text-xl font-semibold text-sky-400 mb-4">ステータス</h3>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                  <RankItem label="総合順位" value={overallRank} />
                  <RankItem label={`${team.prefecture || '都道府県'}内順位`} value={prefectureRank} />
                  <RankItem label={`${team.ageCategory || 'カテゴリ'}内順位`} value={ageCategoryRank} />
                  <RankItem label="レーティング" value={editableTeam.rating} />
              </div>
            </div>
            <div>
              <InputField label="チーム紹介" name="description" value={editableTeam.description} onChange={handleChange} type="textarea" placeholder="チームの紹介文を入力..." readOnly={!editMode} />
            </div>
        </div>

        {editMode && (
          <div className="pt-6 border-t border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">管理・編集メンバー（コーチ・監督等）招待</h3>
            {staffMembers.map((member, index) => (
              <div key={member.id || index} className="flex flex-col sm:flex-row gap-2 mb-3 p-3 border border-slate-700 rounded-md items-center">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={member.email || ''}
                  onChange={e => handleStaffEmailChange(index, e.target.value)}
                  className="bg-slate-700 p-2 rounded-md flex-1"
                  disabled={member.approved}
                />
                <div className="flex flex-col gap-1 items-center min-w-[120px]">
                  {member.invited && !member.approved && (
                    <span className="text-yellow-400 text-xs">招待中（承認は招待された側のみ可能）</span>
                  )}
                  {member.approved && (
                    <span className="text-green-400 text-xs">承認済み：{member.name ? member.name : '（未設定）'}</span>
                  )}
                </div>
                <button type="button" onClick={() => removeStaffMember(index)} className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm">削除</button>
                {!member.invited && !member.approved && (
                  <button
                    type="button"
                    onClick={() => {
                      setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, invited: true } : m));
                      alert('招待メールを送信しました。');
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-md text-sm ml-2"
                    disabled={!member.email}
                  >
                    招待
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addStaffMember} className="mt-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md">
              メンバー追加 +
            </button>
          </div>
        )}
        
        {editMode && (
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
            <button type="button" onClick={handleCancelEdit} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-lg">
              キャンセル
            </button>
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
              保存する
            </button>
          </div>
        )}
      </form>

      {/* メンバー管理コンポーネント */}
      <MemberManagement
        members={editableTeam.members}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onRemoveMember={handleRemoveMember}
        onInviteMember={handleInviteMember}
      />

      {/* Scoring Log Section */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">得点記録一覧</h3>
          {scoringLog.length > 0 ? (
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-600">
                          <tr>
                              <th className="p-2">日付</th>
                              <th className="p-2">大会/試合名</th>
                              <th className="p-2">vs</th>
                              <th className="p-2">時間</th>
                              <th className="p-2">得点者</th>
                              <th className="p-2">アシスト</th>
                          </tr>
                      </thead>
                      <tbody>
                          {scoringLog.map(({match, event}, index) => (
                              <tr key={`${match.id}-${index}`} className="border-b border-slate-700">
                                  <td className="p-2 text-slate-400">{match.date}</td>
                                  <td className="p-2 text-slate-300">{match.location}</td>
                                  <td className="p-2 text-slate-300">{event.opponentName}</td>
                                  <td className="p-2 text-slate-300">{event.period} {event.minute}分</td>
                                  <td className="p-2 font-semibold text-sky-300">{event.scorerName}</td>
                                  <td className="p-2 text-slate-400">{event.assistName || '-'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          ) : (
              <p className="text-slate-400">まだ得点記録はありません。</p>
          )}
      </div>

      {/* フォロー中のチームセクション */}
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">フォロー中のチーム</h3>
        <FollowedTeamsPage 
          followedTeams={followedTeams} 
          onSelectTeam={onSelectTeam}
          onToggleFavorite={onToggleFavorite}
          onUnfollow={onUnfollow} 
          allTeams={allTeams}
          managedTeamId={team.id}
        />
      </div>

    </div>
  );
};

export default TeamManagementPage;
