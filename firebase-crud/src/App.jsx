import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  collection, addDoc, onSnapshot, doc,
  updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import "./App.css";
function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  // Observe login and logout state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  async function register() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Registration successful!");
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful!");
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function logout() {
    try {
       await signOut(auth);
      setTasks([]);
      setMessage("Logged out.");
    } catch (error) {
      setMessage(error.message);
    }
  }
  // Read this user's tasks in real time.
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    const taskRef = collection(db, "users", user.uid, "tasks");
    const unsubscribe = onSnapshot(taskRef, (snapshot) => {
      const taskList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setTasks(taskList);
    }, (error) => setMessage(error.message));
    return () => unsubscribe();
  }, [user]);
  // Create a task, or update the selected task.
  async function saveTask() {
    if (!user || !taskName.trim()) return;
    try {
      if (editId) {
        await updateDoc(
          doc(db, "users", user.uid, "tasks", editId),
          { name: taskName.trim() }
        );
        setMessage("Task updated.");
        setEditId(null);
      } else {
        await addDoc(
          collection(db, "users", user.uid, "tasks"),
          {
            name: taskName.trim(),
            completed: false,
            createdAt: serverTimestamp()
          }
        );
        setMessage("Task added.");
      }
      setTaskName("");
    } catch (error) {
      setMessage(error.message);
    }
  }
  function editTask(task) {
    setTaskName(task.name);
    setEditId(task.id);
  }
  async function deleteTask(id) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
      setMessage("Task deleted.");
      if (editId === id) {
        setEditId(null);
        setTaskName("");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }
  async function toggleTask(task) {
    if (!user) return;
    try {
      await updateDoc(
        doc(db, "users", user.uid, "tasks", task.id),
         { completed: !task.completed }
      );
    } catch (error) {
      setMessage(error.message);
    }
  }
  if (!authReady) return <main className="container">Loading...</main>;
  if (!user) {
    return (
      <main className="container">
        <h1>Firebase Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
        <p>{message}</p>
      </main>
    );
  }
  return (
    <main className="container">
      <h1>My Task Manager</h1>
      <p>Welcome: {user.email}</p>
      <button onClick={logout}>Logout</button>
      <hr />
      <h2>Manage Tasks</h2>
      <input
        type="text"
        placeholder="Enter task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />
      <button onClick={saveTask}>
        {editId ? "Update Task" : "Add Task"}
      </button>
      {editId && (
        <button onClick={() => {
          setEditId(null);
          setTaskName("");
        }}>
          Cancel
        </button>
      )}
      <h2>My Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className="task">
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => toggleTask(task)}
          />
          <span className={task.completed ? "completed" : ""}>
            {task.name}
          </span>
          <button onClick={() => editTask(task)}>Edit</button>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      ))}
      {tasks.length === 0 && <p>No tasks yet. Add your first task.</p>}
      <p>{message}</p>
    </main>
  );
}
export default App;