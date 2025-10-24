// types.ts
// ...ver4の正しい内容をここに挿入...
export enum TeamLevel {
  BEGINNER = "初級",
  INTERMEDIATE = "中級",
  ADVANCED = "上級"
}

export type MemberRole = 'admin' | 'editor' | 'member';
export interface Member {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  positions: string[]; // 複数ポジション対応
  email?: string;
  role?: MemberRole;
  invited?: boolean; // 招待中
  approved?: boolean; // 承認済み
}

export interface Team {
  id: string;
  name: string;
  coachName: string;
  websiteUrl?: string;
  logoUrl: string;
  level: TeamLevel;
  rating: number;
  rank: number;
  members: Member[];
  description: string;
  prefecture?: string; // Added for filtering
  city?: string;       // Added for filtering
  availableSlotsText?: "空き" | "週末のみ空き" | "×"; // For matchmaking/followed teams preview
  ageCategory?: "U6" | "U7" | "U8" | "U9" | "U10" | "U11" | "U12" | "kindergarten_older" | "kindergarten_younger"; // 年齢カテゴリを修正
  ownerId?: string; // チーム作成者（管理者）
  ownerEmail?: string; // チーム作成者のメールアドレス
  staffMembers?: Member[]; // 管理・編集メンバー
}

// Enum for navigation views
export enum View {
  TEAM_PROFILE = "TEAM_PROFILE",
  MATCHES = "MATCHES",
  VENUE_BOOKING = "VENUE_BOOKING",
  SCHEDULE = "SCHEDULE",
  TEAM_MANAGEMENT = "TEAM_MANAGEMENT", 
  FOLLOWED_TEAMS = "FOLLOWED_TEAMS", 
  CHAT_LIST = "CHAT_LIST",
  CHAT_SCREEN = "CHAT_SCREEN", 
  MATCHMAKING = "MATCHMAKING",
  TOURNAMENT_GUIDELINES = "TOURNAMENT_GUIDELINES",
  TABLE_CREATION = "TABLE_CREATION",
  // 庶務機能
  ADMINISTRATIVE = "ADMINISTRATIVE",
  ANNOUNCEMENTS = "ANNOUNCEMENTS",
  ATTENDANCE = "ATTENDANCE",
  MEMBER_INFO = "MEMBER_INFO",
  MERCHANDISE = "MERCHANDISE",
  PAYMENT = "PAYMENT",
  // メンバー機能
  MEMBER_PROFILE = "MEMBER_PROFILE",
  // チーム招待機能
  TEAM_INVITATIONS = "TEAM_INVITATIONS"
}

// For Matches
export enum MatchType {
  TRAINING = "トレーニングマッチ", // Training Match
  TOURNAMENT = "トーナメント戦",   // Tournament Match
  LEAGUE = "リーグ戦",           // League Match
}

export enum MatchStatus {
  PREPARATION = "準備中",    // In Preparation
  READY = "準備完了",        // Ready
  IN_PROGRESS = "開催中",    // In Progress
  FINISHED = "終了",         // Finished
}

export enum ParticipantStatus {
  PENDING = '保留中',
  ACCEPTED = '承認',
  DECLINED = '辞退',
}

export interface MatchParticipant {
  teamId: string;
  status: ParticipantStatus;
}

export interface MatchScoringEvent {
  id: string;
  period: '前半' | '後半';
  minute: number;
  scorerName: string;
  teamId: string; 
  assistName?: string;
  subMatchId?: string; // Links event to a specific match within a tournament/league
}

export interface PastMatchResult {
    id: string;
    date: string;
    opponentName: string;
    ourScore: number;
    opponentScore: number;
    result: '勝利' | '敗北' | '引き分け';
    scoringMembers: string[]; // Names of members who scored
}

// Interface for the detailed Tournament Information Panel
export interface TournamentInfoFormData {
  eventName: string; 
  organizerInfo: { 
    organizationName: string; 
    contactPersonName: string; 
  };
  eventDateTime: { 
    eventDate: string; 
    startTime: string; 
    endTime: string; 
    entryTime: string; 
  };
  venueInfo: { 
    facilityName: string; 
    address: string; 
  };
  participantEligibility: { 
    gradeLevel: string; 
    ageLimit: string; 
  };
  participatingTeams: string; 
  courtInfo: { 
    size: string; 
    numberOfCourts: string; 
  };
  matchFormat: { 
    playersPerTeam: string; 
    goalSpecifications: string; 
    matchDuration?: string; // 追加: 試合時間
    halfTime?: string;      // 追加: ハーフタイム
    breakTime?: string;     // 追加: 休憩時間
  };
  refereeSystem: string; 
  competitionRules: string; 
  matchSchedule: { 
    ceremonyInfo: string; 
    waterBreakInfo: string; 
  };
  ballInfo: string; 
  rankingMethod: { 
    pointsRule: string; 
    tieBreakerRule: string; 
    leagueSystemDescription: string; 
  };
  awards: { 
    winner: string; 
    runnerUp: string; 
    thirdPlace: string; 
    individualAwards: string; 
  };
  participationFee: { 
    amount: string; 
    paymentMethod: string; 
    paymentNotes: string; 
  };
  generalNotes: { 
    parkingInfo: string; 
    spectatorArea: string; 
    cancellationPolicy: string; 
  };
  contactInfo: { 
    personName: string; 
    phoneNumber: string; 
  };
}

// ---- Tournament Bracket Types ----
export interface BracketTeam extends Team { // Or a simplified version if full Team object isn't needed
  seed?: number; // Optional seeding
  isBye?: boolean; // To mark a BYE slot
}

export interface BracketMatch {
  id: string; // Unique ID for the match
  roundIndex: number; // 0-indexed round number
  matchIndexInRound: number; // 0-indexed match number within the round
  team1?: BracketTeam | null; // First team or placeholder
  team2?: BracketTeam | null; // Second team or placeholder
  team1Score?: number | null;
  team2Score?: number | null;
  winner?: BracketTeam | null; // Winner of this match
  winnerId?: string | null; // Manually set winner ID in case of a draw score (e.g., PK)
  nextMatchId?: string | null; // ID of the match this winner advances to
  nextMatchSlot?: 'team1' | 'team2' | null; // Which slot in the next match
  isDecided?: boolean; // If the match has a result
  isPlayable?: boolean; // If both teams are set (and not BYE)
  court?: number; // Assigned court number
  startTime?: string; // Assigned start time
  placeholderTeam1Text?: string;
  placeholderTeam2Text?: string;
}

export interface BracketRound {
  name: string; // e.g., "Round 1", "Quarterfinals"
  matches: BracketMatch[];
}

export interface TournamentBracket {
  id: string;
  name: string; // Name of the tournament
  teams: BracketTeam[]; // List of all participating teams (original list before BYEs added for structure)
  rounds: BracketRound[];
}

// ---- League Table Types ----
export interface LeagueTeamStats {
  team: Team; // Reference to the full Team object
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
    team1Score?: number;
    team2Score?: number;
    winnerId?: string | null; // For PK results, null for normal draw
    played: boolean;
    court?: number; // Assigned court number
    startTime?: string;
}

export interface LeagueGroup {
  name: string; // e.g., "Group A" or "Overall Standings"
  teams: LeagueTeamStats[]; // This array's order will represent the custom order if edited.
  matches: LeagueMatch[]; // The schedule of matches for this group
}

export interface LeagueTable {
  id: string;
  name: string; // Name of the league/season
  groups: LeagueGroup[]; // This structure directly holds group assignments.
  hasFinalRound?: boolean;
  finalRound?: any;
  settings?: {
    numGroups: number;
    teamsPerGroup: number;
    advanceTeamsPerGroup: number;
    numberOfCourts: number;
    eventStartTime: string;
    matchDurationInMinutes: number;
    restTimeInMinutes: number;
  };
}

// --- Advanced League Competition Types ---
export interface LeagueAdvancementRule {
  teamsPerGroup: number; // e.g., 2 means top 2 from each group advance
}

export interface LeagueCompetition {
  id: string;
  name: string;
  preliminaryRound: LeagueTable;
  advancementRule: LeagueAdvancementRule;
  finalRoundType: 'tournament' | 'league' | 'none';
  finalRoundTournament?: TournamentBracket;
  finalRoundLeague?: LeagueTable;
  isFinalsGenerated: boolean;
}

// ---- End of Competition Types ----


// --- SubMatch for Training Matches ---
export interface SubMatch {
  id: string;
  date: string; // 実施日
  time: string; // 開始時刻
  ourScore?: number;
  opponentScore?: number;
  manualWinnerId?: string | null;
  scoringEvents?: MatchScoringEvent[];
  participants?: MatchParticipant[];
  notes?: string;
}

export interface MatchApplication {
  id: string;
  matchId: string;
  applicantTeamId: string;
  applicantTeamName: string;
  applicantTeamLevel: string;
  applicantTeamPrefecture: string;
  applicantTeamCity?: string;
  applicantTeamDescription?: string;
  applicantTeamRating: number;
  applicantTeamMemberCount: number;
  applicationDate: string;
  status: 'pending' | 'accepted' | 'declined';
  declineMessage?: string;
  hostTeamId: string;
}

export interface Match {
  id: string;
  type: MatchType;
  status: MatchStatus;
  ourTeamId: string;      
  opponentTeamId?: string; 
  opponentTeamIds?: string[]; // 複数の対戦相手に対応
  opponentTeamName?: string; 
  date: string;           
  time: string;           
  location: string;
  numberOfCourts?: number; // Number of courts available for the match
  matchDurationInMinutes?: number;
  halftimeInMinutes?: number;
  restTimeInMinutes?: number;
  detailedTournamentInfo?: TournamentInfoFormData; // Optional detailed guide
  bracketData?: TournamentBracket; // Optional data for tournament matches
  leagueCompetitionData?: LeagueCompetition; // Optional data for league matches with preliminary/final rounds
  preparationList?: string[]; 
  // --- 主催・招待情報 ---
  hostTeamId?: string; // 主催チームID
  isInvitation?: boolean; // 招待の試合かどうか
  invitationStatus?: 'pending' | 'accepted' | 'declined'; // 招待の状態
  isRecruiting?: boolean; // マッチングで募集中かどうか
  // --- 練習試合用: サブ試合リスト ---
  subMatches?: SubMatch[]; // type === TRAINING のときのみ利用
  // --- 従来の単一試合用（リーグ・トーナメント・旧練習試合）---
  ourScore?: number;
  opponentScore?: number;
  manualWinnerId?: string | null; // For training match draws
  scoringEvents?: MatchScoringEvent[];
  participants?: MatchParticipant[];
  records?: {
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
  notes?: string;
}

// For Venue Booking
export interface Venue {
  id:string;
  name: string;
  prefecture: string; 
  city?: string; 
  address: string;
  availableDates: string[];
  imageUrl?: string;
  capacity?: number;
  pricePerHour?: number; 
}

export interface Booking {
  id: string;
  venueId: string;
  teamId: string; 
  bookingDate: string; 
  startTime: string;
  endTime: string;
  status: 'リクエスト済み' | '確定済み' | 'キャンセル済み'; 
  notes?: string;
}

// For Schedule
export enum ScheduleEventType {
  PRACTICE = "練習",      
  MATCH = "試合",        
  MEETING = "ミーティング", 
  OTHER = "その他",       
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: ScheduleEventType;
  date: string;           
  startTime: string;      
  endTime: string;        
  location?: string;
  description?: string;
  isRecurring?: boolean;   
  relatedMatchId?: string; 
  teamId: string;         
}

// For Followed Teams
export interface FollowedTeam extends Team {
  isFavorite: boolean;
}

// For Chat
export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string; 
  senderName: string;
  text: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface ChatThread {
  id: string;
  participants: { id: string; name: string; logoUrl?: string; }[]; 
  lastMessage?: ChatMessage;
  unreadCount?: number;
  isGroupChat: boolean;
  groupName?: string; 
}

// For Matchmaking
export interface MatchmakingFilters {
  prefecture?: string[];
  city?: string[];
  level?: TeamLevel[];
  ageCategory?: ("U-10" | "U-12" | "U-15" | "一般")[];
  ratingMin?: number;
  ratingMax?: number;
  availableDate?: string; 
}