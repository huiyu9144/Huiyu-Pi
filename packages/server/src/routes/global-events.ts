import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import {
  registerGlobalClient,
  unregisterGlobalClient,
} from "../sse-bridge.js";

const HEARTBEAT_LINE = `: heartbeat ${"_".repeat(2034)}\n\n`;

/**
 * GET /api/v1/events
 *
 * Global event stream — receives cross-session broadcasts (agent_end,
 * session_list_changed) so the sidebar can stay up-to-date even when
 * the user has switched away from a running session.
 *
 * Cost: 1 long-lived SSE connection + ~100 bytes/s heartbeat.
 */
export async function globalEventsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/events", async (_req, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const client = {
      id: randomUUID(),
      send: (event: unknown) => {
        if (reply.raw.destroyed) return;
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      },
      close: () => {
        // no-op — reply.raw.close() is handled by the 'close' event below
      },
    };

    registerGlobalClient(client);

    const heartbeat = setInterval(() => {
      if (!reply.raw.destroyed) {
        reply.raw.write(HEARTBEAT_LINE);
      }
    }, 20_000);

    reply.raw.on("close", () => {
      clearInterval(heartbeat);
      unregisterGlobalClient(client);
    });

    reply.raw.write(`: global-events connected\n\n`);
  });
}
