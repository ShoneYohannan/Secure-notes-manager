import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:8000/api/v1";

function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [note, setNote] = useState({ title: "", content: "" });
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) fetchNotes(token);
  }, [token]);

  const register = async () => {
    try {
      await axios.post(`${API}/auth/register`, form);
      setMessage("Account created. Please login.");
      setMode("login");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
      setMessage("Login successful");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Invalid email or password");
    }
  };

  const fetchNotes = async (jwt = token) => {
    try {
      const res = await axios.get(`${API}/notes`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setNotes(res.data);
    } catch {
      setMessage("Could not load notes");
    }
  };

  const createNote = async () => {
    if (!note.title || !note.content) {
      setMessage("Please enter title and content");
      return;
    }

    try {
      await axios.post(`${API}/notes`, note, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNote({ title: "", content: "" });
      setMessage("Note created successfully");
      fetchNotes();
    } catch {
      setMessage("Could not create note");
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Note deleted");
      fetchNotes();
    } catch {
      setMessage("Could not delete note");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setNotes([]);
    setMessage("");
  };

  if (!token) {
    return (
      <div className="auth-page fade-in">
        <div className="auth-card pop-in">
          <div className="auth-left slide-up">
            <div className="brand">
              <div className="logo">SN</div>
              <span>Secure Notes</span>
            </div>

            <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1><br></br>
            <p>
              {mode === "login"
                ? "Sign in to manage your secure notes."
                : "Create your account and start writing safely."}
            </p>

            {mode === "register" && (
              <input
                className="input-animate"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}

            <input
              className="input-animate"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              className="input-animate"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button className="btn-animate" onClick={mode === "login" ? login : register}>
              {mode === "login" ? "Login" : "Create Account"}
            </button>

            <button
              className="switch-btn"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              {mode === "login"
                ? "New here? Create an account"
                : "Already have an account? Login"}
            </button>

            {message && <p className="message fade-in">{message}</p>}
          </div>

          <div className="auth-right slide-left">
            <h2>Your private notes, secured.</h2>
            <p>JWT authentication, MongoDB Atlas, and protected APIs.</p>

            <div className="mock-dashboard float-animation">
              <div className="mock-sidebar"></div>
              <div className="mock-content">
                <div className="mock-card wide shimmer"></div>
                <div className="mock-row">
                  <div className="mock-card shimmer"></div>
                  <div className="mock-card shimmer"></div>
                </div>
                <div className="mock-note shimmer"></div>
                <div className="mock-note small shimmer"></div>
              </div>
            </div>

            <div className="floating-card one">JWT Auth</div>
            <div className="floating-card two">MongoDB</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page fade-in">
      <aside className="sidebar slide-right">
        <div className="brand white">
          <div className="logo">SN</div>
          <span>Secure Notes</span>
        </div>

        <button className="btn-animate" onClick={() => fetchNotes()}>
          Refresh Notes
        </button>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-area slide-up">
        <div className="topbar">
          <div>
            <h1>My Notes</h1>
            <p>Write, manage and protect your notes.</p>
          </div>
          <span>{notes.length} notes</span>
        </div>

        <div className="create-box pop-in">
          <input
            placeholder="Note title"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
          />

          <textarea
            placeholder="Write your note..."
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
          />

          <button className="btn-animate" onClick={createNote}>
            Add Note
          </button>
        </div>

        {message && <p className="message dashboard-msg fade-in">{message}</p>}

        <div className="notes-grid">
          {notes.length === 0 ? (
            <div className="empty-state fade-in">
              No notes yet. Create your first note.
            </div>
          ) : (
            notes.map((n, index) => (
              <div
                className="note-card note-animate"
                key={n.id}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <h3>{n.title}</h3>
                <p>{n.content}</p>
                <button onClick={() => deleteNote(n.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;