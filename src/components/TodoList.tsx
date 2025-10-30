import React from 'react';
import { type Todo } from '../types';
import TodoItem from './TodoItem';

type Props = {
    todos: Todo[];
    updateIsDone: (id: string, value: boolean) => void;
    remove: (id: string) => void;
}

const TodoList: React.FC<Props> = ({todos, updateIsDone, remove}) => {
    if (todos.length === 0) {
        return <div>No todos available.</div>;
    }
    return (
        <ul>
            {todos.map(todo => (
                <TodoItem key={todo.id} todo={todo} updateIsDone={updateIsDone} remove={remove} />
            ))}
        </ul>
    );
};

export default TodoList;