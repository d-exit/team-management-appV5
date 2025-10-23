import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 日本語翻訳
const ja = {
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    refresh: '更新',
    retry: '再試行',
    close: '閉じる',
    confirm: '確認',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',
    noData: 'データがありません',
    networkError: 'ネットワークエラーが発生しました',
    serverError: 'サーバーエラーが発生しました',
    unauthorized: '認証が必要です',
    forbidden: 'アクセスが拒否されました',
    notFound: 'ページが見つかりません',
    validation: {
      required: 'この項目は必須です',
      email: '有効なメールアドレスを入力してください',
      minLength: '{{min}}文字以上で入力してください',
      maxLength: '{{max}}文字以下で入力してください',
      passwordMismatch: 'パスワードが一致しません'
    }
  },
  auth: {
    login: 'ログイン',
    logout: 'ログアウト',
    register: 'アカウント作成',
    email: 'メールアドレス',
    password: 'パスワード',
    confirmPassword: 'パスワード（確認）',
    forgotPassword: 'パスワードを忘れた方',
    loginError: 'ログインに失敗しました',
    registerError: 'アカウント作成に失敗しました',
    invalidCredentials: 'メールアドレスまたはパスワードが正しくありません'
  },
  team: {
    name: 'チーム名',
    coach: 'コーチ',
    level: 'レベル',
    rating: 'レーティング',
    rank: '順位',
    members: 'メンバー',
    description: '説明',
    create: 'チーム作成',
    edit: 'チーム編集',
    delete: 'チーム削除',
    invite: 'メンバー招待',
    remove: 'メンバー削除',
    follow: 'フォロー',
    unfollow: 'フォロー解除',
    favorite: 'お気に入り',
    unfavorite: 'お気に入り解除',
    levels: {
      beginner: '初級',
      intermediate: '中級',
      advanced: '上級',
      professional: 'プロフェッショナル'
    }
  },
  match: {
    title: '試合',
    create: '試合作成',
    edit: '試合編集',
    delete: '試合削除',
    type: '試合種別',
    status: 'ステータス',
    date: '日付',
    time: '時間',
    location: '場所',
    opponent: '対戦相手',
    score: 'スコア',
    result: '結果',
    types: {
      training: 'トレーニングマッチ',
      tournament: 'トーナメント戦',
      league: 'リーグ戦'
    },
    statuses: {
      preparation: '準備中',
      inProgress: '開催中',
      finished: '終了'
    },
    results: {
      win: '勝利',
      lose: '敗北',
      draw: '引き分け'
    }
  },
  chat: {
    title: 'チャット',
    message: 'メッセージ',
    send: '送信',
    type: 'メッセージを入力...',
    unread: '未読',
    online: 'オンライン',
    offline: 'オフライン',
    typing: '入力中...',
    fileUpload: 'ファイルをアップロード',
    imageUpload: '画像をアップロード',
    voiceMessage: '音声メッセージ'
  },
  schedule: {
    title: 'スケジュール',
    create: 'イベント作成',
    edit: 'イベント編集',
    delete: 'イベント削除',
    event: 'イベント',
    date: '日付',
    startTime: '開始時間',
    endTime: '終了時間',
    location: '場所',
    description: '説明',
    types: {
      practice: '練習',
      match: '試合',
      meeting: 'ミーティング',
      other: 'その他'
    }
  },
  venue: {
    title: '会場',
    name: '会場名',
    address: '住所',
    capacity: '収容人数',
    price: '料金',
    book: '予約',
    cancel: 'キャンセル',
    available: '利用可能',
    unavailable: '利用不可'
  },
  matchmaking: {
    title: 'マッチング',
    search: '検索',
    filters: 'フィルター',
    area: 'エリア',
    level: 'レベル',
    ageCategory: '年齢カテゴリ',
    rating: 'レーティング',
    availableDate: '利用可能日',
    results: '検索結果',
    noResults: '条件に一致するチームが見つかりません'
  }
}

// 英語翻訳
const en = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    retry: 'Retry',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    noData: 'No data available',
    networkError: 'Network error occurred',
    serverError: 'Server error occurred',
    unauthorized: 'Authentication required',
    forbidden: 'Access denied',
    notFound: 'Page not found',
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minLength: 'Please enter at least {{min}} characters',
      maxLength: 'Please enter no more than {{max}} characters',
      passwordMismatch: 'Passwords do not match'
    }
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    loginError: 'Login failed',
    registerError: 'Registration failed',
    invalidCredentials: 'Invalid email or password'
  },
  team: {
    name: 'Team Name',
    coach: 'Coach',
    level: 'Level',
    rating: 'Rating',
    rank: 'Rank',
    members: 'Members',
    description: 'Description',
    create: 'Create Team',
    edit: 'Edit Team',
    delete: 'Delete Team',
    invite: 'Invite Member',
    remove: 'Remove Member',
    follow: 'Follow',
    unfollow: 'Unfollow',
    favorite: 'Favorite',
    unfavorite: 'Unfavorite',
    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      professional: 'Professional'
    }
  },
  match: {
    title: 'Match',
    create: 'Create Match',
    edit: 'Edit Match',
    delete: 'Delete Match',
    type: 'Match Type',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    opponent: 'Opponent',
    score: 'Score',
    result: 'Result',
    types: {
      training: 'Training Match',
      tournament: 'Tournament Match',
      league: 'League Match'
    },
    statuses: {
      preparation: 'Preparation',
      inProgress: 'In Progress',
      finished: 'Finished'
    },
    results: {
      win: 'Win',
      lose: 'Lose',
      draw: 'Draw'
    }
  },
  chat: {
    title: 'Chat',
    message: 'Message',
    send: 'Send',
    type: 'Type a message...',
    unread: 'Unread',
    online: 'Online',
    offline: 'Offline',
    typing: 'Typing...',
    fileUpload: 'Upload File',
    imageUpload: 'Upload Image',
    voiceMessage: 'Voice Message'
  },
  schedule: {
    title: 'Schedule',
    create: 'Create Event',
    edit: 'Edit Event',
    delete: 'Delete Event',
    event: 'Event',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    location: 'Location',
    description: 'Description',
    types: {
      practice: 'Practice',
      match: 'Match',
      meeting: 'Meeting',
      other: 'Other'
    }
  },
  venue: {
    title: 'Venue',
    name: 'Venue Name',
    address: 'Address',
    capacity: 'Capacity',
    price: 'Price',
    book: 'Book',
    cancel: 'Cancel',
    available: 'Available',
    unavailable: 'Unavailable'
  },
  matchmaking: {
    title: 'Matchmaking',
    search: 'Search',
    filters: 'Filters',
    area: 'Area',
    level: 'Level',
    ageCategory: 'Age Category',
    rating: 'Rating',
    availableDate: 'Available Date',
    results: 'Search Results',
    noResults: 'No teams match your criteria'
  }
}

const resources = {
  ja: { translation: ja },
  en: { translation: en }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n 