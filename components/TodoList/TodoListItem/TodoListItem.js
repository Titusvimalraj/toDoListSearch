import React from 'react'
import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Done';
import Avatar from '@material-ui/core/Avatar';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import ListIcon from '@material-ui/icons/List';

const TodoListItem = ({ title, completed, handleDelete, handleClick }) => {
    return (
        <>
            { completed ?
            <Chip
                avatar={<Avatar><DoneIcon /></Avatar>}
                label={title}
                onClick={handleClick}
                color="secondary"
                onDelete={handleDelete}
            />:
            <Chip
                avatar={<Avatar><ListIcon /></Avatar>}
                label={title}
                onClick={handleClick}
                color="default"
                onDelete={handleDelete}
            /> 
        }
        <br/>
        </>
    )
}

export default TodoListItem;