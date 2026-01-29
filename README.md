# TodoApp

Next.js、TypeScript、Tailwind CSS、Supabase、Prisma を使用した「Todoアプリ」です。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router)、React 19、TypeScript、Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **認証**: Supabase Auth (Discord OAuth)

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成し、Supabase の認証情報を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Database (Prisma)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 3. Prisma マイグレーション

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Discord OAuth の設定

1. Discord Developer Portal で OAuth2 アプリケーションを作成
2. Redirect URL を `https://your-project.supabase.co/auth/v1/callback` に設定
3. Supabase ダッシュボードの Authentication > Providers で Discord を有効化

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセスして動作確認してください。

## 機能

- Discord アカウントでログイン
- Todo の追加、編集、削除
- 優先度の設定 (Low / Medium / High)
- 期限の設定
- 完了/未完了の切り替え
- 複数端末での同期 (Supabase)
- ユーザーごとのデータ分離（アプリケーションレベルのフィルタリング）

## 開発履歴

- 2025年10月23日：プロジェクト開始 (Vite + React + localStorage)
- 2026年1月29日：Next.js + Supabase + Prisma へ全面移行
- 2026年1月29日：Next.js 15 へアップグレード（セキュリティ脆弱性対応）

## ライセンス

[MIT License](LICENSE)
