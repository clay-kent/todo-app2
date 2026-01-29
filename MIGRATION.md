# Migration Guide: Vite + React → Next.js + Supabase + Prisma

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
├── prisma.ts                # Prisma client singleton
├── supabase/
│   ├── client.ts            # Browser Supabase client
│   └── server.ts            # Server Supabase client
└── validation/
    └── todo.ts              # Zod schemas for validation

prisma/
├── schema.prisma            # Database schema
└── migrations/
    └── 00000000000000_rls_setup/
        └── migration.sql    # Row Level Security policies
```

### 3. Key Technology Changes

| Before | After |
|--------|-------|
| Vite | Next.js 14 (App Router) |
| localStorage | PostgreSQL (Supabase) |
| No authentication | Supabase Auth (Discord OAuth) |
| Client-side only | Full-stack with API routes |
| No ORM | Prisma |
| No multi-device sync | Real-time sync via Supabase |

### 4. Features Implemented

- ✅ Discord OAuth authentication
- ✅ CRUD API endpoints with proper authentication
- ✅ Prisma ORM for type-safe database access
- ✅ Row Level Security (RLS) for data isolation
- ✅ Priority levels (Low, Medium, High)
- ✅ Deadline management with timestamps
- ✅ Todo completion tracking
- ✅ Server-side validation with Zod

## Post-Merge Setup

### Prerequisites

1. **Supabase Project**
   - Create a project at https://supabase.com
   - Note your project URL and anon key
   - Get database connection strings (pooler and direct)

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

# Database (Prisma)
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

**How to get these values:**

1. In Supabase Dashboard:
   - Go to Settings > API
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
2. For database URLs:
   - Go to Settings > Database
   - Find "Connection string" section
   - Use "Transaction pooler" for `DATABASE_URL`
   - Use "Session pooler" or "Direct connection" for `DIRECT_URL`

#### 3. Configure Discord OAuth in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Discord provider
3. Enter your Discord Client ID and Client Secret
4. Save changes

#### 4. Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

#### 5. Set Up Row Level Security (RLS)

The RLS policies are in `prisma/migrations/00000000000000_rls_setup/migration.sql`.

**Execute in Supabase SQL Editor:**

1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy and paste the contents of `prisma/migrations/00000000000000_rls_setup/migration.sql`
4. Run the query

This will enable RLS and create policies to ensure users can only access their own todos.

#### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

#### 7. Test the Application

1. Click "Discordでログイン"
2. Authorize with Discord
3. You should be redirected to the todos page
4. Add, edit, complete, and delete todos
5. Log out and log back in - your todos should persist
6. (Optional) Test with a different Discord account to verify RLS works

### Production Deployment

#### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

#### Other Platforms

- Set all environment variables
- Ensure Prisma is properly installed: `npx prisma generate`
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

The `todos` table schema:

```sql
id          UUID      PRIMARY KEY
user_id     UUID      NOT NULL (references auth.users)
name        VARCHAR(32) NOT NULL
is_done     BOOLEAN   DEFAULT false
priority    ENUM      (Low, Medium, High) DEFAULT Low
deadline    TIMESTAMPTZ NULL
created_at  TIMESTAMPTZ DEFAULT now()
updated_at  TIMESTAMPTZ DEFAULT now()
```

### Security Considerations

1. **Row Level Security (RLS):** Ensures users can only access their own data
2. **API Authentication:** All API routes check for valid Supabase session
3. **Input Validation:** Zod schemas validate all incoming data
4. **Environment Variables:** Sensitive data stored in `.env.local` (not committed)

### Known Limitations

1. **npm audit warnings:** Some dependencies have security advisories
   - Next.js 14.2.x has known DoS vulnerabilities (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf)
   - Consider upgrading to Next.js 15+ after testing
   - glob package used by eslint-config-next has a command injection vulnerability
   
2. **Build without environment variables:** 
   - Build will succeed but pages won't work without proper Supabase credentials
   - Ensure `.env.local` is configured before running the app

3. **No offline support:**
   - Unlike localStorage, requires internet connection
   - Consider adding service worker for PWA support if needed

## Troubleshooting

### "Failed to fetch" errors
- Check that environment variables are set correctly
- Verify Supabase project is active
- Check browser console for CORS errors

### Prisma errors
- Run `npx prisma generate` after installing dependencies
- Check database connection strings
- Ensure migrations have been run

### Authentication issues
- Verify Discord OAuth app callback URL matches Supabase auth settings
- Check that Discord provider is enabled in Supabase
- Clear browser cookies and try again

### RLS policy errors
- Ensure RLS migration SQL has been executed
- Check policies in Supabase Dashboard > Authentication > Policies
- Verify user is authenticated (check cookies)

## Support

For issues or questions:
1. Check the README.md for setup instructions
2. Review Supabase documentation: https://supabase.com/docs
3. Review Prisma documentation: https://www.prisma.io/docs
4. Review Next.js documentation: https://nextjs.org/docs
