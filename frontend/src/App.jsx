import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://secure-notes-manager-ecsr.onrender.com/api/v1";

function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [note, setNote] = useState({ title: "", content: "" });
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchNotes(token);
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="loader-page">
        <div className="book-loader">
          <div className="book-cover"></div>
          <div className="book-page">
            <div className="page-line line1"></div>
            <div className="page-line line2"></div>
            <div className="page-line line3"></div>
          </div>
          <div className="book-rings">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <h2>Secure Notes</h2>
        <p>Opening your private workspace...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-left">
            <div className="brand">
              <div className="logo">SN</div>
              <span>Secure Notes</span>
            </div>

            <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>

            <p>
              {mode === "login"
                ? "Sign in to manage your secure notes."
                : "Create your account and start writing safely."}
            </p>

            {mode === "register" && (
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              className="premium-btn"
              onClick={mode === "login" ? login : register}
            >
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

            {message && <p className="message">{message}</p>}
          </div>

          <div className="auth-right notes-preview">
            <div className="glow-circle one"></div>
            <div className="glow-circle two"></div>

            <div className="secure-icon">
              <span>✓</span>
            </div>

            <h2>Secure Notes</h2>

            <p>
              A protected notes workspace with login, JWT authentication, and
              user-specific notes.
            </p>

            <div className="note-editor-preview">
              <div className="editor-top">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="editor-title">Today’s Plan</div>

              <div className="editor-line long"></div>
              <div className="editor-line medium"></div>
              <div className="editor-line short"></div>

              <div className="typing-row">
                <span className="typing-text">
                  Only authenticated users can access notes
                </span>
              </div>

              <div className="editor-footer">
                <span>Auto saved</span>
                <button>Protected</button>
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-pill">JWT Auth</div>
              <div className="feature-pill">MongoDB</div>
              <div className="feature-pill">CRUD API</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="brand white">
          <div className="logo">SN</div>
          <span>Secure Notes</span>
        </div>

        <button className="sidebar-btn" onClick={() => fetchNotes()}>
          Refresh Notes
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <div>
            <h1>My Notes</h1>
            <p>Write, manage and protect your notes.</p>
          </div>
          <span>{notes.length} notes</span>
        </div>

        <div className="create-box">
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

          <button className="premium-btn" onClick={createNote}>
            Add Note
          </button>
        </div>

        {message && <p className="message dashboard-msg">{message}</p>}

        <div className="notes-grid">
          {notes.length === 0 ? (
            <div className="empty-state">
              No notes yet. Create your first note.
            </div>
          ) : (
            notes.map((n) => (
              <div className="note-card" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.content}</p>
                <button className="delete-btn" onClick={() => deleteNote(n.id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;