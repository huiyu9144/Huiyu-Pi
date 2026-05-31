import { create } from "zustand";
import { api, ApiError } from "../lib/api-client";
import type {
  SnapshotMeta,
  SnapshotStorageInfo,
  SnapshotDelta,
  SessionDelta,
} from "../lib/api-client";

interface SnapshotState {
  snapshots: SnapshotMeta[];
  loading: boolean;
  creating: boolean;
  restoring: boolean;
  error: string | undefined;
  storageInfo: SnapshotStorageInfo | null;

  snapshotIdByMsgKey: Record<string, string>;

  loadSnapshots: (projectId: string) => Promise<void>;
  createSnapshot: (
    projectId: string,
    label: string,
    trigger?: "manual" | "pre-agent" | "post-agent",
    sessionId?: string,
  ) => Promise<SnapshotMeta | undefined>;
  snapBeforeAgent: (
    projectId: string,
    label: string,
    sessionId?: string,
  ) => Promise<string | undefined>;
  snapAfterAgent: (
    projectId: string,
    label: string,
    sessionId?: string,
  ) => Promise<string | undefined>;
  restoreSnapshot: (
    projectId: string,
    snapshotId: string,
    confirmProjectPath: string,
  ) => Promise<{ safetySnapshot: SnapshotMeta; warnings: string[] } | undefined>;
  deleteSnapshot: (projectId: string, snapshotId: string) => Promise<void>;
  getStorageInfo: (projectId: string) => Promise<void>;
  getDelta: (projectId: string, snapshotId: string) => Promise<SnapshotDelta | undefined>;
  getSessionDelta: (projectId: string, targetId: string) => Promise<SessionDelta | undefined>;
  restoreSessionDiff: (
    projectId: string,
    targetId: string,
    projectPath: string,
  ) => Promise<SessionDelta | undefined>;
  setSnapshotForMsg: (sessionId: string, msgIndex: number, snapshotId: string) => void;
  getSnapshotForMsg: (sessionId: string, msgIndex: number) => string | undefined;
  clearError: () => void;
}

function msgKey(sessionId: string, msgIndex: number): string {
  return `${sessionId}:${msgIndex}`;
}

export const useSnapshotStore = create<SnapshotState>((set, get) => ({
  snapshots: [],
  loading: false,
  creating: false,
  restoring: false,
  error: undefined,
  storageInfo: null,
  snapshotIdByMsgKey: {},

  loadSnapshots: async (projectId) => {
    set({ loading: true, error: undefined });
    try {
      const { snapshots } = await api.listSnapshots(projectId);
      set({ snapshots, loading: false });
    } catch (err) {
      const msg = err instanceof ApiError ? (err.message ?? err.code) : (err as Error).message;
      set({ error: msg, loading: false });
    }
  },

  createSnapshot: async (projectId, label, trigger, sessionId) => {
    set({ creating: true, error: undefined });
    try {
      const { snapshot, warnings } = await api.createSnapshot(projectId, label, trigger, sessionId);
      if (warnings.length > 0) {
        console.warn("[snapshot] warnings:", warnings);
      }
      const current = get().snapshots;
      set({ snapshots: [snapshot, ...current], creating: false });
      void get().getStorageInfo(projectId);
      return snapshot;
    } catch (err) {
      const msg = err instanceof ApiError ? (err.message ?? err.code) : (err as Error).message;
      set({ error: msg, creating: false });
      return undefined;
    }
  },

  snapBeforeAgent: async (projectId, label, sessionId) => {
    const snap = await get().createSnapshot(projectId, label, "pre-agent", sessionId);
    return snap?.id;
  },

  snapAfterAgent: async (projectId, label, sessionId) => {
    const snap = await get().createSnapshot(projectId, label, "post-agent", sessionId);
    return snap?.id;
  },

  restoreSnapshot: async (projectId, snapshotId, confirmProjectPath) => {
    set({ restoring: true, error: undefined });
    try {
      const result = await api.restoreSnapshot(projectId, snapshotId, confirmProjectPath);
      if (result.warnings.length > 0) {
        console.warn("[snapshot] restore warnings:", result.warnings);
      }
      await get().loadSnapshots(projectId);
      set({ restoring: false });
      return { safetySnapshot: result.safetySnapshot, warnings: result.warnings };
    } catch (err) {
      const msg = err instanceof ApiError ? (err.message ?? err.code) : (err as Error).message;
      set({ error: msg, restoring: false });
      return undefined;
    }
  },

  deleteSnapshot: async (projectId, snapshotId) => {
    set({ error: undefined });
    try {
      await api.deleteSnapshot(projectId, snapshotId);
      set({ snapshots: get().snapshots.filter((s) => s.id !== snapshotId) });
      void get().getStorageInfo(projectId);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.message ?? err.code) : (err as Error).message;
      set({ error: msg });
    }
  },

  getStorageInfo: async (projectId) => {
    try {
      const info = await api.getSnapshotStorage(projectId);
      set({ storageInfo: info });
    } catch {
      // best-effort
    }
  },

  getDelta: async (projectId, snapshotId) => {
    try {
      const { delta } = await api.getSnapshotDelta(projectId, snapshotId);
      return delta;
    } catch {
      return undefined;
    }
  },

  getSessionDelta: async (projectId, targetId) => {
    try {
      const { delta } = await api.getSessionDelta(projectId, targetId);
      return delta;
    } catch {
      return undefined;
    }
  },

  restoreSessionDiff: async (projectId, targetId, projectPath) => {
    set({ restoring: true, error: undefined });
    try {
      const { restored, safetySnapshot, warnings } = await api.restoreSessionDiff(
        projectId,
        targetId,
        projectPath,
      );
      set((s) => ({
        restoring: false,
        snapshots: [safetySnapshot, ...s.snapshots],
      }));
      if (warnings.length > 0) {
        console.warn("[snapshot] restore warnings:", warnings);
      }
      return restored;
    } catch (err) {
      const msg = err instanceof ApiError ? (err.message ?? err.code) : (err as Error).message;
      set({ error: msg, restoring: false });
      return undefined;
    }
  },

  setSnapshotForMsg: (sessionId, msgIndex, snapshotId) => {
    const key = msgKey(sessionId, msgIndex);
    set({ snapshotIdByMsgKey: { ...get().snapshotIdByMsgKey, [key]: snapshotId } });
  },

  getSnapshotForMsg: (sessionId, msgIndex) => {
    return get().snapshotIdByMsgKey[msgKey(sessionId, msgIndex)];
  },

  clearError: () => set({ error: undefined }),
}));
