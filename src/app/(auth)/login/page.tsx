import React from "react";
import { apiClient } from "../../../lib/apiClient";
import { useSession } from "../../../providers/SessionProvider";
import { useToasts } from "../../../components/ToastHub";

export default function LoginPage() {
  const { status, setStatus, refresh } = useSession();
  const { addToast } = useToasts();

  const handleLogin = async () => {
    try {
      addToast({ title: "Logging in…", tone: "info" });
      await apiClient("/api/auth/login", { method: "POST" });
      setStatus("authenticated");
      await refresh();
      addToast({ title: "Welcome back!", tone: "success" });
    } catch (error: any) {
      addToast({
        title: "Login failed",
        description: error?.message || "Check API keys in your .env",
        tone: "error",
      });
      setStatus("error");
    }
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
