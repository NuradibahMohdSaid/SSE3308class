import { useState } from "react";
import { supabase } from "../supabase";

// Shown after the user clicks the password reset link in their email.
// The link logs the user in for a short time, so updateUser() can change
// the password of THIS user only (Supabase uses the token from the link).
export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("The two passwords do not match.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      console.error("Update password error:", error);
      setMessage(error.message);
      return;
    }

    window.alert("Password changed. You are now logged in.");
    onDone();
  };

  const cancel = async () => {
    await supabase.auth.signOut();
    onDone();
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={save}>
        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>Task Web App</span>
        </div>
        <h1>Set a new password</h1>
        <p className="muted">Choose a new password for your account.</p>

        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Type the password again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {message && <p className="message">{message}</p>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Please wait..." : "Save new password"}
        </button>
        <button type="button" className="btn-outline" onClick={cancel} disabled={busy}>
          Cancel
        </button>
      </form>
    </main>
  );
}
