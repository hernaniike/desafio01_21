const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userExists = users.some(
    (user) => user.username === username
        );
  if(userExists) {
    request.userFound = users.find((user) => user.username === username)
    return next();
  } 
  return response.status(400).json({error: "User does not exist!"})
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const userExists = users.some(
    (user) => user.username === username
        );
  if(userExists) {
    return response.status(400).json({error: "Customer already exists!"})
  } 
  const id = uuidv4();
  const todos = [];
  const newUser = {
    id,
    name,
    username,
    todos
  }
  users.push(newUser);
  return response.status(200).send(newUser);
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
  const {userFound} = request;

  return response.status(201).send(userFound.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {userFound} = request;
  const {title, deadline} = request.body
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  userFound.todos.push(newTodo);
  return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const {id} = request.params;
    const {title, deadline} = request.body
    const {userFound} = request;
    const todo = userFound.todos.find((todo => todo.id === id))
    if(!todo) {
      return response.status(404).json({error: "Todo not found"})
    }
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {userFound} = request;
  const todo = userFound.todos.find((todo => todo.id === id))
  if(!todo) {
    return response.status(404).json({error: "Todo not found!"})
  }
  todo.done = true;
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {userFound} = request;

  const todoIndex = userFound.todos.findIndex(todo => todo.id === id)
  console.log(todoIndex);
  if(todoIndex === -1) {
    return response.status(404).json({error: "Todo not found"})
  }
  userFound.todos.splice(todoIndex, 1)
  return response.status(204).json()
});

module.exports = app;