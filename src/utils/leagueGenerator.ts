// utils/leagueGenerator.ts
import { Team, LeagueTeamStats, LeagueGroup, LeagueTable, LeagueMatch, BracketTeam } from '../types';
import { generateTournamentBracket } from './bracketGenerator';

/**
 * Helper to add minutes to a time string (HH:mm) and return a new time string.
 * @param time The initial time string, e.g., "10:00".
 * @param minutes The number of minutes to add.
 * @returns The new time string, e.g., "10:25".
 */
export const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    const newHours = date.getHours().toString().padStart(2, '0');
    const newMins = date.getMinutes().toString().padStart(2, '0');
    return `${newHours}:${newMins}`;
};

/**
 * Generates all unique round-robin pairings for a given set of teams.
 * @param teamStats Array of team statistics objects.
 * @returns An array of LeagueMatch objects representing the fixtures.
 */
export const generateFixturesForGroup = (teamStats: LeagueTeamStats[]): LeagueMatch[] => {
  const fixtures: LeagueMatch[] = [];
  if (teamStats.length < 2) {
    return fixtures;
  }

  for (let i = 0; i < teamStats.length; i++) {
    for (let j = i + 1; j < teamStats.length; j++) {
      const team1 = teamStats[i].team;
      const team2 = teamStats[j].team;
      fixtures.push({
        id: `fixture-${team1.id}-vs-${team2.id}-${Date.now()}${Math.random()}`,
        team1Id: team1.id,
        team2Id: team2.id,
        team1Score: undefined,
        team2Score: undefined,
        startTime: '',
        played: false,
      });
    }
  }
  return fixtures;
};

/**
 * Sorts teams within groups and returns the top N teams from each group.
 * @param league The league table containing groups and team stats.
 * @param teamsPerGroup The number of top teams to select from each group.
 * @returns An array of BracketTeam objects that are advancing.
 */
export const getAdvancingTeams = (league: LeagueTable, teamsPerGroup: number): BracketTeam[] => {
    const advancingTeams: BracketTeam[] = [];
    league.groups.forEach(group => {
        const sortedTeams = [...group.teams].sort((a, b) => 
            b.points - a.points || 
            b.goalDifference - a.goalDifference || 
            b.goalsFor - a.goalsFor
        );
        const advancingStats = sortedTeams.slice(0, teamsPerGroup);
        advancingTeams.push(...advancingStats.map(stat => stat.team as BracketTeam));
    });
    return advancingTeams;
};

/**
 * Creates a final round after the group stage.
 * @param advancingTeams Teams that advanced from the group stage.
 * @param finalRoundType Type of final round ('league' or 'tournament').
 * @param settings League settings for the final round.
 * @returns A FinalRound object.
 */
export const createFinalRound = (
  advancingTeams: BracketTeam[],
  finalRoundType: 'league' | 'tournament',
  settings: {
    numberOfCourts: number;
    eventStartTime: string;
    matchDurationInMinutes: number;
    restTimeInMinutes: number;
  }
) => {
  const finalRound: any = {
    id: `final-round-${Date.now()}`,
    name: finalRoundType === 'league' ? '決勝リーグ' : '決勝トーナメント',
    type: finalRoundType,
    teams: advancingTeams,
  };

  if (finalRoundType === 'league') {
    // 決勝リーグ戦を作成
    const finalLeague = generateLeagueTable(
      advancingTeams.map(team => ({
        id: team.id,
        name: team.name,
        coachName: team.coachName || '',
        logoUrl: team.logoUrl || '',
        level: team.level,
        rating: team.rating,
        rank: team.rank,
        members: team.members || [],
        description: team.description || '',
      })),
      1, // 決勝リーグは1グループ
      settings.numberOfCourts,
      settings.eventStartTime,
      settings.matchDurationInMinutes,
      settings.restTimeInMinutes,
      0, // 決勝リーグからは進出なし
      false, // 決勝リーグの後に決勝ラウンドなし
      'league'
    );
    
    if (finalLeague) {
      finalRound.leagueTable = finalLeague;
    }
  } else {
    // 決勝トーナメントを作成
    const finalTournament = generateTournamentBracket(
      advancingTeams.map(team => ({
        id: team.id,
        name: team.name,
        coachName: team.coachName || '',
        logoUrl: team.logoUrl || '',
        level: team.level,
        rating: team.rating,
        rank: team.rank,
        members: team.members || [],
        description: team.description || '',
      })),
      [], // シードなし
      settings.numberOfCourts,
      settings.eventStartTime,
      settings.matchDurationInMinutes,
      settings.restTimeInMinutes
    );
    
    if (finalTournament) {
      finalRound.tournamentBracket = finalTournament;
    }
  }

  return finalRound;
};

/**
 * より効率的で公平なリーグ戦スケジューリングを生成
 * @param teams 参加チーム
 * @param numGroups グループ数
 * @param numberOfCourts コート数
 * @param eventStartTime 開始時間
 * @param matchDurationInMinutes 試合時間
 * @param restTimeInMinutes 休憩時間
 * @param advanceTeamsPerGroup 各グループからの進出チーム数
 * @param hasFinalRound 決勝ラウンドの有無
 * @param finalRoundType 決勝ラウンドのタイプ
 * @returns リーグ戦テーブル
 */
export const generateOptimizedLeagueTable = (
  teams: Team[],
  numGroups: number,
  numberOfCourts: number = 1,
  eventStartTime: string = '10:00',
  matchDurationInMinutes: number = 10,
  restTimeInMinutes: number = 5,
  advanceTeamsPerGroup: number = 2,
  hasFinalRound: boolean = false,
  finalRoundType: 'league' | 'tournament' = 'tournament'
): LeagueTable | null => {
  if (teams.length < 2 || numGroups < 1 || numGroups > teams.length) {
    console.error("Invalid input for generating league table.");
    return null;
  }

  // 各グループに最低2チーム必要
  const minTeamsPerGroup = 2;
  if (teams.length < numGroups * minTeamsPerGroup) {
    console.error(`Not enough teams for ${numGroups} groups. Need at least ${numGroups * minTeamsPerGroup} teams.`);
    return null;
  }

  // 1. グループ初期化
  const groups: LeagueGroup[] = Array.from({ length: numGroups }, (_, i) => ({
    name: numGroups > 1 ? `グループ ${String.fromCharCode(65 + i)}` : 'リーグ戦',
    teams: [],
    matches: [],
  }));

  // 2. チームをグループに分散（ラウンドロビン）
  teams.forEach((team, index) => {
    const groupIndex = index % numGroups;
    const teamStats: LeagueTeamStats = {
      team,
      played: 0, 
      wins: 0, 
      draws: 0, 
      losses: 0,
      goalsFor: 0, 
      goalsAgainst: 0, 
      goalDifference: 0, 
      points: 0,
    };
    groups[groupIndex].teams.push(teamStats);
  });
  
  // 3. 各グループの対戦カードを生成
  groups.forEach(group => {
    group.matches = generateFixturesForGroup(group.teams);
  });
  
  // 4. 最適化されたスケジューリング
  if (eventStartTime && typeof matchDurationInMinutes === 'number' && typeof restTimeInMinutes === 'number') {
    scheduleMatchesOptimally(groups, numberOfCourts, eventStartTime, matchDurationInMinutes, restTimeInMinutes);
  }

  // 5. 決勝ラウンドの作成
  let finalRound: any = undefined;
  if (hasFinalRound && advanceTeamsPerGroup > 0) {
    const advancingTeams = getAdvancingTeams({ groups } as LeagueTable, advanceTeamsPerGroup);
    if (advancingTeams.length >= 2) {
      finalRound = createFinalRound(advancingTeams, finalRoundType, {
        numberOfCourts,
        eventStartTime,
        matchDurationInMinutes,
        restTimeInMinutes,
      });
    }
  }

  return {
    id: `league-${Date.now()}`,
    name: 'リーグ戦',
    groups,
    hasFinalRound,
    finalRound,
    settings: {
      numGroups,
      teamsPerGroup: Math.ceil(teams.length / numGroups),
      advanceTeamsPerGroup,
      numberOfCourts,
      eventStartTime,
      matchDurationInMinutes,
      restTimeInMinutes,
    },
  };
};

/**
 * 最適化されたスケジューリングアルゴリズム
 * 各チームの待ち時間と試合間隔を均等化し、複数コートを効率的に活用
 */
const scheduleMatchesOptimally = (
  groups: LeagueGroup[],
  numberOfCourts: number,
  eventStartTime: string,
  matchDurationInMinutes: number,
  restTimeInMinutes: number
) => {
  const totalTimePerMatchSlot = matchDurationInMinutes + restTimeInMinutes;
  
  // 全試合を収集
  const allMatches: LeagueMatch[] = [];
  groups.forEach(group => {
    group.matches.forEach(match => {
      allMatches.push(match);
    });
  });

  // チームごとの試合スケジュールを追跡
  const teamSchedules = new Map<string, string[]>();
  const teamLastMatchTime = new Map<string, string>();
  
  // 初期化
  allMatches.forEach(match => {
    if (!teamSchedules.has(match.team1Id)) {
      teamSchedules.set(match.team1Id, []);
      teamLastMatchTime.set(match.team1Id, eventStartTime);
    }
    if (!teamSchedules.has(match.team2Id)) {
      teamSchedules.set(match.team2Id, []);
      teamLastMatchTime.set(match.team2Id, eventStartTime);
    }
  });

  // コートの空き状況を追跡
  const courtSchedules = Array(numberOfCourts).fill(null).map(() => ({
    nextAvailableTime: eventStartTime,
    matches: [] as LeagueMatch[]
  }));

  // より効率的なスケジューリング
  scheduleMatchesWithParallelCourts(
    allMatches,
    courtSchedules,
    teamSchedules,
    teamLastMatchTime,
    totalTimePerMatchSlot
  );

  // 各グループ内で試合を開始時間順にソート
  groups.forEach(group => {
    group.matches.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  });
};

/**
 * 複数コートを同時活用するスケジューリング
 */
const scheduleMatchesWithParallelCourts = (
  allMatches: LeagueMatch[],
  courtSchedules: Array<{ nextAvailableTime: string; matches: LeagueMatch[] }>,
  teamSchedules: Map<string, string[]>,
  teamLastMatchTime: Map<string, string>,
  totalTimePerMatchSlot: number
) => {
  console.log('=== スケジューリング開始 ===');
  console.log('総試合数:', allMatches.length);
  console.log('コート数:', courtSchedules.length);
  
  const unscheduledMatches = [...allMatches];
  
  while (unscheduledMatches.length > 0) {
    console.log('残り試合数:', unscheduledMatches.length);
    
    // 最も早いコートの時間を基準にする
    const baseTime = getEarliestCourtTime(courtSchedules);
    console.log('基準時間:', baseTime);
    
    // 利用可能なコートに試合を割り当て
    let assignedCount = 0;
    const assignedMatches: LeagueMatch[] = [];
    
    // 各コートで同時に試合をスケジューリング
    for (let i = 0; i < courtSchedules.length; i++) {
      const court = courtSchedules[i];
      console.log(`コート${i + 1}の空き時間:`, court.nextAvailableTime);
      
      // このコートでスケジューリング可能な試合を見つける
      const availableMatch = unscheduledMatches.find(match => {
        // 既に他のコートに割り当てられていないかチェック
        if (assignedMatches.some(am => am.id === match.id)) {
          return false;
        }
        
        const team1LastTime = teamLastMatchTime.get(match.team1Id)!;
        const team2LastTime = teamLastMatchTime.get(match.team2Id)!;
        const earliestPossibleTime = getLaterTime(team1LastTime, team2LastTime);
        
        // コートの空き時間とチームの制約のうち遅い方を採用
        const effectiveTime = getLaterTime(earliestPossibleTime, court.nextAvailableTime);
        
        console.log(`試合 ${match.team1Id} vs ${match.team2Id}: チーム1最終時間=${team1LastTime}, チーム2最終時間=${team2LastTime}, コート空き時間=${court.nextAvailableTime}, 有効時間=${effectiveTime}`);
        
        // 基準時間と比較して、同時進行可能かチェック
        return effectiveTime <= baseTime || Math.abs(timeDifferenceInMinutes(effectiveTime, baseTime)) <= 5;
      });
      
      if (availableMatch) {
        // 試合をスケジューリング
        const team1LastTime = teamLastMatchTime.get(availableMatch.team1Id)!;
        const team2LastTime = teamLastMatchTime.get(availableMatch.team2Id)!;
        const earliestPossibleTime = getLaterTime(team1LastTime, team2LastTime);
        const effectiveTime = getLaterTime(earliestPossibleTime, court.nextAvailableTime);
        
        // 同時進行のため、基準時間に合わせる
        const scheduledTime = getLaterTime(effectiveTime, baseTime);
        
        availableMatch.startTime = scheduledTime;
        availableMatch.court = i + 1;
        
        console.log(`試合をスケジューリング: コート${i + 1}, 時間${scheduledTime}, ${availableMatch.team1Id} vs ${availableMatch.team2Id}`);
        
        // コートの次の空き時間を更新
        court.nextAvailableTime = addMinutesToTime(scheduledTime, totalTimePerMatchSlot);
        court.matches.push(availableMatch);
        
        // チームのスケジュールを更新
        const team1Schedule = teamSchedules.get(availableMatch.team1Id)!;
        const team2Schedule = teamSchedules.get(availableMatch.team2Id)!;
        
        team1Schedule.push(availableMatch.startTime!);
        team2Schedule.push(availableMatch.startTime!);
        
        teamLastMatchTime.set(availableMatch.team1Id, availableMatch.startTime!);
        teamLastMatchTime.set(availableMatch.team2Id, availableMatch.startTime!);
        
        // スケジュール済みの試合をリストから削除
        const matchIndex = unscheduledMatches.findIndex(m => m.id === availableMatch.id);
        if (matchIndex !== -1) {
          unscheduledMatches.splice(matchIndex, 1);
        }
        
        assignedMatches.push(availableMatch);
        assignedCount++;
      }
    }
    
    console.log(`この時間スロットで割り当てた試合数: ${assignedCount}`);
    
    // 試合が割り当てられなかった場合、時間を進める
    if (assignedCount === 0) {
      console.log('試合が割り当てられませんでした。時間を進めます。');
      advanceTimeToNextAvailableSlot(courtSchedules, teamLastMatchTime);
    }
  }
  
  console.log('=== スケジューリング完了 ===');
};

/**
 * 2つの時間の差を分単位で計算
 */
const timeDifferenceInMinutes = (time1: string, time2: string): number => {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  return Math.abs(minutes1 - minutes2);
};

/**
 * 最も早いコートの時間を取得
 */
const getEarliestCourtTime = (courtSchedules: Array<{ nextAvailableTime: string }>): string => {
  return courtSchedules.reduce((earliest, court) => 
    court.nextAvailableTime < earliest ? court.nextAvailableTime : earliest,
    courtSchedules[0].nextAvailableTime
  );
};

/**
 * 指定時間でスケジューリング可能な試合を見つける
 */
const findSchedulableMatches = (
  matches: LeagueMatch[],
  teamLastMatchTime: Map<string, string>,
  currentTime: string
): LeagueMatch[] => {
  return matches.filter(match => {
    const team1LastTime = teamLastMatchTime.get(match.team1Id)!;
    const team2LastTime = teamLastMatchTime.get(match.team2Id)!;
    const earliestPossibleTime = getLaterTime(team1LastTime, team2LastTime);
    return earliestPossibleTime <= currentTime;
  });
};

/**
 * 次の利用可能な時間スロットまで時間を進める
 */
const advanceTimeToNextAvailableSlot = (
  courtSchedules: Array<{ nextAvailableTime: string }>,
  teamLastMatchTime: Map<string, string>
) => {
  const nextAvailableTime = getEarliestCourtTime(courtSchedules);
  
  // 全てのコートの時間を次の利用可能時間に更新
  courtSchedules.forEach(court => {
    if (court.nextAvailableTime === nextAvailableTime) {
      // このコートは既に次の時間に設定されている
      return;
    }
    // 他のコートも同じ時間に設定（同時進行のため）
    court.nextAvailableTime = nextAvailableTime;
  });
};

/**
 * 2つの時間文字列のうち遅い方を返す
 */
const getLaterTime = (time1: string, time2: string): string => {
  return time1.localeCompare(time2) >= 0 ? time1 : time2;
};

// 既存の関数を最適化されたバージョンに置き換え
export const generateLeagueTable = generateOptimizedLeagueTable;
