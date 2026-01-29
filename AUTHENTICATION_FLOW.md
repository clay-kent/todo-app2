# 認証フロー実装ドキュメント

このドキュメントは、Todo App の認証・認可フローの実装詳細を説明します。

## ✅ 実装済み機能チェックリスト

### 1. 未ログイン時の導線

#### ルートパスのリダイレクト
**実装場所**: `app/page.tsx`
```typescript
export default function Home() {
  redirect('/login');
}
```
- `/` にアクセスすると自動的に `/login` にリダイレクト

#### /todos への直アクセス保護
**実装場所**: `app/todos/page.tsx` (L33-41)
```typescript
const checkUser = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.push('/login');
  } else {
    setLoading(false);
  }
};
```
- クライアント側でセッションをチェック
- セッションがない場合は `/login` へリダイレクト
- `useEffect` で自動実行

### 2. ログイン開始

**実装場所**: `app/login/page.tsx` (L26-43)
```typescript
const handleLogin = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    setError('ログインに失敗しました: ' + error.message);
  }
};
```

**特徴**:
- Discord OAuth を使用
- コールバック URL を明示的に指定
- エラーハンドリング実装済み

### 3. OAuth コールバック処理

**実装場所**: `app/auth/callback/route.ts`
```typescript
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/todos`);
}
```

**フロー**:
1. Discord から `code` パラメータを受け取る
2. `exchangeCodeForSession()` でセッションに交換
3. 成功したら `/todos` へリダイレクト
4. 失敗したら `/login?error=auth_failed` へリダイレクト

### 4. セッション維持

#### サーバーサイド実装
**実装場所**: `lib/supabase/server.ts`
```typescript
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

**特徴**:
- Next.js 15 の `cookies()` API を使用（async）
- `@supabase/ssr` でサーバーサイドレンダリング対応
- Cookie ベースのセッション管理
- SSR/API Routes から認証済みユーザー取得可能

#### クライアントサイド実装
**実装場所**: `lib/supabase/client.ts`
```typescript
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}
```

### 5. ログアウト

**実装場所**: `app/todos/page.tsx` (L134-138)
```typescript
const handleLogout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push('/login');
};
```

**フロー**:
1. `signOut()` でセッションを削除
2. `/login` へリダイレクト

### 6. API ルートの認可

#### GET /api/todos
**実装場所**: `app/api/todos/route.ts` (L5-14)
```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
    { status: 401 }
  );
}
```

#### POST /api/todos
**実装場所**: `app/api/todos/route.ts` (L49-58, L84)
```typescript
// 認証チェック
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
    { status: 401 }
  );
}

// user_id はサーバ側で設定（なりすまし防止）
const { data: todo } = await supabase
  .from('todos')
  .insert({
    user_id: user.id,  // ← クライアントから受け取らない
    name: parsed.data.name,
    priority: parsed.data.priority,
    deadline: parsed.data.deadline || null,
  });
```

#### PATCH /api/todos/[id]
**実装場所**: `app/api/todos/[id]/route.ts` (L10-18, L42-53)
```typescript
// 認証チェック
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
    { status: 401 }
  );
}

// 所有権確認
const { data: existingTodo } = await supabase
  .from('todos')
  .select('user_id')
  .eq('id', params.id)
  .single();

if (!existingTodo || existingTodo.user_id !== user.id) {
  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
    { status: 404 }
  );
}
```

#### DELETE /api/todos/[id]
**実装場所**: `app/api/todos/[id]/route.ts` (L102-109, L112-124)
- PATCH と同様の認証・所有権確認

### セキュリティポイント

#### ✅ なりすまし防止
- クライアントから `user_id` を一切受け取らない
- サーバ側で `user.id` を直接使用
- すべての操作で所有権を確認

#### ✅ 認証チェック
- すべての API エンドポイントで `getUser()` を実行
- 未認証の場合は 401 を返す
- クライアント側で 401 を検知して `/login` へリダイレクト

#### ✅ データ分離
- クエリに `eq('user_id', user.id)` を必ず含める
- 他のユーザーのデータにアクセス不可
- 更新・削除前に所有権を確認

## フロー図

```
[未ログイン状態]
    |
    v
/ (ルート) → redirect → /login
    |
    v
[Discord OAuth ボタン]
    | signInWithOAuth()
    v
[Discord 認証画面]
    | 認証成功
    v
/auth/callback?code=xxx
    | exchangeCodeForSession()
    v
[Cookie にセッション保存]
    | redirect
    v
/todos (Todo 一覧画面)
    | checkUser() で保護
    v
[ログイン済み状態]
    | API 呼び出し
    v
API Routes (/api/todos/*)
    | getUser() で認証
    | user.id で所有権確認
    v
[データ操作]
    |
    v
[ログアウトボタン]
    | signOut()
    v
/login (戻る)
```

## テスト方法

### 1. 未ログイン時の動作確認
1. ブラウザで `http://localhost:3000/` にアクセス
2. 自動的に `/login` にリダイレクトされることを確認

### 2. ログインフロー確認
1. `/login` で「Discordでログイン」ボタンをクリック
2. Discord 認証画面が表示されることを確認
3. 認証後に `/todos` にリダイレクトされることを確認

### 3. 認証保護の確認
1. ログアウトする
2. 直接 `http://localhost:3000/todos` にアクセス
3. 自動的に `/login` にリダイレクトされることを確認

### 4. API 認証の確認
```bash
# 未認証でAPI呼び出し（401が返る）
curl http://localhost:3000/api/todos

# レスポンス:
# {"error":{"code":"UNAUTHORIZED","message":"ログインが必要です"}}
```

### 5. ログアウト確認
1. ログイン状態で Todo 画面の「ログアウト」ボタンをクリック
2. `/login` に戻ることを確認
3. 再度 `/todos` にアクセスしても弾かれることを確認

## まとめ

すべての要件が実装されており、以下のセキュリティ対策が施されています：

✅ 未ログイン時の適切なリダイレクト  
✅ OAuth フローの正しい実装  
✅ Cookie ベースのセッション管理（SSR対応）  
✅ API の完全な認証・認可  
✅ なりすまし防止（user_id をサーバ側で設定）  
✅ データの完全な分離（所有権確認）  

追加の実装は不要で、本番環境にデプロイ可能な状態です。
