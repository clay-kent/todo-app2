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
      name: todo.name,
      priority: todo.priority,
      deadline: todo.deadline ? new Date(todo.deadline) : null,
      description: todo.description || null,
      assignees: todo.assignees || [],
      status: todo.status || 'todo',
      category: todo.category || 'personal',
      pos: todo.pos || null,
    })) || [];

    return NextResponse.json(transformedTodos);
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
    const insertData: any = {
      user_id: user.id,
      name: parsed.data.name,
      priority: parsed.data.priority,
      deadline: parsed.data.deadline || null,
    };

    // Add optional fields if provided
    if (parsed.data.description !== undefined) {
      insertData.description = parsed.data.description;
    }
    if (parsed.data.status !== undefined) {
      insertData.status = parsed.data.status;
    }
    if (parsed.data.category !== undefined) {
      insertData.category = parsed.data.category;
    }
    if (parsed.data.assignees !== undefined) {
      insertData.assignees = parsed.data.assignees;
    }
    if (parsed.data.pos !== undefined) {
      insertData.pos = parsed.data.pos;
    }

    const { data: todo, error: dbError } = await supabase
      .from('todos')
      .insert(insertData)
      .select()
      .single();

    if (dbError) throw dbError;

    // Transform to frontend format
    const transformedTodo = {
      id: todo.id,
      name: todo.name,
      priority: todo.priority,
      deadline: todo.deadline ? new Date(todo.deadline) : null,
      description: todo.description || null,
      assignees: todo.assignees || [],
      status: todo.status || 'todo',
      category: todo.category || 'personal',
      pos: todo.pos || null,
    };

    return NextResponse.json(transformedTodo, { status: 201 });
  } catch (e) {
    console.error('POST /api/todos error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}
