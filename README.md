# チーム管理アプリケーション

## 概要

このプロジェクトは、サッカーチームの管理を効率化するためのWebアプリケーションです。チーム管理、試合管理、スケジュール管理、チャット機能などを提供します。

## 🔐 ユーザーアカウント情報

### 管理者アカウント
- **メールアドレス**: `admin@teamapp.com`
- **パスワード**: `admin123`
- **権限**: 全ての機能にアクセス可能（チーム管理、メンバー管理、支払い管理、商品管理など）

### 編集者アカウント
- **メールアドレス**: `editor@teamapp.com`
- **パスワード**: `editor123`
- **権限**: チーム管理とコンテンツ編集が可能（試合管理、スケジュール管理、お知らせ作成など）

### メンバーアカウント
- **メールアドレス**: `member1@teamapp.com`
- **パスワード**: `member123`
- **権限**: 基本的な閲覧と参加機能のみ（お知らせ閲覧、出欠管理、商品注文など）

### その他のアカウント
- **管理者2**: `admin2@teamapp.com` / `admin456`
- **編集者2**: `editor2@teamapp.com` / `editor456`
- **編集者3**: `editor3@teamapp.com` / `editor789`
- **メンバー2**: `member2@teamapp.com` / `member456`
- **メンバー3**: `member3@teamapp.com` / `member789`
- **メンバー4**: `member4@teamapp.com` / `member101`
- **メンバー5**: `member5@teamapp.com` / `member202`
- **メンバー6**: `member6@teamapp.com` / `member303`

## 🚀 新機能・改善点

### パフォーマンス最適化
- **仮想リスト**: 大量のデータを効率的に表示
- **メモ化**: 重い計算の結果をキャッシュ
- **遅延読み込み**: 必要な時だけコンポーネントを読み込み
- **デバウンス**: ユーザー入力の最適化

### アクセシビリティ向上
- **キーボードナビゲーション**: 完全なキーボード操作対応
- **スクリーンリーダー対応**: ARIA属性の適切な使用
- **高コントラストモード**: 視覚障害者への配慮
- **フォントサイズ調整**: 読みやすさの向上

### 型安全性の強化
- **型ガード**: 実行時の型チェック
- **厳密な型定義**: TypeScriptの活用
- **エラーハンドリング**: 安全なエラー処理

### エラーハンドリング
- **エラーバウンダリー**: コンポーネントレベルのエラー捕捉
- **グローバルエラーハンドリング**: アプリケーション全体のエラー管理
- **ユーザーフレンドリーなエラー表示**: 分かりやすいエラーメッセージ

### カスタムフック
- **useLocalStorage**: ローカルストレージの安全な使用
- **useAsync**: 非同期処理の簡素化
- **useDebounce**: デバウンス機能
- **useIntersectionObserver**: 要素の可視性監視

## 🛠️ 技術スタック

- **フロントエンド**: React 19, TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod
- **アニメーション**: Framer Motion
- **アイコン**: Lucide React
- **テスト**: Jest, React Testing Library
- **E2Eテスト**: Playwright

## 📦 新しく追加されたユーティリティ

### フック
- `useLocalStorage`: ローカルストレージの安全な操作
- `useAsync`: 非同期処理の状態管理
- `useDebounce`: デバウンス機能
- `useIntersectionObserver`: 要素の可視性監視

### コンポーネント
- `AccessibilityProvider`: アクセシビリティ設定の管理
- `KeyboardNavigation`: キーボードナビゲーション
- `VirtualList`: 仮想リスト
- `LoadingSpinner`: ローディング表示
- `OptimizedButton`: パフォーマンス最適化されたボタン

### ユーティリティ
- `typeGuards.ts`: 型安全性の向上
- `memoization.ts`: メモ化機能
- `performance.ts`: パフォーマンス監視
- `errorBoundary.ts`: エラーハンドリング

## 🚀 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テストの実行
npm test

# 型チェック
npm run type-check

# リント
npm run lint
```

## 📋 利用可能なスクリプト

- `npm run dev`: 開発サーバーを起動
- `npm run build`: プロダクションビルド
- `npm run preview`: ビルド結果のプレビュー
- `npm run test`: テストの実行
- `npm run test:watch`: ウォッチモードでテスト実行
- `npm run test:coverage`: カバレッジ付きテスト実行
- `npm run lint`: ESLintによるコードチェック
- `npm run type-check`: TypeScriptの型チェック
- `npm run e2e`: E2Eテストの実行

## 🏗️ プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── common/         # 共通コンポーネント
│   │   ├── AccessibilityProvider.tsx
│   │   ├── KeyboardNavigation.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── OptimizedButton.tsx
│   │   └── VirtualList.tsx
│   └── ...            # 機能別コンポーネント
├── hooks/              # カスタムフック
│   ├── useAsync.ts
│   ├── useDebounce.ts
│   ├── useIntersectionObserver.ts
│   └── useLocalStorage.ts
├── utils/              # ユーティリティ関数
│   ├── errorBoundary.ts
│   ├── memoization.ts
│   ├── performance.ts
│   └── typeGuards.ts
├── types/              # TypeScript型定義
├── data/               # モックデータ
└── stores/             # 状態管理
```

## 🎯 パフォーマンス最適化

### 実装された最適化
1. **React.memo**: 不要な再レンダリングの防止
2. **useMemo/useCallback**: 計算結果とコールバックのメモ化
3. **仮想リスト**: 大量データの効率的表示
4. **遅延読み込み**: 必要な時だけコンポーネントを読み込み
5. **デバウンス**: ユーザー入力の最適化

### 監視機能
- レンダリング時間の測定
- メモリ使用量の監視
- パフォーマンスメトリクスの収集

## ♿ アクセシビリティ

### 実装された機能
1. **キーボードナビゲーション**: Tabキーでの操作
2. **スクリーンリーダー対応**: ARIA属性の適切な使用
3. **高コントラストモード**: 視覚障害者への配慮
4. **フォントサイズ調整**: 読みやすさの向上
5. **フォーカス管理**: 適切なフォーカス移動

## 🔒 セキュリティ

### 実装された対策
1. **入力検証**: Zodによる型安全なバリデーション
2. **XSS対策**: 適切なエスケープ処理
3. **CSRF対策**: トークンベースの認証
4. **セキュアなストレージ**: ローカルストレージの安全な使用

## 🧪 テスト

### テスト戦略
1. **ユニットテスト**: Jest + React Testing Library
2. **E2Eテスト**: Playwright
3. **型チェック**: TypeScript
4. **リント**: ESLint + Prettier

## 📈 今後の改善予定

- [ ] PWA対応の強化
- [ ] オフライン機能の実装
- [ ] リアルタイム通信の追加
- [ ] 多言語対応の拡充
- [ ] テーマカスタマイズ機能
- [ ] データエクスポート機能
- [ ] 高度な分析機能

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、Issueを作成してください。
