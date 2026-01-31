import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateTodoSchema } from '@/lib/validation/todo';

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = UpdateTodoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: '入力内容に誤りがあります',
          details: parsed.error.errors.map((err) => ({
            path: err.path,
            message: err.message,
            code: err.code,
          })),
        },
      },
      { status: 400 }
    );
  }

  try {
    // First verify the todo exists and belongs to the user
    const { data: existingTodo, error: fetchError } = await supabase
      .from('todos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingTodo || existingTodo.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.isDone !== undefined) updateData.is_done = parsed.data.isDone;
    if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
    if (parsed.data.deadline !== undefined) {
      updateData.deadline = parsed.data.deadline || null;
    }
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
    }
    if (parsed.data.category !== undefined) {
      updateData.category = parsed.data.category;
    }
    if (parsed.data.assignees !== undefined) {
      updateData.assignees = parsed.data.assignees;
    }
    if (parsed.data.pos !== undefined) {
      updateData.pos = parsed.data.pos;
    }

    const { data: todo, error: updateError } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

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

    return NextResponse.json(transformedTodo);
  } catch (e: any) {
    console.error('PATCH /api/todos/[id] error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
      { status: 401 }
    );
  }

  try {
    // First verify the todo exists and belongs to the user
    const { data: existingTodo, error: fetchError } = await supabase
      .from('todos')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingTodo || existingTodo.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE /api/todos/[id] error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}
