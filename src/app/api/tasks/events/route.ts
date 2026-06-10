import { NextRequest } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";
import { subscribeToTaskEvents } from "@/lib/task-events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const encoder = new TextEncoder();

    let unsubscribe: (() => void) | undefined;
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    const stream = new ReadableStream({
      start(controller) {
        const send = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        send({ type: "connected" });

        unsubscribe = subscribeToTaskEvents(user.id, (event) => {
          send(event);
        });

        heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": ping\n\n"));
        }, 25_000);

        request.signal.addEventListener("abort", () => {
          unsubscribe?.();
          if (heartbeat) clearInterval(heartbeat);
          controller.close();
        });
      },
      cancel() {
        unsubscribe?.();
        if (heartbeat) clearInterval(heartbeat);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
