import { NextRequest, NextResponse } from 'next/server';
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
    const { data: todos, error: dbError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true }) // High, Medium, Low
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    // Transform snake_case to camelCase for consistency with frontend
    const transformedTodos = todos?.map((todo) => ({
      id: todo.id,
      userId: todo.user_id,
      name: todo.name,
      isDone: todo.is_done,
      priority: todo.priority,
      deadline: todo.deadline,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
    })) || [];

    return NextResponse.json({ todos: transformedTodos });
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
    const validationMessage = parsed.error.errors
      .map((err) => err.message)
      .join('\n');

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: validationMessage,
          details: parsed.error.errors,
        },
      },
      { status: 400 }
    );
  }

  try {
    const { data: todo, error: dbError } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        priority: parsed.data.priority,
        deadline: parsed.data.deadline || null,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Transform snake_case to camelCase
    const transformedTodo = {
      id: todo.id,
      userId: todo.user_id,
      name: todo.name,
      isDone: todo.is_done,
      priority: todo.priority,
      deadline: todo.deadline,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
    };

    return NextResponse.json({ todo: transformedTodo }, { status: 201 });
  } catch (e) {
    console.error('POST /api/todos error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}
