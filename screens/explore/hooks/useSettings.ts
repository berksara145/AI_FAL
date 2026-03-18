import { useState, useEffect, useCallback } from "react";
import { getOrCreateUser, updateUserName, updateBirthDate, updateBirthTime, type User } from "../../../db/user.repo";
import { deleteAllChatSessions } from "../../../db/chat.repo";

export type EditingField = "name" | "date" | "time" | null;

export interface SettingsState {
  user: User | null;
  loading: boolean;
  editingField: EditingField;

  // Edit buffers
  nameBuffer: string;
  dateBuffer: { day: string; month: string; year: string };
  timeBuffer: { hour: string; minute: string };

  // Actions
  startEditing: (field: EditingField) => void;
  cancelEditing: () => void;
  saveName: () => Promise<void>;
  saveDate: () => Promise<void>;
  saveTime: () => Promise<void>;
  clearHistory: () => Promise<void>;

  setNameBuffer: (v: string) => void;
  setDateBuffer: (v: { day: string; month: string; year: string }) => void;
  setTimeBuffer: (v: { hour: string; minute: string }) => void;

  saving: boolean;
  error: string | null;
}

export function useSettings(): SettingsState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameBuffer, setNameBuffer] = useState("");
  const [dateBuffer, setDateBuffer] = useState({ day: "", month: "", year: "" });
  const [timeBuffer, setTimeBuffer] = useState({ hour: "", minute: "" });

  const loadUser = useCallback(async () => {
    try {
      const u = await getOrCreateUser();
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const startEditing = (field: EditingField) => {
    setError(null);
    setEditingField(field);
    if (!user) return;
    if (field === "name") {
      setNameBuffer(user.name ?? "");
    } else if (field === "date") {
      setDateBuffer({
        day: user.birth_day != null ? String(user.birth_day) : "",
        month: user.birth_month != null ? String(user.birth_month) : "",
        year: user.birth_year != null ? String(user.birth_year) : "",
      });
    } else if (field === "time") {
      setTimeBuffer({
        hour: user.birth_hour != null ? String(user.birth_hour).padStart(2, "0") : "",
        minute: user.birth_minute != null ? String(user.birth_minute).padStart(2, "0") : "",
      });
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setError(null);
  };

  const saveName = async () => {
    const trimmed = nameBuffer.trim();
    if (!trimmed) { setError("Name can't be empty"); return; }
    setSaving(true);
    try {
      await updateUserName(trimmed);
      await loadUser();
      setEditingField(null);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveDate = async () => {
    const d = parseInt(dateBuffer.day, 10);
    const m = parseInt(dateBuffer.month, 10);
    const y = parseInt(dateBuffer.year, 10);
    if (isNaN(d) || isNaN(m) || isNaN(y) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      setError("Enter a valid date");
      return;
    }
    setSaving(true);
    try {
      await updateBirthDate(y, m, d);
      await loadUser();
      setEditingField(null);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveTime = async () => {
    const h = parseInt(timeBuffer.hour, 10);
    const min = parseInt(timeBuffer.minute, 10);
    if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) {
      setError("Enter a valid time (HH MM)");
      return;
    }
    setSaving(true);
    try {
      await updateBirthTime(h, min);
      await loadUser();
      setEditingField(null);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const clearHistory = async () => {
    await deleteAllChatSessions();
  };

  return {
    user, loading, editingField,
    nameBuffer, dateBuffer, timeBuffer,
    startEditing, cancelEditing,
    saveName, saveDate, saveTime, clearHistory,
    setNameBuffer, setDateBuffer, setTimeBuffer,
    saving, error,
  };
}
