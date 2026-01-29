import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const existingTodo = await prisma.todo.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingTodo || existingTodo.userId !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
        { status: 404 }
      );
    }

    const todo = await prisma.todo.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.isDone !== undefined && { isDone: parsed.data.isDone }),
        ...(parsed.data.priority !== undefined && { priority: parsed.data.priority }),
        ...(parsed.data.deadline !== undefined && {
          deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        }),
      },
    });

    return NextResponse.json({ todo });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
        { status: 404 }
      );
    }
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
    const existingTodo = await prisma.todo.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingTodo || existingTodo.userId !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
        { status: 404 }
      );
    }

    await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todoが見つかりません' } },
        { status: 404 }
      );
    }
    console.error('DELETE /api/todos/[id] error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラー' } },
      { status: 500 }
    );
  }
}
