import { useCallback, useEffect, useMemo, useState } from "react";
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

// The three task lists shown in the sidebar and as filter tabs
const FILTERS = [
  { key: "all", label: "All Tasks", dot: "dot-all" },
  { key: "pending", label: "Pending", dot: "dot-pending" },
  { key: "completed", label: "Completed", dot: "dot-done" },
];

// Small line icons (inline SVG, no extra library needed)
const ICONS = {
  cap: (
    <>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1" />
      <circle cx="3.5" cy="12" r="1" />
      <circle cx="3.5" cy="18" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="3" y1="11" x2="21" y2="11" />
    </>
  ),
  left: <polyline points="15 18 9 12 15 6" />,
  right: <polyline points="9 18 15 12 9 6" />,
  back: (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

// Each folder gets a colour from this list (by its position)
const FOLDER_COLOURS = ["#7c5cff", "#2f9bff", "#e94f6f", "#f08c00", "#22a06b", "#d6409f"];
const folderColour = (index) => FOLDER_COLOURS[index % FOLDER_COLOURS.length];

// "25 Nov 2026, 3:04 pm"
function formatDate(iso) {
  return new Date(iso).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// "5 minutes ago", "yesterday", ...
// "YYYY-MM-DD" for a date in the student's own time zone
function dateKey(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayString() {
  return dateKey(new Date());
}

// "YYYY-MM-DD" -> local Date
function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Text + colour for a task's due date
function dueInfo(task) {
  if (!task.due_date) return { label: "No due date", tone: "none" };
  const [y, m, d] = task.due_date.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const label = due.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  if (task.completed) return { label: `Due ${label}`, tone: "done" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { label: `Overdue · ${label}`, tone: "overdue" };
  if (days === 0) return { label: "Due today", tone: "today" };
  if (days === 1) return { label: "Due tomorrow", tone: "soon" };
  return { label: `Due ${label}`, tone: "later" };
}

function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (seconds < 60) return "just now";
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  return rtf.format(-Math.floor(seconds / 86400), "day");
}

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState([]);
  // Which folder is open: "all", "none" (tasks without a folder) or a folder ID
  const [folderView, setFolderView] = useState("all");
  const [taskFolder, setTaskFolder] = useState(""); // folder for the next new task
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [dueDate, setDueDate] = useState(""); // "YYYY-MM-DD"
  const [noDueDate, setNoDueDate] = useState(false);
  // Which page is shown: "dashboard" (tasks) or "folders" (All Folders page)
  const [page, setPage] = useState("dashboard"); // "dashboard" | "folders" | "schedule"
  // Schedule page: which month is shown, and which day is selected
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(todayString);
  // Phone menu (the 3-line button in the header)
  const [menuOpen, setMenuOpen] = useState(false);

  // READ: load only this user's tasks.
  // The .eq() filter is for speed. The real protection is the RLS policy:
  // even without .eq(), the database returns only the user's own rows.
  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, completed, created_at, folder_id, due_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load tasks error:", error);
      setError("Unable to load tasks.");
      return;
    }
    setTasks(data);
  }, [user.id]);

  // READ: this user's folders (also protected by RLS)
  const loadFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Load folders error:", error);
      setError("Unable to load folders.");
      return;
    }
    setFolders(data);
  }, [user.id]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // REAL-TIME: reload the list when one of this user's tasks is added or changed
  useEffect(() => {
    loadTasks();

    const rowFilter = `user_id=eq.${user.id}`;
    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks", filter: rowFilter },
        () => loadTasks())
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter: rowFilter },
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
    // Ignore a folder that no longer exists
    const folderId = taskFolder && folders.some((f) => f.id === taskFolder) ? taskFolder : null;
    // The student must pick a date OR tick "No due date"
    if (!noDueDate && !dueDate) {
      setError('Pick a due date, or tick "No due date".');
      return;
    }
    const ok = await run("create-task", {
      title,
      folderId,
      dueDate: noDueDate ? null : dueDate,
    });
    if (ok) {
      setTitle("");
      setDueDate("");
      setNoDueDate(false);
    }
  };

  // Open a folder (or "all" / "none"). New tasks go into the open folder.
  const openFolder = (view) => {
    setPage("dashboard");
    setFolderView(view);
    setTaskFolder(view === "all" || view === "none" ? "" : view);
  };

  const addFolder = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await callFunction("create-folder", { name: folderName });
      await loadFolders();
      setFolderName("");
      setShowNewFolder(false);
      // On the All Folders page, stay there; otherwise open the new folder
      if (page !== "folders") openFolder(result.folderId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteFolder = async (folder) => {
    const ok = window.confirm(
      `Delete folder "${folder.name}"?\nIts tasks will be kept and moved to "No folder".`
    );
    if (!ok) return;
    if (await run("delete-folder", { folderId: folder.id })) {
      await loadFolders();
      if (folderView === folder.id) {
        setFolderView("all");
        setTaskFolder("");
      }
    }
  };

  const toggleTask = (taskId) => run("toggle-task", { taskId });

  // Move a task into a folder ("" = No folder). Done by the move-task function.
  const moveTask = (taskId, folderId) => run("move-task", { taskId, folderId: folderId || null });

  const deleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) run("delete-task", { taskId });
  };

  const logout = () => supabase.auth.signOut();

  // While the phone menu is open: stop the page behind it from scrolling,
  // and let the Escape key close it
  useEffect(() => {
    if (!menuOpen) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Folder lookup: id -> { name, colour }
  const folderInfo = useMemo(() => {
    const map = {};
    folders.forEach((f, i) => {
      map[f.id] = { name: f.name, colour: folderColour(i) };
    });
    return map;
  }, [folders]);

  // If the open folder was deleted (e.g. in another tab), go back to "all"
  const view = folderView === "all" || folderView === "none" || folderInfo[folderView]
    ? folderView
    : "all";

  // Tasks in the open folder
  const folderTasks = useMemo(() => {
    if (view === "all") return tasks;
    if (view === "none") return tasks.filter((t) => !t.folder_id);
    return tasks.filter((t) => t.folder_id === view);
  }, [tasks, view]);

  // Numbers next to folders = how many TASKS are inside
  const countIn = (id) => tasks.filter((t) => t.folder_id === id).length;
  const noFolderCount = tasks.filter((t) => !t.folder_id).length;
  const taskLabel = (n) => `${n} task${n === 1 ? "" : "s"}`;
  const viewName =
    view === "all" ? "All folders" : view === "none" ? "No folder" : folderInfo[view].name;

  // Numbers for the cards and the chart (for the open folder)
  const total = folderTasks.length;
  const completed = folderTasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  // Sidebar "My Lists" always counts ALL tasks (every folder)
  const allCompleted = tasks.filter((t) => t.completed).length;
  const allCounts = {
    all: tasks.length,
    pending: tasks.length - allCompleted,
    completed: allCompleted,
  };

  // Tasks after the folder, the filter tab and the search box
  const visibleTasks = useMemo(() => {
    const text = search.trim().toLowerCase();
    return folderTasks.filter((t) => {
      if (filter === "pending" && t.completed) return false;
      if (filter === "completed" && !t.completed) return false;
      return !text || t.title.toLowerCase().includes(text);
    });
  }, [folderTasks, filter, search]);

  const recent = folderTasks.slice(0, 4); // already newest first

  const onDashboard = page === "dashboard";

  // Folders shown on the All Folders page (the search box filters them)
  const shownFolders = folders
    .map((f, i) => ({ folder: f, colour: folderColour(i) }))
    .filter(({ folder }) => folder.name.toLowerCase().includes(search.trim().toLowerCase()));

  // Folder list + "New folder" form (sidebar, and the phone menu)
  const folderButtons = (
    <>
      <button
        className={`folder-link ${page === "folders" ? "selected" : ""}`}
        onClick={() => setPage("folders")}
      >
        <Icon name="folder" size={16} />
        <span className="folder-name">All folders</span>
      </button>
      {folders.map((f, i) => (
        <div key={f.id} className={`folder-link ${onDashboard && view === f.id ? "selected" : ""}`}>
          <button className="folder-open" onClick={() => openFolder(f.id)}>
            <span className="folder-swatch" style={{ background: folderColour(i) }} />
            {/* plain text: a folder name cannot run as HTML */}
            <span className="folder-name">{f.name}</span>
            <span className="side-count" title={taskLabel(countIn(f.id))}>{countIn(f.id)}</span>
          </button>
          <button
            className="folder-delete"
            onClick={() => deleteFolder(f)}
            disabled={busy}
            aria-label={`Delete folder ${f.name}`}
            title="Delete folder"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
      <button
        className={`folder-link ${onDashboard && view === "none" ? "selected" : ""}`}
        onClick={() => openFolder("none")}
      >
        <span className="folder-swatch none" />
        <span className="folder-name">No folder</span>
        <span className="side-count" title={taskLabel(noFolderCount)}>{noFolderCount}</span>
      </button>

      {showNewFolder ? (
        <form className="new-folder" onSubmit={addFolder}>
          <input
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g. SSE3308"
            maxLength={40}
            aria-label="New folder name"
          />
          <div className="new-folder-actions">
            <button type="submit" className="btn-small" disabled={busy || !folderName.trim()}>
              Create
            </button>
            <button
              type="button"
              className="btn-small ghost"
              onClick={() => { setShowNewFolder(false); setFolderName(""); }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="folder-add" onClick={() => setShowNewFolder(true)}>
          <Icon name="plus" size={16} /> New folder
        </button>
      )}
    </>
  );
  const name = user.email.split("@")[0];
  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ===== Schedule page (calendar of due dates) =====
  const todayKey = todayString();

  // Tasks grouped by due date (the search box filters them too)
  const tasksByDay = useMemo(() => {
    const text = search.trim().toLowerCase();
    const map = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      if (text && !t.title.toLowerCase().includes(text)) return;
      (map[t.due_date] ||= []).push(t);
    });
    return map;
  }, [tasks, search]);

  // 6 weeks (Mon-Sun) around the shown month; drop the last week if it is all next month
  const calendarDays = (() => {
    const offset = (calMonth.getDay() + 6) % 7;
    const days = Array.from({ length: 42 }, (_, i) =>
      new Date(calMonth.getFullYear(), calMonth.getMonth(), 1 - offset + i)
    );
    return days[35].getMonth() !== calMonth.getMonth() ? days.slice(0, 35) : days;
  })();

  const monthLabel = calMonth.toLocaleDateString("en-MY", { month: "long", year: "numeric" });
  const shiftMonth = (n) =>
    setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + n, 1));
  const goToDay = (key) => {
    const d = keyToDate(key);
    setCalMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDay(key);
  };

  const dayTasks = tasksByDay[selectedDay] || [];
  const selectedLabel = keyToDate(selectedDay).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Upcoming: only tasks that still need to be done
  const in7Days = (() => {
    const d = new Date();
    return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  })();
  const openTasks = tasks.filter((t) => !t.completed);
  const byDue = (a, b) => a.due_date.localeCompare(b.due_date);
  const overdue = openTasks.filter((t) => t.due_date && t.due_date < todayKey).sort(byDue);
  const next7 = openTasks
    .filter((t) => t.due_date && t.due_date >= todayKey && t.due_date <= in7Days)
    .sort(byDue);
  const laterCount = openTasks.filter((t) => t.due_date && t.due_date > in7Days).length;
  const noDueCount = openTasks.filter((t) => !t.due_date).length;

  // One task in the schedule side lists
  const scheduleItem = (task, showDate) => (
    <li key={task.id} className={`sched-item ${task.completed ? "done" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        disabled={busy}
        aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
      />
      <button className="sched-text" onClick={() => goToDay(task.due_date)} title="Show this day">
        <span className="sched-title">{task.title}</span>
        <small>
          {folderInfo[task.folder_id] && (
            <span style={{ color: folderInfo[task.folder_id].colour }}>
              {folderInfo[task.folder_id].name} ·{" "}
            </span>
          )}
          {showDate ? dueInfo(task).label : task.completed ? "Completed" : "Pending"}
        </small>
      </button>
    </li>
  );

  const schedulePage = (
    <div className="content-grid">
      <div className="col-main">
        {error && <p className="message">{error}</p>}
        <section className="card calendar">
          <div className="card-head">
            <h2>{monthLabel}</h2>
            <div className="cal-nav">
              <button className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                <Icon name="left" size={18} />
              </button>
              <button className="btn-small" onClick={() => goToDay(todayKey)}>Today</button>
              <button className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
                <Icon name="right" size={18} />
              </button>
            </div>
          </div>

          <div className="cal-grid">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-weekday">{w}</div>
            ))}
            {calendarDays.map((d) => {
              const key = dateKey(d);
              const list = tasksByDay[key] || [];
              const classes = [
                "cal-day",
                d.getMonth() !== calMonth.getMonth() ? "out" : "",
                key === todayKey ? "today" : "",
                key === selectedDay ? "selected" : "",
              ].join(" ");
              return (
                <button
                  key={key}
                  className={classes}
                  onClick={() => setSelectedDay(key)}
                  aria-label={`${d.toDateString()}: ${taskLabel(list.length)}`}
                >
                  <span className="cal-num">{d.getDate()}</span>
                  <span className="cal-chips">
                    {list.slice(0, 2).map((t) => (
                      <span
                        key={t.id}
                        className={`cal-chip ${dueInfo(t).tone}`}
                        style={{ "--chip": folderInfo[t.folder_id]?.colour || "#80869a" }}
                      >
                        {t.title}
                      </span>
                    ))}
                    {list.length > 2 && <span className="cal-more">+{list.length - 2} more</span>}
                  </span>
                  {list.length > 0 && (
                    <span className="cal-dots">
                      {list.slice(0, 3).map((t) => (
                        <i key={t.id} className={dueInfo(t).tone} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <span><i className="later" /> Upcoming</span>
            <span><i className="today" /> Today / tomorrow</span>
            <span><i className="overdue" /> Overdue</span>
            <span><i className="done" /> Completed</span>
          </div>
        </section>
      </div>

      <aside className="col-side">
        <section className="card">
          <div className="card-head">
            <h2>{selectedLabel}</h2>
            <span className="badge">{taskLabel(dayTasks.length)}</span>
          </div>
          {dayTasks.length === 0 ? (
            <p className="muted">No tasks due on this day.</p>
          ) : (
            <ul className="sched-list">{dayTasks.map((t) => scheduleItem(t, false))}</ul>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Upcoming</h2>
          </div>
          {overdue.length > 0 && (
            <>
              <p className="sched-heading overdue">Overdue ({overdue.length})</p>
              <ul className="sched-list">{overdue.map((t) => scheduleItem(t, true))}</ul>
            </>
          )}
          <p className="sched-heading">Next 7 days ({next7.length})</p>
          {next7.length === 0 ? (
            <p className="muted">Nothing due in the next 7 days.</p>
          ) : (
            <ul className="sched-list">{next7.map((t) => scheduleItem(t, true))}</ul>
          )}
          <p className="muted sched-foot">
            {laterCount} due later · {noDueCount} with no due date
          </p>
        </section>
      </aside>
    </div>
  );

  return (
    <div className="app">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon"><Icon name="cap" size={20} /></span>
          <span>StudentTask</span>
        </div>

        {/* Phones only: opens the menu below */}
        <button
          className="menu-btn mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="side-menu"
        >
          <Icon name={menuOpen ? "x" : "menu"} size={22} />
        </button>

        {/* Desktop: always shown. Phones: full-screen menu when open */}
        <div
          id="side-menu"
          className={`side-body ${menuOpen ? "open" : ""}`}
          onClick={(e) => {
            // Close the phone menu after picking a page, list or folder
            // (not for "New folder" or the delete X buttons)
            if (e.target.closest("button.side-link, button.folder-link, .folder-open")) {
              setMenuOpen(false);
            }
          }}
        >
        <nav className="side-nav">
          <button
            className={`side-link ${onDashboard && view === "all" ? "active" : ""}`}
            onClick={() => openFolder("all")}
          >
            <Icon name="grid" /> Dashboard
          </button>
          <button
            className={`side-link ${page === "schedule" ? "active" : ""}`}
            onClick={() => setPage("schedule")}
          >
            <Icon name="calendar" /> Schedule
          </button>
        </nav>

        <p className="side-heading">My Lists</p>
        <nav className="side-nav">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`side-link ${onDashboard && view === "all" && filter === f.key ? "selected" : ""}`}
              onClick={() => {
                // Show this status across ALL folders
                openFolder("all");
                setFilter(f.key);
              }}
            >
              <span className={`dot ${f.dot}`} />
              {f.label}
              <span className="side-count" title={taskLabel(allCounts[f.key])}>{allCounts[f.key]}</span>
            </button>
          ))}
        </nav>

        <p className="side-heading">Folders ({folders.length})</p>
        <nav className="side-nav folder-nav">{folderButtons}</nav>

        <button className="side-link side-logout" onClick={logout}>
          <Icon name="logout" /> Log Out
        </button>
        </div>
      </aside>

      {/* ===== Main area ===== */}
      <div className="main">
        <header className="topbar">
          <div>
            <h1>
              {page === "folders"
                ? "All Folders"
                : page === "schedule"
                  ? "Schedule"
                  : view === "all"
                    ? "Dashboard"
                    : viewName}
            </h1>
            <p className="muted">{today}</p>
          </div>
          <div className="topbar-right">
            <label className="search">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder={page === "folders" ? "Search folders" : "Search tasks"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={page === "folders" ? "Search folders" : "Search tasks"}
              />
            </label>
            <div className="user-pill" title={user.email}>
              <span className="avatar">{name.charAt(0).toUpperCase()}</span>
              <span className="user-name">{name}</span>
            </div>
          </div>
        </header>

        {page === "schedule" ? (
          schedulePage
        ) : page === "folders" ? (
          /* ===== All Folders page (no statistics / recent tasks) ===== */
          <section className="folders-page">
            <div className="folders-head">
              <button className="btn-back" onClick={() => openFolder("all")}>
                <Icon name="back" size={16} /> Back to dashboard
              </button>
              <p className="muted">
                {folders.length} folder{folders.length === 1 ? "" : "s"} · {taskLabel(tasks.length)}
              </p>
            </div>

            {error && <p className="message">{error}</p>}

            <div className="folder-grid">
              {shownFolders.map(({ folder, colour }) => {
                const inside = tasks.filter((t) => t.folder_id === folder.id);
                const done = inside.filter((t) => t.completed).length;
                const pct = inside.length ? Math.round((done / inside.length) * 100) : 0;
                return (
                  <article key={folder.id} className="folder-card" style={{ "--folder": colour }}>
                    <button
                      className="folder-card-open"
                      onClick={() => openFolder(folder.id)}
                      aria-label={`Open folder ${folder.name}`}
                    >
                      <span className="folder-card-icon"><Icon name="folder" size={22} /></span>
                      {/* plain text: a folder name cannot run as HTML */}
                      <h3>{folder.name}</h3>
                      <p className="muted">{taskLabel(inside.length)}</p>
                      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                      <div className="folder-card-foot">
                        <span>{inside.length - done} pending · {done} done</span>
                        <strong>{pct}%</strong>
                      </div>
                    </button>
                    <button
                      className="folder-card-delete"
                      onClick={() => deleteFolder(folder)}
                      disabled={busy}
                      aria-label={`Delete folder ${folder.name}`}
                      title="Delete folder (tasks are kept)"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </article>
                );
              })}

              {!search.trim() && (
                <article className="folder-card no-folder" style={{ "--folder": "var(--muted)" }}>
                  <button
                    className="folder-card-open"
                    onClick={() => openFolder("none")}
                    aria-label="Open tasks with no folder"
                  >
                    <span className="folder-card-icon"><Icon name="list" size={22} /></span>
                    <h3>No folder</h3>
                    <p className="muted">{taskLabel(noFolderCount)} not in any folder</p>
                  </button>
                </article>
              )}

              {showNewFolder ? (
                <form className="folder-card new-card" onSubmit={addFolder}>
                  <h3>New folder</h3>
                  <input
                    autoFocus
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="e.g. SSE3308"
                    maxLength={40}
                    aria-label="New folder name"
                  />
                  <div className="new-folder-actions">
                    <button type="submit" className="btn-primary" disabled={busy || !folderName.trim()}>
                      Create
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => { setShowNewFolder(false); setFolderName(""); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button className="folder-card add-card-btn" onClick={() => setShowNewFolder(true)}>
                  <Icon name="plus" size={24} />
                  <span>New folder</span>
                </button>
              )}
            </div>

            {shownFolders.length === 0 && search.trim() && (
              <p className="muted empty">No folders match "{search}".</p>
            )}
          </section>
        ) : (
        <div className="content-grid">
          {/* ----- Left column ----- */}
          <div className="col-main">
            <section className="summary">
              <div className="summary-card highlight">
                <span className="summary-icon"><Icon name="list" size={22} /></span>
                <div>
                  <strong>{total}</strong>
                  <span>Total Tasks</span>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-icon amber"><Icon name="clock" size={22} /></span>
                <div>
                  <strong>{pending}</strong>
                  <span>Pending</span>
                </div>
              </div>
              <div className="summary-card">
                <span className="summary-icon green"><Icon name="check" size={22} /></span>
                <div>
                  <strong>{completed}</strong>
                  <span>Completed</span>
                </div>
              </div>
            </section>

            <form className="card add-card" onSubmit={addTask}>
              <h2>Add a new task</h2>
              <div className="add-row">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish SSE3308 lab report"
                  maxLength={100}
                  aria-label="New task title"
                />
                <select
                  className="folder-select"
                  value={taskFolder}
                  onChange={(e) => setTaskFolder(e.target.value)}
                  aria-label="Folder for the new task"
                >
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="date-input"
                  value={noDueDate ? "" : dueDate}
                  min={todayString()}
                  max="2100-12-31"
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={noDueDate}
                  aria-label="Due date"
                  title="Due date"
                />
                <button type="submit" className="btn-primary" disabled={busy || !title.trim()}>
                  <Icon name="plus" size={16} /> Add Task
                </button>
              </div>
              <div className="add-foot">
                <label className="no-due">
                  <input
                    type="checkbox"
                    checked={noDueDate}
                    onChange={(e) => setNoDueDate(e.target.checked)}
                  />
                  No due date
                </label>
                <small className="char-count">{title.length}/100</small>
              </div>
            </form>

            {error && <p className="message">{error}</p>}

            <section className="card">
              <div className="card-head">
                <h2>
                  My Tasks
                  {view !== "all" && <span className="head-folder"> · {viewName}</span>}
                </h2>
                <div className="pills" role="tablist" aria-label="Filter tasks">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      role="tab"
                      aria-selected={filter === f.key}
                      className={`pill ${filter === f.key ? "active" : ""}`}
                      onClick={() => setFilter(f.key)}
                    >
                      {f.key === "all" ? "All" : f.label}
                    </button>
                  ))}
                </div>
              </div>

              {visibleTasks.length === 0 ? (
                <p className="muted empty">
                  {total === 0
                    ? view === "all"
                      ? "No tasks yet. Add your first task above."
                      : "No tasks in this folder yet. Add one above."
                    : "No tasks match this filter or search."}
                </p>
              ) : (
                <ul className="task-list">
                  {visibleTasks.map((task) => (
                    <li key={task.id} className={task.completed ? "task done" : "task"}>
                      <div className="task-check">
                        <input
                          id={`task-${task.id}`}
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          disabled={busy}
                        />
                        <span className="task-text">
                          {/* React shows this as plain text, so HTML/script in a title cannot run */}
                          <label htmlFor={`task-${task.id}`} className="task-title">
                            {task.title}
                          </label>
                          <small className="task-meta">
                            {/* Move the task into a folder, or keep it in "No folder" */}
                            <select
                              className={`move-select ${task.folder_id ? "in-folder" : ""}`}
                              style={
                                folderInfo[task.folder_id]
                                  ? { "--folder": folderInfo[task.folder_id].colour }
                                  : undefined
                              }
                              value={folderInfo[task.folder_id] ? task.folder_id : ""}
                              onChange={(e) => moveTask(task.id, e.target.value)}
                              disabled={busy}
                              aria-label={`Folder for ${task.title}`}
                              title="Move to folder"
                            >
                              <option value="">No folder</option>
                              {folders.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                            <span className={`due-tag ${dueInfo(task).tone}`}>
                              <Icon name="calendar" size={12} /> {dueInfo(task).label}
                            </span>
                            <span>Added {formatDate(task.created_at)}</span>
                          </small>
                        </span>
                      </div>
                      <span className={`status ${task.completed ? "done" : "pending"}`}>
                        {task.completed ? "Completed" : "Pending"}
                      </span>
                      <button
                        className="btn-delete"
                        onClick={() => deleteTask(task.id)}
                        disabled={busy}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ----- Right column ----- */}
          <aside className="col-side">
            <section className="card">
              <div className="card-head">
                <h2>Task Statistic</h2>
                <span className="badge">{percent}% done</span>
              </div>

              <div className="mini-stats">
                <div className="mini-stat accent">
                  <strong>{completed}/{total}</strong>
                  <span>Completed</span>
                </div>
                <div className="mini-stat amber">
                  <strong>{pending}</strong>
                  <span>Pending</span>
                </div>
                <div className="mini-stat green">
                  <strong>{percent}%</strong>
                  <span>Progress</span>
                </div>
              </div>

              <div
                className="donut"
                style={{ "--p": percent }}
                role="img"
                aria-label={`${percent}% of tasks completed`}
              >
                <div className="donut-inner">
                  <strong>{percent}%</strong>
                  <span>Completed</span>
                </div>
              </div>
              <p className="muted center">
                {completed} of {total} tasks completed
              </p>
            </section>

            <section className="card">
              <div className="card-head">
                <h2>Recent Tasks</h2>
              </div>
              {recent.length === 0 ? (
                <p className="muted">No tasks yet.</p>
              ) : (
                <ol className="recent">
                  {recent.map((task, i) => (
                    <li key={task.id}>
                      <span className="recent-num">{i + 1}</span>
                      <div className="recent-text">
                        <p>{task.title}</p>
                        <small>{timeAgo(task.created_at)}</small>
                      </div>
                      <span className={`status ${task.completed ? "done" : "pending"}`}>
                        {task.completed ? "Done" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </aside>
        </div>
        )}
      </div>
    </div>
  );
}
