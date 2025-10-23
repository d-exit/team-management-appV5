// data/mockData.ts
// ...ver4の正しい内容をここに挿入...
import { ChatMessage, ChatThread, Match, MatchStatus, MatchType, Member, MemberRole, PastMatchResult, ScheduleEvent, ScheduleEventType, Team, TeamLevel, Venue, ParticipantStatus, LeagueTeamStats, LeagueMatch, LeagueGroup, LeagueTable, LeagueCompetition, LeagueAdvancementRule, TournamentBracket, BracketTeam, BracketMatch, BracketRound, SubMatch, MatchScoringEvent, TournamentInfoFormData, Booking, FollowedTeam } from '../types';

// ユーザーアカウント情報
export interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor' | 'member';
  teamId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  phoneNumber?: string;
  birthDate?: string;
  position?: string;
  jerseyNumber?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalInfo?: {
    allergies: string;
    medications: string;
    conditions: string;
  };
  address?: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
  };
  // メンバー用の追加フィールド
  registrantName?: string;
  childName?: string;
  childFurigana?: string;
  childBirthDate?: string;
  childGrade?: string;
  emailSettings?: {
    announcements: boolean;
    attendance: boolean;
    payments: boolean;
    chat: boolean;
    schedule: boolean;
  };
}

export const mockUserAccounts: UserAccount[] = [
  // 管理者アカウント
  {
    id: 'admin-1',
    email: 'admin@teamapp.com',
    password: 'admin123',
    name: '田中 管理者',
    role: 'admin',
    teamId: 'team-1',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-02-15'),
  },
  {
    id: 'admin-2',
    email: 'admin2@teamapp.com',
    password: 'admin456',
    name: '佐藤 管理者',
    role: 'admin',
    teamId: 'team-2',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2024-02-14'),
  },
  
  // 編集者アカウント
  {
    id: 'editor-1',
    email: 'editor@teamapp.com',
    password: 'editor123',
    name: '鈴木 編集者',
    role: 'editor',
    teamId: 'team-1',
    isActive: true,
    createdAt: new Date('2024-01-05'),
    lastLoginAt: new Date('2024-02-15'),
  },
  {
    id: 'editor-2',
    email: 'editor2@teamapp.com',
    password: 'editor456',
    name: '高橋 編集者',
    role: 'editor',
    teamId: 'team-2',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    lastLoginAt: new Date('2024-02-13'),
  },
  {
    id: 'editor-3',
    email: 'editor3@teamapp.com',
    password: 'editor789',
    name: '渡辺 編集者',
    role: 'editor',
    teamId: 'team-3',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date('2024-02-12'),
  },
  
  // メンバーアカウント
  {
    id: 'member-1',
    email: 'member1@teamapp.com',
    password: 'member123',
    name: '山田 太郎',
    role: 'member',
    teamId: 'team-1',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    lastLoginAt: new Date('2024-02-15'),
    phoneNumber: '090-1234-5678',
    birthDate: '2010-05-15',
    position: 'FW',
    jerseyNumber: 10,
    emergencyContact: {
      name: '山田 花子',
      relationship: '母親',
      phoneNumber: '090-8765-4321',
    },
    medicalInfo: {
      allergies: '花粉症',
      medications: '',
      conditions: '',
    },
    address: {
      postalCode: '150-0002',
      prefecture: '東京都',
      city: '渋谷区',
      address: '渋谷2-1-1',
    },
    // メンバー用の追加情報
    registrantName: '山田 太郎',
    childName: '山田 次郎',
    childFurigana: 'ヤマダ ジロウ',
    childBirthDate: '2012-08-20',
    childGrade: '5年生',
    emailSettings: {
      announcements: true,
      attendance: true,
      payments: true,
      chat: false,
      schedule: true,
    },
  },
  {
    id: 'member-2',
    email: 'member2@teamapp.com',
    password: 'member456',
    name: '伊藤 花子',
    role: 'member',
    teamId: 'team-1',
    isActive: true,
    createdAt: new Date('2024-01-12'),
    lastLoginAt: new Date('2024-02-14'),
  },
  {
    id: 'member-3',
    email: 'member3@teamapp.com',
    password: 'member789',
    name: '中村 三郎',
    role: 'member',
    teamId: 'team-1',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2024-02-13'),
  },
  {
    id: 'member-4',
    email: 'member4@teamapp.com',
    password: 'member101',
    name: '小林 四郎',
    role: 'member',
    teamId: 'team-2',
    isActive: true,
    createdAt: new Date('2024-01-18'),
    lastLoginAt: new Date('2024-02-12'),
  },
  {
    id: 'member-5',
    email: 'member5@teamapp.com',
    password: 'member202',
    name: '加藤 五郎',
    role: 'member',
    teamId: 'team-2',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    lastLoginAt: new Date('2024-02-11'),
  },
  {
    id: 'member-6',
    email: 'member6@teamapp.com',
    password: 'member303',
    name: '吉田 六郎',
    role: 'member',
    teamId: 'team-3',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date('2024-02-10'),
  },
];

// ログイン情報
export const getLoginInfo = () => {
  return {
    admin: {
      email: 'admin@teamapp.com',
      password: 'admin123',
      description: '管理者アカウント - 全ての機能にアクセス可能'
    },
    editor: {
      email: 'editor@teamapp.com', 
      password: 'editor123',
      description: '編集者アカウント - チーム管理とコンテンツ編集が可能'
    },
    member: {
      email: 'member1@teamapp.com',
      password: 'member123', 
      description: 'メンバーアカウント - 基本的な閲覧と参加機能のみ'
    }
  };
};

// Members for Team 1
export const mockMembers1: Member[] = [
  { id: 'm1-1', name: '佐藤 太郎', jerseyNumber: 10, position: 'フォワード', positions: ['フォワード'] },
  { id: 'm1-2', name: '鈴木 一郎', jerseyNumber: 9, position: 'フォワード', positions: ['フォワード'] },
  { id: 'm1-3', name: '高橋 大輔', jerseyNumber: 8, position: 'ミッドフィールダー', positions: ['ミッドフィールダー'] },
  { id: 'm1-4', name: '田中 健太', jerseyNumber: 7, position: 'ミッドフィールダー', positions: ['ミッドフィールダー'] },
  { id: 'm1-5', name: '渡辺 翔太', jerseyNumber: 5, position: 'ディフェンダー', positions: ['ディフェンダー'] },
  { id: 'm1-6', name: '伊藤 翼', jerseyNumber: 4, position: 'ディフェンダー', positions: ['ディフェンダー'] },
  { id: 'm1-7', name: '山本 航平', jerseyNumber: 1, position: 'ゴールキーパー', positions: ['ゴールキーパー'] },
];

// Members for Team 2
export const mockMembers2: Member[] = [
  { id: 'm2-1', name: '中村 俊介', jerseyNumber: 10, position: 'ミッドフィールダー', positions: ['ミッドフィールダー'] },
  { id: 'm2-2', name: '小林 優斗', jerseyNumber: 11, position: 'フォワード', positions: ['フォワード'] },
  { id: 'm2-3', name: '加藤 亮', jerseyNumber: 6, position: 'ミッドフィールダー', positions: ['ミッドフィールダー'] },
];

// Members for Team 3
export const mockMembers3: Member[] = [
    { id: 'm3-1', name: '吉田 拓也', jerseyNumber: 22, position: 'フォワード', positions: ['フォワード'] },
    { id: 'm3-2', name: '山田 直輝', jerseyNumber: 14, position: 'ミッドフィールダー', positions: ['ミッドフィールダー'] },
];

// Members for Team 4
export const mockMembers4: Member[] = [
    { id: 'm4-1', name: '佐々木 勇気', jerseyNumber: 3, position: 'ディフェンダー', positions: ['ディフェンダー'] },
    { id: 'm4-2', name: '山口 達也', jerseyNumber: 18, position: 'フォワード', positions: ['フォワード'] },
];

export const mockTeams: Team[] = [
  // 1-5: original samples
  {
    id: 'team-1', name: 'FCスカイウィングス', coachName: '山田 太郎', websiteUrl: 'https://example.com/skywings', logoUrl: 'https://picsum.photos/seed/skywings/200/200', level: TeamLevel.INTERMEDIATE, rating: 1650, rank: 1, members: mockMembers1, description: '我々は空を翔ける翼のように、フィールドを駆け巡ります。地域最強を目指して日々練習に励んでいます。', prefecture: '東京都', city: '渋谷区', availableSlotsText: '週末のみ空き', ageCategory: 'U12', ownerId: 'user-admin-1', staffMembers: [{ id: 'user-admin-1', email: 'admin1@example.com', invited: false, approved: true, role: 'admin', name: '管理者サンプル', jerseyNumber: 0, position: '管理者', positions: ['管理者'] }, { id: 'user-editor-1', email: 'editor1@example.com', invited: false, approved: true, role: 'editor', name: '編集者サンプル', jerseyNumber: 0, position: '編集者', positions: ['編集者'] }] },
  {
    id: 'team-2', name: 'オーシャンズFC', coachName: '鈴木 次郎', logoUrl: 'https://picsum.photos/seed/oceans/200/200', level: TeamLevel.ADVANCED, rating: 1800, rank: 2, members: mockMembers2, description: '大海のごとき戦略で相手を圧倒する。全国大会出場経験あり。', prefecture: '神奈川県', city: '横浜市', availableSlotsText: '空き', ageCategory: 'U12', ownerId: 'user-admin-2', staffMembers: [{ id: 'user-admin-2', email: 'admin2@example.com', invited: false, approved: true, role: 'admin', name: '管理者サンプル2', jerseyNumber: 0, position: '管理者', positions: ['管理者'] }, { id: 'user-editor-2', email: 'editor2@example.com', invited: false, approved: true, role: 'editor', name: '編集者サンプル2', jerseyNumber: 0, position: '編集者', positions: ['編集者'] }] },
  {
    id: 'team-3', name: 'マウンテンキングス', coachName: '佐藤 三郎', websiteUrl: 'https://example.com/kings', logoUrl: 'https://picsum.photos/seed/kings/200/200', level: TeamLevel.BEGINNER, rating: 1300, rank: 5, members: mockMembers3, description: '初心者歓迎！楽しくサッカーをすることをモットーに活動しています。', prefecture: '北海道', city: '札幌市', availableSlotsText: '空き', ageCategory: 'U10', staffMembers: [] },
  {
    id: 'team-4', name: 'デザートライオンズ', coachName: '田中 四郎', logoUrl: 'https://picsum.photos/seed/lions/200/200', level: TeamLevel.INTERMEDIATE, rating: 1550, rank: 3, members: mockMembers4, description: '砂漠のライオンのような粘り強さが持ち味。', prefecture: '福岡県', city: '福岡市', availableSlotsText: '×', ageCategory: 'U12', staffMembers: [] },
  {
    id: 'team-5', name: 'リバーサイドイーグルス', coachName: '高橋 五郎', logoUrl: 'https://picsum.photos/seed/eagles/200/200', level: TeamLevel.ADVANCED, rating: 1900, rank: 1, members: [], description: '川沿いの風のように素早い攻撃を展開する強豪チーム。', prefecture: '大阪府', city: '大阪市', availableSlotsText: '週末のみ空き', ageCategory: 'U12', staffMembers: [] },
  // 6-20: generated samples
  ...Array.from({ length: 15 }, (_, i) => {
    const n = i + 6;
    return {
      id: `team-${n}`,
      name: `サンプルチーム${n}`,
      coachName: `コーチ${n}`,
      logoUrl: `https://picsum.photos/seed/sample${n}/200/200`,
      level: [TeamLevel.BEGINNER, TeamLevel.INTERMEDIATE, TeamLevel.ADVANCED][n % 3],
      rating: 1000 + n * 50,
      rank: n,
      members: [],
      description: `サンプル説明${n}`,
      prefecture: ['東京都', '神奈川県', '大阪府', '北海道', '福岡県', '愛知県', '京都府', '兵庫県', '埼玉県', '千葉県', '静岡県', '広島県', '宮城県', '新潟県', '熊本県'][i % 15],
      city: ['渋谷区', '横浜市', '大阪市', '札幌市', '福岡市', '名古屋市', '京都市', '神戸市', 'さいたま市', '千葉市', '静岡市', '広島市', '仙台市', '新潟市', '熊本市'][i % 15],
      availableSlotsText: ['週末のみ空き', '空き', '×'][i % 3] as '週末のみ空き' | '空き' | '×',
      ageCategory: ['U12', 'U10', 'U11', 'U12'][i % 4] as "U6" | "U7" | "U8" | "U9" | "U10" | "U11" | "U12" | "kindergarten_older" | "kindergarten_younger",
      ownerId: i % 2 === 0 ? 'admin1@example.com' : 'editor1@example.com',
      staffMembers: i % 2 === 0 ? [{ id: 'user-admin-1', email: 'admin1@example.com', invited: false, approved: true, role: 'admin' as MemberRole, name: '管理者サンプル', jerseyNumber: 0, position: '管理者', positions: ['管理者'] }] : [{ id: 'user-editor-1', email: 'editor1@example.com', invited: false, approved: true, role: 'editor' as MemberRole, name: '編集者サンプル', jerseyNumber: 0, position: '編集者', positions: ['編集者'] }]
    };
  })
];

export const mockMatches: Match[] = [
  {
    id: 'match-1',
    type: MatchType.LEAGUE,
    status: MatchStatus.FINISHED,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-2',
    opponentTeamIds: ['team-1', 'team-2'], // 複数の対戦相手に対応
    opponentTeamName: 'オーシャンズFC',
    date: '2023-10-21',
    time: '14:00',
    location: '市内リーグ 第3節',
    ourScore: 2,
    opponentScore: 1,
    notes: '劇的な逆転勝利！',
    hostTeamId: 'team-1', // 主催チーム
    isInvitation: false,
    records: {
      results: [{
        matchId: 'match-1',
        ourScore: 2,
        opponentScore: 1,
        winner: 'our' as 'our' | 'opponent' | 'draw',
        goals: [
          {
            id: 'goal-1',
            scorerName: '田中太郎',
            period: '前半' as '前半' | '後半',
            minute: 25,
            assistName: '佐藤花子'
          },
          {
            id: 'goal-2',
            scorerName: '山田次郎',
            period: '後半' as '前半' | '後半',
            minute: 78
          }
        ]
      }],
      additionalTrainingMatches: 0
    },
  },
  {
    id: 'match-2',
    type: MatchType.TRAINING,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-3',
    opponentTeamIds: ['team-1', 'team-3'], // 複数の対戦相手に対応
    opponentTeamName: 'マウンテンキングス',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // One week from now
    time: '10:00',
    location: '練習グラウンドA',
    hostTeamId: 'team-1', // 主催チーム
    isInvitation: false,
    records: {
      results: [{
        matchId: 'match-2',
        ourScore: 3,
        opponentScore: 1,
        winner: 'our' as 'our' | 'opponent' | 'draw',
        goals: [
          {
            id: 'goal-3',
            scorerName: '佐藤花子',
            period: '前半' as '前半' | '後半',
            minute: 15,
            assistName: '田中太郎'
          },
          {
            id: 'goal-4',
            scorerName: '鈴木三郎',
            period: '前半' as '前半' | '後半',
            minute: 32
          },
          {
            id: 'goal-5',
            scorerName: '高橋四郎',
            period: '後半' as '前半' | '後半',
            minute: 65,
            assistName: '佐藤花子'
          }
        ]
      }],
      additionalTrainingMatches: 0
    },
  },
   {
    id: 'match-3',
    type: MatchType.TOURNAMENT,
    status: MatchStatus.IN_PROGRESS,
    ourTeamId: 'team-1',
    date: new Date().toISOString().split('T')[0], // Today
    time: '09:00',
    location: '地域カップ',
    notes: 'トーナメント1回戦',
    hostTeamId: 'team-1', // 主催チーム
    isInvitation: false,
  },
  // 招待された試合のサンプル（保留中）
  {
    id: 'match-invitation-1',
    type: MatchType.TRAINING,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-2',
    opponentTeamIds: ['team-1', 'team-2'], // 複数の対戦相手に対応
    opponentTeamName: 'オーシャンズFC',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
    time: '13:00',
    location: 'オーシャンズFCグラウンド',
    notes: 'オーシャンズFCから招待された試合',
    hostTeamId: 'team-2', // オーシャンズFCが主催
    isInvitation: true, // 招待の試合
    invitationStatus: 'pending', // 保留中
  },
  // 招待された試合のサンプル（承諾済み）
  {
    id: 'match-invitation-2',
    type: MatchType.LEAGUE,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-3',
    opponentTeamIds: ['team-1', 'team-3'], // 複数の対戦相手に対応
    opponentTeamName: 'マウンテンキングス',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks from now
    time: '10:00',
    location: 'マウンテンキングスホームグラウンド',
    notes: 'マウンテンキングスから招待された試合（承諾済み）',
    hostTeamId: 'team-3', // マウンテンキングスが主催
    isInvitation: true, // 招待の試合
    invitationStatus: 'accepted', // 承諾済み
  },
  // 招待された試合のサンプル（辞退済み）
  {
    id: 'match-invitation-3',
    type: MatchType.TRAINING,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-4',
    opponentTeamIds: ['team-1', 'team-4'], // 複数の対戦相手に対応
    opponentTeamName: 'サンダーボルトFC',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    time: '16:00',
    location: 'サンダーボルトFCグラウンド',
    notes: 'サンダーボルトFCから招待された試合（辞退済み）',
    hostTeamId: 'team-4', // サンダーボルトFCが主催
    isInvitation: true, // 招待の試合
    invitationStatus: 'declined', // 辞退済み
  },
  // 招待された試合のサンプル（保留中 - リーグ戦）
  {
    id: 'match-invitation-4',
    type: MatchType.LEAGUE,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-5',
    opponentTeamIds: ['team-1', 'team-5'], // 複数の対戦相手に対応
    opponentTeamName: 'イーグルスFC',
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 weeks from now
    time: '14:00',
    location: 'イーグルスFCホームグラウンド',
    notes: 'イーグルスFCから招待された地域リーグ戦',
    hostTeamId: 'team-5', // イーグルスFCが主催
    isInvitation: true, // 招待の試合
    invitationStatus: 'pending', // 保留中
  },
  // 招待された試合のサンプル（保留中 - トーナメント）
  {
    id: 'match-invitation-5',
    type: MatchType.TOURNAMENT,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-1',
    opponentTeamId: 'team-6',
    opponentTeamIds: ['team-1', 'team-6'], // 複数の対戦相手に対応
    opponentTeamName: 'ホークスFC',
    date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 weeks from now
    time: '09:00',
    location: 'ホークスFC総合グラウンド',
    notes: 'ホークスFC主催のトーナメント大会に招待',
    hostTeamId: 'team-6', // ホークスFCが主催
    isInvitation: true, // 招待の試合
    invitationStatus: 'pending', // 保留中
  },
  // 招待型のサンプル試合（リーグ戦形式、リーグ表・要項付き）
  {
    id: 'match-invite-1',
    type: MatchType.LEAGUE,
    status: MatchStatus.PREPARATION,
    ourTeamId: 'team-2',
    opponentTeamId: 'team-1',
    opponentTeamName: 'FCスカイウィングス',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    time: '15:00',
    location: 'オーシャンズFCグラウンド',
    notes: '招待: オーシャンズFCからFCスカイウィングスへの招待',
    participants: [
      { teamId: 'team-2', status: ParticipantStatus.ACCEPTED },
      { teamId: 'team-1', status: ParticipantStatus.PENDING }
    ],
    leagueCompetitionData: {
      id: 'competition-1',
      name: '地域リーグ戦',
      advancementRule: { teamsPerGroup: 2 },
      finalRoundType: 'none',
      isFinalsGenerated: false,
      preliminaryRound: {
        id: 'league-1',
        name: '地域リーグ',
        groups: [
          {
            name: 'Aグループ',
            teams: [
              { team: mockTeams.find(t => t.id === 'team-2')!, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
              { team: mockTeams.find(t => t.id === 'team-1')!, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
            ],
            matches: [
              {
                id: 'lgm-1',
                team1Id: 'team-2',
                team2Id: 'team-1',
                team1Score: undefined,
                team2Score: undefined,
                court: 1,
                startTime: '15:00',
                played: false
              }
            ]
          }
        ]
      }
    }
  }
];

export const mockVenues: Venue[] = [
  {
    id: 'venue-1',
    name: 'スカイフィールド',
    prefecture: '東京都',
    city: '渋谷区',
    address: '渋谷区神南2-1-1',
    availableDates: ['2023-11-15', '2023-11-22'],
    imageUrl: 'https://picsum.photos/seed/venue1/400/300',
    capacity: 200,
    pricePerHour: 15000,
  },
  {
    id: 'venue-2',
    name: 'オーシャンスタジアム',
    prefecture: '神奈川県',
    city: '横浜市',
    address: '横浜市中区日本大通',
    availableDates: ['2023-11-18', '2023-11-19', '2023-11-25'],
    imageUrl: 'https://picsum.photos/seed/venue2/400/300',
    capacity: 1000,
    pricePerHour: 30000,
  },
  {
    id: 'venue-3',
    name: 'グリーンパーク',
    prefecture: '埼玉県',
    city: 'さいたま市',
    address: 'さいたま市緑区美園',
    availableDates: ['2023-11-12', '2023-11-26'],
    imageUrl: 'https://picsum.photos/seed/venue3/400/300',
    capacity: 500,
    pricePerHour: 20000,
  }
];

export const mockScheduleEvents: ScheduleEvent[] = [
  {
    id: 'se-1',
    title: '通常練習',
    type: ScheduleEventType.PRACTICE,
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '16:00',
    endTime: '18:00',
    location: 'ホームグラウンド',
    teamId: 'team-1',
  },
  {
    id: 'se-2',
    title: 'vs オーシャンズFC',
    type: ScheduleEventType.MATCH,
    date: '2023-10-21',
    startTime: '14:00',
    endTime: '16:00',
    location: '市内グラウンド',
    relatedMatchId: 'match-1',
    teamId: 'team-1',
  },
  {
    id: 'se-3',
    title: '月次ミーティング',
    type: ScheduleEventType.MEETING,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0], // This month's 15th
    startTime: '19:00',
    endTime: '20:00',
    location: 'クラブハウス',
    description: '次節の戦略について話し合います。',
    teamId: 'team-1',
  },
  {
    id: 'se-4',
    title: '通常練習',
    type: ScheduleEventType.PRACTICE,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    startTime: '16:00',
    endTime: '18:00',
    location: 'ホームグラウンド',
    teamId: 'team-1',
  },
];


export const mockPastMatchResults: PastMatchResult[] = [
    { id: 'pr-1', date: '2023-10-21', opponentName: 'オーシャンズFC', ourScore: 2, opponentScore: 1, result: '勝利', scoringMembers: ['佐藤 太郎', '鈴木 一郎'] },
    { id: 'pr-2', date: '2023-10-14', opponentName: 'サンダーボルト', ourScore: 1, opponentScore: 1, result: '引き分け', scoringMembers: ['佐藤 太郎'] },
    { id: 'pr-3', date: '2023-10-07', opponentName: 'FCファイアードラゴン', ourScore: 0, opponentScore: 3, result: '敗北', scoringMembers: [] },
];

export const mockChatThreads: ChatThread[] = [
    {
        id: 'thread-1',
        participants: [
            { id: 'team-1', name: 'FCスカイウィングス', logoUrl: 'https://picsum.photos/seed/skywings/40/40' },
            { id: 'team-2', name: 'オーシャンズFC', logoUrl: 'https://picsum.photos/seed/oceans/40/40' }
        ],
        isGroupChat: false,
        lastMessage: {
            id: 'msg-2',
            threadId: 'thread-1',
            senderId: 'team-2',
            senderName: 'オーシャンズFC',
            text: '了解です！では、来週の土曜10時でお願いします。',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        },
        unreadCount: 1,
    },
    {
        id: 'thread-2',
        participants: [
            { id: 'team-1', name: 'FCスカイウィングス', logoUrl: 'https://picsum.photos/seed/skywings/40/40' },
            { id: 'team-3', name: 'マウンテンキングス', logoUrl: 'https://picsum.photos/seed/kings/40/40' },
            { id: 'team-4', name: 'デザートライオンズ', logoUrl: 'https://picsum.photos/seed/lions/40/40' },
        ],
        isGroupChat: true,
        groupName: 'U-12練習試合グループ',
        lastMessage: {
            id: 'msg-3',
            threadId: 'thread-2',
            senderId: 'team-1',
            senderName: 'FCスカイウィングス',
            text: '皆さん、次の週末の練習試合の件ですが、会場が見つかりました！',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        unreadCount: 0,
    }
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
    'thread-1': [
        {
            id: 'msg-1',
            threadId: 'thread-1',
            senderId: 'team-1',
            senderName: 'FCスカイウィングス',
            text: 'こんにちは！練習試合の件ですが、来週末はいかがでしょうか？',
            timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
        },
        {
            id: 'msg-2',
            threadId: 'thread-1',
            senderId: 'team-2',
            senderName: 'オーシャンズFC',
            text: '了解です！では、来週の土曜10時でお願いします。',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        },
    ],
    'thread-2': [
        {
            id: 'msg-3',
            threadId: 'thread-2',
            senderId: 'team-1',
            senderName: 'FCスカイウィングス',
            text: '皆さん、次の週末の練習試合の件ですが、会場が見つかりました！',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
    ]
};
