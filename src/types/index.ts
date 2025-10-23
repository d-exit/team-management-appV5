// 既存の型定義に追加
export interface MatchScoringEvent {
  id: string;
  period: '前半' | '後半';
  minute: number;
  scorerName: string;
  teamId: string;
  assistName?: string;
}

export interface MatchResult {
  id: string;
  teamId: string;
  score: number;
  isWinner: boolean;
}

export interface TournamentBracket {
  id: string;
  name: string;
  rounds: BracketRound[];
  teams?: BracketTeam[];
}

export interface BracketRound {
  id: string;
  name: string;
  matches: BracketMatch[];
}

export interface BracketMatch {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  isCompleted: boolean;
}

export interface BracketTeam {
  id: string;
  name: string;
  logoUrl?: string;
  isBye?: boolean;
}

// 拡張されたリーグ表の型定義
export interface LeagueTable {
  id: string;
  name: string;
  groups: LeagueGroup[];
  hasFinalRound?: boolean;
  finalRound?: FinalRound;
  settings: LeagueSettings;
}

export interface LeagueGroup {
  id: string;
  name: string;
  teams: LeagueTeamStats[];
  matches: LeagueMatch[];
}

export interface LeagueTeamStats {
  team: BracketTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueMatch {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score: number | null;
  team2Score: number | null;
  startTime: string;
  court?: number;
  isCompleted: boolean;
  nextMatchId?: string;
}

export interface LeagueSettings {
  numGroups: number;
  teamsPerGroup: number;
  advanceTeamsPerGroup: number;
  numberOfCourts: number;
  eventStartTime: string;
  matchDurationInMinutes: number;
  restTimeInMinutes: number;
}

// 決勝ラウンドの型定義
export interface FinalRound {
  id: string;
  name: string;
  type: 'league' | 'tournament';
  teams: BracketTeam[];
  // リーグ戦の場合
  leagueTable?: LeagueTable;
  // トーナメント戦の場合
  tournamentBracket?: TournamentBracket;
}

// 既存の型定義
export interface LeagueCompetition {
  id: string;
  name: string;
  groups: LeagueGroup[];
}

export interface TournamentInfoFormData {
  tournamentName: string;
  organizerName: string;
  organizerContact: string;
  participatingTeams: string[];
  venueName: string;
  venueAddress: string;
  courtSize: string;
  courtCount: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  checkInTime: string;
  matchDuration: number;
  halfTime: number;
  breakTime: number;
  coolingBreak: number;
  eligibility: string;
  refereeFormat: string;
  ballType: string;
  rules: string;
  playerCount: number;
  goalSpec: string;
  openingCeremony: string;
  closingCeremony: string;
  pointSystem: string;
  rankingMethod: string;
  leagueFormat: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  individualAwards: string;
  participationFee: number;
  paymentMethod: string;
  paymentNotes: string;
  parkingInfo: string;
  spectatorArea: string;
  cancellationPolicy: string;
  emergencyContact: string;
  emergencyPhone: string;
}

// ポジション型の定義
export type Position = 'FW' | 'MF' | 'DF' | 'GK';

// 年齢カテゴリの定義
export const AGE_CATEGORIES = {
  U12: { label: 'U12（6年生）', grade: 6 },
  U11: { label: 'U11（5年生）', grade: 5 },
  U10: { label: 'U10（4年生）', grade: 4 },
  U9: { label: 'U9（3年生）', grade: 3 },
  U8: { label: 'U8（2年生）', grade: 2 },
  U7: { label: 'U7（1年生）', grade: 1 },
  U6: { label: 'U6（年長）', grade: 0 },
  kindergarten_older: { label: 'キンダー（年中）', grade: -1 },
  kindergarten_younger: { label: 'キンダー（年少）', grade: -2 }
} as const;

// レベルの定義（プロフェッショナルを削除）
export const TEAM_LEVELS = {
  beginner: { label: '初級', value: 1 },
  intermediate: { label: '中級', value: 2 },
  advanced: { label: '上級', value: 3 }
} as const;

// ポジションの定義
export const POSITIONS = {
  FW: { label: 'FW', color: 'bg-red-500' },
  MF: { label: 'MF', color: 'bg-yellow-500' },
  DF: { label: 'DF', color: 'bg-blue-500' },
  GK: { label: 'GK', color: 'bg-green-500' }
} as const;

// 都道府県データ
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const; 