import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { CreateTodoSchema } from '@/lib/validation/todo';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
      { status: 401 }
    );
  }

  try {
    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: [
        { priority: 'asc' }, // enum is High, Medium, Low - asc gives High first
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ todos });
  } catch (e) {
    console.error('GET /api/todos error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = CreateTodoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors } },
      { status: 400 }
    );
  }

  try {
    const todo = await prisma.todo.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        priority: parsed.data.priority,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      },
    });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (e) {
    console.error('POST /api/todos error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}
