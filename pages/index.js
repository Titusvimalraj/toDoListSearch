import React, { useState, useRef, useEffect } from 'react'
import Head from "next/head";
import TodoList from "../components/TodoList/TodoList";
import styles from "../styles/Home.module.css";
import { Grid, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import { BehaviorSubject, of, merge } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter, switchMap, catchError } from 'rxjs/operators';


export default function Home() {
  const contentType = 'application/json';
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [state, setState] = useState({
    data: [],
    loading: false,
    errorMessage: '',
    noResults: false
  });

  const handleDelete = (id) => {
     fetch(`/api/todo/${id}`,{
          method: 'DELETE'
          }).then(response => {
              if(response.ok) {
                return response
                  .json()
                  .then(data => {
                      const afterDelete = [...state.data].filter(todo => todo._id !== id);
                      setState((prevState)=>({...prevState, data:afterDelete}));
                  });
              }
            }).catch(err=>console.log(err));
  }

  const handleClick = (todo) => {
    const {_id:id, title, completed} = todo;    
     fetch(`/api/todo/${id}`,{
          method: 'PUT',
          headers: {
          Accept: contentType,
          'Content-Type': contentType,
        },
        body: JSON.stringify({title, completed: !completed})
          }).then(response => {
              if(response.ok) {
                return response
                  .json()
                  .then(data => {
                       const updatedStatusArray = [...state.data].map(todo => {
                        if (todo._id == id) {
                          todo.completed = !todo.completed;
                          return todo;
                        }
                        return todo;
                      });

                      setState((prevState)=>({...prevState, data:updatedStatusArray}));
                  });
              }
            }).catch(err=>console.log(err));  
  }


  const addTodo = () =>{

      fetch(`/api/todo`,{
          method: 'POST',
          headers: {
          Accept: contentType,
          'Content-Type': contentType,
        },
        body: JSON.stringify({title: newTodoTitle})
          }).then(response => {
              if(response.ok) {
                return response
                  .json()
                  .then(newTodo => {
                      setState((prevState)=>({...prevState, data:[...prevState.data, newTodo.data]}));
                      setNewTodoTitle('');
                  });
              }
            }).catch(err=>console.log(err));  
  }

  const loadInitialData = () => {
     fetch(`/api/todo?search=` ).then(response => {
              if(response.ok) {
                return response
                  .json()
                  .then(data => ({...data, loading: false, noResults: data.length === 0}));
              }
              return response
                .json()
                .then(data => ({
                  data: [],
                  loading: false,
                  errorMessage: data.title
                }));
            }).then(newState=>{
              setState(s => Object.assign({}, s, newState));
            }).catch(err=>console.log(err));
  }

 useEffect(() => {
  loadInitialData();
 }, [])


   const [subject, setSubject] = useState(null);

  useEffect(() => {
    if(subject === null) {
      const sub = new BehaviorSubject('');
      setSubject(sub);
    } else {
      const observable = subject.pipe(
        map(s => s.trim()),
        distinctUntilChanged(),
        filter(s => s.length >= 3),
        debounceTime(200),
        switchMap(term =>
          merge(
            of({loading: true, errorMessage: '', noResults: false}),
            fetch(`/api/todo?search=${term}` ).then(response => {
              if(response.ok) {
                return response
                  .json()
                  .then(data => ({...data, loading: false, noResults: data.length === 0}));
              }
              return response
                .json()
                .then(data => ({
                  data: [],
                  loading: false,
                  errorMessage: data.title
                }));
            })
          )
        ),
        catchError(e => ({
          loading: false,
          errorMessage: 'An application error occured'
        }))
      ).subscribe( newState => {
        setState(s => Object.assign({}, s, newState));
      });

      return () => {
        observable.unsubscribe()
        subject.unsubscribe();
      }
    }
  }, [subject]);

  const handleSearch = e => {
    const term = e.target.value || "";
    if(subject && term!="") {
      return subject.next(term);
    }else{
      loadInitialData();
    }
  };

  const handleAdd = e => {
    setNewTodoTitle(e.target.value);
  }


  

  const searchInput = useRef(null);
  const addInput  = useRef(null);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>To Do List with Search</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Todo List App with Search!</h1>

        <p className={styles.description}>Get started by adding few To do`s</p>
        <Grid container direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={4}>
        <Grid item xs={12}>
        <Grid container >
          <Grid item xs>
            <Grid container 
            direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
            >
              
               <Grid item xs>
              <Grid container><TextField inputRef={searchInput} onChange={handleSearch} label="Search Todos" variant="outlined" /></Grid>
              
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs>
              <Grid container 
              direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
              
              <Grid item xs>
              <Grid container><TextField value={newTodoTitle} label="Add Todo" variant="outlined" onChange={handleAdd}/></Grid>
              
              </Grid>
              <Grid item xs>
              <Grid container>             
               <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<SaveIcon />}
        disabled={!newTodoTitle}
        onClick={addTodo}
      >
        Save
      </Button>
      </Grid>

              </Grid>
              

      
              </Grid>
           </Grid>
        </Grid>
        </Grid>
        <Grid item xs={12}>
        <Grid container>
          <Grid item xs>
            
          <Grid container direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={4}
          >
            <h2>All</h2>
            <TodoList todos={state.data} handleDelete={handleDelete} handleClick={handleClick} />
          </Grid>
          </Grid>
          <Grid item xs>
          <Grid container direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={4}
          >
            <h2>Pending</h2>
            <TodoList todos={state.data.length ? state.data.filter(todo => todo.completed==false) : []} handleDelete={handleDelete} handleClick={handleClick} />
          </Grid>
          </Grid>
          <Grid item xs>
          <Grid container direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={4}
          >
            <h2>Completed</h2>
            <TodoList todos={state.data.length ? state.data.filter(todo => todo.completed==true) : []} handleDelete={handleDelete} handleClick={handleClick} />
          </Grid>
          </Grid>
          
          </Grid>
        </Grid>
        </Grid>
      </main>

      <footer className={styles.footer}>
        Powered by Titus Vimal Raj
      </footer>
    </div>
  );
}
