# TodoApp

Next.js、TypeScript、Tailwind CSS、Supabase を使用した「Todoアプリ」です。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router)、React 19、TypeScript、Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth (Discord OAuth)

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクトのセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で以下のテーブルを作成:

```sql
-- Create todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(32) NOT NULL,
  is_done BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Low',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_todos_user_created ON todos(user_id, created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. 環境変数の設定

`.env.local` を作成し、Supabase の認証情報を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
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
- 2026年1月29日：Next.js + Supabase へ全面移行
- 2026年1月29日：Next.js 15 へアップグレード（セキュリティ脆弱性対応）
- 2026年1月29日：Prisma を削除し、Supabase クライアントに完全移行

## ライセンス

[MIT License](LICENSE)
