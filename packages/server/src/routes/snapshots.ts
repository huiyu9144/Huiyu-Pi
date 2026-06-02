import type { FastifyPluginAsync, FastifyReply } from "fastify";
import {
  createSnapshot,
  listSnapshots,
  getSnapshot,
  deleteSnapshot,
  restoreSnapshot,
  getStorageInfo,
  computeDelta,
  computeSessionDelta,
  restoreSessionDelta,
  SnapshotTooLargeError,
  SnapshotLimitError,
  SnapshotNotFoundError,
  ConfirmPathMismatchError,
  PathTraversalError,
} from "../snapshot-store.js";
import { getProject } from "../project-manager.js";
import { getTree } from "../file-manager.js";
import { errorSchema } from "./_schemas.js";

/* ----------------------------- schemas ----------------------------- */

const snapshotMetaSchema = {
  type: "object",
  required: ["id", "projectId", "label", "createdAt", "trigger", "totalFiles", "totalSize"],
  properties: {
    id: { type: "string" },
    projectId: { type: "string" },
    label: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    trigger: { type: "string", enum: ["manual", "pre-agent", "post-agent", "pre-restore"] },
    sessionId: { type: "string" },
    totalFiles: { type: "integer", minimum: 0 },
    totalSize: { type: "integer", minimum: 0 },
  },
} as const;

const fileEntrySchema = {
  type: "object",
  required: ["hash", "size", "encoding"],
  properties: {
    hash: { type: "string" },
    size: { type: "integer", minimum: 0 },
    encoding: { type: "string", enum: ["utf-8", "binary"] },
    skipped: { type: "boolean" },
  },
} as const;

const snapshotDetailSchema = {
  type: "object",
  required: [
    "id",
    "projectId",
    "label",
    "createdAt",
    "trigger",
    "files",
    "totalFiles",
    "totalSize",
  ],
  properties: {
    id: { type: "string" },
    projectId: { type: "string" },
    label: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    trigger: { type: "string", enum: ["manual", "pre-agent", "post-agent", "pre-restore"] },
    sessionId: { type: "string" },
    files: {
      type: "object",
      additionalProperties: fileEntrySchema,
    },
    totalFiles: { type: "integer", minimum: 0 },
    totalSize: { type: "integer", minimum: 0 },
  },
} as const;

/* ----------------------------- error mapping ----------------------------- */

function mapError(reply: FastifyReply, err: unknown): FastifyReply {
  if (err instanceof SnapshotTooLargeError) {
    return reply.code(413).send({
      error: "snapshot_too_large",
      message: `快照大小 ${err.size} 超出上限 ${err.limit}，请清理项目后重试`,
    });
  }
  if (err instanceof SnapshotLimitError) {
    return reply.code(409).send({
      error: "snapshot_limit_reached",
      message: `快照数量已达上限 (${err.limit})，请删除旧快照后重试`,
    });
  }
  if (err instanceof SnapshotNotFoundError) {
    return reply.code(404).send({ error: "snapshot_not_found", message: err.message });
  }
  if (err instanceof ConfirmPathMismatchError) {
    return reply.code(400).send({
      error: "confirm_path_mismatch",
      message: "确认路径与项目路径不一致",
    });
  }
  if (err instanceof PathTraversalError) {
    return reply.code(400).send({
      error: "path_traversal",
      message: err.message,
    });
  }
  return reply.code(500).send({ error: "internal_error", message: (err as Error).message });
}

/* ----------------------------- routes ----------------------------- */

export const snapshotRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Params: { projectId: string };
    Body: {
      label?: string;
      trigger?: "manual" | "pre-agent" | "post-agent";
      sessionId?: string;
      createdAt?: string;
      changedFiles?: string[];
    };
  }>(
    "/projects/:projectId/snapshots",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId"],
          properties: { projectId: { type: "string" } },
        },
        body: {
          type: "object",
          properties: {
            label: { type: "string" },
            trigger: { type: "string", enum: ["manual", "pre-agent", "post-agent"] },
            sessionId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            changedFiles: { type: "array", items: { type: "string" } },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["snapshot", "warnings"],
            properties: {
              snapshot: snapshotMetaSchema,
              warnings: { type: "array", items: { type: "string" } },
            },
          },
          413: errorSchema,
          409: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId } = req.params;
      const project = await getProject(projectId);
      if (project === undefined) {
        return reply.code(404).send({ error: "project_not_found" });
      }
      try {
        const result = await createSnapshot(
          projectId,
          project.path,
          req.body?.label ?? "手动快照",
          req.body?.trigger ?? "manual",
          req.body?.sessionId,
          req.body?.createdAt,
          req.body?.changedFiles,
        );
        return { snapshot: result.snapshot, warnings: result.warnings };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.get<{
    Params: { projectId: string; snapshotId: string };
  }>(
    "/projects/:projectId/snapshots/:snapshotId/delta",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId", "snapshotId"],
          properties: {
            projectId: { type: "string" },
            snapshotId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["delta"],
            properties: {
              delta: {
                type: "object",
                required: ["snapshotId", "snapshotLabel", "entries", "summary"],
                properties: {
                  snapshotId: { type: "string" },
                  snapshotLabel: { type: "string" },
                  entries: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["path", "status", "snapshotSize", "currentSize"],
                      properties: {
                        path: { type: "string" },
                        status: { type: "string", enum: ["added", "modified", "deleted"] },
                        snapshotSize: { type: "integer" },
                        currentSize: { type: "integer" },
                      },
                    },
                  },
                  summary: {
                    type: "object",
                    required: ["added", "modified", "deleted"],
                    properties: {
                      added: { type: "integer" },
                      modified: { type: "integer" },
                      deleted: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId, snapshotId } = req.params;
      const project = await getProject(projectId);
      if (project === undefined) {
        return reply.code(404).send({ error: "project_not_found" });
      }
      try {
        const tree = await getTree(project.path, { maxDepth: Infinity });
        const delta = await computeDelta(projectId, snapshotId, tree);
        return { delta };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.get<{
    Params: { projectId: string };
  }>(
    "/projects/:projectId/snapshots",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId"],
          properties: { projectId: { type: "string" } },
        },
        response: {
          200: {
            type: "object",
            required: ["snapshots"],
            properties: {
              snapshots: { type: "array", items: snapshotMetaSchema },
            },
          },
        },
      },
    },
    async (req) => {
      const { projectId } = req.params;
      const snapshots = await listSnapshots(projectId);
      return { snapshots };
    },
  );

  fastify.get<{
    Params: { projectId: string; snapshotId: string };
  }>(
    "/projects/:projectId/snapshots/:snapshotId",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId", "snapshotId"],
          properties: {
            projectId: { type: "string" },
            snapshotId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["snapshot"],
            properties: { snapshot: snapshotDetailSchema },
          },
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId, snapshotId } = req.params;
      try {
        const snapshot = await getSnapshot(projectId, snapshotId);
        return { snapshot };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.post<{
    Params: { projectId: string; snapshotId: string };
    Body: { confirmProjectPath: string };
  }>(
    "/projects/:projectId/snapshots/:snapshotId/restore",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId", "snapshotId"],
          properties: {
            projectId: { type: "string" },
            snapshotId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["confirmProjectPath"],
          properties: { confirmProjectPath: { type: "string" } },
        },
        response: {
          200: {
            type: "object",
            required: ["restored", "safetySnapshot", "warnings"],
            properties: {
              restored: snapshotMetaSchema,
              safetySnapshot: snapshotMetaSchema,
              warnings: { type: "array", items: { type: "string" } },
            },
          },
          400: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId, snapshotId } = req.params;
      const project = await getProject(projectId);
      if (project === undefined) {
        return reply.code(404).send({ error: "project_not_found" });
      }
      try {
        const result = await restoreSnapshot(
          projectId,
          project.path,
          snapshotId,
          req.body.confirmProjectPath,
        );
        return {
          restored: result.restored,
          safetySnapshot: result.safetySnapshot,
          warnings: result.warnings,
        };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.post<{
    Params: { projectId: string };
    Body: { targetSnapshotId: string };
  }>(
    "/projects/:projectId/snapshots/session-delta",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId"],
          properties: { projectId: { type: "string" } },
        },
        body: {
          type: "object",
          required: ["targetSnapshotId"],
          properties: {
            targetSnapshotId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["delta"],
            properties: {
              delta: {
                type: "object",
                required: ["targetId", "entries", "summary"],
                properties: {
                  targetId: { type: "string" },
                  entries: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["path", "status", "snapshotSize", "currentSize"],
                      properties: {
                        path: { type: "string" },
                        status: { type: "string", enum: ["added", "modified", "deleted"] },
                        snapshotSize: { type: "integer" },
                        currentSize: { type: "integer" },
                      },
                    },
                  },
                  summary: {
                    type: "object",
                    required: ["added", "modified", "deleted"],
                    properties: {
                      added: { type: "integer" },
                      modified: { type: "integer" },
                      deleted: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId } = req.params;
      const { targetSnapshotId } = req.body;
      const project = await getProject(projectId);
      if (project === undefined) {
        return reply.code(404).send({ error: "project_not_found" });
      }
      try {
        const tree = await getTree(project.path, { maxDepth: Infinity });
        const delta = await computeSessionDelta(projectId, targetSnapshotId, tree, project.path);
        return { delta };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.post<{
    Params: { projectId: string };
    Body: { targetSnapshotId: string; confirmProjectPath: string };
  }>(
    "/projects/:projectId/snapshots/restore-diff",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId"],
          properties: { projectId: { type: "string" } },
        },
        body: {
          type: "object",
          required: ["targetSnapshotId", "confirmProjectPath"],
          properties: {
            targetSnapshotId: { type: "string" },
            confirmProjectPath: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["restored", "safetySnapshot", "warnings"],
            properties: {
              restored: {
                type: "object",
                required: ["targetId", "entries", "summary"],
                properties: {
                  targetId: { type: "string" },
                  entries: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["path", "status", "snapshotSize", "currentSize"],
                      properties: {
                        path: { type: "string" },
                        status: { type: "string", enum: ["added", "modified", "deleted"] },
                        snapshotSize: { type: "integer" },
                        currentSize: { type: "integer" },
                      },
                    },
                  },
                  summary: {
                    type: "object",
                    required: ["added", "modified", "deleted"],
                    properties: {
                      added: { type: "integer" },
                      modified: { type: "integer" },
                      deleted: { type: "integer" },
                    },
                  },
                },
              },
              safetySnapshot: snapshotMetaSchema,
              warnings: { type: "array", items: { type: "string" } },
            },
          },
          400: errorSchema,
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId } = req.params;
      const { targetSnapshotId, confirmProjectPath } = req.body;
      const project = await getProject(projectId);
      if (project === undefined) {
        return reply.code(404).send({ error: "project_not_found" });
      }
      try {
        const result = await restoreSessionDelta(
          projectId,
          project.path,
          targetSnapshotId,
          confirmProjectPath,
        );
        return {
          restored: result.restored,
          safetySnapshot: result.safetySnapshot,
          warnings: result.warnings,
        };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.delete<{
    Params: { projectId: string; snapshotId: string };
  }>(
    "/projects/:projectId/snapshots/:snapshotId",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId", "snapshotId"],
          properties: {
            projectId: { type: "string" },
            snapshotId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["deleted"],
            properties: { deleted: { type: "string" } },
          },
          404: errorSchema,
        },
      },
    },
    async (req, reply) => {
      const { projectId, snapshotId } = req.params;
      try {
        const deleted = await deleteSnapshot(projectId, snapshotId);
        return { deleted };
      } catch (err) {
        return mapError(reply, err);
      }
    },
  );

  fastify.get<{
    Params: { projectId: string };
  }>(
    "/projects/:projectId/snapshots/storage",
    {
      schema: {
        params: {
          type: "object",
          required: ["projectId"],
          properties: { projectId: { type: "string" } },
        },
        response: {
          200: {
            type: "object",
            required: ["totalSnapshots", "totalSizeBytes"],
            properties: {
              totalSnapshots: { type: "integer", minimum: 0 },
              totalSizeBytes: { type: "integer", minimum: 0 },
            },
          },
        },
      },
    },
    async (req) => {
      const { projectId } = req.params;
      const info = await getStorageInfo(projectId);
      return info;
    },
  );
};
