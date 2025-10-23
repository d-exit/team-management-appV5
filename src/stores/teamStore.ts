import { create } from 'zustand'
import { Team, Member, TeamLevel } from '@/types'

interface TeamState {
  teams: Team[]
  selectedTeamId: string | null
  managedTeams: Team[]
  followedTeams: Team[]
  isLoading: boolean
  error: string | null

  // Actions
  setTeams: (teams: Team[]) => void
  addTeam: (team: Team) => void
  updateTeam: (teamId: string, updates: Partial<Team>) => void
  deleteTeam: (teamId: string) => void
  selectTeam: (teamId: string) => void
  setManagedTeams: (teams: Team[]) => void
  addManagedTeam: (team: Team) => void
  removeManagedTeam: (teamId: string) => void
  setFollowedTeams: (teams: Team[]) => void
  followTeam: (team: Team) => void
  unfollowTeam: (teamId: string) => void
  toggleFavorite: (teamId: string) => void
  addMember: (teamId: string, member: Member) => void
  updateMember: (teamId: string, memberId: string, updates: Partial<Member>) => void
  removeMember: (teamId: string, memberId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  selectedTeamId: null,
  managedTeams: [],
  followedTeams: [],
  isLoading: false,
  error: null,

  setTeams: (teams) => set({ teams }),

  addTeam: (team) => set((state) => ({
    teams: [...state.teams, team]
  })),

  updateTeam: (teamId, updates) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    ),
    managedTeams: state.managedTeams.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    ),
    followedTeams: state.followedTeams.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    )
  })),

  deleteTeam: (teamId) => set((state) => ({
    teams: state.teams.filter(team => team.id !== teamId),
    managedTeams: state.managedTeams.filter(team => team.id !== teamId),
    followedTeams: state.followedTeams.filter(team => team.id !== teamId),
    selectedTeamId: state.selectedTeamId === teamId ? null : state.selectedTeamId
  })),

  selectTeam: (teamId) => set({ selectedTeamId: teamId }),

  setManagedTeams: (teams) => set({ managedTeams: teams }),

  addManagedTeam: (team) => set((state) => ({
    managedTeams: [...state.managedTeams, team]
  })),

  removeManagedTeam: (teamId) => set((state) => ({
    managedTeams: state.managedTeams.filter(team => team.id !== teamId)
  })),

  setFollowedTeams: (teams) => set({ followedTeams: teams }),

  followTeam: (team) => set((state) => ({
    followedTeams: [...state.followedTeams, { ...team, isFavorite: false }]
  })),

  unfollowTeam: (teamId) => set((state) => ({
    followedTeams: state.followedTeams.filter(team => team.id !== teamId)
  })),

  toggleFavorite: (teamId) => set((state) => ({
    followedTeams: state.followedTeams.map(team =>
      team.id === teamId ? { ...team, isFavorite: !(team as any).isFavorite } : team
    )
  })),

  addMember: (teamId, member) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? { ...team, members: [...team.members, member] }
        : team
    ),
    managedTeams: state.managedTeams.map(team =>
      team.id === teamId
        ? { ...team, members: [...team.members, member] }
        : team
    )
  })),

  updateMember: (teamId, memberId, updates) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? {
            ...team,
            members: team.members.map(member =>
              member.id === memberId ? { ...member, ...updates } : member
            )
          }
        : team
    ),
    managedTeams: state.managedTeams.map(team =>
      team.id === teamId
        ? {
            ...team,
            members: team.members.map(member =>
              member.id === memberId ? { ...member, ...updates } : member
            )
          }
        : team
    )
  })),

  removeMember: (teamId, memberId) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? { ...team, members: team.members.filter(member => member.id !== memberId) }
        : team
    ),
    managedTeams: state.managedTeams.map(team =>
      team.id === teamId
        ? { ...team, members: team.members.filter(member => member.id !== memberId) }
        : team
    )
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error })
})) 