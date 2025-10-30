import React from 'react';
import { type Todo } from '../types';
import { format } from 'date-fns';

type Props = {
    todo: Todo;
    updateIsDone: (id: string, value: boolean) => void;
    remove: (id: string) => void;
}

const TodoItem: React.FC<Props> = ({ todo, updateIsDone, remove }) => {
    const key = todo.id;
    const isOverdue = todo.deadline && !todo.isDone && new Date() > todo.deadline;
    
    return (
        <div key={key} style={{ color: isOverdue ? 'red' : 'inherit' }}>
            <input type="checkbox" id={`todo-${key}`} checked={todo.isDone} onChange={e => updateIsDone(key, e.target.checked)} />
            {todo.name} | Priority: {todo.priority}
            {todo.deadline && (
                <span>
                    {' | '}Deadline: {format(todo.deadline, 'yyyy-MM-dd HH:mm')}
                    {isOverdue && ' (期限切れ)'}
                </span>
            )}
            <button onClick={() => remove(key)}>Remove</button>
        </div>
    );
};

export default TodoItem;
