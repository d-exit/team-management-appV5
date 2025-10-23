// 権限の定義
export type Permission = 
  | 'team.create'      // チーム作成
  | 'team.edit'        // チーム編集
  | 'team.delete'      // チーム削除
  | 'member.invite'    // メンバー招待
  | 'member.manage'    // メンバー管理
  | 'match.create'     // 試合作成
  | 'match.edit'       // 試合編集
  | 'match.delete'     // 試合削除
  | 'match.score'      // 得点記録
  | 'schedule.create'  // スケジュール作成
  | 'schedule.edit'    // スケジュール編集
  | 'schedule.read'    // スケジュール閲覧
  | 'chat.send'        // チャット送信
  | 'chat.read'        // チャット閲覧
  | 'notice.send'      // お知らせ送信
  | 'payment.manage'   // 支払い管理
  | 'product.manage'   // 物販管理
  | 'venue.book'       // 会場予約
  | 'admin.all';       // 全権限

// ユーザー種別
export type UserRole = 'admin' | 'editor' | 'member';

// 年齢カテゴリ
export type AgeCategory = 
  | 'U12' | 'U11' | 'U10' | 'U9' | 'U8' | 'U7' | 'U6' 
  | 'kindergarten_older' | 'kindergarten_younger';

// レベル
export type TeamLevel = 'beginner' | 'intermediate' | 'advanced';

// ポジション
export type Position = 'FW' | 'MF' | 'DF' | 'GK';

// 権限チェック関数
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('admin.all');
};

// ロール別権限マッピング
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'admin.all'
  ],
  editor: [
    'team.edit',
    'member.invite',
    'member.manage',
    'match.create',
    'match.edit',
    'match.delete',
    'match.score',
    'schedule.create',
    'schedule.edit',
    'chat.send',
    'chat.read',
    'notice.send',
    'payment.manage',
    'product.manage',
    'venue.book'
  ],
  member: [
    'chat.send',
    'chat.read',
    'schedule.read'
  ]
}; 