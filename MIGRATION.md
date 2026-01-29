# Migration Guide: Vite + React → Next.js + Supabase

This document provides an overview of the migration performed and the steps required after merging.

## What Was Changed

### 1. Project Configuration

#### Removed Files
- `vite.config.ts` - Vite configuration
- `index.html` - Vite HTML entry point
- `404.html` - GitHub Pages 404 page
- `tsconfig.app.json` - Vite TypeScript config
- `tsconfig.node.json` - Vite Node TypeScript config
- `eslint.config.js` - Old ESLint configuration
- `.prettierrc` - Prettier configuration
- `src/` directory - All old React source code

#### Added Files
- `next.config.js` - Next.js configuration
- `postcss.config.js` - PostCSS configuration for Tailwind
- `tailwind.config.js` - Updated for Next.js
- `.eslintrc.json` - Next.js ESLint configuration
- `tsconfig.json` - Updated for Next.js

### 2. Application Structure

```
app/
├── api/
│   ├── todos/
│   │   ├── route.ts          # GET (list), POST (create)
│   │   └── [id]/route.ts     # PATCH (update), DELETE (delete)
│   └── auth/
│       └── callback/route.ts # OAuth callback handler
├── login/
│   └── page.tsx             # Discord login page
├── todos/
│   └── page.tsx             # Todo management UI
├── page.tsx                 # Home page (redirects to login)
├── layout.tsx               # Root layout
└── globals.css              # Global styles with Tailwind

lib/
├── supabase/
│   ├── client.ts            # Browser Supabase client
│   └── server.ts            # Server Supabase client
└── validation/
    └── todo.ts              # Zod schemas for validation
```

### 3. Key Technology Changes

| Before | After |
|--------|-------|
| Vite | Next.js 15 (App Router) |
| localStorage | PostgreSQL (Supabase) |
| No authentication | Supabase Auth (Discord OAuth) |
| Client-side only | Full-stack with API routes |
| No ORM | Supabase Client (direct database access) |
| No multi-device sync | Real-time sync via Supabase |

### 4. Features Implemented

- ✅ Discord OAuth authentication
- ✅ CRUD API endpoints with proper authentication
- ✅ Supabase client for type-safe database access
- ✅ Database-level data isolation with Row Level Security (RLS)
- ✅ Priority levels (Low, Medium, High)
- ✅ Deadline management with timestamps
- ✅ Todo completion tracking
- ✅ Server-side validation with Zod

## Post-Merge Setup

### Prerequisites

1. **Supabase Project**
   - Create a project at https://supabase.com
   - Note your project URL and anon key

2. **Discord OAuth App**
   - Create an application at https://discord.com/developers
   - Add redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Note your Client ID and Client Secret

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**How to get these values:**

In Supabase Dashboard:
- Go to Settings > API
- Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3. Configure Discord OAuth in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Discord provider
3. Enter your Discord Client ID and Client Secret
4. Save changes

#### 4. Create Database Table

In Supabase Dashboard, go to SQL Editor and run:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for user data isolation
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

#### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

#### 6. Test the Application

1. Click "Discordでログイン"
2. Authorize with Discord
3. You should be redirected to the todos page
4. Add, edit, complete, and delete todos
5. Log out and log back in - your todos should persist
6. (Optional) Test with a different Discord account to verify data isolation works

### Production Deployment

#### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

#### Other Platforms

- Set all environment variables
- Build: `npm run build`
- Start: `npm start`

## Migration Notes

### Data Migration

**⚠️ Important:** localStorage data is NOT automatically migrated. If you need to preserve existing todos:

1. Export data from localStorage in the old version
2. Manually import using the API after setting up the new version

### Breaking Changes

- GitHub Pages deployment removed (replaced with Vercel/server-based hosting)
- All old localStorage data is lost unless manually migrated
- Requires authentication - anonymous usage no longer supported

### Database Schema

The `todos` table is created directly in Supabase via SQL:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(32) NOT NULL,
  is_done BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Low',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Features:**
- UUID primary key with automatic generation
- Foreign key to auth.users with cascade delete
- Priority constraint ensuring valid values
- Timestamp support with timezone awareness
- Row Level Security (RLS) policies for data isolation

### Security Considerations

1. **Row Level Security (RLS):** Database-level policies ensure users can only access their own data
2. **API Authentication:** All API routes check for valid Supabase session
3. **Input Validation:** Zod schemas validate all incoming data
4. **Environment Variables:** Sensitive data stored in `.env.local` (not committed)
5. **Supabase Client:** Uses server-side client for secure database operations

### Known Limitations

1. **npm audit warnings:** Dependencies security advisories
   - ~~Next.js 14.2.x has known DoS vulnerabilities~~ **FIXED: Upgraded to Next.js 15.5.11**
   - 1 moderate severity vulnerability remains in canary versions (GHSA-5f7q-jpqc-wp7h)
   - This moderate vulnerability only affects Next.js canary versions 15.0.0-canary.0 - 15.6.0-canary.60
   - Production version 15.5.11 is not affected
   
2. **Build without environment variables:** 
   - Build will succeed but pages won't work without proper Supabase credentials
   - Ensure `.env.local` is configured before running the app

3. **No offline support:**
   - Unlike localStorage, requires internet connection
   - Consider adding service worker for PWA support if needed

### Breaking Changes from Next.js 14 to 15

The application has been upgraded to Next.js 15 to address security vulnerabilities:

1. **`cookies()` is now async** - All server-side Supabase client creation now uses `await cookies()`
2. **Route params are now Promises** - Dynamic route parameters must be awaited
3. **React 19** - Upgraded from React 18 to React 19
4. **Enhanced type safety** - Better TypeScript support for async operations

## Troubleshooting

### "Failed to fetch" errors
- Check that environment variables are set correctly
- Verify Supabase project is active
- Check browser console for CORS errors

### Database errors
- Verify the todos table exists in Supabase
- Check that RLS policies are enabled
- Ensure user_id references are correct

### Authentication issues
- Verify Discord OAuth app callback URL matches Supabase auth settings
- Check that Discord provider is enabled in Supabase
- Clear browser cookies and try again

### Data isolation issues
- User data is protected by Row Level Security (RLS) at the database level
- Ensure authentication is working correctly
- Verify RLS policies are enabled on the todos table

## Support

For issues or questions:
1. Check the README.md for setup instructions
2. Review Supabase documentation: https://supabase.com/docs
3. Review Next.js documentation: https://nextjs.org/docs
