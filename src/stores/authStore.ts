import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Permission, ROLE_PERMISSIONS } from '@/types/auth'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'member'
  teamId?: string
  permissions: Permission[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: { name: string; email: string; password: string; role?: 'admin' | 'editor' | 'member' }) => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearError: () => void
  checkAuth: () => Promise<void>
  updateUserProfile: (userData: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: 実際のAPI呼び出しに置き換え
          await new Promise(resolve => setTimeout(resolve, 1000)) // モック遅延
          
          // モックユーザーデータ
          const mockUser: User = {
            id: 'user-1',
            name: 'テストユーザー',
            email,
            role: 'admin', // デフォルトで管理者権限
            teamId: 'team-1',
            permissions: ROLE_PERMISSIONS.admin
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({
            isLoading: false,
            error: 'ログインに失敗しました'
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: 実際のAPI呼び出しに置き換え
          await new Promise(resolve => setTimeout(resolve, 1000)) // モック遅延
          
          const role = userData.role || 'member'
          const mockUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name,
            email: userData.email,
            role,
            permissions: ROLE_PERMISSIONS[role]
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({
            isLoading: false,
            error: '登録に失敗しました'
          })
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: async () => {
        const { user, token } = get()
        if (user && token) {
          // TODO: トークンの有効性をチェック
          set({ isAuthenticated: true })
        } else {
          set({ isAuthenticated: false })
        }
      },

      updateUserProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: 実際のAPI呼び出しに置き換え
          await new Promise(resolve => setTimeout(resolve, 1000)) // モック遅延
          
          const currentUser = get().user
          if (currentUser) {
            const updatedUser: User = {
              ...currentUser,
              ...userData,
            }
            set({ user: updatedUser, isLoading: false })
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'プロフィールの更新に失敗しました'
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 