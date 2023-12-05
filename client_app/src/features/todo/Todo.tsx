import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import TodoModel from '../../models/Todo';
import GetParamModel from '../../models/Getparam';
import  LoginModel from "../../models/Login";
import { getTodosAsync, selectTodos,selectLogin, addTodoAsync,updTodoAsync,selectUpdate,selectSortType,selectSortField,selectPage,setpageTodoAsync,selectError,loginTodoAsync,logoutTodoAsync,finishTodoAsync} from './todoSlice';


export function Todo() {

    const todos = useAppSelector(selectTodos);  
    const updFlag = useAppSelector(selectUpdate);
    const sort_type = useAppSelector(selectSortType)
    const sort_field = useAppSelector(selectSortField)
    const page = useAppSelector(selectPage)
    const token = useAppSelector(selectLogin)
    const error = useAppSelector(selectError)

    const dispatch = useAppDispatch();
    const [task_id, settask_id] = useState("")
    const [user, setuser] = useState("")
    const [email, setemail] = useState("")
    const [text, settext] = useState("") 
    const [edited, setedited] = useState(false) 
    const [finished, setfinished] = useState(false) 
    const [temp_page,settemppage]=useState(page) 
    const [temp_sort,settempsort]=useState(sort_type) 
    const [templogin,settemplogin]=useState("") 
    const [temppassword,settemppassword]=useState("")    

    const field_names=['task_id','user','email','text','edited','finished']

    const build_todos = () => {
        const temp_todo: TodoModel = { task_id, user, email, text,edited,finished}
        dispatch(addTodoAsync(temp_todo))
    }    
    const upd_grade = (task_id:string,user:string,email:string,text:string) => {
        const temp_todo: TodoModel = { task_id,user, email,text,edited,finished}
        dispatch(updTodoAsync(temp_todo))
    }
    const finish = (task_id:string,user:string,email:string,text:string) => {
        const temp_todo: TodoModel = { task_id,user, email,text,edited,finished}
        dispatch(finishTodoAsync(temp_todo))
    }

    const get_todos = () => {
        const temp_param: GetParamModel = { page:temp_page,sort_type,sort_field}
        dispatch(getTodosAsync(temp_param))
    }   

    const get_token = () => {
        const temp_login: LoginModel = { login:templogin,password:temppassword}
        dispatch(loginTodoAsync(temp_login))

    } 
     const del_token = () => {
        const temp_login: LoginModel = { login:templogin,password:temppassword}
        dispatch(logoutTodoAsync())

    }   
    const setasc = (sort_field:string) => {
        settempsort(temp_sort => "asc")
        const temp_param: GetParamModel = { page:page,sort_type:"asc",sort_field:sort_field}
        dispatch(getTodosAsync(temp_param))        
    } 
    const setdesc = (sort_field:string) => {        
        settempsort(temp_sort => "desc")
        const temp_param: GetParamModel = { page:page,sort_type:"desc",sort_field:sort_field}
        dispatch(getTodosAsync(temp_param))        
    } 
    const prev_page = () => {
        if(page>1){ 
            settemppage(temp_page => page - 1)
            const temp_param: GetParamModel = { page:(temp_page-1),sort_type,sort_field}
            dispatch(getTodosAsync(temp_param))
        }
    };
    const next_page = () => {
        if(todos.length>0){
            settemppage(temp_page => page + 1)
            const temp_param: GetParamModel = { page:(temp_page+1),sort_type,sort_field}
            dispatch(getTodosAsync(temp_param))
        }
    };
    const print_field_type_sort = (name:string) =>{
        if (name==sort_field){
            return sort_type
        }
        else{
            return ''
        } 
    };

    const admin_panel_edit=(todo: TodoModel)=>{
        if (token=='a23f51237579072357vc235928dd359872357fg7t7g'){
            return <button onClick={() => edit_todo(todo.task_id,todo.user,todo.email,todo.text)}>edit</button>
        }
        else{
            return ''
        }
    }
    const admin_panel_end_task=(todo: TodoModel)=>{
        if (token=='a23f51237579072357vc235928dd359872357fg7t7g'){
            return <button onClick={() => finish(todo.task_id,todo.user,todo.email,todo.text)}>task_end</button>
        }
        else{
            return ''
        }

    }    
    const edit_todo=(temp_task_id: string,temp_user: string,temp_email: string,temp_text: string)=>{
        settask_id(temp_task_id)
        setuser(temp_user)
        setemail(temp_email)
        settext(temp_text)
    }
    const open_edit_panel=()=>{
        if (token=='a23f51237579072357vc235928dd359872357fg7t7g' && task_id!=''){
            return <div>
                <h1> User editing panel</h1>
                <button onClick={() => upd_grade(task_id,user,email,text)}>update data</button> 
                <div>task_id: <input disabled value={task_id}/></div>
                <div>name: <input disabled  value={user}/></div>
                <div>email:  <input disabled  value={email} /></div>
                <div>text:  <input  onChange={(e) => settext(e.target.value)} value={text} /></div>            
             </div>  
                      
        }
    }
    const open_add_panel=()=>{
        if (token==''){
            return <div> 
                <h1> User adding panel</h1>                
                <button onClick={() => build_todos()}>Add</button>
                <div>name: <input onChange={(e) => setuser(e.target.value)} /></div>
                <div>email:  <input onChange={(e) => setemail(e.target.value)}  /></div>
                <div>text:  <input  onChange={(e) => settext(e.target.value)}  /></div>                               
             </div>  
                      
        }
    }    

    const login_logout=()=>{
        if (token==''){
            return <button><a href="#zatemnenie">Login</a></button>
        }
        else{
            return <button onClick={() => del_token() }>Logout</button>
        }

    }    

    useEffect(() => {
        const temp_param: GetParamModel = { page,sort_type,sort_field}
        dispatch(getTodosAsync(temp_param))
    }, [updFlag])

    return (
        <div>
            <div>            
                {login_logout()}
            </div>
            <hr></hr>
            <h1>Todo</h1>
            <table className="table_dark">
                <thead>
                <tr>
                {field_names.map((field)=>
                    <th>
                        {field}
                    </th>
                )}
                </tr>  
                </thead>              
                <tbody>
                <tr>
                {field_names.map(field=>
                    <td>
                        <button onClick={() => setdesc(field)}>&uarr;</button>            
                        <button onClick={() => setasc(field)}>&darr;</button> 
                        {print_field_type_sort(field)}
                    </td>
                 )}                    
                </tr>                
                {todos.map(todo=><tr><td>{todo.task_id}</td>
                                    <td>{todo.user}</td>
                                    <td>{todo.email}</td>
                                    <td>{todo.text}</td>
                                    <td>{todo.edited}</td>
                                    <td>{todo.finished}</td>
                                    <td>
                                        {admin_panel_edit(todo)}
                                        {admin_panel_end_task(todo)}                                                                               
                                    </td>                             
                               </tr>)}
                </tbody>
            </table>
            <h3 className="err">{error}</h3> 
            <br></br>            
            <button onClick={() => prev_page()}>prev page</button>
            {page}
            <button onClick={() => next_page()}>next page</button>
            <hr></hr>
            {open_edit_panel()}
            {open_add_panel()}
            <hr></hr>                             
            <div id="zatemnenie">
                <div id="okno">
                    <div>Admin panel</div>
                    <div>Login: <input onChange={(e) => settemplogin(e.target.value)} /></div>
                    <div>Password: <input onChange={(e) => settemppassword(e.target.value)} /></div>
                    <a href="#" onClick={() => get_token()} >Войти</a>
                </div>
            </div>            
        </div>
    );
}