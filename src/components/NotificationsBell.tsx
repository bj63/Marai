"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";
import { useToasts } from "./ToastHub";

type NotificationSummary = {
  unread: number;
};

export function NotificationsBell() {
  const { addToast } = useToasts();
  const [unread, setUnread] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUnread = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient<NotificationSummary>("/api/notifications/unread", { method: "GET" });
      setUnread(response?.unread ?? 0);
    } catch (error) {
      addToast({ title: "Notifications unavailable", tone: "warning" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const markRead = useCallback(async () => {
    if (unread === 0) return;
    const previous = unread;
    setUnread(0);
    try {
      await apiClient("/api/notifications/mark-read", { method: "PATCH" });
      addToast({ title: "Notifications marked as read", tone: "success" });
    } catch (error) {
      setUnread(previous);
      addToast({ title: "Unable to mark as read", tone: "error" });
    }
  }, [addToast, unread]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  return (
    <button
      className="notifications-bell"
      aria-label="Notifications"
      onClick={markRead}
      disabled={loading}
    >
      <span aria-hidden>🔔</span>
      {unread !== null && unread > 0 && <span className="notifications-bell__badge">{unread}</span>}
      {loading && <span className="notifications-bell__badge" aria-live="polite">…</span>}
    </button>
  );
}
