import { useEffect, useState } from "react";
import { supabase, openedFromResetLink } from "./supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // true when the user arrived from a "reset password" email link
  const [resetting, setResetting] = useState(openedFromResetLink);

  useEffect(() => {
    // 1. Check if a user is already logged in (session saved in the browser)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2. Listen for login, logout, token refresh and password recovery
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === "PASSWORD_RECOVERY") setResetting(true);
        setSession(newSession);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="center-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  // The reset link logs the user in, but we ask for a new password first
  if (resetting && session) {
    return <ResetPassword onDone={() => setResetting(false)} />;
  }

  return session ? <Dashboard user={session.user} /> : <Login />;
}
