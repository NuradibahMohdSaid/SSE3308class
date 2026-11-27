import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";

// Calls an Edge Function. supabase-js sends the user's login token
// (JWT) automatically in the Authorization header.
async function callFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    let message = error.message;
    try {
      // Read the error message sent by our function, e.g. "Task not found."
      const details = await error.context.json();
      if (details?.error) message = details.error;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }
  return data;
}

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // READ: load only this user's tasks.
  // The .eq() filter is for speed. The real protection is the RLS policy:
  // even without .eq(), the database returns only the user's own rows.
  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, completed, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load tasks error:", error);
      setError("Unable to load tasks.");
      return;
    }
    setTasks(data);
  }, [user.id]);

  // REAL-TIME: reload the list when one of this user's tasks is added or changed
  useEffect(() => {
    loadTasks();

    const filter = `user_id=eq.${user.id}`;
    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks", filter },
        () => loadTasks())
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter },
        () => loadTasks())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, loadTasks]);

  // WRITE: every change goes through an Edge Function
  const run = async (functionName, body) => {
    setBusy(true);
    setError("");
    try {
      await callFunction(functionName, body);
      await loadTasks();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addTask = async (event) => {
    event.preventDefault();
    const ok = await run("create-task", { title });
    if (ok) setTitle("");
  };

  const toggleTask = (taskId) => run("toggle-task", { taskId });

  const deleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) run("delete-task", { taskId });
  };

  const logout = () => supabase.auth.signOut();

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;
  const name = user.email.split("@")[0];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>Task Web App</span>
        </div>
        <nav>
          <span className="nav-item active">Dashboard</span>
          <button className="nav-item" onClick={logout}>Logout</button>
        </nav>
        <p className="sidebar-user">{user.email}</p>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <h1>Hi, {name}</h1>
            <p className="muted">Manage, track and complete your tasks</p>
          </div>
          <button className="btn-outline mobile-only" onClick={logout}>Logout</button>
        </header>

        <section className="stats">
          <div className="stat">
            <strong>{tasks.length}</strong>
            <span>Total Tasks</span>
          </div>
          <div className="stat">
            <strong className="green">{completed}</strong>
            <span>Completed</span>
          </div>
          <div className="stat">
            <strong className="amber">{pending}</strong>
            <span>Pending</span>
          </div>
        </section>

        <form className="add-form" onSubmit={addTask}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a new task"
            maxLength={100}
            aria-label="New task title"
          />
          <button type="submit" className="btn-primary" disabled={busy || !title.trim()}>
            + Add Task
          </button>
        </form>

        {error && <p className="message">{error}</p>}

        <h2>My Tasks</h2>
        {tasks.length === 0 ? (
          <p className="muted empty">No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "task done" : "task"}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    disabled={busy}
                  />
                  {/* React shows this as plain text, so HTML/script in a title cannot run */}
                  <span>{task.title}</span>
                </label>
                <button
                  className="btn-delete"
                  onClick={() => deleteTask(task.id)}
                  disabled={busy}
                  aria-label={`Delete ${task.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}