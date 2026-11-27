import { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) setMessage(error.message);
    setBusy(false);
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      setMessage("Enter your email above first, then click Forgot password.");
      return;
    }

    setBusy(true);
    setMessage("");

    // Supabase emails a reset link. The link brings the user back to this app,
    // where App.jsx shows the "Set a new password" page.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    if (error) {
      console.error("Reset password error:", error);
      setMessage(error.message);
    } else {
      // Same message for every email, so nobody can use this to check
      // which emails are registered.
      setMessage("If this email is registered, a password reset link has been sent. Please check your inbox.");
    }
    setBusy(false);
  };

  const register = async () => {
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      // When "Confirm email" is OFF, Supabase returns "User already registered"
      if (/already registered/i.test(error.message)) {
        setMessage("This email is already registered. Please log in instead.");
      } else {
        setMessage(error.message);
      }
    } else if (data.user && data.user.identities?.length === 0) {
      // When "Confirm email" is ON, Supabase does not return an error for an
      // existing email. Instead it returns a fake user with no identities and
      // sends no email. The old password is NOT changed.
      setMessage("This email is already registered. Please log in instead.");
    } else if (!data.session) {
      // Happens only when "Confirm email" is ON in Supabase
      setMessage("Account created. Check your email to confirm, then log in.");
    }
    setBusy(false);
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={login}>
        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>Task Web App</span>
        </div>
        <h1>Student Task System</h1>
        <p className="muted">Log in or create an account to manage your tasks.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="student@student.upm.edu.my"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="link-button"
          onClick={forgotPassword}
          disabled={busy}
        >
          Forgot password?
        </button>

        {message &&<p className="message">{message}</p>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Please wait..." : "Login"}
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={register}
          disabled={busy || !email}
        >
          Register
        </button>
      </form>
    </main>
  );
}