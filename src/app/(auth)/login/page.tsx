import React from "react";
import { useSession } from "../../../providers/SessionProvider";
import { useToasts } from "../../../components/ToastHub";

export default function LoginPage() {
  const { status, setStatus, refresh } = useSession();
  const { addToast } = useToasts();

  const handleLogin = async () => {
    addToast({ title: "Logging in...", tone: "info" });
    // In a real app, call auth endpoint then refresh session state.
    setStatus("authenticated");
    await refresh();
    addToast({ title: "Welcome back!", tone: "success" });
  };

  return (
    <section className="page auth">
      <h1>Login</h1>
      <p>Access your MarAI feed, profile, and chat after authenticating.</p>
      <button className="button" onClick={handleLogin} disabled={status === "loading"}>
        {status === "loading" ? "Connecting..." : "Continue"}
      </button>
    </section>
  );
}
