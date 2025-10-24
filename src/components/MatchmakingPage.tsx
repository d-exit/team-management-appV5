
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Users, Calendar, Award } from 'lucide-react';

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

interface MatchmakingTeam {
  id: string;
  name: string;
  logoUrl: string;
  coachName: string;
  websiteUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  ageCategory: string;
  prefecture: string;
  city?: string;
  description?: string;
  rating: number;
  overallRank: number;
  prefectureRank: number;
  availableDates: string[];
  isFollowed: boolean;
  isFavorite: boolean;
}

interface MatchmakingPageProps {
  onBack: () => void;
  onSelectTeam?: (team: MatchmakingTeam, filters: any) => void;
  onFollowTeam?: (teamId: string) => void;
  followedTeams?: { id: string; isFollowed?: boolean }[];
  matches?: any[]; // 試合データを追加
  teams?: any[]; // チームデータを追加
}

export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({ onBack, onSelectTeam, onFollowTeam, followedTeams, matches, teams: propTeams }) => {
  const [viewMode, setViewMode] = useState<'teams' | 'matches'>('teams');
  
  // モック試合データ
  const [recruitingMatches, setRecruitingMatches] = useState<MatchmakingMatch[]>([
    {
      id: 'match-1',
      name: '練習試合募集',
      date: '2024-01-15',
      time: '14:00',
      location: '市営グラウンドA',
      hostTeamId: 'team-2',
      hostTeamName: 'オーシャンズFC',
      hostTeamLevel: '中級',
      matchType: 'training',
      courtCount: 1,
      matchDuration: 90,
      breakTime: 15,
      description: '練習試合を募集しています。初心者歓迎！',
      isRecruiting: true
    },
    {
      id: 'match-2',
      name: 'リーグ戦 第3節',
      date: '2024-01-20',
      time: '10:00',
      location: 'スポーツセンター',
      hostTeamId: 'team-3',
      hostTeamName: 'マウンテンキングス',
      hostTeamLevel: '上級',
      matchType: 'league',
      courtCount: 2,
      matchDuration: 60,
      breakTime: 10,
      description: 'リーグ戦の対戦相手を募集',
      isRecruiting: true
    },
    {
      id: 'match-3',
      name: 'トーナメント予選',
      date: '2024-01-25',
      time: '09:00',
      location: '県営競技場',
      hostTeamId: 'team-4',
      hostTeamName: 'サンダーボルトFC',
      hostTeamLevel: '中級',
      matchType: 'tournament',
      courtCount: 3,
      matchDuration: 45,
      breakTime: 5,
      description: 'トーナメント予選の参加チームを募集',
      isRecruiting: true
    }
  ]);
  
  const [teams, setTeams] = useState<MatchmakingTeam[]>([
    {
      id: '1',
      name: 'FCサッカークラブ',
      logoUrl: '/api/placeholder/60/60',
      coachName: '田中コーチ',
      websiteUrl: 'https://example.com',
      level: 'intermediate',
      ageCategory: 'U12',
      prefecture: '東京都',
      city: '渋谷区',
      description: '楽しくサッカーを学ぶクラブです。',
      rating: 4.2,
      overallRank: 15,
      prefectureRank: 3,
      availableDates: ['2024-01-20', '2024-01-27', '2024-02-03'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '2',
      name: 'ジュニアサッカーチーム',
      logoUrl: '/api/placeholder/60/60',
      coachName: '佐藤コーチ',
      level: 'advanced',
      ageCategory: 'U11',
      prefecture: '神奈川県',
      city: '横浜市',
      description: '技術向上を重視したクラブです。',
      rating: 4.5,
      overallRank: 8,
      prefectureRank: 1,
      availableDates: ['2024-01-21', '2024-01-28'],
      isFollowed: true,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'スカイウィングスFC',
      logoUrl: '/api/placeholder/60/60',
      coachName: '山田コーチ',
      level: 'beginner',
      ageCategory: 'U10',
      prefecture: '大阪府',
      city: '大阪市',
      description: '基礎から丁寧に指導します。',
      rating: 3.8,
      overallRank: 25,
      prefectureRank: 5,
      availableDates: ['2024-01-22', '2024-01-29'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '4',
      name: 'オーシャンズFC',
      logoUrl: '/api/placeholder/60/60',
      coachName: '鈴木コーチ',
      level: 'intermediate',
      ageCategory: 'U12',
      prefecture: '千葉県',
      city: '千葉市',
      description: 'チームワークを重視したクラブです。',
      rating: 4.1,
      overallRank: 12,
      prefectureRank: 2,
      availableDates: ['2024-01-23', '2024-01-30'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '5',
      name: 'マウンテンキングス',
      logoUrl: '/api/placeholder/60/60',
      coachName: '高橋コーチ',
      level: 'advanced',
      ageCategory: 'U11',
      prefecture: '埼玉県',
      city: 'さいたま市',
      description: '強豪チームを目指しています。',
      rating: 4.7,
      overallRank: 5,
      prefectureRank: 1,
      availableDates: ['2024-01-24', '2024-01-31'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '6',
      name: 'サンダーボルトFC',
      logoUrl: '/api/placeholder/60/60',
      coachName: '伊藤コーチ',
      level: 'beginner',
      ageCategory: 'U9',
      prefecture: '愛知県',
      city: '名古屋市',
      description: '楽しみながら技術を身につけます。',
      rating: 3.9,
      overallRank: 22,
      prefectureRank: 4,
      availableDates: ['2024-01-25', '2024-02-01'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '7',
      name: 'ファイヤーフォックス',
      logoUrl: '/api/placeholder/60/60',
      coachName: '渡辺コーチ',
      level: 'intermediate',
      ageCategory: 'U10',
      prefecture: '福岡県',
      city: '福岡市',
      description: 'スピードとテクニックを重視。',
      rating: 4.3,
      overallRank: 10,
      prefectureRank: 2,
      availableDates: ['2024-01-26', '2024-02-02'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '8',
      name: 'アイスウルブズ',
      logoUrl: '/api/placeholder/60/60',
      coachName: '小林コーチ',
      level: 'advanced',
      ageCategory: 'U12',
      prefecture: '北海道',
      city: '札幌市',
      description: '寒さに負けない強いチームです。',
      rating: 4.6,
      overallRank: 6,
      prefectureRank: 1,
      availableDates: ['2024-01-27', '2024-02-03'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '9',
      name: 'ストームライダーズ',
      logoUrl: '/api/placeholder/60/60',
      coachName: '加藤コーチ',
      level: 'beginner',
      ageCategory: 'U8',
      prefecture: '兵庫県',
      city: '神戸市',
      description: '元気いっぱいのチームです。',
      rating: 3.7,
      overallRank: 28,
      prefectureRank: 6,
      availableDates: ['2024-01-28', '2024-02-04'],
      isFollowed: false,
      isFavorite: false,
    },
    {
      id: '10',
      name: 'ゴールデンイーグルス',
      logoUrl: '/api/placeholder/60/60',
      coachName: '森コーチ',
      level: 'intermediate',
      ageCategory: 'U11',
      prefecture: '静岡県',
      city: '静岡市',
      description: '富士山のように高くを目指します。',
      rating: 4.0,
      overallRank: 18,
      prefectureRank: 3,
      availableDates: ['2024-01-29', '2024-02-05'],
      isFollowed: false,
      isFavorite: false,
    },
  ]);

  // followedTeamsの状態を反映
  useEffect(() => {
    if (followedTeams) {
      setTeams(prev => prev.map(team => {
        const followedTeam = followedTeams.find(ft => ft.id === team.id);
        return followedTeam ? { ...team, isFollowed: followedTeam.isFollowed || false } : team;
      }));
    }
  }, [followedTeams]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    prefecture: '',
    cities: [] as string[],
    level: '',
    ageCategory: '',
    minRating: 0,
    maxRating: 5,
    availableDate: '',
    excludeFollowed: false,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<MatchmakingTeam | null>(null);
  
  // 試合用フィルター
  const [matchSearchTerm, setMatchSearchTerm] = useState('');
  const [selectedMatchTypes, setSelectedMatchTypes] = useState<string[]>([]);
  const [selectedMatchDates, setSelectedMatchDates] = useState<string[]>([]);
  const [selectedMatchLevels, setSelectedMatchLevels] = useState<string[]>([]);
  const [selectedMatchAreas, setSelectedMatchAreas] = useState<string[]>([]);

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const levels = [
    { value: 'beginner', label: '初級' },
    { value: 'intermediate', label: '中級' },
    { value: 'advanced', label: '上級' },
  ];

  const ageCategories = [
    { value: 'U6', label: 'U6（年長）' },
    { value: 'U7', label: 'U7（1年生）' },
    { value: 'U8', label: 'U8（2年生）' },
    { value: 'U9', label: 'U9（3年生）' },
    { value: 'U10', label: 'U10（4年生）' },
    { value: 'U11', label: 'U11（5年生）' },
    { value: 'U12', label: 'U12（6年生）' },
  ];

  // 市区町村データ
  const cityMap: { [pref: string]: { value: string; label: string }[] } = {
    '東京都': [
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
    ],
    '神奈川県': [
      { value: '横浜市', label: '横浜市' },
      { value: '川崎市', label: '川崎市' },
      { value: '相模原市', label: '相模原市' },
      { value: '横須賀市', label: '横須賀市' },
      { value: '藤沢市', label: '藤沢市' },
      { value: '茅ヶ崎市', label: '茅ヶ崎市' },
      { value: '逗子市', label: '逗子市' },
      { value: '三浦市', label: '三浦市' },
      { value: '秦野市', label: '秦野市' },
      { value: '厚木市', label: '厚木市' },
      { value: '大和市', label: '大和市' },
      { value: '伊勢原市', label: '伊勢原市' },
      { value: '海老名市', label: '海老名市' },
      { value: '座間市', label: '座間市' },
      { value: '南足柄市', label: '南足柄市' },
      { value: '綾瀬市', label: '綾瀬市' },
    ],
    '大阪府': [
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
    ],
  };

  const getCityOptions = (prefecture: string) => {
    return cityMap[prefecture] || [];
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      // 検索クエリ
      if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !team.coachName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // エリアフィルター（都道府県）
      if (filters.prefecture && team.prefecture !== filters.prefecture) {
        return false;
      }

      // エリアフィルター（市区町村）
      if (filters.cities.length > 0 && team.city && !filters.cities.includes(team.city)) {
        return false;
      }

      // レベルフィルター
      if (filters.level && team.level !== filters.level) {
        return false;
      }

      // 年齢カテゴリフィルター
      if (filters.ageCategory && team.ageCategory !== filters.ageCategory) {
        return false;
      }

      // レーティングフィルター
      if (team.rating < filters.minRating || team.rating > filters.maxRating) {
        return false;
      }

      // 空き日程フィルター
      if (filters.availableDate && !team.availableDates.includes(filters.availableDate)) {
        return false;
      }

      // フォロー済み除外
      if (filters.excludeFollowed && team.isFollowed) {
        return false;
      }

      return true;
    });
  }, [teams, searchQuery, filters]);

  // 試合フィルタリング
  const filteredMatches = useMemo(() => {
    return recruitingMatches.filter(match => {
      const matchesSearch = matchSearchTerm === '' || 
        match.name.toLowerCase().includes(matchSearchTerm.toLowerCase()) ||
        match.hostTeamName.toLowerCase().includes(matchSearchTerm.toLowerCase()) ||
        match.location.toLowerCase().includes(matchSearchTerm.toLowerCase());
      
      const matchesType = selectedMatchTypes.length === 0 || 
        selectedMatchTypes.includes(match.matchType);
      
      const matchesLevel = selectedMatchLevels.length === 0 || 
        selectedMatchLevels.includes(match.hostTeamLevel);
      
      const matchesArea = selectedMatchAreas.length === 0 || 
        selectedMatchAreas.some(area => match.location.includes(area));
      
      return matchesSearch && matchesType && matchesLevel && matchesArea;
    });
  }, [recruitingMatches, matchSearchTerm, selectedMatchTypes, selectedMatchLevels, selectedMatchAreas]);

  const handleFollow = (teamId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId ? { ...team, isFollowed: !team.isFollowed } : team
    ));
    
    // App.tsxのfollowedTeams状態も更新
    if (onFollowTeam) {
      onFollowTeam(teamId);
    }
  };





  const handleViewDetails = (team: MatchmakingTeam) => {
    if (onSelectTeam) {
      // チーム詳細画面に遷移
      onSelectTeam(team, filters);
    } else {
      // フォールバック: アラート表示
      alert(`${team.name}の詳細情報を表示します。\n\nチーム名: ${team.name}\nコーチ: ${team.coachName}\nレベル: ${levels.find(l => l.value === team.level)?.label}\n年齢カテゴリ: ${team.ageCategory}\n都道府県: ${team.prefecture}\n市区町村: ${team.city || '未設定'}\nレーティング: ${team.rating * 1000}\n総合順位: #${team.overallRank}\n都道府県順位: #${team.prefectureRank}\n空き日程: ${team.availableDates.length}日\n\n説明: ${team.description || '説明なし'}`);
    }
  };



  const clearFilters = () => {
    setFilters({
      prefecture: '',
      cities: [],
      level: '',
      ageCategory: '',
      minRating: 0,
      maxRating: 5,
      availableDate: '',
      excludeFollowed: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-400 mb-2">マッチング</h1>
            <p className="text-slate-400">対戦相手を探して試合を申し込みましょう</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            戻る
          </button>
        </div>

        {/* チーム・試合選択 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setViewMode('teams')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'teams'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            チームを探す
          </button>
          <button
            onClick={() => setViewMode('matches')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'matches'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Calendar className="inline-block w-5 h-5 mr-2" />
            試合を探す
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* 検索バー */}
            <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={viewMode === 'teams' ? "チーム名やコーチ名で検索..." : "試合名やチーム名で検索..."}
                    value={viewMode === 'teams' ? searchQuery : matchSearchTerm}
                    onChange={(e) => {
                      if (viewMode === 'teams') {
                        setSearchQuery(e.target.value);
                      } else {
                        setMatchSearchTerm(e.target.value);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
            </div>
          </div>

                    {/* フィルター詳細 - 常時表示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">都道府県</label>
              <select
                value={filters.prefecture}
                onChange={(e) => {
                  const selectedPrefecture = e.target.value;
                  setFilters(prev => ({ 
                    ...prev, 
                    prefecture: selectedPrefecture,
                    cities: [] // 都道府県変更時は市区町村をリセット
                  }));
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">すべて</option>
                {prefectures.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">市区町村（複数選択可）</label>
              <div className="max-h-32 overflow-y-auto border border-slate-600 rounded-lg bg-slate-700 p-2">
                {filters.prefecture ? (
                  // 選択された都道府県の市区町村を表示
                  (() => {
                    const cityOptions = getCityOptions(filters.prefecture);
                    console.log('Selected prefecture:', filters.prefecture);
                    console.log('City options:', cityOptions);
                    return cityOptions.length > 0 ? (
                      cityOptions.map(city => (
                        <label key={city.value} className="flex items-center gap-2 p-1 hover:bg-slate-600 rounded">
                          <input
                            type="checkbox"
                            checked={filters.cities.includes(city.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, cities: [...prev.cities, city.value] }));
                              } else {
                                setFilters(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city.value) }));
                              }
                            }}
                            className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500"
                          />
                          <span className="text-sm text-white">{city.label}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 p-2">この都道府県の市区町村データがありません</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-slate-400 p-2">都道府県を選択してください</p>
                )}
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">レベル</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">すべて</option>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">年齢カテゴリ</label>
                <select
                  value={filters.ageCategory}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageCategory: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">すべて</option>
                  {ageCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">レーティング</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.minRating * 1000}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) / 1000 }))}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="最小"
                  />
                  <span className="text-slate-400 self-center">-</span>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.maxRating * 1000}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxRating: parseFloat(e.target.value) / 1000 }))}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="最大"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">空き日程</label>
                <input
                  type="date"
                  value={filters.availableDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, availableDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="excludeFollowed"
                  checked={filters.excludeFollowed}
                  onChange={(e) => setFilters(prev => ({ ...prev, excludeFollowed: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500"
                />
                <label htmlFor="excludeFollowed" className="text-sm text-slate-300">
                  フォロー済みを除外
                </label>
              </div>
            </div>

          {/* フィルタークリア */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              フィルターをクリア
            </button>
              <span className="text-sm text-slate-400">
                {viewMode === 'teams' ? filteredTeams.length : filteredMatches.length}件の{viewMode === 'teams' ? 'チーム' : '試合'}が見つかりました
              </span>
          </div>
        </div>

        {/* チーム一覧 */}
        {viewMode === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <div key={team.id} className="bg-slate-800 rounded-xl p-6 shadow-2xl hover:shadow-3xl transition-shadow">
                {/* チームヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-12 h-12 rounded-full bg-slate-600"
                    />
                    <div>
                      <h3 className="font-semibold text-white text-lg">{team.name}</h3>
                      <p className="text-sm text-slate-400">{team.coachName}</p>
                    </div>
                  </div>
                </div>

                {/* チーム情報 */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{team.prefecture} {team.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{team.ageCategory} | {levels.find(l => l.value === team.level)?.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">レーティング: {team.rating * 1000}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">空き日程: {team.availableDates.length}日</span>
                  </div>
                </div>

                {/* ランキング */}
                <div className="bg-slate-700 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">総合順位:</span>
                      <span className="text-white ml-2">#{team.overallRank}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">都道府県順位:</span>
                      <span className="text-white ml-2">#{team.prefectureRank}</span>
                    </div>
                  </div>
                </div>

                {/* 説明 */}
                {team.description && (
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">{team.description}</p>
                )}

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFollow(team.id)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm ${
                      team.isFollowed
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-slate-600 hover:bg-slate-500 text-white'
                    }`}
                  >
                    {team.isFollowed ? 'フォロー中' : 'フォロー'}
                  </button>
                  <button
                    onClick={() => handleViewDetails(team)}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
                  >
                    詳細
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 試合一覧 */}
        {viewMode === 'matches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(match => (
              <div key={match.id} className="bg-slate-800 rounded-xl p-6 shadow-2xl hover:shadow-3xl transition-shadow">
                {/* 試合ヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{match.name}</h3>
                      <p className="text-sm text-slate-400">{match.hostTeamName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.matchType === 'training' ? 'bg-green-500 text-white' :
                    match.matchType === 'league' ? 'bg-blue-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {match.matchType === 'training' ? '練習試合' :
                     match.matchType === 'league' ? 'リーグ戦' : 'トーナメント'}
                  </span>
                </div>

                {/* 試合情報 */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{match.date} {match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{match.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">主催: {match.hostTeamName} ({match.hostTeamLevel})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{match.courtCount}コート, {match.matchDuration}分</span>
                  </div>
                </div>

                {/* 説明 */}
                {match.description && (
                  <div className="mb-4">
                    <p className="text-slate-300 text-sm">{match.description}</p>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // 試合に応募する処理
                      alert(`${match.name}に応募しました！`);
                    }}
                    className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
                  >
                    応募する
                  </button>
                  <button
                    onClick={() => {
                      // 試合詳細を表示する処理
                      alert(`${match.name}の詳細を表示`);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
                  >
                    詳細
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* チームが見つからない場合 */}
        {viewMode === 'teams' && filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">チームが見つかりません</h3>
            <p className="text-slate-400">検索条件を変更してお試しください</p>
          </div>
        )}

        {/* 試合が見つからない場合 */}
        {viewMode === 'matches' && filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">試合が見つかりません</h3>
            <p className="text-slate-400">検索条件を変更してお試しください</p>
          </div>
        )}
      </div>
    </div>
  );
};
