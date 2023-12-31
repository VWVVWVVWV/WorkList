import  Todo from "../../models/Todo";
import  GetParam from "../../models/Getparam";
import  Login from "../../models/Login";
import axios from "axios";
const MY_SERVER = "http://localhost:82/"
  
export function getTodos(new_param:GetParam) {
    return new Promise<{ data: Todo[] }>((resolve) =>
        axios.post(MY_SERVER+"tasks",new_param).then(res => resolve({ data: res.data }))
    );
}


export function addTodo(new_todo:Todo) {
    return new Promise<{ data: string}>((resolve) =>
        axios.post(MY_SERVER +"new",new_todo).then(res => resolve({ data: res.data }))
    );
}


export function updTodo(new_todo:Todo) {
    return new Promise<{ data: string }>((resolve) =>
        axios.post(MY_SERVER +"edit_task",new_todo).then(res => resolve({ data: res.data }))
    );
}

export function finishTodo(new_todo:Todo) {
    return new Promise<{ data: string }>((resolve) =>
        axios.post(MY_SERVER +"finish",new_todo).then(res => resolve({ data: res.data }))
    );
}


export function loginTodo(new_login:Login) {
    return new Promise<{ data: string }>((resolve) =>
        axios.post(MY_SERVER +"login",new_login).then(res => resolve({ data: res.data }))
    );
}
export function logoutTodo() {
    return  Promise.resolve("")
}

