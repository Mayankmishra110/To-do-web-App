import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
// import './App.css'
// import { CreateTodo } from './components/CreateTodo';
import { CreateTodo } from "../components/CreateTodo";
// import { Todos } from './components/Todos';
import { Todos } from "../components/todos";

// useEffect hook
function App() {
  const [todos, setTodos] = useState([]);

  fetch("http://localhost:8000/todos").then(async function (res) {
    const json = await res.json();
    setTodos(json.todos);
  });

  return (
    <div>
      <CreateTodo></CreateTodo>
      <Todos todos={todos}></Todos>
    </div>
  );
}

export default App;
