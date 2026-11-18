import type { CallToolResult } from "@modelcontextprotocol/server";
import type { ZodType } from "zod";

export class ReadAnywayToolError extends Error {
  constructor(
    readonly code: "SHARING_REQUIRED" | "INVALID_CURSOR" | "CONNECTION_REVOKED",
    readonly setupUrl?: string,
  ) {
    super(code);
  }
}

function sharingLink(raw?: string) {
  const path = "/app/connected-apps";
  if (!raw || !URL.canParse(raw)) return path;
  const url = new URL(raw);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== path ||
    url.hash ||
    [...url.searchParams.keys()].some((key) => key !== "connection")
  )
    return path;
  return url.href;
}

export async function readPage<Page extends Record<string, unknown>>(
  schema: ZodType<Page>,
  read: () => Promise<Page>,
): Promise<CallToolResult> {
  try {
    // Project the adapter result through the public schema before either encoding leaves the server.
    const page = schema.parse(await read());
    return {
      structuredContent: page,
      content: [{ type: "text", text: JSON.stringify(page) }],
    };
  } catch (error) {
    let text = "ReadAnyway could not retrieve this page. Try again.";
    if (error instanceof ReadAnywayToolError) {
      if (error.code === "CONNECTION_REVOKED")
        text =
          "This connection was disconnected. Reconnect the assistant to ReadAnyway and approve a new connection.";
      if (error.code === "SHARING_REQUIRED")
        text =
          "Choose which books to share in ReadAnyway, then try again. " +
          sharingLink(error.setupUrl);
      if (error.code === "INVALID_CURSOR")
        text =
          "This cursor is invalid for this search. Start again without a cursor.";
    }
    return { isError: true, content: [{ type: "text", text }] };
  }
}
