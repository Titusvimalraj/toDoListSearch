import React from 'react'
import TodoListItem from "./TodoListItem/TodoListItem";

const TodoList = ({ todos, handleDelete, handleClick }) => {
    return (
        <>
            { todos.length ? todos.map(todo => <TodoListItem key={todo._id} title={todo.title} completed={todo.completed} handleDelete={() => handleDelete(todo._id)} handleClick={()=> handleClick(todo)}/>) : "No data Add todos"}
        </>
    )
}

export default TodoList;