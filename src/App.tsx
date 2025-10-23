
// src/App.tsx
import React, { useState, useCallback, useMemo, Suspense } from 'react';
import LoginPage from '@/components/LoginPage';
import SignupSelectionPage from '@/components/SignupSelectionPage';
import SignupPage from '@/components/SignupPage';
import { Team, View, Match, Venue, ScheduleEvent, FollowedTeam, ChatThread, TeamLevel, ChatMessage, MatchType, MatchStatus, TournamentInfoFormData, ScheduleEventType } from './types';
import { mockTeams, mockMatches, mockVenues, mockScheduleEvents, mockPastMatchResults, mockChatThreads, mockChatMessages, mockUserAccounts } from './data/mockData';
import TeamProfilePage from '@/components/TeamProfilePage';
import MatchesPage from '@/components/MatchesPage';
import VenueBookingPage from '@/components/VenueBookingPage';
import { SchedulePage } from '@/components/SchedulePage';
import TeamManagementPage from '@/components/TeamManagementPage';
import FollowedTeamsPage from './components/FollowedTeamsPage';
import { ChatPage } from '@/components/ChatPage';
import ChatScreen from '@/components/ChatScreen';
import { MatchmakingPage } from '@/components/MatchmakingPage';


import TeamSelectionPage from '@/components/TeamSelectionPage';
// 庶務機能とメンバー機能のインポート
import { AdministrativePage } from '@/components/AdministrativePage';
import { AnnouncementsPage } from '@/components/AnnouncementsPage';
import { AttendancePage } from '@/components/AttendancePage';
import { MemberInfoPage } from '@/components/MemberInfoPage';
import { MerchandiseManagementPage } from '@/components/MerchandiseManagementPage';
import { PaymentManagementPage } from '@/components/PaymentManagementPage';
import MemberProfilePage from '@/components/MemberProfilePage';
import { TeamInvitationPage } from '@/components/TeamInvitationPage';

// 新しいインポート
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorBoundary as CustomErrorBoundary } from '@/components/common/ErrorBoundary';
import { AccessibilityProvider } from '@/components/common/AccessibilityProvider';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAsync } from '@/hooks/useAsync';
import { memoize } from '@/utils/memoization';
import { isNotNull } from '@/utils/typeGuards';
import { useAuthStore } from '@/stores/authStore';
import { Permission, ROLE_PERMISSIONS } from '@/types/auth';

const App: React.FC = () => {
  // 認証・アカウント作成状態
  const { user, setUser } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup-selection' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'member'>('member');
  // チーム選択状態
  const [teamSelectionDone, setTeamSelectionDone] = useState(false);
  
  // ローカルストレージを使用した設定の永続化
  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    theme: 'dark',
    language: 'ja',
    notifications: true,
  });

  const [currentView, setCurrentView] = useState<View>(View.TEAM_MANAGEMENT);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  // Track previous view and context for context-aware navigation
  const [previousView, setPreviousView] = useState<{ view: View; filters?: any } | null>(null);
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  
  // ユーザーに基づいて管理チームを設定
  const [managedTeams, setManagedTeams] = useState<Team[]>([]);
  const [selectedManagedTeamId, setSelectedManagedTeamId] = useState<string | null>(null);
  const selectedManagedTeam = useMemo(() => managedTeams.find(t => t.id === selectedManagedTeamId), [managedTeams, selectedManagedTeamId]);

  const [userAccounts, setUserAccounts] = useState(mockUserAccounts);
  
  // チーム招待システムの状態管理
  const [teamInvitations, setTeamInvitations] = useState<{
    id: string;
    teamId: string;
    teamName: string;
    inviterId: string;
    inviterName: string;
    invitedUserId: string;
    invitedUserEmail: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
  }[]>([]);
  
  const [userTeamMemberships, setUserTeamMemberships] = useState<{
    userId: string;
    teamId: string;
    role: 'admin' | 'editor' | 'member';
    joinedAt: Date;
  }[]>([]);

  // ユーザーの権限を取得
  const getUserRole = useCallback((email: string) => {
    // 動的なuserAccounts状態から検索
    const userAccount = userAccounts.find(account => account.email === email);
    console.log('getUserRole called for email:', email, 'found account:', userAccount);
    return userAccount?.role || 'member';
  }, [userAccounts]);

  const currentUserRole = user ? getUserRole(user.email) : 'member';

  // チーム招待の処理関数
  const sendTeamInvitation = useCallback((teamId: string, teamName: string, invitedUserEmail: string, role: 'admin' | 'editor' | 'member') => {
    const invitedUser = userAccounts.find(account => account.email === invitedUserEmail);
    if (!invitedUser) {
      console.log('User not found for invitation:', invitedUserEmail);
      return false;
    }

    const newInvitation = {
      id: 'invitation-' + Date.now(),
      teamId,
      teamName,
      inviterId: user?.id || '',
      inviterName: user?.name || '',
      invitedUserId: invitedUser.id,
      invitedUserEmail,
      status: 'pending' as const,
      createdAt: new Date()
    };

    setTeamInvitations(prev => [...prev, newInvitation]);
    console.log('Team invitation sent:', newInvitation);
    return true;
  }, [user, userAccounts]);

  const acceptTeamInvitation = useCallback((invitationId: string) => {
    const invitation = teamInvitations.find(inv => inv.id === invitationId);
    if (!invitation || !user) return;

    // 招待を承諾状態に更新
    setTeamInvitations(prev => 
      prev.map(inv => inv.id === invitationId ? { ...inv, status: 'accepted' } : inv)
    );

    // ユーザーのチームメンバーシップを追加
    const newMembership = {
      userId: user.id,
      teamId: invitation.teamId,
      role: 'member' as const, // 招待された場合は常にメンバーとして参加
      joinedAt: new Date()
    };

    setUserTeamMemberships(prev => [...prev, newMembership]);

    // チーム情報を取得して管理チームに設定
    const team = teams.find(t => t.id === invitation.teamId);
    if (team) {
      setManagedTeams([team]);
      setSelectedManagedTeamId(team.id);
      setTeamSelectionDone(true);
      console.log('Team invitation accepted, team set as managed:', team.name);
    }
  }, [teamInvitations, user, teams]);

  const declineTeamInvitation = useCallback((invitationId: string) => {
    setTeamInvitations(prev => 
      prev.map(inv => inv.id === invitationId ? { ...inv, status: 'declined' } : inv)
    );
    console.log('Team invitation declined:', invitationId);
  }, []);

  // ログイン後の初期表示設定
  React.useEffect(() => {
    console.log('=== useEffect for Initial View Setting ===');
    console.log('Effect triggered with:', {
      user: user?.email,
      teamSelectionDone,
      currentView,
      currentUserRole
    });
    
    if (user && teamSelectionDone && currentView === View.TEAM_MANAGEMENT) {
      if (currentUserRole === 'member') {
        console.log('Setting initial view to SCHEDULE for member user');
        setCurrentView(View.SCHEDULE);
        console.log('Setting initial view to SCHEDULE for member user');
      }
      // 管理者・編集者はチーム選択後に自チーム管理画面に設定されるため、ここでは設定しない
    } else {
      console.log('Effect conditions not met:', {
        hasUser: !!user,
        teamSelectionDone,
        isTeamManagementView: currentView === View.TEAM_MANAGEMENT,
        isMemberRole: currentUserRole === 'member'
      });
    }
  }, [user, currentUserRole, teamSelectionDone, currentView]);
  
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [venues] = useState<Venue[]>(mockVenues);
  const [manualScheduleEvents, setManualScheduleEvents] = useState<ScheduleEvent[]>(mockScheduleEvents);
  // --- スケジュール自動同期ロジック ---
  // メモ化された自動スケジュールイベント生成
  const autoScheduleEvents = useMemo(() => {
    return matches
      .filter(m => m.ourTeamId === selectedManagedTeamId || m.participants?.some(p => p.teamId === selectedManagedTeamId))
      .map(m => {
        // 開始・終了時刻の推定（例: matchDurationInMinutes使用）
        const startTime = m.time || '10:00';
        let endTime = '12:00';
        if (m.matchDurationInMinutes) {
          const [h, min] = startTime.split(':').map(Number);
          const end = new Date(2025, 0, 1, h, min + m.matchDurationInMinutes);
          endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
        }
        return {
          id: `auto-event-${m.id}`,
          title: `${m.type} vs ${m.opponentTeamName || ''}`,
          type: ScheduleEventType.MATCH,
          date: m.date,
          startTime,
          endTime,
          location: m.location,
          description: '',
          relatedMatchId: m.id,
          teamId: m.ourTeamId,
        };
      });
  }, [matches, selectedManagedTeamId]);
  
  const [followedTeams, setFollowedTeams] = useState<FollowedTeam[]>(() => 
    mockTeams.filter(t => t.id !== 'team-1').slice(0, 10).map(t => ({...t, isFavorite: Math.random() > 0.5, logoUrl: t.logoUrl}))
  );
  
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(mockChatThreads);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(mockChatMessages);
  const [selectedChatThreadId, setSelectedChatThreadId] = useState<string | null>(null);
  const [selectedMatchIdForGuideline, setSelectedMatchIdForGuideline] = useState<string | null>(null);

  const currentUserId = selectedManagedTeam?.id || 'user-self';

  const handleUpdateMatches = useCallback((updater: React.SetStateAction<Match[]>) => {
    setMatches(updater);
  }, []);
  
  const handleUpdateTeams = useCallback((updater: React.SetStateAction<Team[]>) => {
     setTeams(prevGlobalTeams => {
        const updatedGlobalTeams = typeof updater === 'function' ? updater(prevGlobalTeams) : updater;

        setManagedTeams(currentManagedTeams => 
            currentManagedTeams.map(mt => updatedGlobalTeams.find(ut => ut.id === mt.id) || mt)
        );

        return updatedGlobalTeams;
    });
  }, []);

  const handleUpdateGuidelineForMatch = useCallback((matchId: string, guidelineData: TournamentInfoFormData) => {
    setMatches(prev => 
      prev.map(m => 
        m.id === matchId 
          ? { ...m, detailedTournamentInfo: guidelineData, location: guidelineData.eventName, date: guidelineData.eventDateTime.eventDate, time: guidelineData.eventDateTime.startTime } 
          : m
      )
    );
    alert('大会要項が更新されました。');
  }, []);
  
  const handleSaveNewGuidelineAsNewMatch = useCallback((newMatch: Match) => {
    setMatches(prev => [newMatch, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    alert('大会要項が新しい試合として保存されました。');
  }, []);


  // Used when navigating from FollowedTeamsPage
  const handleSelectTeamFromFollowed = (team: Team) => {
    setPreviousView({ view: View.FOLLOWED_TEAMS });
    setSelectedTeam(team);
    setCurrentView(View.TEAM_PROFILE);
  };

  // Used when navigating from MatchmakingPage, with filters
  const handleSelectTeamFromMatching = (team: any, filters: any) => {
    // MatchmakingTeamからApp.tsxのTeam型に変換
    const convertedTeam: Team = {
      id: team.id,
      name: team.name,
      logoUrl: team.logoUrl,
      coachName: team.coachName,
      level: team.level === 'beginner' ? TeamLevel.BEGINNER : 
             team.level === 'intermediate' ? TeamLevel.INTERMEDIATE : 
             TeamLevel.ADVANCED,
      rating: team.rating,
      rank: team.overallRank || 0,
      members: [],
      description: team.description || '',
      prefecture: team.prefecture,
      city: team.city,
      ageCategory: team.ageCategory,
    };
    
    setPreviousView({ view: View.MATCHMAKING, filters });
    setSelectedTeam(convertedTeam);
    setCurrentView(View.TEAM_PROFILE);
  };
  
  const handleSelectManagedTeam = (teamId: string) => {
    setSelectedManagedTeamId(teamId);
    setCurrentView(View.TEAM_MANAGEMENT);
  };



  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm("このチームを本当に削除しますか？関連データは元に戻せません。")) {
      setManagedTeams(prev => prev.filter(t => t.id !== teamId));
    }
  };
  
  const handleBackToTeamSelection = () => {
    setSelectedManagedTeamId(null);
  };
  
  const handleEditGuidelineForMatch = (matchId: string) => {
    setSelectedMatchIdForGuideline(matchId);
    navigateTo(View.TOURNAMENT_GUIDELINES);
  };

  const navigateTo = (view: View) => {
    // チームに参加していないユーザーがチーム関連の機能にアクセスしようとした場合はチーム招待画面にリダイレクト
    if (!selectedManagedTeam && view !== View.TEAM_INVITATIONS && view !== View.MEMBER_PROFILE) {
      console.log('User not in team, redirecting to team invitations');
      setCurrentView(View.TEAM_INVITATIONS);
      return;
    }
    
    // メンバーアカウントが自チーム管理画面にアクセスしようとした場合はスケジュール画面にリダイレクト
    if (currentUserRole === 'member' && view === View.TEAM_MANAGEMENT) {
      setCurrentView(View.SCHEDULE);
      return;
    }
    
    if (view !== View.TEAM_PROFILE && view !== View.CHAT_SCREEN) setSelectedTeam(null);
    if (view !== View.CHAT_SCREEN) setSelectedChatThreadId(null);
    if (view !== View.TOURNAMENT_GUIDELINES) setSelectedMatchIdForGuideline(null);
    setCurrentView(view);
  };

  const navigateToChatScreen = (threadId: string) => {
    setSelectedChatThreadId(threadId);
    setCurrentView(View.CHAT_SCREEN);
  };
  
  const updateManagedTeam = (updatedTeam: Team) => {
    setManagedTeams(prevManaged => prevManaged.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    setTeams(prevTeams => prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    setFollowedTeams(prevFollowed => prevFollowed.map(ft => ft.id === updatedTeam.id ? {...updatedTeam, isFavorite: ft.isFavorite, logoUrl: updatedTeam.logoUrl} : ft));
  };

  const toggleFollowTeam = (teamToToggle: Team) => {
    setFollowedTeams(prev => {
        const isFollowing = prev.find(ft => ft.id === teamToToggle.id);
        if (isFollowing) {
            return prev.filter(ft => ft.id !== teamToToggle.id);
        } else {
            const teamData = teams.find(t => t.id === teamToToggle.id) || teamToToggle;
            return [...prev, {...teamData, isFavorite: false, logoUrl: teamData.logoUrl}];
        }
    });
  };

  const toggleFollowTeamById = (teamId: string) => {
    const teamToToggle = teams.find(t => t.id === teamId);
    if (teamToToggle) {
      toggleFollowTeam(teamToToggle);
    }
  };

  const toggleFavoriteTeam = (teamId: string) => {
    setFollowedTeams(prev => prev.map(ft => ft.id === teamId ? {...ft, isFavorite: !ft.isFavorite} : ft));
  };

  const handleAddChatThread = (newThread: ChatThread, initialMessage?: ChatMessage, shouldNavigate: boolean = true) => {
    setChatThreads(prev => [newThread, ...prev].sort((a, b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)));
    if (initialMessage) {
        setChatMessages(prevMessages => ({ ...prevMessages, [newThread.id]: [initialMessage] }));
    }
    if (shouldNavigate) navigateToChatScreen(newThread.id);
  };
  
  const handleSendMessage = (threadId: string, message: ChatMessage) => {
    setChatMessages(prev => ({ ...prev, [threadId]: [...(prev[threadId] || []), message] }));
    setChatThreads(prevThreads => prevThreads.map(t => 
        t.id === threadId ? {...t, lastMessage: message, unreadCount: (message.senderId === currentUserId ? t.unreadCount : (t.unreadCount || 0) + 1) } : t 
    ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)));
  };

  const NavButton: React.FC<{ view: View; label: string; current: View; onClick: (view: View) => void }> = ({ view, label, current, onClick }) => (
    <button onClick={() => onClick(view)} className={`px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-md font-medium transition-colors ${current === view ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-700 hover:bg-slate-600 text-sky-300 hover:text-sky-200'}`} aria-current={current === view ? "page" : undefined}>
      {label}
    </button>
  );

  const currentSelectedChatThread = selectedChatThreadId ? chatThreads.find(t => t.id === selectedChatThreadId) : null;
  const messagesForSelectedThread = selectedChatThreadId ? chatMessages[selectedChatThreadId] || [] : [];
  

  // 認証フロー
  if (!isAuthenticated || !user) {
    return (
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <CustomErrorBoundary onError={(error, errorInfo) => {
            console.error('App Error:', error, errorInfo)
          }}>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
              <div className="max-w-md w-full mx-auto p-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    エラーが発生しました
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    申し訳ございませんが、予期しないエラーが発生しました。
                  </p>
                  <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            </div>
          </CustomErrorBoundary>
        )}
      >
        {authMode === 'login' && (
          <LoginPage
            onLogin={async (email: string, password: string) => {
              // ユーザーアカウントから検索
              const userAccount = userAccounts.find(account => 
                account.email === email && account.password === password
              );
              
              if (userAccount) {
                setUser({ 
                  id: userAccount.id, 
                  name: userAccount.name, 
                  email: userAccount.email,
                  role: userAccount.role,
                  permissions: userAccount.role === 'admin' ? ['admin.all'] : userAccount.role === 'editor' ? ['team.edit', 'member.invite', 'member.manage', 'match.create', 'match.edit', 'match.delete', 'match.score', 'schedule.create', 'schedule.edit', 'chat.send', 'chat.read', 'notice.send', 'payment.manage', 'product.manage', 'venue.book'] : ['chat.send', 'chat.read'],
                  teamId: userAccount.teamId
                });
                setIsAuthenticated(true);
                
                // ユーザーのチームを設定
                if (userAccount.teamId) {
                  const userTeams = mockTeams.filter(t => t.id === userAccount.teamId);
                  if (userTeams.length > 0) {
                    setManagedTeams(userTeams);
                    setSelectedManagedTeamId(userTeams[0].id);
                    setTeamSelectionDone(true);
                    console.log('Setting managed teams for user:', userAccount.email, 'teams:', userTeams);
                  }
                } else if (userAccount.role === 'member') {
                  // メンバーアカウントの場合は空のチーム情報でスタート
                  setManagedTeams([]);
                  setSelectedManagedTeamId(null);
                  setTeamSelectionDone(true);
                  console.log('Member account login - starting with empty team data');
                }
                
                // メンバーアカウントの場合はスケジュール画面に設定（管理者・編集者はチーム選択後に設定）
                if (userAccount.role === 'member') {
                  // 状態更新を確実にするため、遅延を設定
                  setTimeout(() => {
                    setCurrentView(View.SCHEDULE);
                  }, 100);
                }
                
                console.log('Login successful:', { userAccount, defaultTeam: mockTeams.find(t => t.id === 'team-1') });
              } else {
                // デフォルトユーザー（テスト用）
                const defaultTeam = mockTeams.find(t => t.id === 'team-1');
                if (defaultTeam) {
                  setManagedTeams([defaultTeam]);
                  setSelectedManagedTeamId(defaultTeam.id);
                  setTeamSelectionDone(true);
                }
                setUser({ 
                  id: 'user-' + Date.now(), 
                  name: 'ログインユーザー', 
                  email,
                  role: 'member',
                  permissions: ['chat.send', 'chat.read'],
                  teamId: 'team-1'
                });
                setIsAuthenticated(true);
              }
              
              // 状態更新を確実にするための遅延
              await new Promise(resolve => setTimeout(resolve, 100));
            }}
            onNavigateToSignup={() => setAuthMode('signup-selection')}
          />
        )}

        {authMode === 'signup-selection' && (
          <SignupSelectionPage
            onSelectRole={(role: 'admin' | 'editor' | 'member') => {
              setSelectedRole(role);
              setAuthMode('signup');
            }}
            onBack={() => setAuthMode('login')}
          />
        )}

        {authMode === 'signup' && (
          <SignupPage
            selectedRole={selectedRole}
            onCreateAccount={async (email: string, password: string, name: string, role: 'admin' | 'editor' | 'member') => {
              console.log('=== Account Creation Started ===');
              console.log('Creating account with:', { email, name, role });
              
              // アカウント作成処理
              const newUser = { 
                id: 'user-' + Date.now(), 
                name, 
                email,
                role,
                permissions: ROLE_PERMISSIONS[role],
                teamId: role === 'member' ? 'team-1' : undefined
              };
              
              console.log('New user object created:', newUser);
              
              // 新しく作成したアカウントをuserAccountsに追加
              const newUserAccount = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                password: 'password', // 仮のパスワード
                role: newUser.role,
                teamId: newUser.teamId,
                isActive: true,
                createdAt: new Date(),
                lastLoginAt: new Date()
              };
              
              console.log('New user account object created:', newUserAccount);
              
              // userAccountsに新規アカウントを追加
              setUserAccounts(prev => [...prev, newUserAccount]);
              
              // 新しく作成したアカウントで自動的にログイン
              setUser(newUser);
              setIsAuthenticated(true);
              
              console.log('User set and authenticated. Current state:', {
                user: newUser,
                isAuthenticated: true,
                role: newUser.role
              });
              
              // メンバーアカウントの場合はデフォルトチームを設定してプロフィール画面に遷移
              if (role === 'member') {
                console.log('Member account - setting up default team and redirecting to profile');
                // 新規メンバーアカウントの場合は空のチーム情報でスタート
                setManagedTeams([]);
                setSelectedManagedTeamId(null);
                setTeamSelectionDone(true);
                console.log('New member account - starting with empty team data');
                // 状態更新を確実にするため、遅延を設定
                setTimeout(() => {
                  console.log('Redirecting new member to MEMBER_PROFILE view');
                  setCurrentView(View.MEMBER_PROFILE);
                  console.log('New member account created, redirecting to profile with empty team data');
                }, 100);
              } else {
                // 管理者・編集者アカウントの場合はチーム選択画面を表示
                console.log('Admin/Editor account - setting up for team selection');
                setTeamSelectionDone(false);
                setSelectedManagedTeamId(null);
                setManagedTeams([]);
                console.log('Admin/Editor account created, redirecting to team selection');
                console.log('State after setup:', {
                  teamSelectionDone: false,
                  selectedManagedTeamId: null,
                  managedTeams: []
                });
              }
              
              console.log('=== Account Creation Completed ===');
            }}
            onBack={() => setAuthMode('signup-selection')}
          />
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f1f5f9',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f1f5f9',
              },
            },
          }}
        />
      </ErrorBoundary>
    );
  }
  // ログイン後のフロー
  if (!teamSelectionDone) {
    console.log('=== Team Selection Check ===');
    console.log('Current state:', {
      teamSelectionDone,
      currentUserRole,
      user: user?.email,
      managedTeams: managedTeams.length,
      selectedManagedTeamId
    });
    
    // メンバーアカウントの場合はチーム選択画面をスキップ
    if (currentUserRole === 'member') {
      console.log('Member account detected - skipping team selection');
      // メンバーアカウントの場合は空のチーム情報でスタート
      setManagedTeams([]);
      setSelectedManagedTeamId(null);
      setTeamSelectionDone(true);
      console.log('Member account - starting with empty team data in login flow');
      return null;
    }
    
    console.log('Admin/Editor account - showing team selection page');
    
    // 管理者・編集者アカウントは常にチーム選択画面を表示
    // 既にチームが設定されている場合でも、チーム選択画面で確認できるようにする

    // 管理者・編集者の場合はチーム選択画面を表示
    return <TeamSelectionPage
      teams={teams}
      onSelectTeam={teamId => {
        console.log('=== Team Selection - onSelectTeam ===');
        console.log('Selected team ID:', teamId);
        const selectedTeam = teams.find(t => t.id === teamId);
        if (selectedTeam) {
          console.log('Selected team found:', selectedTeam.name);
          setManagedTeams([selectedTeam]); // 選択されたチームのみを管理チームとして設定
          setSelectedManagedTeamId(teamId);
          setTeamSelectionDone(true);
          
          console.log('Team selection completed. New state:', {
            managedTeams: [selectedTeam],
            selectedManagedTeamId: teamId,
            teamSelectionDone: true
          });
          
          // 管理者・編集者の場合は自チーム管理画面に設定
          if (currentUserRole === 'admin' || currentUserRole === 'editor') {
            console.log('Setting view to TEAM_MANAGEMENT for admin/editor');
            setCurrentView(View.TEAM_MANAGEMENT);
            console.log('Setting initial view to TEAM_MANAGEMENT after team selection:', selectedTeam.name);
            console.log('Selected team details:', { id: selectedTeam.id, name: selectedTeam.name, selectedId: teamId });
          }
        }
      }}
              onCreateTeam={(teamName, coachName) => {
        console.log('=== Team Creation - onCreateTeam ===');
        console.log('Creating team:', { teamName, coachName });
        
        const newTeam = {
          id: 'team-' + Date.now(),
          name: teamName,
          coachName,
          logoUrl: '',
          level: TeamLevel.BEGINNER,
          rating: 1000,
          rank: 0,
          members: [],
          description: '',
          prefecture: '',
          city: '',
          ageCategory: undefined,
        };
        
        console.log('New team object created:', newTeam);
        
        // 新しく作成したチームを追加
        setTeams(prev => [...prev, newTeam]);
        
        // 状態更新を確実にするため、順序を調整
        setManagedTeams([newTeam]); // 新しく作成したチームのみを管理チームとして設定
        setSelectedManagedTeamId(newTeam.id);
        setTeamSelectionDone(true);
        
        console.log('Team creation completed. New state:', {
          managedTeams: [newTeam],
          selectedManagedTeamId: newTeam.id,
          teamSelectionDone: true
        });
        
        // 管理者・編集者の場合は自チーム管理画面に設定
        if (currentUserRole === 'admin' || currentUserRole === 'editor') {
          console.log('Setting view to TEAM_MANAGEMENT for admin/editor after team creation');
          setCurrentView(View.TEAM_MANAGEMENT);
          console.log('Setting initial view to TEAM_MANAGEMENT after team creation:', newTeam.name);
          console.log('New team details:', { id: newTeam.id, name: newTeam.name, selectedId: newTeam.id });
        }
      }}
      onDeleteTeam={teamId => {
        setTeams(prev => prev.filter(t => t.id !== teamId));
        setManagedTeams(prev => prev.filter(t => t.id !== teamId));
        if (selectedManagedTeamId === teamId) setSelectedManagedTeamId(null);
      }}
      onBack={() => {
        setTeamSelectionDone(false);
        setSelectedManagedTeamId(null);
      }}
      currentUserEmail={user?.email || ''}
    />;
  }

  // selectedManagedTeamがnull/undefinedの場合は何も表示しない（理論上到達しないが型安全のため）
  if (!selectedManagedTeam) {
    console.log('selectedManagedTeam is null:', { selectedManagedTeam, selectedManagedTeamId, managedTeams });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="text-center">
          <p className="text-slate-400">チーム情報の読み込み中...</p>
        </div>
      </div>
    );
  }

  console.log('=== Main Render ===');
  console.log('Current state:', {
    currentView,
    selectedManagedTeam: selectedManagedTeam.name,
    currentUserRole,
    teamSelectionDone,
    managedTeams: managedTeams.map(t => ({ id: t.id, name: t.name }))
  });

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <CustomErrorBoundary onError={(error, errorInfo) => {
          console.error('App Error:', error, errorInfo)
        }}>
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
            <div className="max-w-md w-full mx-auto p-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  エラーが発生しました
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  申し訳ございませんが、予期しないエラーが発生しました。
                </p>
                <button
                  onClick={resetErrorBoundary}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  再試行
                </button>
              </div>
            </div>
          </div>
        </CustomErrorBoundary>
      )}
    >
      <AccessibilityProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        }>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white p-4 sm:p-6">
        <header className="mb-6 text-center">
          <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400">{selectedManagedTeam.name}</h1>
              <p className="text-slate-400 mt-1 text-md sm:text-lg">チーム管理システム</p>
              {/* メンバーアカウント以外のみチーム選択ボタンを表示 */}
              {currentUserRole !== 'member' && (
                <button onClick={handleBackToTeamSelection} className="absolute top-1/2 -translate-y-1/2 left-0 bg-slate-700 hover:bg-slate-600 text-sky-300 font-semibold py-2 px-4 rounded-lg transition text-sm">&larr; チーム選択</button>
              )}
              {/* ログアウトボタン */}
              <button 
                onClick={() => {
                  setIsAuthenticated(false);
                  setUser({ 
                    id: '', 
                    name: '', 
                    email: '', 
                    role: 'member', 
                    permissions: [], 
                    teamId: undefined 
                  });
                  setTeamSelectionDone(false);
                  setSelectedManagedTeamId(null);
                  setManagedTeams([]);
                  setCurrentView(View.TEAM_MANAGEMENT);
                }} 
                className="absolute top-1/2 -translate-y-1/2 right-0 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                ログアウト
              </button>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-3 px-1">
          {/* チーム招待（全ユーザー向け） */}
          <NavButton view={View.TEAM_INVITATIONS} label="チーム招待" current={currentView} onClick={navigateTo} />
          
          {/* 管理者・編集者向け基本機能（チームに参加している場合のみ） */}
          {(currentUserRole === 'admin' || currentUserRole === 'editor') && selectedManagedTeam && (
            <>
              <NavButton view={View.TEAM_MANAGEMENT} label="チーム管理" current={currentView} onClick={navigateTo} />
              <NavButton view={View.MATCHMAKING} label="マッチング" current={currentView} onClick={navigateTo} />
              <NavButton view={View.MATCHES} label="試合管理" current={currentView} onClick={navigateTo} />
              <NavButton view={View.CHAT_LIST} label="チャット" current={currentView} onClick={navigateTo} />
              <NavButton view={View.SCHEDULE} label="スケジュール" current={currentView} onClick={navigateTo} />
            </>
          )}
          
          {/* 庶務機能（管理者・編集者、チームに参加している場合のみ） */}
          {(currentUserRole === 'admin' || currentUserRole === 'editor') && selectedManagedTeam && (
            <>
              <NavButton view={View.ADMINISTRATIVE} label="庶務管理" current={currentView} onClick={navigateTo} />
              <NavButton view={View.VENUE_BOOKING} label="会場予約" current={currentView} onClick={navigateTo} />
            </>
          )}
          
          {/* メンバー機能（チームに参加しているユーザーのみ、管理者・編集者機能と重複しない） */}
          {selectedManagedTeam && (currentUserRole === 'member' || !(currentUserRole === 'admin' || currentUserRole === 'editor')) && (
            <>
              <NavButton view={View.ANNOUNCEMENTS} label="お知らせ" current={currentView} onClick={navigateTo} />
              <NavButton view={View.ATTENDANCE} label="出欠連絡" current={currentView} onClick={navigateTo} />
              <NavButton view={View.MERCHANDISE} label="商品注文" current={currentView} onClick={navigateTo} />
              <NavButton view={View.PAYMENT} label="活動費" current={currentView} onClick={navigateTo} />
              <NavButton view={View.MEMBER_PROFILE} label="プロフィール" current={currentView} onClick={navigateTo} />
            </>
          )}
        </nav>

        <main className="container mx-auto max-w-5xl xl:max-w-7xl">
          {!currentView && (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
              <div className="text-center">
                <p className="text-slate-400">画面を読み込み中...</p>
              </div>
            </div>
          )}
          
          {/* チームに参加していないユーザー向けのメッセージ */}
          {!selectedManagedTeam && currentView !== View.TEAM_INVITATIONS && currentView !== View.MEMBER_PROFILE && (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
              <div className="text-center max-w-md mx-auto p-6">
                <h2 className="text-2xl font-bold text-sky-400 mb-4">チームに参加してください</h2>
                <p className="text-slate-300 mb-6">
                  チームの機能を利用するには、まずチームに招待される必要があります。
                </p>
                <button
                  onClick={() => navigateTo(View.TEAM_INVITATIONS)}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors font-medium"
                >
                  チーム招待を確認
                </button>
              </div>
            </div>
          )}
          
          {currentView === View.TEAM_MANAGEMENT && selectedManagedTeam && (
            <TeamManagementPage 
              team={selectedManagedTeam} 
              onUpdateTeam={updateManagedTeam}
              pastMatchResults={mockPastMatchResults} 
              allTeams={teams}
              matches={matches.filter(m => m.ourTeamId === selectedManagedTeamId || m.participants?.some(p => p.teamId === selectedManagedTeamId))}
              followedTeams={followedTeams}
              onSelectTeam={handleSelectTeamFromFollowed}
              onToggleFavorite={toggleFavoriteTeam}
              onUnfollow={toggleFollowTeam}
            />
          )}
          {currentView === View.TEAM_PROFILE && selectedTeam && (
            <TeamProfilePage 
              team={selectedTeam} 
              onBack={() => {
                if (previousView?.view === View.MATCHMAKING) {
                  setCurrentView(View.MATCHMAKING);
                  // Optionally, trigger filter restore via a ref or state (see below)
                } else {
                  setCurrentView(View.FOLLOWED_TEAMS);
                }
              }}
              allTeams={teams}
            />
          )}

          {currentView === View.MATCHES && selectedManagedTeam && (
            <MatchesPage 
              matches={matches} 
              teams={teams} 
              onUpdateMatches={handleUpdateMatches} 
              managedTeam={selectedManagedTeam}
              followedTeams={followedTeams}
              chatThreads={chatThreads}
              onAddChatThread={handleAddChatThread}
              onSendMessage={handleSendMessage}
              onUpdateTeams={handleUpdateTeams}
              onEditGuideline={handleEditGuidelineForMatch}
            />
          )}
          {currentView === View.VENUE_BOOKING && (
            <VenueBookingPage venues={venues} teams={teams} />
          )}
          {currentView === View.SCHEDULE && selectedManagedTeam && (
            <SchedulePage 
              onBack={() => navigateTo(View.TEAM_MANAGEMENT)} 
              isAdmin={currentUserRole === 'admin' || currentUserRole === 'editor'}
              matches={matches.filter(m => m.ourTeamId === selectedManagedTeamId || m.participants?.some(p => p.teamId === selectedManagedTeamId))}
            />
          )}

          {currentView === View.CHAT_LIST && selectedManagedTeam && (
            <ChatPage 
              onBack={() => navigateTo(View.TEAM_MANAGEMENT)} 
              chatThreads={chatThreads}
              chatMessages={chatMessages}
              onAddChatThread={handleAddChatThread}
              onSendMessage={handleSendMessage}
            />
          )}
          {currentView === View.CHAT_SCREEN && currentSelectedChatThread && selectedManagedTeam && (
            <ChatScreen
              thread={currentSelectedChatThread}
              messages={messagesForSelectedThread}
              currentUserId={currentUserId}
              currentUserTeamName={selectedManagedTeam.name}
              teams={teams}
              onSendMessage={handleSendMessage}
              onBackToList={() => navigateTo(View.CHAT_LIST)}
            />
          )}
          {currentView === View.MATCHMAKING && (
             <MatchmakingPage 
               onBack={() => navigateTo(View.TEAM_MANAGEMENT)} 
               onSelectTeam={handleSelectTeamFromMatching}
               onFollowTeam={toggleFollowTeamById}
               followedTeams={followedTeams}
             />
          )}
          

          
          {/* 庶務機能 */}
          {currentView === View.ADMINISTRATIVE && (
            <AdministrativePage onBack={() => navigateTo(View.TEAM_MANAGEMENT)} currentUser={user} />
          )}
          {currentView === View.MEMBER_PROFILE && (
            <MemberProfilePage 
              onBack={() => {
                // メンバーアカウントの場合はスケジュール画面に戻る
                if (currentUserRole === 'member') {
                  navigateTo(View.SCHEDULE);
                } else {
                  navigateTo(View.TEAM_MANAGEMENT);
                }
              }} 
            />
          )}
          
          {/* メンバー向け機能 */}
          {currentView === View.ANNOUNCEMENTS && (
            <AnnouncementsPage 
              onBack={() => navigateTo(View.SCHEDULE)} 
              isAdmin={false}
              currentUser={user}
            />
          )}
          {currentView === View.ATTENDANCE && (
            <AttendancePage 
              onBack={() => navigateTo(View.SCHEDULE)} 
              isAdmin={false}
            />
          )}
          {currentView === View.MERCHANDISE && (
            <MerchandiseManagementPage 
              onBack={() => navigateTo(View.SCHEDULE)} 
              isAdmin={false}
            />
          )}
          {currentView === View.PAYMENT && (
            <PaymentManagementPage 
              onBack={() => navigateTo(View.SCHEDULE)} 
              isAdmin={false}
            />
          )}
          {currentView === View.TEAM_INVITATIONS && (
            <TeamInvitationPage
              invitations={teamInvitations}
              onAccept={acceptTeamInvitation}
              onDecline={declineTeamInvitation}
              onBack={() => navigateTo(View.TEAM_MANAGEMENT)}
            />
          )}
        </main>

        <footer className="text-center mt-10 py-5 border-t border-slate-700">
          <p className="text-slate-500 text-xs sm:text-sm">&copy; {new Date().getFullYear()} チーム管理システム. All rights reserved.</p>
        </footer>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
        </Suspense>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
};

export default App;
